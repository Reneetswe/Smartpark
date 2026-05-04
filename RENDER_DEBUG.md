# Render Deployment Debug Instructions

## STEP 1: Change Start Command Temporarily

Go to Render Dashboard → Your Service → Settings → Start Command

**Change from:**
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Change to:**
```
python test_import.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

This will run the test script first and show us the EXACT error.

## STEP 2: Deploy and Check Logs

1. Save the settings (Render will auto-deploy)
2. Go to Logs tab
3. Look for the test output showing which import fails
4. Screenshot the error and share it

## STEP 3: After We Fix It

Change the Start Command back to:
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

---

## Alternative: Check Environment Variables

Go to Render Dashboard → Your Service → Environment

**Required variables:**
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `SECRET_KEY` - Any random string (e.g., `your-secret-key-here`)
- `FRONTEND_URL` - Your Vercel frontend URL (e.g., `https://yourapp.vercel.app`)

If `DATABASE_URL` is missing, that's the problem!
