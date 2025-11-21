# Deployment Guide for Aura Duo

This Next.js application uses API routes and requires a server-side environment. **GitHub Pages cannot host this application** because it only serves static files.

## Recommended: Deploy to Vercel (Easiest)

Vercel is the best platform for Next.js applications and offers free hosting.

### Steps:

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "New Project"
   - Import your repository: `Yashwanth-Kumar-Kotla/aura_duo_project`
   - Vercel will auto-detect Next.js settings

3. **Add Environment Variables**:
   - In your Vercel project settings, go to "Environment Variables"
   - Add:
     - `OPENAI_API_KEY` = your OpenAI API key
     - `GEMINI_API_KEY` = your Gemini API key
   - Click "Redeploy" after adding variables

4. **Your site will be live!** Vercel will give you a URL like `https://aura-duo.vercel.app`

## Alternative: Deploy to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with GitHub
3. Click "Add new site" → "Import an existing project"
4. Select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Add environment variables in Site settings → Environment variables
7. Deploy!

## Alternative: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables in the Variables tab
6. Railway will automatically detect Next.js and deploy

## Why GitHub Pages Won't Work

- GitHub Pages only serves static HTML/CSS/JS files
- Your app uses Next.js API routes (`/api/chat`, `/api/list-models`) which require a Node.js server
- API routes need to access environment variables and make server-side API calls
- GitHub Pages has no server-side execution capability

## Local Development

To run locally:
```bash
npm install
npm run dev
```

Make sure to create a `.env.local` file with:
```
OPENAI_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

## Troubleshooting

- **Build fails**: Check that all dependencies are in `package.json`
- **API errors**: Verify environment variables are set correctly
- **404 errors**: Make sure you're deploying to a platform that supports Next.js (not GitHub Pages)

