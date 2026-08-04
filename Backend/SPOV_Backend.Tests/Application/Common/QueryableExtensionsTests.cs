using FluentAssertions;
using SPOV.Application.Common;
using SPOV.Domain.Common;
using SPOV.Domain.Entities;
using Xunit;

namespace SPOV_Backend.Tests.Application.Common;

public sealed class QueryableExtensionsTests
{
    private static readonly IQueryable<Article> Articles = new List<Article>
    {
        new() { Id = 1, Title = "C# Design Patterns", Body = "Learn about expression trees" },
        new() { Id = 2, Title = "ASP.NET Core", Body = "Building modern web APIs" },
        new() { Id = 3, Title = "PostgreSQL tips", Body = "Indexing strategies" },
        new() { Id = 4, Title = "Design systems", Body = "Consistent UI components" }
    }.AsQueryable();

    [Fact]
    public void ApplySearch_WithExpressionFields_Should_MatchCaseInsensitivelyAcrossFields()
    {
        var result = Articles.ApplySearch("design", a => a.Title, a => a.Body).ToList();

        result.Should().HaveCount(2);
        result.Select(a => a.Id).Should().BeEquivalentTo([1, 4]);
    }

    [Fact]
    public void ApplySearch_WithExpressionFields_Should_MatchSecondFieldWhenFirstDoesNot()
    {
        var result = Articles.ApplySearch("indexing", a => a.Title, a => a.Body).ToList();

        result.Should().ContainSingle().Which.Id.Should().Be(3);
    }

    [Fact]
    public void ApplySearch_WithNoMatch_Should_ReturnEmpty()
    {
        var result = Articles.ApplySearch("nonexistent", a => a.Title, a => a.Body).ToList();

        result.Should().BeEmpty();
    }

    [Fact]
    public void ApplySearch_WithWhitespaceSearch_Should_ReturnOriginalQuery()
    {
        var result = Articles.ApplySearch("  ", a => a.Title, a => a.Body);

        result.Should().BeSameAs(Articles);
    }

    [Fact]
    public void ApplySearch_WithNullSearch_Should_ReturnOriginalQuery()
    {
        var result = Articles.ApplySearch(null, a => a.Title, a => a.Body);

        result.Should().BeSameAs(Articles);
    }

    [Fact]
    public void ApplySearch_WithNoSearchFields_Should_ReturnOriginalQuery()
    {
        var items = new List<PlainEntity>
        {
            new() { Id = 1, Name = "design patterns" },
            new() { Id = 2, Name = "postgres" }
        }.AsQueryable();

        var result = items.ApplySearch("design");

        result.Should().BeSameAs(items);
    }

    [Fact]
    public void ApplySearch_WithNullFieldValues_Should_NotThrow()
    {
        var partners = new List<SearchablePartner>
        {
            new() { Id = 1, FullName = "Ana Silva", Email = null },
            new() { Id = 2, FullName = "Carlos Mendes", Email = "carlos@spov.pt" }
        }.AsQueryable();

        var result = partners.ApplySearch("carlos").ToList();

        result.Should().ContainSingle().Which.Id.Should().Be(2);
    }

    [Fact]
    public void ApplySearch_WithISearchable_Should_SearchDeclaredProperties()
    {
        var partners = new List<SearchablePartner>
        {
            new() { Id = 1, FullName = "Ana Silva", Email = "ana@spov.pt" },
            new() { Id = 2, FullName = "Bruno Costa", Email = "bruno@gmail.com" },
            new() { Id = 3, FullName = "Carla Rocha", Email = "carla@spov.pt" }
        }.AsQueryable();

        var result = partners.ApplySearch("spov").ToList();

        result.Select(p => p.Id).Should().BeEquivalentTo([1, 3]);
    }

    [Fact]
    public void ApplySearch_WithISearchable_AndWhitespaceSearch_Should_ReturnOriginalQuery()
    {
        var partners = new List<SearchablePartner>
        {
            new() { Id = 1, FullName = "Ana Silva", Email = "ana@spov.pt" }
        }.AsQueryable();

        var result = partners.ApplySearch(" ");

        result.Should().BeSameAs(partners);
    }

    [Fact]
    public void ApplySort_Should_OrderBySingleProperty()
    {
        var result = Articles.ApplySort("title").ToList();

        result.Select(a => a.Title).Should().Equal("ASP.NET Core", "C# Design Patterns", "Design systems", "PostgreSQL tips");
    }

    [Fact]
    public void ApplySort_Should_OrderByDescending()
    {
        var result = Articles.ApplySort("title desc").ToList();

        result.Select(a => a.Title).Should().Equal("PostgreSQL tips", "Design systems", "C# Design Patterns", "ASP.NET Core");
    }

    [Fact]
    public void ApplySort_Should_IgnoreUnknownProperties()
    {
        var result = Articles.ApplySort("nonexistent, title").ToList();

        result.Select(a => a.Title).Should().Equal("ASP.NET Core", "C# Design Patterns", "Design systems", "PostgreSQL tips");
    }

    [Fact]
    public void ApplySort_WithWhitespace_Should_ReturnOriginalQuery()
    {
        var result = Articles.ApplySort(" ");

        result.Should().BeSameAs(Articles);
    }

    private sealed class SearchablePartner : ISearchable
    {
        public static IReadOnlyCollection<string> SearchableProperties { get; } = [nameof(FullName), nameof(Email)];

        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Email { get; set; }
    }

    private sealed class PlainEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
