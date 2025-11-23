# DNS Verification Checklist

## Your Current Setup (from screenshots):

### In Namecheap:
✅ **CNAME Record:**
- Type: CNAME Record
- Host: `www`
- Value: `53b9b15f363e8da8.vercel-dns-017.com.`
- TTL: Automatic

✅ **A Record:**
- Type: A Record
- Host: `@`
- Value: `216.198.79.1`
- TTL: Automatic

### What Vercel Expects:
✅ **For www.auraduo.app:**
- Type: CNAME
- Name: `www`
- Value: `53b9b15f363e8da8.vercel-dns-017.com.`

✅ **For auraduo.app:**
- Type: A
- Name: `@`
- Value: `216.198.79.1`

## Verification Steps:

1. **Check DNS Propagation:**
   - Go to: https://dnschecker.org
   - For CNAME: Search `www.auraduo.app` → Select `CNAME`
   - For A Record: Search `auraduo.app` → Select `A`
   - Wait for green checkmarks (can take 15-30 minutes)

2. **Common Issues:**
   - Missing trailing dot (.) in CNAME value
   - Wrong host value (@ vs www)
   - DNS not propagated yet (most common)

3. **If Still Not Working:**
   - Double-check values match exactly
   - Remove any extra spaces
   - Make sure records are saved in Namecheap

