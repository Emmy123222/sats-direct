# Quick: Vercel Environment Variables Setup

## 🚨 Fix "Secret does not exist" Error

### Go to Vercel Dashboard:
1. Open your project on [vercel.com](https://vercel.com)
2. Click "Settings" → "Environment Variables"

### Add These Variables:

#### Frontend (Browser-Safe)
```
VITE_ESCROW_CONTRACT_ADDRESS = ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT.escrow
VITE_INVOICE_CONTRACT_ADDRESS = ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT.invoice-registry
VITE_STACKS_NETWORK = testnet
VITE_NODE_ENV = production
```

#### Backend (Secret - API Routes Only)
```
RESEND_API_KEY = [Your NEW Resend API key]
BREVO_API_KEY = [Your NEW Brevo API key]
FROM_EMAIL = your-email@example.com
FROM_NAME = Your Name from SatsGate
ADMIN_SECRET = [Generate with: openssl rand -base64 32]
```

### For Each Variable:
1. Click "Add New"
2. Enter Key and Value
3. Select: ✅ Production ✅ Preview ✅ Development
4. Click "Save"

### After Adding All Variables:
1. Go to "Deployments" tab
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait ~2 minutes
5. Test your site!

## 🔑 Get New API Keys

### Resend (Email Service)
1. Go to: https://resend.com/api-keys
2. Delete old key (if exposed)
3. Click "Create API Key"
4. Copy the key
5. Add to Vercel as `RESEND_API_KEY`

### Brevo (Alternative Email)
1. Go to: https://app.brevo.com/settings/keys/api
2. Delete old key (if exposed)
3. Click "Create a new API key"
4. Copy the key
5. Add to Vercel as `BREVO_API_KEY`

### Admin Secret
```bash
# Generate a secure random secret
openssl rand -base64 32
```
Copy the output and add to Vercel as `ADMIN_SECRET`

## ✅ Done!

Your app should now deploy successfully on Vercel.

See [docs/VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md) for full guide.
