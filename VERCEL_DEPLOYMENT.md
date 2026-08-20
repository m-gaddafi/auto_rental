# Deploying Django on Vercel

Vercel functions cannot use the repository's `db.sqlite3`: the function filesystem
is read-only and any temporary files would disappear between requests. This project
uses SQLite only when neither `DATABASE_URL` nor `POSTGRES_URL` is available.

## Configure the production database

1. In **Vercel → Project → Settings → Environment Variables**, make sure the
   PostgreSQL connection string is available to the **Production** environment.
   Vercel Postgres normally exposes this as `POSTGRES_URL`. If your provider gives
   a `DATABASE_URL`, add that variable instead. `DATABASE_URL` takes precedence.
2. Redeploy so Vercel installs the new PostgreSQL dependencies in
   `requirements.txt` and the function receives the environment variable.

## Run migrations against production

Migrations must be run by a command with access to the production database; a
serverless HTTP request does not run them. From a machine authenticated with the
Vercel CLI:

```powershell
vercel env pull .env.vercel.local --environment=production
$env:DATABASE_URL = (Get-Content .env.vercel.local |
  Where-Object { $_ -match '^DATABASE_URL=' } |
  ForEach-Object { $_.Substring('DATABASE_URL='.Length) })

# If Vercel supplied POSTGRES_URL instead, use this line in place of the one above.
# $env:POSTGRES_URL = (Get-Content .env.vercel.local |
#   Where-Object { $_ -match '^POSTGRES_URL=' } |
#   ForEach-Object { $_.Substring('POSTGRES_URL='.Length) })

python manage.py migrate
```

Do not commit `.env.vercel.local`; it contains database credentials. After the
migration succeeds, deploy (or redeploy) the application normally.
