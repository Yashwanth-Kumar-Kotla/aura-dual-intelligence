# Email OTP Authentication Setup Guide

This guide explains how to set up email OTP (One-Time Password) authentication for your Aura Duo application.

## What You Need

1. **Resend Account** (Free tier available)
   - Sign up at: https://resend.com
   - Free tier: 3,000 emails/month
   - Perfect for Next.js applications

## Setup Steps

### 1. Create a Resend Account

1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. After logging in, go to **API Keys** in the dashboard
2. Click **Create API Key**
3. Give it a name (e.g., "Aura Duo Production")
4. Copy the API key (starts with `re_...`)
5. **Important:** Save it securely - you won't be able to see it again!

### 3. Set Up Your Domain (Optional but Recommended)

For production, you should verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Follow the DNS setup instructions
4. Once verified, you can use emails like `noreply@yourdomain.com`

For development/testing, you can use Resend's default domain: `onboarding@resend.dev`

### 4. Add Environment Variables

Add these to your `.env.local` file:

```env
# Resend API Key (required)
RESEND_API_KEY=re_your_api_key_here

# From Email Address (optional - defaults to onboarding@resend.dev)
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 5. For Vercel Deployment

When deploying to Vercel:

1. Go to your project settings in Vercel
2. Navigate to **Environment Variables**
3. Add:
   - `RESEND_API_KEY` = your Resend API key
   - `RESEND_FROM_EMAIL` = your verified email (optional)

## How It Works

### User Flow:

1. **User enters email** → Clicks "Send OTP"
2. **Backend generates 6-digit code** → Stores it with expiration (10 minutes)
3. **Email sent via Resend** → User receives code in their inbox
4. **User enters code** → Backend verifies it
5. **On success** → User is logged in or account is created

### Security Features:

- ✅ OTPs expire after 10 minutes
- ✅ Max 5 verification attempts per OTP
- ✅ Rate limiting: Max 5 OTP requests per email per hour
- ✅ One-time use: OTP is deleted after successful verification
- ✅ Cryptographically secure random code generation

## Testing

1. Start your development server: `npm run dev`
2. Go to `/login` or `/signup`
3. Select "Email OTP" tab
4. Enter your email
5. Click "Send OTP Code"
6. Check your email inbox
7. Enter the 6-digit code
8. You should be logged in!

## Troubleshooting

### Emails Not Sending

1. **Check API Key**: Make sure `RESEND_API_KEY` is set correctly
2. **Check Email Address**: Verify the "from" email is correct
3. **Check Resend Dashboard**: Look for errors in the Resend dashboard
4. **Check Console**: Look for error messages in your server logs

### OTP Not Working

1. **Check Expiration**: OTPs expire after 10 minutes
2. **Check Attempts**: Max 5 attempts per OTP
3. **Check Rate Limit**: Max 5 OTP requests per hour per email
4. **Request New OTP**: Click "Resend code" if expired

### Development vs Production

- **Development**: Uses `onboarding@resend.dev` (default)
- **Production**: Should use your verified domain email

## Cost

- **Free Tier**: 3,000 emails/month
- **Paid Plans**: Start at $20/month for more emails
- **Per Email**: ~$0.003 per email after free tier

## Alternative Email Services

If you prefer other services:

1. **SendGrid**: Free tier (100 emails/day)
2. **AWS SES**: Very cheap (~$0.10 per 1,000 emails)
3. **Mailgun**: Free tier (5,000 emails/month)
4. **Nodemailer**: Self-hosted (requires SMTP server)

To switch services, you'd need to modify `/app/api/auth/send-otp/route.js`

## Support

- Resend Docs: https://resend.com/docs
- Resend Support: support@resend.com

