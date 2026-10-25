# TuitionDesk - Complete Hosting & Deployment Guide

TuitionDesk is a Vite + React application with a standalone Parent Portal (`parent.html`). When built, it produces a pure static bundle inside the `dist/` directory that can be hosted anywhere for free.

---

## 1. Instant Access (Already Hosted in AI Studio)

Your app is currently running live on Google Cloud Run:
- **Tutor / Admin Desk**: `https://ais-pre-gukxanyar6aucgc34nfrz6-11902239593.asia-northeast1.run.app`
- **Parent Portal**: `https://ais-pre-gukxanyar6aucgc34nfrz6-11902239593.asia-northeast1.run.app/parent.html`

You can share the **Parent Portal URL** with parents right away.

---

## 2. Deploying to Vercel (Recommended - 100% Free)

1. Push your code to a **GitHub** repository.
2. Go to [https://vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Vercel will automatically detect the settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. *(Optional)* Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`: `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `your-anon-key`
6. Click **Deploy**.
7. In ~30 seconds, you get a live URL (e.g. `https://tuitiondesk.vercel.app`):
   - Tutor App: `https://tuitiondesk.vercel.app`
   - Parent Portal: `https://tuitiondesk.vercel.app/parent.html`

---

## 3. Deploying to Netlify (Free)

1. Go to [https://www.netlify.com](https://www.netlify.com) and sign in.
2. Click **"Add new site"** -> **"Import an existing project"**.
3. Select your GitHub repository.
4. Set:
   - **Base directory**: (leave empty)
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Click **Deploy Site**.

To support client-side routing on Netlify, add a `_redirects` file in `public/_redirects`:
```text
/parent.html    /parent.html   200
/*              /index.html    200
```

---

## 4. Deploying to Cloudflare Pages (Free & Fastest in India)

1. Go to Cloudflare Dashboard -> **Workers & Pages** -> **Create Application** -> **Pages**.
2. Connect your GitHub repository.
3. Build configuration:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**. Cloudflare has Mumbai and Delhi edge data centers, making page loads near-instant across India.

---

## 5. Adding Your Custom Domain (e.g. `apexacademy.in`)

Once deployed on Vercel, Netlify, or Cloudflare:
1. In the project settings, click **Domains** -> **Add Domain** (e.g., `classes.apexacademy.in`).
2. Add the provided CNAME record in your domain registrar (GoDaddy, Namecheap, Hostinger, etc.).
3. SSL certificates are issued automatically for free!

---

## 6. How Parents Access on Mobile

Tell parents to:
1. Open `https://your-domain.com/parent.html` on their phone.
2. In Chrome/Safari, tap **"Add to Home Screen"**.
3. It installs like an app icon on their phone without needing Google Play Store!
