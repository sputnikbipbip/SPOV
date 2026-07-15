using SPOV.Domain.Entities;

namespace SPOV.Domain.Interfaces;

public interface IArticleRepository
{
    Task<List<Article>> GetAllAsync();
    Task<Article?> GetByIdAsync(int id);
    Task<Article> AddAsync(Article article);
}
