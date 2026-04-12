<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1bjxx7kFOisQoJiTErmrTsy_4xOv7AgXo

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Azure App Service

### Option 1: Git Deployment (Recommended)

1. Create a new Azure App Service with Node.js runtime
2. In Azure Portal > Configuration > Application settings, add:
   - `GEMINI_API_KEY` - Your Gemini API key
   - `NODE_ENV` - `production`
3. Configure deployment from your Git repository
4. Azure will automatically run `npm install` and `npm run build`
5. The app will start using `npm start`

### Option 2: ZIP Deployment

1. Build the app locally:
   ```
   npm install
   npm run build
   ```
2. Create a ZIP file of the entire project including `dist` folder
3. Deploy via Azure CLI:
   ```
   az webapp deploy --resource-group <group> --name <app-name> --src-path <zip-file>
   ```

### Important Configuration

- **Startup Command**: `npm start`
- **Node Version**: >= 18.x (configured in `engines` in package.json)
- **Port**: App listens on `process.env.PORT` (set by Azure)
- **Environment Variables**: Set in Azure Portal > Configuration > Application settings
