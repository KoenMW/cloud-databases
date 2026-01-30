# cloud-databases

A proof-of-concept property management system with a C# API for house listings and mortgage offers, integrated with Azure Functions for background processing via RabbitMQ.

## System Architecture

```ascii
┌─────────────────┐
│   C# API        │
│  (Port 5070)    │
│                 │
│ - House CRUD    │
│ - Search        │
│ - Mortgage      │
│   Offers        │
└────────┬────────┘
         │
         ├──────────────────────┬──────────────────┐
         │                      │                  │
    ┌────▼──────┐        ┌──────▼──────┐     ┌─────▼─────┐
    │PostgreSQL │        │   RabbitMQ  │     │  Azurite  │
    │Database   │        │   Queue     │     │  (Blob)   │
    │           │        │             │     │           │
    └───────────┘        └──────┬──────┘     └───────────┘
                                │
                         ┌──────▼────────┐
                         │ Azure         │
                         │ Functions     │
                         │               │
                         │ - Process     │
                         │   Mortgages   │
                         │ - Send        │
                         │   Emails      │
                         └────────┬──────┘
                                  │
                         ┌────────▼──────┐
                         │   PostgreSQL  │
                         │   Database    │
                         └───────────────┘
```

## Local Development Setup

### Prerequisites

- Node.js (version 22 or later)
- .NET SDK (version 9.0 or later)
- Azure Functions Core Tools
- Azurite (for local Azure Storage emulation)
- Docker (optional, for containerized setup)

### Getting Started

#### Option 1: Local Development

1. **Start PostgreSQL and RabbitMQ** (using Docker):

   ```bash
   docker compose up postgres rabbitmq
   ```

2. **Start Azurite** (in a separate terminal):

   ```bash
   cd azurite
   azurite --skipApiVersionCheck
   ```

3. **Start the C# API** (in a separate terminal):

   ```bash
   cd CSharpApi
   dotnet restore
   dotnet run
   ```

4. **Start Azure Functions** (in a separate terminal):

   ```bash
   cd AzureFunctions
   npm install
   npm start
   ```

#### Option 2: Docker Compose

Run all services together (except Azurite, which is for local development):

```bash
docker compose up
```

**Note**: Azurite still needs to be run separately for local development:

```bash
cd azurite
azurite --skipApiVersionCheck
```

## API Endpoints

All endpoints are available on the C# API at `http://localhost:5070`.

### Health Check

#### `GET /health`

Returns the health status of the API.

**Response:**

```json
{
  "status": "Healthy",
  "version": "0.0.2",
  "timestamp": "2026-01-30T10:30:00Z"
}
```

---

### House Management

#### `GET /houses`

Retrieves all house listings from the database.

**Response:**

```json
[
  {
    "id": 1,
    "numberOfRooms": 3,
    "sizeInSquareMeters": 120.5,
    "price": 250000.0,
    "hasGarage": true,
    "hasGarden": true,
    "imageUrl": "https://blob-storage-url/..."
  }
]
```

---

#### `GET /houses/{id}`

Retrieves a specific house by ID.

**Parameters:**

- `id` (path): House ID (integer)

**Response:**

```json
{
  "id": 1,
  "numberOfRooms": 3,
  "sizeInSquareMeters": 120.5,
  "price": 250000.0,
  "hasGarage": true,
  "hasGarden": true,
  "imageUrl": "https://blob-storage-url/..."
}
```

**Error Response (404):**

```json
{
  "error": "House not found"
}
```

---

#### `GET /houses/search`

Searches for houses within a specified price range.

**Parameters:**

- `minPrice` (query): Minimum price (double)
- `maxPrice` (query): Maximum price (double)

**Example:**

```http
GET /houses/search?minPrice=200000&maxPrice=350000
```

**Response:**

```json
[
  {
    "id": 1,
    "numberOfRooms": 3,
    "sizeInSquareMeters": 120.5,
    "price": 250000.0,
    "hasGarage": true,
    "hasGarden": true,
    "imageUrl": "https://blob-storage-url/..."
  }
]
```

---

#### `POST /houses`

Creates a new house listing with an image upload.

**Request:**

- Content-Type: `multipart/form-data`

**Form Fields:**

- `house` (form field): JSON object containing:
  - `numberOfRooms` (integer, required): Must be > 0
  - `sizeInSquareMeters` (double, required): Must be > 0
  - `price` (double, required): Must be > 0
  - `hasGarage` (boolean, optional): Default is false
  - `hasGarden` (boolean, optional): Default is false
- `image` (file, required): Image file for the house listing

**Example using cURL:**

```bash
curl -X POST http://localhost:5070/houses \
  -F "house={\"numberOfRooms\":3,\"sizeInSquareMeters\":120.5,\"price\":250000,\"hasGarage\":true,\"hasGarden\":true}" \
  -F "image=@/path/to/image.jpg"
```

