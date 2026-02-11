# Security Guidelines

## 🔒 Environment Variables

### ⚠️ CRITICAL: Never Commit `.env` Files

The `.env` file contains sensitive information and should NEVER be committed to git:

- API keys (Resend, Brevo)
- Admin secrets
- SMTP passwords
- Private keys

### What Was Fixed

1. **Added `.env` to `.gitignore`**
2. **Removed `.env` from git history** (using `git rm --cached`)
3. **Created `.env.example`** as a template

### If `.env` Was Already Committed

If your `.env` file was already pushed to GitHub:

1. **Immediately rotate all API keys and secrets**:
   - Resend API key
   - Brevo API key
   - Admin secret
   - SMTP password

2. **Remove from git history**:
```bash
# Remove .env from all commits
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: This rewrites history!)
git push origin --force --all
```

3. **Or use BFG Repo-Cleaner** (easier):
```bash
# Install BFG
brew install bfg  # macOS
# or download from https://rtyley.github.io/bfg-repo-cleaner/

# Remove .env from history
bfg --delete-files .env
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push origin --force --all
```

## 🔑 API Keys to Rotate

If your `.env` was exposed, rotate these immediately:

### 1. Resend API Key
- Go to: https://resend.com/api-keys
- Delete old key
- Create new key
- Update `.env`

### 2. Brevo API Key
- Go to: https://app.brevo.com/settings/keys/api
- Delete old key
- Create new key
- Update `.env`

### 3. Admin Secret
- Generate new random string:
```bash
openssl rand -base64 32
```
- Update `.env`

### 4. SMTP Password
- If using Gmail App Password:
  - Go to: https://myaccount.google.com/apppasswords
  - Revoke old password
  - Generate new one
  - Update `.env`

## ✅ Best Practices

### 1. Use `.env.example`
Always maintain a `.env.example` file with dummy values:

```bash
# .env.example
RESEND_API_KEY=re_your_key_here
BREVO_API_KEY=xkeysib-your_key_here
ADMIN_SECRET=your_secret_here
```

### 2. Never Log Secrets
```typescript
// ❌ BAD
console.log('API Key:', process.env.RESEND_API_KEY);

// ✅ GOOD
console.log('API Key:', process.env.RESEND_API_KEY ? '***' : 'not set');
```

### 3. Use Environment-Specific Files
```bash
.env              # Local development (gitignored)
.env.example      # Template (committed)
.env.production   # Production (gitignored, set on server)
```

### 4. Server-Side Only
Never expose secrets in client-side code:

```typescript
// ❌ BAD - Exposed to browser
const apiKey = import.meta.env.VITE_SECRET_KEY;

// ✅ GOOD - Server-side only
const apiKey = process.env.SECRET_KEY;
```

### 5. Use Vercel/Netlify Environment Variables
For production, set environment variables in your hosting platform:

**Vercel**:
- Go to Project Settings → Environment Variables
- Add each variable
- Redeploy

**Netlify**:
- Go to Site Settings → Environment Variables
- Add each variable
- Redeploy

## 🚨 What to Do If Secrets Are Exposed

1. **Immediately rotate all API keys**
2. **Check for unauthorized usage**:
   - Resend: Check email logs
   - Brevo: Check campaign logs
   - Check for unexpected charges

3. **Remove from git history** (see above)
4. **Monitor for abuse**:
   - Set up billing alerts
   - Check API usage dashboards
   - Review access logs

5. **Update documentation** to prevent future exposure

## 📋 Checklist

Before committing:
- [ ] `.env` is in `.gitignore`
- [ ] No secrets in code
- [ ] `.env.example` is up to date
- [ ] No API keys in commit messages
- [ ] No secrets in error messages

## 🔗 Resources

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [Git filter-branch](https://git-scm.com/docs/git-filter-branch)

## 📞 Need Help?

If you've exposed secrets and need help:
1. Rotate all keys immediately
2. Contact support for each service
3. Review billing for unauthorized usage
4. Clean git history
5. Update security practices
