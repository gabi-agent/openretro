# Docker Compose Deployment Guide for SmartSolar Microservices

This guide describes how to deploy SmartSolar microservices using Docker Compose with synchronized JWT authentication.

## 🔑 JWT Authentication Configuration

To ensure end-users can be authenticated across all services, the following environment variables **MUST** be synchronized with the Identity Service:

| Variable | Recommended Value | Description |
| :--- | :--- | :--- |
| `JWT:Secret` | `JWTfsdfasggfadsff979679fadsf092332d4324asdVVVp1OH7Xzyr` | Secret key used to sign/verify tokens |
| `JWT:ValidAudience` | `https://*.smartsolar.io.vn` | Allowed audience (supports subdomains) |
| `JWT:ValidIssuer` | `https://smartsolar.io.vn` | Trusted token issuer |

## 🚀 Deployment Steps

### 1. Update `docker-compose.yml`

Add the JWT configurations to the `environment` section of your service:

```yaml
services:
  your-service-name:
    image: smartsolar-your-service:latest
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - JWT:Secret=JWTfsdfasggfadsff979679fadsf092332d4324asdVVVp1OH7Xzyr
      - JWT:ValidAudience=https://*.smartsolar.io.vn
      - JWT:ValidIssuer=https://smartsolar.io.vn
    ports:
      - "XXXX:80"
```

### 2. Standard Dockerfile Pattern

For .NET 8.0 Clean Architecture projects, use this optimized multi-stage `Dockerfile`:

```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project files and restore
COPY ["src/YourProject.Api/YourProject.Api.csproj", "src/YourProject.Api/"]
# ... copy other layer .csproj files
RUN dotnet restore "src/YourProject.Api/YourProject.Api.csproj"

# Copy full source and build
COPY . .
WORKDIR "/src/src/YourProject.Api"
RUN dotnet publish "YourProject.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 80
ENV ASPNETCORE_URLS=http://+:80
ENTRYPOINT ["dotnet", "YourProject.Api.dll"]
```

### 3. Deploy/Update Command

Run the following command in the directory containing your `docker-compose.yml`:

```bash
docker compose up -d --build --force-recreate
```

## ⚠️ Important Notes
- **Case Sensitivity:** Ensure your controllers use `[Authorize(Roles = "Admin,admin")]` to handle case variations in roles from the Identity Service.
- **Health Checks:** Always use port `80` inside the container if using `ASPNETCORE_URLS=http://+:80`.
