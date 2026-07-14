namespace SPOV.Application.Common.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(string fileName, Stream content);
}
