import {
  BlobSASPermissions,
  BlobServiceClient,
  ContainerClient,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";

let blobServiceClient: BlobServiceClient | undefined = undefined;
let containerClient: ContainerClient | undefined = undefined;

const getContainerClient = () => {
  const accountName = process.env.BLOB_ACCOUNT_NAME ?? "devstoreaccount1";
  const accountKey =
    process.env.BLOB_ACCOUNT_KEY ??
    "Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==";
  const containerName = "mortgage-documents";
  const endpoint =
    process.env.BLOB_ENDPOINT ?? "http://127.0.0.1:10000/devstoreaccount1";

  const credential = new StorageSharedKeyCredential(accountName, accountKey);

  if (!blobServiceClient) {
    blobServiceClient = new BlobServiceClient(endpoint, credential);
  }
  if (!containerClient) {
    containerClient = blobServiceClient.getContainerClient(containerName);
  }

  return { containerClient, credential, containerName };
};

export const uploadPdfAndGetSasUrl = async (
  fileName: string,
  pdfBuffer: Buffer,
  validMinutes = 60,
): Promise<string> => {
  const { containerClient, credential, containerName } = getContainerClient();

  await containerClient.createIfNotExists();

  const blockBlobClient = containerClient.getBlockBlobClient(fileName);

  await blockBlobClient.uploadData(pdfBuffer, {
    blobHTTPHeaders: { blobContentType: "application/pdf" },
  });

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName: fileName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: new Date(),
      expiresOn: new Date(Date.now() + validMinutes * 60 * 1000),
    },
    credential,
  ).toString();

  return `${blockBlobClient.url}?${sasToken}`;
};
