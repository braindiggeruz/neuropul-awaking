# NeuropulAI Deployment Guide

This document provides instructions for deploying the NeuropulAI application to various hosting platforms.

## Prerequisites

- Node.js 20 or later
- npm 10 or later
- Git (optional, for version control)

## Environment Setup

The application requires several environment variables to function properly. These are set in the `.env` file for local development and in the hosting platform's environment settings for production.

Key environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for serverless functions)
- `OPENAI_API_KEY`: Your OpenAI API key
- `APP_ENV`: Set to "production" for production deployments
- `DEFAULT_LANGUAGE`: Default language for the application (ru/uz)

## Build Process

To build the application for production:

```bash
# Install dependencies
npm install

# Build the application
npm run build
```

This will create a `dist` directory containing the compiled application.

## Deployment Options

### Netlify (Recommended)

1. **Using Netlify CLI**:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize a new site (first time only)
netlify init

# Deploy to production
netlify deploy --prod
```

2. **Using Netlify UI**:
   - Connect your GitHub repository to Netlify
   - Set build command to `npm run build`
   - Set publish directory to `dist`
   - Configure environment variables in the Netlify dashboard

### Vercel

1. **Using Vercel CLI**:

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

2. **Using Vercel UI**:
   - Connect your GitHub repository to Vercel
   - Set build command to `npm run build`
   - Set output directory to `dist`
   - Configure environment variables in the Vercel dashboard

## Post-Deployment Verification

After deploying, verify the following:

1. **Application loads correctly**: Visit the deployed URL and ensure the application loads without errors
2. **API endpoints work**: Test the API endpoints to ensure they're functioning correctly
3. **Authentication works**: Test user authentication flows
4. **Language switching works**: Test switching between Russian and Uzbek
5. **XP system works**: Verify that XP is awarded and stored correctly
6. **PDF generation works**: Test the PDF generation functionality

## Troubleshooting

### Common Issues

1. **API endpoints return 404**:
   - Check that the redirects in `netlify.toml` or `vercel.json` are configured correctly

2. **Environment variables not working**:
   - Verify that all required environment variables are set in the hosting platform's dashboard
   - For Netlify, check the "Environment" section in the site settings
   - For Vercel, check the "Environment Variables" section in the project settings

3. **PDF generation fails**:
   - Check that the `html2canvas` and `jspdf` dependencies are correctly included in the build
   - Verify that the serverless function for PDF generation has the correct permissions

4. **Supabase connection issues**:
   - Verify that the Supabase URL and keys are correct
   - Check that the Supabase project is active and accessible

## Maintenance

### Updating the Application

To update the deployed application:

1. Make changes to the codebase
2. Test locally using `npm run dev`
3. Build the application using `npm run build`
4. Deploy using the same method as the initial deployment

### Monitoring

- Use the hosting platform's built-in monitoring tools to track application performance
- Check error logs regularly for any issues
- Monitor API usage to ensure you stay within limits

## Current Deployment Status

- **Production URL**: https://neuropul.ai
- **Staging URL**: https://staging.neuropul.ai
- **Last Deployed**: [Date of last deployment]
- **Deployed By**: [Name of deployer]

## Known Issues

- None at this time

## Contact

For deployment issues or questions, contact the development team at [contact email].