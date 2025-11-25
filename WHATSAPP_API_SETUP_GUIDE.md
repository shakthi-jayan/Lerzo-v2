# WhatsApp Business API Setup Guide

## 🎯 Goal
Send automated WhatsApp messages **from your center's number** to students' numbers.

---

## ⚠️ Important Understanding

### **Current Implementation (Click-to-Chat)**
- Opens WhatsApp from **user's device**
- User must manually click "Send"
- **NOT automated**
- ✅ Free
- ✅ Works immediately

### **WhatsApp Business API (What You Need)**
- Sends messages **from center's number**
- **Fully automated**
- No manual clicking required
- ❌ Requires setup
- ❌ Costs money (~₹0.50-2 per message)

---

## 📋 Option 1: Twilio WhatsApp Business API (Recommended)

### **Step 1: Create Twilio Account**
1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for free trial
3. Verify your email and phone number
4. You get **$15 free credit** for testing

### **Step 2: Get WhatsApp Sandbox (For Testing)**
1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. You'll see a sandbox number like: `+1 415 523 8886`
3. Send `join <your-code>` from your WhatsApp to activate
4. **Note**: Sandbox is for testing only, limited to numbers that join

### **Step 3: Get Your Credentials**
1. Go to Twilio Console Dashboard
2. Copy these values:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Click "Show" to reveal
   - **WhatsApp Number**: `whatsapp:+14155238886` (sandbox) or your approved number

### **Step 4: Configure in Your App**

**File**: `pages/Settings.tsx` (or create new WhatsApp Settings section)

Add these fields:
```tsx
<div className="space-y-4">
  <h3 className="font-bold">WhatsApp Business API</h3>
  
  <div>
    <label>Provider</label>
    <select value={whatsappProvider} onChange={(e) => setWhatsappProvider(e.target.value)}>
      <option value="click-to-chat">Click-to-Chat (Free, Manual)</option>
      <option value="twilio">Twilio API (Paid, Automated)</option>
    </select>
  </div>

  {whatsappProvider === 'twilio' && (
    <>
      <div>
        <label>Twilio Account SID</label>
        <input type="text" value={twilioSid} onChange={(e) => setTwilioSid(e.target.value)} />
      </div>

      <div>
        <label>Twilio Auth Token</label>
        <input type="password" value={twilioToken} onChange={(e) => setTwilioToken(e.target.value)} />
      </div>

      <div>
        <label>WhatsApp Number</label>
        <input 
          type="text" 
          placeholder="whatsapp:+14155238886"
          value={twilioNumber} 
          onChange={(e) => setTwilioNumber(e.target.value)} 
        />
      </div>
    </>
  )}
</div>
```

### **Step 5: Store in Database**

Add to `centreSettings` table or create new `whatsapp_config` table:
```sql
ALTER TABLE "centreSettings" 
ADD COLUMN "whatsappProvider" TEXT DEFAULT 'click-to-chat',
ADD COLUMN "twilioAccountSid" TEXT,
ADD COLUMN "twilioAuthToken" TEXT,
ADD COLUMN "twilioWhatsAppNumber" TEXT;
```

---

## 📋 Option 2: Get Your Own WhatsApp Business Number

### **For Production Use (After Testing)**

1. **Apply for WhatsApp Business API**
   - Through Twilio: [https://www.twilio.com/whatsapp](https://www.twilio.com/whatsapp)
   - Fill business verification form
   - Submit documents (business registration, etc.)
   - Wait 1-2 weeks for approval

2. **Costs**:
   - Setup: Free with Twilio
   - Per message: ₹0.50 - ₹2 (varies by country)
   - Monthly: No fixed cost, pay per use

3. **Requirements**:
   - Registered business
   - Business documents
   - Facebook Business Manager account
   - Dedicated phone number for WhatsApp

---

## 🔧 How to Use in Your App

### **Update FeeReminderSystem Component**

The system will automatically:
1. Check if Twilio is configured
2. If YES → Send via API (automated)
3. If NO → Use click-to-chat (manual)

**No code changes needed!** Just configure the credentials.

---

## 💰 Pricing Comparison

### **Twilio WhatsApp**
- India: ~₹0.50 per message
- 100 messages = ₹50
- 1000 messages = ₹500
- **Free $15 credit** for testing

### **Other Providers**
- **Gupshup**: ₹0.35 - ₹1 per message
- **WATI**: ₹999/month + per message
- **MessageBird**: Similar to Twilio

---

## 🚀 Quick Start (Testing)

### **For Immediate Testing (5 minutes)**:

1. **Sign up for Twilio** (free trial)
2. **Get sandbox number** (+1 415 523 8886)
3. **Join sandbox** from your WhatsApp
4. **Add credentials** to Settings:
   ```
   Provider: Twilio
   Account SID: AC... (from Twilio dashboard)
   Auth Token: ... (from Twilio dashboard)
   WhatsApp Number: whatsapp:+14155238886
   ```
5. **Test!** Send reminder to yourself

### **Limitations of Sandbox**:
- ⚠️ Recipients must join sandbox first
- ⚠️ Only for testing
- ⚠️ Not for production use

---

## 📱 Alternative: Use Click-to-Chat (Current Method)

If you don't want to pay for API:

### **Advantages**:
- ✅ **Free**
- ✅ Works immediately
- ✅ No setup required

### **How it works**:
1. Click "Send Reminders"
2. Opens WhatsApp Web/App for each student
3. Message is pre-filled
4. **You manually click "Send"** for each

### **Best for**:
- Small batches (5-10 students)
- Occasional reminders
- Budget-conscious institutes

---

## 🎯 Recommendation

### **For Your Use Case**:

**Start with Click-to-Chat** (what you have now):
- Free
- Works immediately
- Good for testing

**Upgrade to Twilio API when**:
- Sending 50+ messages regularly
- Want full automation
- Have budget (~₹500/month for 1000 messages)

---

## 📝 Summary

| Feature | Click-to-Chat | Twilio API |
|---------|---------------|------------|
| **Cost** | Free | ~₹0.50/message |
| **Setup** | None | 10 minutes |
| **Automation** | Manual | Fully automated |
| **From Number** | User's number | Center's number |
| **Best For** | Small batches | Bulk messaging |

---

## 🔗 Helpful Links

- **Twilio WhatsApp**: https://www.twilio.com/whatsapp
- **Twilio Pricing**: https://www.twilio.com/whatsapp/pricing
- **Twilio Docs**: https://www.twilio.com/docs/whatsapp
- **Alternative (Gupshup)**: https://www.gupshup.io/whatsapp-business-api
- **Alternative (WATI)**: https://www.wati.io/

---

**Need help setting up? Let me know which option you prefer!** 🚀
