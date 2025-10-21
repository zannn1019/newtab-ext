# 🔑 How to Get Binance API Key & Secret

## Step-by-Step Guide with Screenshots

---

## 📝 Prerequisites

- ✅ Active Binance account
- ✅ Email verified
- ✅ 2FA enabled (Google Authenticator or SMS)

---

## 🚀 Step 1: Login to Binance

1. Go to [**Binance.com**](https://www.binance.com)
2. Click **"Log In"** (top right)
3. Enter your email and password
4. Complete 2FA verification

---

## 🔧 Step 2: Navigate to API Management

### Option A: Via Profile Menu

1. Click your **profile icon** (top right corner)
2. Select **"API Management"** from dropdown

### Option B: Direct Link

Go directly to: [https://www.binance.com/en/my/settings/api-management](https://www.binance.com/en/my/settings/api-management)

---

## ➕ Step 3: Create API Key

1. Click **"Create API"** button (yellow button)
2. You'll see two options:

   - **System generated** (Recommended ✅)
   - **Self generated** (Advanced)

3. Select **"System generated"**

---

## 📝 Step 4: Label Your API Key

1. **API Key Label**: Enter a name (e.g., "Kinesis Trading Journal")
2. This helps you identify the key later
3. Click **"Next"**

---

## 🔐 Step 5: Complete Security Verification

You'll need to complete 2FA:

### If using Google Authenticator:

1. Open your authenticator app
2. Enter the 6-digit code
3. Click **"Submit"**

### If using SMS:

1. Click **"Get Code"**
2. Check your phone for SMS
3. Enter the code
4. Click **"Submit"**

### Email Verification:

1. Check your email inbox
2. Find the verification code
3. Enter it
4. Click **"Submit"**

---

## ✨ Step 6: Save Your Keys (CRITICAL!)

After verification, you'll see:

```
✅ API Key Created Successfully

API Key:     abc123def456ghi789jkl012mno345pqr678stu901vwx234yz...
Secret Key:  xyz987wvu654tsr321qpo098nml765kji432hgf210edc...

⚠️ IMPORTANT: Save your Secret Key now!
   It will only be shown once and cannot be retrieved later.
```

### What to Do:

1. **Copy API Key** → Save to a text file
2. **Copy Secret Key** → Save to the SAME text file
3. Store securely (password manager recommended)
4. **DO NOT share these keys with anyone!**

---

## 🔒 Step 7: Configure Permissions (CRITICAL!)

After creation, you'll see your new API key listed. Now configure it:

1. Find your newly created API key in the list
2. Click **"Edit"** (pencil icon)

### Set Permissions:

✅ **Enable Reading** - ✓ CHECK THIS (Required)  
❌ **Enable Spot & Margin Trading** - ✗ LEAVE UNCHECKED (Not needed)  
❌ **Enable Futures** - ✗ LEAVE UNCHECKED (Not needed)  
❌ **Enable Withdrawals** - ✗ LEAVE UNCHECKED (Never enable!)

3. Click **"Save"**

---

## 🌐 Step 8: IP Access Restrictions (Optional but Recommended)

For extra security, restrict API access to your IP:

1. Scroll to **"IP Access Restrictions"**
2. Select **"Restrict access to trusted IPs only"**
3. Click **"Add IP"**
4. Enter your current IP address

**To find your IP:**

- Google: "what is my ip"
- Or use: [https://whatismyipaddress.com](https://whatismyipaddress.com)

5. Click **"Confirm"**

### Note:

If you use different networks (home, work, mobile), you may need to add multiple IPs or skip this step.

---

## ✅ Step 9: Verify Your Setup

1. Your API key should now show:

   - **Status**: ✅ Enabled
   - **Permissions**: Enable Reading
   - **IP Restriction**: Unrestricted (or your IP)

2. **Test it in the Journal**:
   - Open your Kinesis extension
   - Press `J` key
   - Click "Configure API Keys"
   - Paste your API Key and Secret
   - Enter symbols: `BTCUSDT,ETHUSDT,BNBUSDT`
   - Click "Save & Sync"

---

## 📋 Quick Checklist

Before using your API keys:

- [ ] API Key saved securely
- [ ] Secret Key saved securely
- [ ] "Enable Reading" permission is CHECKED
- [ ] Trading/Withdrawal permissions are UNCHECKED
- [ ] (Optional) IP restriction configured
- [ ] Keys tested in Kinesis Journal

---

## 🔍 Finding Your API Keys Later

To view existing API keys:

1. Go to **Profile** → **API Management**
2. You'll see all your API keys listed
3. **Note**: You can see the API Key, but NOT the Secret
4. If you lost the Secret, you must delete and create a new API key

---

## 🚨 Security Best Practices

### ✅ DO:

- ✅ Use read-only permissions
- ✅ Store keys in a password manager
- ✅ Enable IP restrictions if possible
- ✅ Rotate keys every 3-6 months
- ✅ Monitor API usage in Binance dashboard

### ❌ DON'T:

- ❌ Never enable withdrawal permissions
- ❌ Never share keys with anyone
- ❌ Never commit keys to GitHub
- ❌ Never store keys in plain text files on shared computers
- ❌ Never use the same keys for multiple apps

---

## 🔄 If You Need to Delete/Recreate

### To Delete:

1. Go to **API Management**
2. Find the key you want to remove
3. Click **"Delete"** (trash icon)
4. Confirm deletion

### To Create New:

1. Follow Steps 3-8 again
2. You can create up to **30 API keys** per account

---

## 🆘 Troubleshooting

### "Invalid API Key Format"

- ✅ API keys are exactly **64 characters**
- ✅ Copy the entire key (no spaces)
- ✅ Don't include any labels or prefixes

### "Permission Denied"

- ✅ Check "Enable Reading" is enabled
- ✅ Verify you completed the creation process
- ✅ Wait 5 minutes after creation (sometimes takes time to activate)

### "IP Restriction Error"

- ✅ Check your current IP matches the whitelist
- ✅ Or disable IP restriction temporarily to test

### Lost Secret Key?

- ❌ Cannot be recovered
- ✅ Must delete old key and create new one

---

## 📱 Mobile App (Alternative)

You can also create API keys via the Binance mobile app:

1. Open Binance app
2. Tap **Profile** (bottom right)
3. Tap **Security**
4. Tap **API Management**
5. Follow the same steps as above

---

## 🌐 Binance US vs Binance.com

### If you're in the USA:

- Use [**Binance.US**](https://www.binance.us) instead
- API endpoint is different: `https://api.binance.us`
- Update `BINANCE_API_BASE` in `binanceApi.js` if using Binance.US

### Rest of World:

- Use [**Binance.com**](https://www.binance.com)
- Default API endpoint: `https://api.binance.com`

---

## 📚 Official Documentation

For more details, see Binance official guides:

- [How to Create API Keys](https://www.binance.com/en/support/faq/how-to-create-api-keys-on-binance-360002502072)
- [API Management Overview](https://www.binance.com/en/support/faq/api-management-360061045832)
- [API Documentation](https://binance-docs.github.io/apidocs/spot/en/)

---

## ✨ You're Ready!

Once you have your API Key and Secret:

1. Open Kinesis extension
2. Press `J` (or type "journal" in Command Palette)
3. Click "Configure API Keys"
4. Paste your credentials
5. Add symbols: `BTCUSDT,ETHUSDT,BNBUSDT`
6. Click "Save & Sync"
7. Watch the beautiful loading animation 🎬
8. Explore your trading analytics! 📊

---

## 🔐 Final Security Reminder

Your API keys are like your password:

- 🔒 Keep them private
- 📝 Store them securely
- 🔄 Rotate them regularly
- 👀 Monitor their usage
- ❌ Never enable withdrawal permissions

**Happy Trading!** 📈✨

---

**Need help?** Check `JOURNAL_GUIDE.md` for full usage instructions.
