# Turbopack Troubleshooting Guide

## Overview
This guide helps resolve common Turbopack permission issues on macOS with Next.js 15.5.3.

## Quick Fix Commands

### 1. Basic Permission Fix
```bash
npm run dev:turbo:fix
```

### 2. Manual Permission Fix
```bash
./scripts/fix-turbopack-permissions.sh
```

### 3. Fallback to Webpack
```bash
npm run dev  # Uses regular Webpack instead of Turbopack
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with Webpack (stable) |
| `npm run dev:turbo` | Start with Turbopack (experimental) |
| `npm run dev:turbo:fix` | Fix permissions + start with Turbopack |
| `npm run build` | Build with Webpack |
| `npm run build:turbo` | Build with Turbopack |

## Common Issues & Solutions

### 1. Permission Denied (os error 13)

**Symptoms:**
- `TurbopackInternalError: Permission denied (os error 13)`
- Panic logs in `/var/folders/.../T/next-panic-*.log`

**Solutions:**
1. **Run permission fix script:**
   ```bash
   ./scripts/fix-turbopack-permissions.sh
   ```

2. **Manual permission fix:**
   ```bash
   chmod -R u+rw .
   rm -rf .next
   rm -rf /var/folders/*/T/next-*
   ```

3. **Check macOS security settings:**
   - Go to System Settings > Privacy & Security > Files and Folders
   - Ensure Terminal/Node.js has Full Disk Access

### 2. Cache Corruption

**Symptoms:**
- Unexpected build failures
- Inconsistent behavior

**Solution:**
```bash
rm -rf .next
rm -rf node_modules/.cache
rm -rf ~/.npm/_cacache
npm run dev:turbo
```

### 3. Node.js Version Issues

**Check version:**
```bash
node --version
```

**Requirements:**
- Node.js 18+ recommended
- Current: v22.16.0 ✅

### 4. macOS Security Restrictions

**Check TCC permissions:**
1. System Settings > Privacy & Security > Files and Folders
2. Ensure Terminal has access to:
   - Full Disk Access
   - Developer Tools
   - Project directory

## Debugging Steps

### 1. Check Panic Logs
```bash
ls -la /var/folders/*/T/next-panic-*.log
cat /var/folders/*/T/next-panic-*.log
```

### 2. Verify Permissions
```bash
ls -ld .
ls -ld .next
ls -ld /var/folders/*/T
```

### 3. Test Without Turbopack
```bash
npm run dev  # Should work with Webpack
```

## When to Use Each Option

### Use Webpack (`npm run dev`) when:
- ✅ You need stability
- ✅ Working on production features
- ✅ Turbopack causes issues

### Use Turbopack (`npm run dev:turbo`) when:
- ✅ You want faster builds
- ✅ Working on development features
- ✅ Permissions are properly configured

## Reporting Issues

If Turbopack continues to fail:

1. **Collect information:**
   ```bash
   node --version
   npm --version
   npx next --version
   ```

2. **Include panic logs:**
   ```bash
   cat /var/folders/*/T/next-panic-*.log
   ```

3. **Report to Next.js team:**
   - GitHub: https://github.com/vercel/next.js/issues
   - Include OS, Node.js version, and error details

## Fallback Strategy

If Turbopack consistently fails:

1. **Disable experimental features:**
   ```javascript
   // next.config.js
   module.exports = {
     experimental: {
       optimizePackageImports: false,
     },
   };
   ```

2. **Use Webpack for development:**
   ```bash
   npm run dev
   ```

3. **Consider upgrading Next.js:**
   ```bash
   npm install next@latest
   ```

## Performance Comparison

| Feature | Webpack | Turbopack |
|---------|---------|-----------|
| Initial Build | ~3-5s | ~1-2s |
| Hot Reload | ~500ms | ~100ms |
| Stability | ✅ High | ⚠️ Experimental |
| Compatibility | ✅ Full | ⚠️ Some issues |

## Conclusion

- **For stability:** Use `npm run dev` (Webpack)
- **For speed:** Use `npm run dev:turbo` (Turbopack)
- **For troubleshooting:** Use `npm run dev:turbo:fix`

Remember: Turbopack is experimental. If it causes issues, Webpack is a reliable fallback.
