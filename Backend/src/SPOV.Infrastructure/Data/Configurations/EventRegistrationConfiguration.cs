using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SPOV.Domain.Entities;

namespace SPOV.Infrastructure.Data.Configurations;

public class EventRegistrationConfiguration : IEntityTypeConfiguration<EventRegistration>
{
    public void Configure(EntityTypeBuilder<EventRegistration> builder)
    {
        builder.HasKey(r => r.Id);
        builder.HasOne<Event>()
            .WithMany()
            .HasForeignKey(r => r.EventId);
        builder.HasOne<Partner>()
            .WithMany()
            .HasForeignKey(r => r.PartnerId);
        builder.HasIndex(r => new { r.EventId, r.PartnerId }).IsUnique();
    }
}
