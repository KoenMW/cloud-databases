using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using CSharpApi.src.interfaces;

namespace CSharpApi.src.service
{

    public class BlobService : IBlobService
    {
        private readonly BlobContainerClient _container;

        public BlobService()
        {
            var conn = Environment.GetEnvironmentVariable("AZURE_BLOB_CONNECTION")
                ?? "UseDevelopmentStorage=true";
            var containerName = "house-images";

            _container = new BlobContainerClient(conn, containerName);
            _container.CreateIfNotExists();
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
        {
            var blobClient = _container.GetBlobClient(fileName);
            await blobClient.UploadAsync(fileStream, new BlobHttpHeaders { ContentType = contentType });
            return blobClient.Uri.ToString();
        }
    }
}
