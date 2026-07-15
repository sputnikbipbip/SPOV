using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SPOV.Domain.Entities;

namespace SPOV.Infrastructure.Data.Configurations;

public class ArticleConfiguration : IEntityTypeConfiguration<Article>
{
    public void Configure(EntityTypeBuilder<Article> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Title).IsRequired().HasMaxLength(300);
        builder.Property(a => a.Body).IsRequired();
        builder.Property(a => a.FileUrl).HasMaxLength(1000);
        builder.HasOne<MembershipTier>()
            .WithMany()
            .HasForeignKey(a => a.RequiredTierId)
            .IsRequired(false);
    }
}
