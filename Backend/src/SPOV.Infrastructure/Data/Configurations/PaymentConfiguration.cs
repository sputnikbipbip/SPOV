using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SPOV.Domain.Entities;

namespace SPOV.Infrastructure.Data.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Amount).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(p => p.Currency).IsRequired().HasMaxLength(3);
        builder.Property(p => p.Status).IsRequired().HasMaxLength(50);
        builder.Property(p => p.Provider).IsRequired().HasMaxLength(100);
        builder.Property(p => p.ProviderTransactionId).HasMaxLength(200);
        builder.Property(p => p.ProofStorageKey).HasMaxLength(500);
        builder.Property(p => p.ProofFileName).HasMaxLength(255);
        builder.Property(p => p.ProofContentType).HasMaxLength(100);
        builder.Property(p => p.ReviewedByUserId).HasMaxLength(450);
        builder.Property(p => p.ReviewNote).HasMaxLength(1000);
        builder.Property(p => p.Version).IsRequired().IsConcurrencyToken();
        builder.HasOne<Partner>()
            .WithMany()
            .HasForeignKey(p => p.PartnerId);
    }
}
