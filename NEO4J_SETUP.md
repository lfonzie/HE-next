# Neo4j Setup Guide for HubEdu.ai

## 🚨 Current Issue
Your authentication system is currently configured to use **Prisma with PostgreSQL**, but you want to use **Neo4j** instead. This is causing the 401 Unauthorized error because the system is trying to connect to PostgreSQL instead of Neo4j.

## ✅ Solution Implemented

I've created a complete Neo4j-based authentication system:

### 1. New Files Created
- `lib/neo4j-auth.ts` - Neo4j user management functions
- `lib/auth-neo4j.ts` - Neo4j-based NextAuth configuration
- `test-neo4j-auth.js` - Test script to verify setup

### 2. Files Updated
- `app/api/auth/[...nextauth]/route.ts` - Now uses Neo4j auth configuration
- `.env.local` - Added Neo4j configuration

## 🔧 Setup Steps

### Step 1: Install Neo4j

**Option A: Neo4j Desktop (Recommended)**
1. Download Neo4j Desktop from https://neo4j.com/download/
2. Install and create a new project
3. Create a new database (local)
4. Start the database
5. Set password to `password` (or update `.env.local`)

**Option B: Docker**
```bash
docker run \
    --name neo4j \
    -p 7474:7474 -p 7687:7687 \
    -d \
    -v $HOME/neo4j/data:/data \
    -v $HOME/neo4j/logs:/logs \
    -v $HOME/neo4j/import:/var/lib/neo4j/import \
    -v $HOME/neo4j/plugins:/plugins \
    --env NEO4J_AUTH=neo4j/password \
    neo4j:latest
```

### Step 2: Verify Configuration

Your `.env.local` now includes:
```env
# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
```

### Step 3: Test the Setup

Run the test script:
```bash
node test-neo4j-auth.js
```

This will:
- Test Neo4j connection
- Create initial admin user
- Verify authentication functions

### Step 4: Start Your Application

```bash
npm run dev
```

## 🔐 Default Admin User

The system will automatically create an admin user:
- **Email**: `admin@hubedu.ia`
- **Password**: `admin123`
- **Role**: `ADMIN`

## 🧪 Testing Authentication

1. Go to `http://localhost:3000/login`
2. Use the admin credentials above
3. You should be redirected to `/chat` without 401 errors

## 🔍 Troubleshooting

### Neo4j Connection Issues
```bash
# Check if Neo4j is running
curl http://localhost:7474

# Check bolt port
nc -z localhost 7687
```

### Authentication Issues
1. Check browser console for errors
2. Check server logs for Neo4j connection errors
3. Verify `.env.local` has correct Neo4j credentials
4. Run the test script: `node test-neo4j-auth.js`

### Port Conflicts
If ports 7474 or 7687 are in use:
```bash
# Find processes using these ports
lsof -i :7474
lsof -i :7687

# Kill processes if needed
kill -9 <PID>
```

## 📊 Neo4j Browser

Access Neo4j Browser at `http://localhost:7474` to:
- View your database
- Run Cypher queries
- Monitor user data

## 🚀 Production Deployment

For production, update your environment variables:
```env
NEO4J_URI=bolt://your-neo4j-server:7687
NEO4J_USER=your-username
NEO4J_PASSWORD=your-secure-password
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com
```

## 📝 Key Changes Made

1. **Authentication System**: Switched from Prisma/PostgreSQL to Neo4j
2. **User Management**: Created Neo4j-based user CRUD operations
3. **Password Hashing**: Using bcryptjs for secure password storage
4. **Session Management**: JWT-based sessions with Neo4j user data
5. **Admin User**: Automatic creation of initial admin user

## ✅ Expected Results

After setup:
- ✅ No more 401 Unauthorized errors
- ✅ Successful login with admin credentials
- ✅ User data stored in Neo4j
- ✅ Session management working
- ✅ Role-based access control

## 🆘 Need Help?

If you encounter issues:
1. Check Neo4j is running: `curl http://localhost:7474`
2. Run test script: `node test-neo4j-auth.js`
3. Check server logs for specific error messages
4. Verify `.env.local` configuration