**Success Response (201):**

```json
{
  "id": 1,
  "numberOfRooms": 3,
  "sizeInSquareMeters": 120.5,
  "price": 250000.0,
  "hasGarage": true,
  "hasGarden": true,
  "imageUrl": "https://blob-storage-url/..."
}
```

**Error Response (400):**

```json
{
  "error": "Image file is required."
}
```

---

#### `PUT /houses/{id}`

Updates an existing house listing with optional image replacement.

**Parameters:**

- `id` (path): House ID (integer)

**Request:**

- Content-Type: `multipart/form-data`

**Form Fields:**

- `house` (form field): JSON object with fields to update (same structure as POST)
- `image` (file, optional): New image file (leave blank to keep existing image)

**Example using cURL:**

```bash
curl -X PUT http://localhost:5070/houses/1 \
  -F "house={\"numberOfRooms\":4,\"sizeInSquareMeters\":150,\"price\":300000}" \
  -F "image=@/path/to/new-image.jpg"
```

**Success Response (201):**

```json
{
  "id": 1,
  "numberOfRooms": 4,
  "sizeInSquareMeters": 150.0,
  "price": 300000.0,
  "hasGarage": true,
  "hasGarden": true,
  "imageUrl": "https://blob-storage-url/..."
}
```

---

#### `DELETE /houses/{id}`

Deletes a house listing by ID.

**Parameters:**

- `id` (path): House ID (integer)

**Success Response (204):**
No content returned.

**Error Response (400):**

```json
{
  "error": "Error message"
}
```

---

### Mortgage Offers

#### `POST /mortgage-offer`

Submits a mortgage offer for processing. The offer is placed in a RabbitMQ queue and processed asynchronously by Azure Functions.

**Request:**

```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "annualIncome": 75000.0,
  "loanAmount": 200000.0,
  "loanTermYears": 30
}
```

**Success Response (200):**

```json
{
  "message": "Mortgage offer received successfully, it will be processed at night"
}
```

**Background Processing Flow:**

1. Mortgage offer is validated and sent to RabbitMQ
2. Azure Functions consume the message from the queue
3. Each offer is randomly approved/rejected (POC logic)
4. Results are stored in PostgreSQL `processed_mortgages` table with a `processed_at` timestamp
5. Morning email function retrieves unprocessed results and marks them as sent

---

## Database Schema

### Houses Table

```sql
CREATE TABLE Houses (
  Id INT PRIMARY KEY,
  NumberOfRooms INT NOT NULL,
  SizeInSquareMeters DECIMAL(10, 2) NOT NULL,
  Price DECIMAL(15, 2) NOT NULL,
  HasGarage BOOLEAN,
  HasGarden BOOLEAN,
  ImageUrl VARCHAR(2000)
);
```

### Processed Mortgages Table

```sql
CREATE TABLE processed_mortgages (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  annual_income DECIMAL(15, 2),
  loan_amount DECIMAL(15, 2),
  loan_term_years INT,
  accepted BOOLEAN,
  processed_at TIMESTAMP,
  notifications_sent BOOLEAN DEFAULT FALSE
);
```

---

## Environment Configuration

### PostgreSQL Connection

Set in `docker-compose.yml`:

- Host: `postgres`
- Port: `5432`
- Database: `buy_my_house`
- Username: `postgres`
- Password: `example`

### RabbitMQ

- Host: `rabbitmq`
- Port: `5672`
- Default Queue: `mortgage`
- Username: `guest`
- Password: `guest`

### Azure Storage (Azurite)

- Connection uses local Azurite emulation for blob storage
- Images are uploaded with unique timestamps in their filenames

---

## Azure Functions

### morning_mail

**Trigger:** Timer (Daily at 7:00 AM, or every 2 minutes in testing mode)

**Functionality:**

1. Queries processed mortgages where notifications have not been sent
2. For each record:
   - Generates a PDF document with mortgage details
   - Uploads PDF to Azure Blob Storage
   - Marks notification as sent in the database
   - Logs the action (no actual email sent in POC)

---

### nigthly_batch

**Trigger:** Timer (Daily at 00:00, or every 2 hours in testing mode)

**Functionality:**

1. Connects to RabbitMQ and consumes mortgage offer messages
2. For each message:
   - Parses the mortgage offer data
   - Randomly accepts/rejects (POC simulation)
   - Records result in PostgreSQL with timestamp
3. Waits 1 second for new messages, then closes connection
4. Logs completion with message count

---

## Additional Information

- Ensure that you have the correct versions of Node.js and .NET SDK installed.
- No authentication is configured. This is a proof-of-concept system.
- For more details on Azure Functions, refer to the [official documentation](https://docs.microsoft.com/en-us/azure/azure-functions/).
- For Azurite, refer to the [Azurite GitHub Repository](https://github.com/Azure/Azurite).
