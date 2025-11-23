# Setting Up Custom Domain for Resend (Production)

This guide will help you verify your domain in Resend so you can send emails to any email address.

## Prerequisites

- A domain name (e.g., `auraduo.com`, `yourdomain.com`)
- Access to your domain's DNS settings (usually through your domain registrar like GoDaddy, Namecheap, Cloudflare, etc.)

## Step-by-Step Instructions

### Step 1: Add Domain in Resend

1. Go to https://resend.com/domains
2. Click **"Add Domain"** button
3. Enter your domain name (e.g., `auraduo.com`)
   - **Important:** Don't include `www` or `http://`
   - Just the domain: `auraduo.com`
4. Click **"Add"**

### Step 2: Get DNS Records from Resend

After adding the domain, Resend will show you DNS records you need to add. You'll typically see:

1. **SPF Record** (TXT record)
   - Name: `@` or your domain
   - Value: `v=spf1 include:_spf.resend.com ~all`

2. **DKIM Record** (TXT record)
   - Name: `resend._domainkey` (or similar)
   - Value: A long string provided by Resend

3. **DMARC Record** (TXT record) - Optional but recommended
   - Name: `_dmarc`
   - Value: `v=DMARC1; p=none;`

### Step 3: Add DNS Records to Your Domain

1. Log in to your domain registrar (where you bought the domain)
   - Examples: GoDaddy, Namecheap, Cloudflare, Google Domains, etc.

2. Find **DNS Management** or **DNS Settings**

3. Add each record Resend provided:
   - **Type:** TXT
   - **Name/Host:** Copy exactly from Resend (might be `@`, `resend._domainkey`, etc.)
   - **Value:** Copy exactly from Resend
   - **TTL:** 3600 (or default)

4. **Save** all records

### Step 4: Wait for Verification

- DNS changes can take **5 minutes to 48 hours** to propagate
- Usually takes **15-30 minutes**
- Resend will automatically check and verify your domain
- You'll see a green checkmark when verified

### Step 5: Update Your Environment Variables

Once verified, update your `.env.local`:

```env
RESEND_FROM_EMAIL=noreply@yourdomain.com
# or
RESEND_FROM_EMAIL=Aura Duo <noreply@yourdomain.com>
```

Replace `yourdomain.com` with your actual domain.

### Step 6: Restart Your Server

```bash
# Stop your dev server (Ctrl+C)
npm run dev
```

## Common Domain Registrars - Quick Links

- **GoDaddy:** https://www.godaddy.com → My Products → DNS
- **Namecheap:** https://www.namecheap.com → Domain List → Manage → Advanced DNS
- **Cloudflare:** https://dash.cloudflare.com → Your Domain → DNS
- **Google Domains:** https://domains.google → DNS
- **AWS Route 53:** AWS Console → Route 53 → Hosted Zones

## Testing

1. After domain is verified, try signing up with a different email address
2. Check if you receive the OTP email
3. If not, check:
   - DNS records are correct
   - Domain is verified in Resend dashboard
   - `RESEND_FROM_EMAIL` is updated correctly

## Troubleshooting

### Domain Not Verifying

- **Wait longer:** DNS can take up to 48 hours
- **Check DNS records:** Make sure they're exactly as Resend provided
- **Check TTL:** Lower TTL (300-600) can help propagation
- **Use DNS checker:** https://dnschecker.org to see if records propagated

### Emails Still Not Sending

- **Check Resend dashboard:** Look for error messages
- **Verify FROM email:** Must use your verified domain
- **Check spam folder:** Emails might go to spam initially
- **Check Resend logs:** Go to Resend → Emails to see delivery status

## For Vercel Deployment

When deploying to Vercel, add the same environment variable:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `RESEND_FROM_EMAIL` = `noreply@yourdomain.com`
3. Redeploy your application

## Alternative: Use a Subdomain

If you don't want to use your main domain, you can use a subdomain:

- Example: `mail.auraduo.com` or `noreply.auraduo.com`
- Add the same DNS records but for the subdomain
- Use: `RESEND_FROM_EMAIL=noreply@mail.auraduo.com`

## Cost

- **Domain verification:** FREE
- **Sending emails:** Free tier = 3,000 emails/month
- **After free tier:** ~$20/month for more emails

