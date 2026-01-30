namespace CSharpApi.src.interfaces
{
    public interface IBlobService
    {
        Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType);
    }
}