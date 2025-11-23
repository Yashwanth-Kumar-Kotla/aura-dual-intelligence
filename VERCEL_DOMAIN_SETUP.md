# Setting Up auraduo.app on Vercel and Resend

## Step 1: Add Domain to Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Click on your project: **aura-dual-intelligence**
3. Go to **Settings** → **Domains**
4. Click **"Add Domain"**
5. Enter: `auraduo.app`
6. Click **"Add"**
7. Vercel will show you DNS records to add (usually just one A record or CNAME)

## Step 2: Configure DNS in Namecheap

### For Vercel:

1. Log in to Namecheap: https://www.namecheap.com
2. Go to **Domain List** → Click **"Manage"** next to `auraduo.app`
3. Go to **Advanced DNS** tab
4. Add the DNS record Vercel provided:
   - Usually a **CNAME** record:
     - **Type:** CNAME Record
     - **Host:** `@` or `www`
     - **Value:** `cname.vercel-dns.com` (or what Vercel shows)
     - **TTL:** Automatic
   - Or an **A Record** if Vercel specifies
5. Click **"Save All Changes"**
6. Wait 5-30 minutes for DNS to propagate

### Verify Vercel Domain:

- Vercel will automatically check and show a green checkmark when ready
- Your site will be accessible at `https://auraduo.app`

## Step 3: Verify Domain in Resend

1. Go to Resend: https://resend.com/domains
2. Click **"Add Domain"**
3. Enter: `auraduo.app` (just the domain, no www or http)
4. Click **"Add"**
5. Resend will show you DNS records to add:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **DMARC Record** (TXT) - Optional

## Step 4: Add Resend DNS Records in Namecheap

1. Go back to Namecheap → Your Domain → **Advanced DNS**
2. Add each record Resend provided:

   **SPF Record:**
   - **Type:** TXT Record
   - **Host:** `@`
   - **Value:** `v=spf1 include:_spf.resend.com ~all`
   - **TTL:** Automatic

   **DKIM Record:**
   - **Type:** TXT Record
   - **Host:** `resend._domainkey` (or what Resend shows)
   - **Value:** (Long string from Resend)
   - **TTL:** Automatic

   **DMARC Record (Optional but recommended):**
   - **Type:** TXT Record
   - **Host:** `_dmarc`
   - **Value:** `v=DMARC1; p=none;`
   - **TTL:** Automatic

3. Click **"Save All Changes"**
4. Wait 15-30 minutes for DNS to propagate

## Step 5: Verify Domain in Resend

- Resend will automatically check DNS records
- You'll see a green checkmark ✅ when verified
- This can take 15 minutes to 48 hours (usually 15-30 minutes)

## Step 6: Update Environment Variables

### In Vercel:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add/Update:
   - `RESEND_FROM_EMAIL` = `noreply@auraduo.app`
   - Make sure `RESEND_API_KEY` is also set
3. **Important:** Select which environments (Production, Preview, Development)
4. Click **"Save"**

### In Local `.env.local`:

```env
RESEND_FROM_EMAIL=noreply@auraduo.app
RESEND_API_KEY=re_your_api_key_here
```

## Step 7: Redeploy on Vercel

After adding environment variables:
1. Go to **Deployments** tab
2. Click the **"..."** menu on latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger redeploy

## Step 8: Test

1. Go to `https://auraduo.app/signup`
2. Try signing up with any email address
3. Check if you receive the OTP email
4. If not, check:
   - Resend dashboard for errors
   - Spam folder
   - DNS propagation status

## Troubleshooting

### Domain Not Working on Vercel:
- Wait longer (DNS can take up to 48 hours)
- Check DNS records are correct in Namecheap
- Use https://dnschecker.org to verify DNS propagation

### Resend Domain Not Verifying:
- Double-check DNS records match exactly what Resend provided
- Wait longer (can take up to 48 hours)
- Check Resend dashboard for specific error messages

### Emails Not Sending:
- Verify domain shows green checkmark in Resend
- Check `RESEND_FROM_EMAIL` is set to `noreply@auraduo.app`
- Check Resend dashboard → Emails for delivery status

## Quick Checklist

- [ ] Domain added to Vercel
- [ ] Vercel DNS records added to Namecheap
- [ ] Domain verified in Vercel (green checkmark)
- [ ] Domain added to Resend
- [ ] Resend DNS records added to Namecheap
- [ ] Domain verified in Resend (green checkmark)
- [ ] `RESEND_FROM_EMAIL` updated in Vercel
- [ ] `RESEND_FROM_EMAIL` updated in `.env.local`
- [ ] Vercel deployment redeployed
- [ ] Tested OTP email sending

