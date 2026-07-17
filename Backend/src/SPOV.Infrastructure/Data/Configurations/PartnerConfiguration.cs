using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SPOV.Domain.Entities;

namespace SPOV.Infrastructure.Data.Configurations;

public class PartnerConfiguration : IEntityTypeConfiguration<Partner>
{
    public void Configure(EntityTypeBuilder<Partner> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.UserId).IsRequired();
        builder.Property(p => p.FullName).IsRequired().HasMaxLength(200);
        builder.Property(p => p.Email).IsRequired().HasMaxLength(256);
        builder.Property(p => p.Phone).IsRequired().HasMaxLength(50);
        builder.Property(p => p.TaxId).HasMaxLength(50);
        builder.Property(p => p.Address).HasMaxLength(500);
        builder.Property(p => p.City).HasMaxLength(200);
        builder.Property(p => p.ZipCode).HasMaxLength(20);
        builder.Property(p => p.Country).HasMaxLength(100);
        builder.Property(p => p.AcademicQualifications).HasMaxLength(200);
        builder.Property(p => p.ProfessionalCardNumber).HasMaxLength(50);
        builder.Property(p => p.Profession).HasMaxLength(200);
        builder.Property(p => p.CompanyName).HasMaxLength(200);
        builder.Property(p => p.CompanyPhone).HasMaxLength(50);
        builder.Property(p => p.Observations).HasMaxLength(2000);
        builder.Property(p => p.PaymentProofUrl).HasMaxLength(500);
        builder.Property(p => p.InitiationFee).HasColumnType("decimal(18,2)");
        builder.Property(p => p.QuotaValue).HasColumnType("decimal(18,2)");
        builder.Property(p => p.TotalAmount).HasColumnType("decimal(18,2)");
        builder.Property(p => p.PartnerType)
            .HasConversion<string>()
            .HasMaxLength(50);
        builder.Property(p => p.MembershipStatus)
            .HasConversion<string>()
            .HasMaxLength(50);
        builder.HasOne<MembershipTier>()
            .WithMany()
            .HasForeignKey(p => p.MembershipTierId)
            .IsRequired(false);
    }
}
