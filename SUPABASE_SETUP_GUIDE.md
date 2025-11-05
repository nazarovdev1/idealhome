# Supabase Setup Guide - Fix RLS Policy Error

## Problem
Getting "new row violates row-level security policy" when uploading wallpapers.

## Root Cause
The application now uses **Supabase authentication** to comply with Row-Level Security (RLS) policies. The admin login automatically creates a Supabase session, allowing secure database operations.

## Solution Steps

### Step 1: Configure Supabase RLS Policies

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Run the SQL Migration**
   - Navigate to: **SQL Editor** (left sidebar)
   - Click **New Query**
   - Copy and paste the contents of `supabase-setup.sql`
   - Click **Run** (or press Ctrl+Enter)

3. **Configure Storage Bucket**
   - Navigate to: **Storage** (left sidebar)
   - Find or create the `wallpapers` bucket
   - Click on the bucket name
   - Click **Configuration** tab
   - Enable **Public bucket** (toggle ON)
   - Save changes

### Step 2: Verify Email Settings (Optional but Recommended)

Since the app creates a Supabase user automatically, you may want to disable email confirmation:

1. **Navigate to Authentication Settings**
   - Go to: **Authentication** > **Settings** (left sidebar)
   - Scroll to **Email Auth**
   
2. **Disable Email Confirmation (for development)**
   - Find "Enable email confirmations"
   - Toggle it **OFF**
   - This allows instant login without email verification

### Step 3: Test the Upload

1. **Login to Admin Panel**
   - Navigate to `/auth`
   - Username: `admin`
   - Password: `asd123`
   - First login will automatically create a Supabase user

2. **Upload a Wallpaper**
   - Go to Admin Dashboard
   - Fill in title and description
   - Select an image file
   - Click "Upload Wallpaper"
   - Should now work without RLS errors! ✅

## What Changed in the Code

### Authentication Flow
- **Before**: Only localStorage authentication (no Supabase session)
- **After**: Creates Supabase session on login (maintains localStorage for UI state)

### Files Modified
1. **`Auth.tsx`**: Now signs in/signs up with Supabase
2. **`Admin.tsx`**: Verifies both localStorage and Supabase session
3. **`Navigation.tsx`**: Signs out from Supabase on logout

### Security Benefits
- ✅ RLS policies protect your database
- ✅ Only authenticated users can upload/delete
- ✅ Public users can still view wallpapers
- ✅ Storage bucket is protected but publicly readable

## Troubleshooting

### Error: "Invalid login credentials"
- The app will automatically create the user on first login
- Just try logging in again

### Error: "Email not confirmed"
- Follow Step 2 to disable email confirmation
- Or check your email for confirmation link

### Error: Still getting RLS errors
- Verify the SQL from `supabase-setup.sql` ran successfully
- Check if policies exist: Run `SELECT * FROM pg_policies WHERE tablename = 'wallpapers';`
- Make sure storage bucket is public

### Storage upload fails
- Ensure the `wallpapers` bucket exists in Storage
- Verify storage policies were created (check the SQL output)
- Make bucket public in Storage settings

## Need Help?

If you're still experiencing issues:
1. Check the browser console for detailed error messages
2. Check Supabase logs in Dashboard > Logs
3. Verify your environment variables (`.env` file):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
