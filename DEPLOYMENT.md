# Deploy Tattletale to Netlify

Your website is **100% ready to deploy**. Here's how to get it live in 2 minutes:

## Option 1: Netlify Drop (Easiest - No Account Needed)

1. Go to **https://app.netlify.com/drop**
2. **Drag** the entire `dist` folder onto the page
3. Wait 30 seconds
4. **Done!** You get a live URL like `https://random-name-12345.netlify.app`

### Set Environment Variables:
1. Click **Site settings** → **Environment variables**
2. Add these two variables:
   - `VITE_SUPABASE_URL` = `https://zhzdehswlygmhbdsrhax.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoemRlaHN3bHlnbWhiZHNyaGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjA3MzAsImV4cCI6MjA3NjEzNjczMH0.arjiy5jDcydkzFpJbqsruOhn1o9Guqu1Rcw8bcL2mbo`
3. Click **Trigger deploy** to rebuild with environment variables

---

## Option 2: Netlify CLI (Connect to Git)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

When prompted:
- **Publish directory:** `dist`
- The CLI will give you a live URL

### After deployment, set environment variables:
```bash
netlify env:set VITE_SUPABASE_URL "https://zhzdehswlygmhbdsrhax.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoemRlaHN3bHlnbWhiZHNyaGF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1NjA3MzAsImV4cCI6MjA3NjEzNjczMH0.arjiy5jDcydkzFpJbqsruOhn1o9Guqu1Rcw8bcL2mbo"
```

---

## Option 3: Connect to GitHub (Automatic Deployments)

1. Push your code to GitHub
2. Go to **https://app.netlify.com**
3. Click **Add new site** → **Import from Git**
4. Select your repository
5. Netlify auto-detects settings from `netlify.toml`
6. Add environment variables in **Site settings** → **Environment variables**
7. Every push to GitHub will automatically deploy!

---

## Option 4: Vercel (Alternative)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

Add environment variables in the Vercel dashboard.

---

## What's Included:

✅ Full transcription web app with speaker detection
✅ Supabase database (already configured)
✅ Export to TXT, SRT, VTT, JSON formats
✅ File upload and URL transcription
✅ Responsive design
✅ Mac app download button

## After Deployment:

1. **Upload the Mac app** (`Tattletale-1.0.0-Mac.tar.gz`) to your hosting
2. **Update the download button** in `src/App.tsx` to point to the file
3. Users can download and install the desktop app!

---

## Need Custom Domain?

In Netlify:
1. **Domain settings** → **Add custom domain**
2. Follow instructions to point your domain to Netlify
3. Free SSL certificate included!

Your site is ready to go live! 🚀
