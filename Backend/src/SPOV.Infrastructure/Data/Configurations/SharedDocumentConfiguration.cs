using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SPOV.Domain.Entities;

namespace SPOV.Infrastructure.Data.Configurations;

public class SharedDocumentConfiguration : IEntityTypeConfiguration<SharedDocument>
{
    public void Configure(EntityTypeBuilder<SharedDocument> builder)
    {
        builder.HasKey(d => d.Id);
        builder.Property(d => d.FileName).IsRequired().HasMaxLength(500);
        builder.Property(d => d.FilePath).IsRequired().HasMaxLength(1000);
    }
}
