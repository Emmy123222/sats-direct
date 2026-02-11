# Vercel Deployment Guide

## 🚀 Deploying to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Click "Import"

### Step 3: Configure Environment Variables

⚠️ **IMPORTANT**: You must add environment variables in Vercel dashboard!

#### Go to Project Settings

1. Click on your project
2. Go to "Settings" tab
3. Click "Environment Variables" in the sidebar

#### Add These Variables:

##### Frontend Variables (VITE_*)
These are exposed to the browser:

```
VITE_ESCROW_CONTRACT_ADDRESS=ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT.escrow
VITE_INVOICE_CONTRACT_ADDRESS=ST3XJC356F2NYYBT4JBEYW5KWYHVRHEZ1YDZG65KT.invoice-registry
VITE_STACKS_NETWORK=testnet
VITE_NODE_ENV=production
```

##### Backend Variables (Serverless Functions)
These are secret and only available to API routes:

```
RESEND_API_KEY=re_your_new_key_here
BREVO_API_KEY=xkeysib-your_new_key_here
FROM_EMAIL=your-email@example.com
FROM_NAME=Your Name from SatsGate
ADMIN_SECRET=your_secure_secret_here
```

#### How to Add Each Variable:

1. Click "Add New"
2. Enter the **Key** (e.g., `RESEND_API_KEY`)
3. Enter the **Value** (e.g., `re_abc123...`)
4. Select environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click "Save"

### Step 4: Deploy

After adding all environment variables:

1. Go to "Deployments" tab
2. Click "Redeploy" on the latest deployment
3. Check "Use existing Build Cache" (optional)
4. Click "Redeploy"

### Step 5: Verify Deployment

1. Wait for deployment to complete (~2 minutes)
2. Click "Visit" to open your site
3. Test wallet connection
4. Test creating an escrow
5. Check that API routes work

## 🔧 Troubleshooting

### Error: "Environment Variable references Secret which does not exist"

**Solution**: Add the missing environment variable in Vercel dashboard.

Example error:
```
Environment Variable "RESEND_API_KEY" references Secret "resend-api-key", which does not exist.
```

Fix:
1. Go to Project Settings → Environment Variables
2. Add `RESEND_API_KEY` with your actual API key
3. Redeploy

### Error: "Wallet connection fails"

**Solution**: Check that `VITE_STACKS_NETWORK` is set correctly.

For testnet:
```
VITE_STACKS_NETWORK=testnet
```

For mainnet:
```
VITE_STACKS_NETWORK=mainnet
```

### Error: "Contract not found"

**Solution**: Update contract addresses in environment variables.

1. Deploy your contracts to testnet/mainnet
2. Get the contract addresses
3. Update in Vercel:
   ```
   VITE_ESCROW_CONTRACT_ADDRESS=YOUR_ADDRESS.escrow
   VITE_INVOICE_CONTRACT_ADDRESS=YOUR_ADDRESS.invoice-registry
   ```
4. Redeploy

### Error: "API route fails"

**Solution**: Check that backend environment variables are set.

Required for API routes:
- `RESEND_API_KEY` or `BREVO_API_KEY`
- `FROM_EMAIL`
- `FROM_NAME`
- `ADMIN_SECRET`

## 📋 Environment Variables Checklist

### Frontend (VITE_*)
- [ ] `VITE_ESCROW_CONTRACT_ADDRESS`
- [ ] `VITE_INVOICE_CONTRACT_ADDRESS`
- [ ] `VITE_STACKS_NETWORK`
- [ ] `VITE_NODE_ENV`

### Backend (API Routes)
- [ ] `RESEND_API_KEY` (for emails)
- [ ] `BREVO_API_KEY` (alternative email service)
- [ ] `FROM_EMAIL`
- [ ] `FROM_NAME`
- [ ] `ADMIN_SECRET`

### Optional
- [ ] `SMTP_HOST` (if using SMTP)
- [ ] `SMTP_PORT`
- [ ] `SMTP_USER`
- [ ] `SMTP_PASS`

## 🔒 Security Notes

1. **Never commit `.env` to git** ✅ (already fixed)
2. **Use different keys for production** - Don't use the same API keys as development
3. **Rotate keys regularly** - Change API keys every few months
4. **Monitor usage** - Check API dashboards for unexpected usage
5. **Set up billing alerts** - Get notified of unusual charges

## 🌐 Custom Domain (Optional)

### Add Custom Domain:

1. Go to Project Settings → Domains
2. Enter your domain (e.g., `satsgate.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (~24 hours)

### SSL Certificate:

Vercel automatically provides SSL certificates for all domains.

## 📊 Monitoring

### Check Deployment Logs:

1. Go to "Deployments" tab
2. Click on a deployment
3. View "Build Logs" and "Function Logs"

### Monitor API Usage:

1. **Resend**: https://resend.com/emails
2. **Brevo**: https://app.brevo.com/statistics

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will:
1. Detect the push
2. Build your project
3. Deploy to production
4. Update your live site

## 📝 Notes

- **Build time**: ~2-3 minutes
- **Function timeout**: 10 seconds (Hobby plan)
- **Function size**: 50MB max
- **Bandwidth**: 100GB/month (Hobby plan)

## 🆘 Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- [Environment Variables Guide](https://vercel.com/docs/concepts/projects/environment-variables)

## ✅ Deployment Complete!

Once deployed, your app will be live at:
```
https://your-project-name.vercel.app
```

Share this URL with users to test the escrow platform!
