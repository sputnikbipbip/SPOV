using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SPOV.Domain.Entities;
using SPOV.Domain.Enums;
using SPOV.Infrastructure.Data;
using SPOV.Infrastructure.Identity;

namespace SPOV.WebApi.Extensions;

public sealed class DevelopmentDataSeeder(
    ApplicationDbContext db,
    UserManager<ApplicationUser> userManager,
    IConfiguration configuration,
    IHostEnvironment environment)
{
    public const string ProviderName = "DevelopmentSeed";
    private const string DemoEmailSuffix = "@spov.local";

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (!environment.IsDevelopment())
            throw new InvalidOperationException("Demo data can only be seeded in the Development environment.");

        var partnerPassword = configuration["DevelopmentSeed:PartnerPassword"];
        if (string.IsNullOrWhiteSpace(partnerPassword))
            throw new InvalidOperationException("Configure DevelopmentSeed:PartnerPassword before seeding demo data.");

        await ValidatePartnerPasswordAsync(partnerPassword);

        var administrators = await userManager.GetUsersInRoleAsync(Roles.Administrator);
        var administrator = administrators.FirstOrDefault()
            ?? throw new InvalidOperationException("Create an administrator using AdminBootstrap settings before seeding demo data.");

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        var professionalTier = await GetOrCreateTierAsync("Demo Profissional", 50m, "Acesso de demonstração para profissionais.", cancellationToken);
        var studentTier = await GetOrCreateTierAsync("Demo Estudante", 20m, "Acesso de demonstração para estudantes.", cancellationToken);
        var publicEvent = await GetOrCreateEventAsync("[DEMO] Workshop de Oncologia Veterinária", false, 14, cancellationToken);
        var membersEvent = await GetOrCreateEventAsync("[DEMO] Webinar para Sócios", true, 28, cancellationToken);

        var activePartner = await GetOrCreatePartnerAsync(
            "demo.active" + DemoEmailSuffix, "Demonstração Sócio Ativo", PartnerType.Professional,
            MembershipStatus.Active, professionalTier, partnerPassword, cancellationToken);
        var pendingPartner = await GetOrCreatePartnerAsync(
            "demo.pending" + DemoEmailSuffix, "Demonstração Sócio Pendente", PartnerType.Professional,
            MembershipStatus.Pending, professionalTier, partnerPassword, cancellationToken);
        var studentPartner = await GetOrCreatePartnerAsync(
            "demo.student" + DemoEmailSuffix, "Demonstração Estudante", PartnerType.Student,
            MembershipStatus.Pending, studentTier, partnerPassword, cancellationToken);

        await EnsurePaymentAsync(activePartner, PaymentStatus.Verified, administrator.Id, cancellationToken);
        await EnsurePaymentAsync(pendingPartner, PaymentStatus.Pending, null, cancellationToken);
        await EnsurePaymentAsync(studentPartner, PaymentStatus.Rejected, administrator.Id, cancellationToken);

        await EnsureRegistrationAsync(activePartner.Id, publicEvent.Id, cancellationToken);
        await EnsureRegistrationAsync(activePartner.Id, membersEvent.Id, cancellationToken);

        await EnsureArticleAsync(
            "[DEMO] Introdução à oncologia veterinária",
            "Artigo de demonstração para validar a listagem e leitura de conteúdos.",
            null,
            cancellationToken);
        await EnsureArticleAsync(
            "[DEMO] Recursos para profissionais",
            "Conteúdo de demonstração reservado ao plano Demo Profissional.",
            professionalTier.Id,
            cancellationToken);

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }

    private async Task ValidatePartnerPasswordAsync(string partnerPassword)
    {
        var validationUser = new ApplicationUser
        {
            UserName = "demo.validation@spov.local",
            Email = "demo.validation@spov.local"
        };
        var failures = new List<string>();
        foreach (var validator in userManager.PasswordValidators)
        {
            var result = await validator.ValidateAsync(userManager, validationUser, partnerPassword);
            failures.AddRange(result.Errors.Select(error => error.Code switch
            {
                "PasswordRequiresNonAlphanumeric" => "a special character",
                "PasswordRequiresDigit" => "a digit",
                "PasswordRequiresUpper" => "an uppercase letter",
                "PasswordRequiresLower" => "a lowercase letter",
                "PasswordTooShort" => "the minimum password length",
                _ => error.Description
            }));
        }

        if (failures.Count > 0)
            throw new InvalidOperationException(
                $"DevelopmentSeed:PartnerPassword does not meet the Identity password policy. Include {string.Join(", ", failures.Distinct())}.");
    }

    private async Task<MembershipTier> GetOrCreateTierAsync(
        string name,
        decimal price,
        string benefits,
        CancellationToken cancellationToken)
    {
        var tier = await db.MembershipTiers.SingleOrDefaultAsync(t => t.Name == name, cancellationToken);
        if (tier is not null)
            return tier;

        tier = new MembershipTier
        {
            Name = name,
            Price = price,
            BillingInterval = BillingInterval.Yearly,
            Benefits = benefits
        };
        db.MembershipTiers.Add(tier);
        await db.SaveChangesAsync(cancellationToken);
        return tier;
    }

    private async Task<Event> GetOrCreateEventAsync(
        string title,
        bool membersOnly,
        int daysFromNow,
        CancellationToken cancellationToken)
    {
        var existing = await db.Events.SingleOrDefaultAsync(e => e.Title == title, cancellationToken);
        if (existing is not null)
            return existing;

        var start = DateTime.UtcNow.Date.AddDays(daysFromNow).AddHours(9);
        var newEvent = new Event
        {
            Title = title,
            Description = "Evento de demonstração criado pelo seeder local da SPOV.",
            StartDate = start,
            EndDate = start.AddHours(3),
            Location = membersOnly ? "Online" : "Lisboa",
            IsMembersOnly = membersOnly
        };
        db.Events.Add(newEvent);
        await db.SaveChangesAsync(cancellationToken);
        return newEvent;
    }

    private async Task<Partner> GetOrCreatePartnerAsync(
        string email,
        string fullName,
        PartnerType type,
        MembershipStatus status,
        MembershipTier tier,
        string partnerPassword,
        CancellationToken cancellationToken)
    {
        var existing = await db.Partners.SingleOrDefaultAsync(p => p.Email == email, cancellationToken);
        if (existing is not null)
            return existing;

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                FullName = fullName,
                EmailConfirmed = true
            };
            var createResult = await userManager.CreateAsync(user, partnerPassword);
            if (!createResult.Succeeded)
                throw new InvalidOperationException($"Unable to create demo account '{email}': {string.Join(", ", createResult.Errors.Select(error => error.Code))}");
        }

        if (!await userManager.IsInRoleAsync(user, Roles.Partner))
        {
            var roleResult = await userManager.AddToRoleAsync(user, Roles.Partner);
            if (!roleResult.Succeeded)
                throw new InvalidOperationException($"Unable to assign the Partner role to '{email}'.");
        }

        var isStudent = type == PartnerType.Student;
        var partner = new Partner
        {
            UserId = user.Id,
            FullName = fullName,
            Email = email,
            Phone = "+351 910 000 000",
            City = "Lisboa",
            Country = "Portugal",
            Profession = isStudent ? "Estudante de Medicina Veterinária" : "Médico Veterinário",
            CompanyName = isStudent ? null : "Clínica de Demonstração",
            InitiationFee = 30m,
            QuotaValue = isStudent ? 20m : 50m,
            TotalAmount = isStudent ? 50m : 80m,
            PartnerType = type,
            MembershipStatus = status,
            MembershipTierId = tier.Id,
            JoinedAt = DateTime.UtcNow.Date,
            MembershipExpiresAt = status == MembershipStatus.Active ? DateTime.UtcNow.Date.AddYears(1) : null
        };
        db.Partners.Add(partner);
        await db.SaveChangesAsync(cancellationToken);
        return partner;
    }

    private async Task EnsurePaymentAsync(
        Partner partner,
        string status,
        string? reviewerId,
        CancellationToken cancellationToken)
    {
        if (await db.Payments.AnyAsync(p => p.PartnerId == partner.Id && p.Provider == ProviderName, cancellationToken))
            return;

        db.Payments.Add(new Payment
        {
            PartnerId = partner.Id,
            Amount = partner.TotalAmount,
            Currency = "EUR",
            Status = status,
            Provider = ProviderName,
            ProviderTransactionId = $"demo-payment-{partner.Id}",
            ReviewedAt = reviewerId is null ? null : DateTime.UtcNow,
            ReviewedByUserId = reviewerId,
            ReviewNote = status == PaymentStatus.Rejected ? "Comprovativo de demonstração rejeitado." : null
        });
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureRegistrationAsync(int partnerId, int eventId, CancellationToken cancellationToken)
    {
        if (await db.EventRegistrations.AnyAsync(
                r => r.PartnerId == partnerId && r.EventId == eventId,
                cancellationToken))
            return;

        db.EventRegistrations.Add(new EventRegistration
        {
            PartnerId = partnerId,
            EventId = eventId,
            RegisteredAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync(cancellationToken);
    }

    private async Task EnsureArticleAsync(
        string title,
        string body,
        int? requiredTierId,
        CancellationToken cancellationToken)
    {
        if (await db.Articles.AnyAsync(a => a.Title == title, cancellationToken))
            return;

        db.Articles.Add(new Article
        {
            Title = title,
            Body = body,
            RequiredTierId = requiredTierId,
            PublishedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync(cancellationToken);
    }
}
