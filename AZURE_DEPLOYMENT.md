# Azure App Service Deployment Configuration
# ==========================================
#
# This file documents the deployment settings for Azure App Service (Linux)
#
# Deployment Steps:
# -----------------
# 1. Create a Web App in Azure Portal or use Azure CLI:
#    az webapp create --resource-group <resource-group> --plan <app-service-plan> --name <app-name> --runtime "NODE|18-lts"
#
# 2. Configure startup command:
#    az webapp config set --startup-file startup.sh --name <app-name>
#
# 3. Deploy using ZIP deploy or GitHub Actions:
#    az webapp deployment source config-zip --resource-group <resource-group> --name <app-name> --src deploy.zip
#
# Environment Variables:
# ---------------------
# - GEMINI_API_KEY: Your Gemini API key
# - PORT: Automatically set by Azure (default: 8080)
# - NODE_ENV: production
#
# Recommended App Service Plan:
# ----------------------------
# - Linux
# - Node.js 18 LTS runtime
# - Minimum: B1 (Basic) or higher for production
