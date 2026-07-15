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
        builder.Property(p => p.ClinicName).HasMaxLength(200);
        builder.Property(p => p.Specialization).HasMaxLength(200);
        builder.Property(p => p.Country).HasMaxLength(100);
        builder.Property(p => p.MembershipStatus)
            .HasConversion<string>()
            .HasMaxLength(50);
        builder.HasOne<MembershipTier>()
            .WithMany()
            .HasForeignKey(p => p.MembershipTierId)
            .IsRequired(false);
    }
}
