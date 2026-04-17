# Azure App Service Deployment Guide

This guide explains how to deploy the EV Companion app to Azure App Service on Linux.

## Prerequisites

- Azure account with active subscription
- Azure CLI installed (`az`)
- Node.js 18+ installed locally

## Quick Deploy

### 1. Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name ev-companion-rg --location eastus

# Create App Service Plan (Linux)
az appservice plan create --name ev-companion-plan \
  --resource-group ev-companion-rg \
  --sku B1 \
  --is-linux

# Create Web App
az webapp create --name ev-companion-<unique-id> \
  --resource-group ev-companion-rg \
  --plan ev-companion-plan \
  --runtime "NODE|18-lts"
```

### 2. Configure Startup Command

```bash
az webapp config set --startup-file startup.sh \
  --name ev-companion-<unique-id> \
  --resource-group ev-companion-rg
```

### 3. Set Environment Variables

```bash
az webapp config appsettings set --name ev-companion-<unique-id> \
  --resource-group ev-companion-rg \
  --settings GEMINI_API_KEY="your-api-key-here"
```

### 4. Deploy

**Option A: Using ZIP Deploy**

```bash
# Create deployment package
npm run azure:package

# Deploy
az webapp deployment source config-zip \
  --resource-group ev-companion-rg \
  --name ev-companion-<unique-id> \
  --src deploy.zip
```

**Option B: Using GitHub Actions**

1. Fork this repo to your GitHub organization
2. In Azure Portal, get the publish profile for your web app
3. In GitHub repo settings, add secrets:
   - `AZURE_WEBAPP_PUBLISH_PROFILE`: Paste the publish profile XML
4. In GitHub repo settings, add variables:
   - `AZURE_WEBAPP_NAME`: Your web app name (e.g., `ev-companion-<unique-id>`)
5. Push to main branch to trigger deployment

## Configuration Reference

### Required Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Gemini API key | Required |
| `PORT` | Server port (set by Azure) | 8080 |
| `NODE_ENV` | Environment | production |

### App Service Plan Recommendations

| Tier | Use Case | Monthly Cost (approx.) |
|------|----------|------------------------|
| B1 | Development/Testing | ~$50 |
| S1 | Production (small) | ~$70 |
| S2 | Production (medium) | ~$140 |

### Startup Script

The `startup.sh` script:
1. Installs npm dependencies
2. Builds the React app (`npm run build`)
3. Starts the Express server (`npm start`)

Azure automatically runs the startup file on app startup and restart.

## Troubleshooting

### View Logs

```bash
az webapp log tail --name ev-companion-<unique-id> \
  --resource-group ev-companion-rg
```

### Common Issues

1. **App won't start**: Check that `startup.sh` is executable and has Unix line endings
   ```bash
   dos2unix startup.sh
   ```

2. **Port binding errors**: The server is configured to listen on `0.0.0.0` which is required for Azure containers

3. **Build failures**: Check Node.js version compatibility (requires 18+)

4. **API errors**: Verify `GEMINI_API_KEY` is set correctly in App Settings

## Pricing Calculator

Use the [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/) to estimate costs for your specific configuration.
