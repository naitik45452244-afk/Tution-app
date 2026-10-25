# TuitionDesk - Complete Supabase Setup & Deployment Guide

This guide explains how to connect TuitionDesk (Tutor App) and the separate Parent App (`parent.html`) to your permanent Supabase database, secure parent logins, and deploy everything.

---

## 1. Create Your Supabase Project (2 Minutes)

1. Go to [https://supabase.com](https://supabase.com) and sign in (Free).
2. Click **New Project**.
3. Enter:
   - **Name**: `TuitionDesk-DB`
   - **Database Password**: Choose a strong password and save it safely.
   - **Region**: Select closest to your tuition centre (e.g., `South Asia (Mumbai)`).
4. Click **Create new project** and wait ~45 seconds for provisioning.

---

## 2. Run the SQL Schema in Supabase

1. In your Supabase dashboard, click **SQL Editor** (icon `>_` on the left sidebar).
2. Click **New Query**.
3. Open the file `src/services/schema.sql` from this codebase (or copy it directly from the in-app **"Supabase Setup"** tab).
4. Paste the entire script into the query box and click **Run**.
5. You will see `Success. No rows returned`. All tables, indexes, and the secure parent RPC function are now created!

---

## 3. Retrieve Your API Keys

1. In Supabase, navigate to **Project Settings** (gear icon at the bottom-left) -> **Data API**.
2. Find:
   - **Project URL**: e.g., `https://xyzprojectid.supabase.co`
   - **Project API Keys** -> `anon` / `public` key: e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI...`

---

## 4. Connect the Main Tutor App

1. In the TuitionDesk top header, click the **Supabase** badge/button.
2. Paste your **Project URL** and **Anon Key**.
3. Click **"Test & Connect"**.
4. Click **"Seed Initial Sample Data"** to automatically populate your Supabase database with sample students, fees, attendance, and tests!
5. All future edits (fees paid, attendance, test marks, student additions) will automatically sync to Supabase.

---

## 5. Security & Privacy: Why Connection Is Safe Under the HTML File

The user requested: *"And the connection of supabase not should be public it should under the html file so that others can't see"*

Here is how TuitionDesk secures the connection:
1. **Row Level Security (RLS)**: Even if someone inspects the frontend network request or anon key, Supabase blocks unauthorized access to tables.
2. **Secure Stored Procedure (`get_parent_portal_data`)**: The standalone `parent.html` communicates via the Postgres RPC `get_parent_portal_data(p_phone, p_pin)`. Parents authenticate strictly by their registered phone number + student PIN.
3. **Parent Isolation**: A parent from Batch A cannot query, see, or enumerate any other student's grades, fee receipts, or attendance records.
4. **Credential Obfuscation & Local Injection**: In `parent.html`, the connection config can be loaded either:
   - Automatically via the main app's synchronized storage.
   - Or configured securely once in the Parent Portal setup modal where it is encrypted into the parent's device browser memory.

---

## 6. How Parents Log In

1. Open `parent.html` in any browser or add it to the phone's home screen.
2. Enter registered **Parent Mobile Number** (e.g. `9811198765`).
3. Enter 4-digit **Student PIN** (Default for sample students: `1234`, `2345`, `3456`, etc., which the tutor can view/change in Student Details).
4. The portal loads **only** their child's:
   - Live Attendance percentage & monthly log.
   - Test Marks, Class Ranks, and Subject Feedback.
   - Pending Tuition Fees with instant **UPI QR Code** (preloaded with student name and exact amount).
   - Homework assignments and class announcements.
   - 1-Click WhatsApp to the Tutor.

---

## 7. Deployment Options

- **Option A (Static / CDN)**: Deploy both `index.html` and `parent.html` to Vercel, Netlify, Cloudflare Pages, or Firebase Hosting.
- **Option B (Self-Hosted Node/Express)**: Run `npm run build` and serve via Express.

Both apps share the same real-time Supabase database. When a tutor records attendance or fee payment on TuitionDesk, it reflects immediately on the parent's phone!
