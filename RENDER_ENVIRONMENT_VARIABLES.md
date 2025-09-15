# Render Environment Variables Configuration

## Database Configuration for Neon PostgreSQL

The following environment variables need to be set in the Render dashboard for your service:

### Required Environment Variables

```
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require&channel_binding=require&connect_timeout=10
```

```
DIRECT_URL=postgresql://username:password@hostname:port/database?sslmode=require&channel_binding=require&connect_timeout=10
```

```
NEXTAUTH_SECRET=your_nextauth_secret_here
```

```
NEXTAUTH_URL=https://your-app-name.onrender.com
```

```
OPENAI_API_KEY=your_openai_api_key_here
```

```
NEXT_PUBLIC_API_URL=https://your-app-name.onrender.com/api
```

```
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

```
UNSPLASH_SECRET_KEY=your_unsplash_secret_key_here
```

### Optional Environment Variables

```
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

```
NEXT_PUBLIC_ENABLE_DEBUG=false
```

```
API_PRIORITY_MODE=hybrid
```

```
ENEM_API_PRIORITY=hybrid
```

```
ENEM_ENABLE_REAL_QUESTIONS=true
```

```
ENEM_ENABLE_DATABASE_FALLBACK=true
```

```
ENEM_ENABLE_AI_FALLBACK=true
```

```
OPENAI_API_PRIORITY=api
```

```
OPENAI_MODEL_SELECTION=auto
```

```
UNSPLASH_API_PRIORITY=api
```

```
UNSPLASH_ENABLE_IMAGE_SEARCH=true
```

```
UNSPLASH_ENABLE_AUTO_IMAGES=true
```

```
API_CACHE_TIMEOUT=300000
```

```
API_ENABLE_RETRIES=true
```

```
API_MAX_RETRIES=3
```

```
API_ENABLE_LOGGING=true
```

```
ENEM_API_BASE=https://your-app-name.onrender.com
```

```
ENEM_API_PREFIX=/v1
```

## Important Notes

1. **Database URLs**: The `DATABASE_URL` uses the pooled connection (`-pooler` in hostname) for better performance in production. The `DIRECT_URL` is used for migrations and CLI operations.

2. **Connection Timeout**: Added `connect_timeout=10` to handle Neon's serverless compute activation delays.

3. **SSL Requirements**: Both URLs include `sslmode=require&channel_binding=require` which are mandatory for Neon connections.

4. **Role**: Using `neondb_owner` role which should have full permissions on the database.

## Steps to Update Render Environment

1. Go to Render Dashboard → Your Service → Environment
2. Add or update each environment variable listed above
3. Save changes
4. Trigger a manual redeploy
5. Monitor the deployment logs for any database connection errors

## Troubleshooting

If you still get authentication errors:

1. Verify the role `neondb_owner` exists in your Neon console
2. Check that the password is correct
3. Ensure the database name `neondb` is correct
4. Verify the hostname includes the correct region (`sa-east-1.aws.neon.tech`)

The error message mentioning `hubedu_db_user` suggests there might be a different database configuration in Render that needs to be updated to match the local configuration.