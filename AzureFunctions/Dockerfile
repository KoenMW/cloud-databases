# build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build  # should compile TS -> dist/

# runtime (Azure Functions Node)
FROM mcr.microsoft.com/azure-functions/node:4-node22@sha256:bfd2846101d8928809312d942679b3741d9d58ac2c06c2693f18f098d5877c83
ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    FUNCTIONS_WORKER_RUNTIME=node
WORKDIR /home/site/wwwroot

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/host.json ./host.json
COPY --from=build /app/local.settings.json ./local.settings.json
COPY --from=build /app/dist ./dist
# If you keep function.json under each function folder, ensure your build copies them into dist.
