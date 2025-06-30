# NeuropulAI Deployment Guide

## Overview

This document provides instructions for deploying the NeuropulAI application in both local development and production environments.

## Local Development

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/neuropul-ai.git
   cd neuropul-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

4. Edit `.env.local` to add your API keys and configuration.

5. Start the development server:
   ```bash
   npm run dev
   ```

6. The application will be available at `http://localhost:5173`

## Production Deployment

### Building for Production

1. Ensure all environment variables are set in `.env.production`:
   ```
   APP_ENV=production
   ENABLE_DEBUG=false
   DISABLE_PDF_GEN=false
   DEFAULT_LANGUAGE=ru
   TIMEOUT=30000
   CHECK_STATUS=true
   ERROR_LOGGER=true
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. The production build will be available in the `dist` directory.

### Deploying to Netlify

1. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

4. When prompted, specify `dist` as the publish directory.

### Deploying to Vercel

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

### Deploying to Firebase

1. Install the Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase (if not already done):
   ```bash
   firebase init hosting
   ```

4. Deploy to Firebase:
   ```bash
   firebase deploy --only hosting
   ```

## Environment Variables

The following environment variables are required for production:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `OPENAI_API_KEY`: Your OpenAI API key

## Post-Deployment Verification

After deploying, verify the following:

1. The application loads correctly
2. Language switching works
3. All animations and transitions are smooth
4. XP system works and persists
5. Error handling works correctly
6. All API endpoints are accessible
7. Responsive design works on all devices

## Troubleshooting

If you encounter issues during deployment:

1. Check the browser console for errors
2. Verify all environment variables are set correctly
3. Check the network tab for failed API requests
4. Ensure all required dependencies are installed
5. Check the build logs for any compilation errors

## Support

For additional support, contact the NeuropulAI development team at support@neuropul.ai