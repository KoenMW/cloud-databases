# cloud-databases

## Local Development Setup

### Prerequisites

- Node.js (version 22 or later)
- .NET SDK (version 9.0 or later)
- Azure Functions Core Tools
- Azurite (for local Azure Storage emulation)

### Getting Started

1. Navigate to the AzureFunctions directory:

   ```bash
   cd AzureFunctions
   ```

2. Install the necessary dependencies:

   ```bash
   npm install
   ```

3. Start the Azure Functions host:

   ```bash
   npm start
   ```

### Running Azurite

To run Azurite, navigate to the `azurite` folder and execute the following command:

```bash
azurite
```

### Running the C# API

To run the C# API, navigate to the `CSharpApi` directory and execute the following commands:

1. Install the necessary dependencies:

   ```bash
   dotnet restore
   ```

2. Start the C# API:

   ```bash
   dotnet run
   ```

### Running with Docker

You can also run the services using Docker. To do this, ensure you have Docker installed and then execute the following command from the root of the project:

```bash
docker compose up
```

This will start all the services defined in the `docker-compose.yml` file. However, note that Azurite still needs to be run separately:

Start Azurite:

   ```bash
   azurite
   ```

### Additional Information

- Ensure that you have the correct versions of Node.js and .NET SDK installed.
- For more details on Azure Functions, refer to the [official documentation](https://docs.microsoft.com/en-us/azure/azure-functions/).
- For Azurite, refer to the [Azurite GitHub repository](https://github.com/Azure/Azurite).
