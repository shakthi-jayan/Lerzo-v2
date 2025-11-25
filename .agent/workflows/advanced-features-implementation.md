---
description: Implementation plan for advanced features (Digital Receipts, Fee Reminders, WhatsApp Integration, AI Insights)
---

# Advanced Features Implementation Plan

## Overview
This workflow outlines the implementation of four major feature sets:
1. **Digital Receipt & Invoice Sharing** - PDF generation with WhatsApp/Email sharing
2. **Automated Fee Reminders** - Bulk reminder system for overdue fees
3. **WhatsApp Integration** - Click-to-chat buttons throughout the app
4. **AI Insights** - Smart dashboard widget with risk analysis and projections

---

## Phase 1: Digital Receipt & Invoice Sharing

### 1.1 Create Receipt Generator Component
**File**: `components/ReceiptGenerator.tsx`
- Generate PDF receipts using jsPDF
- Include: Student name, payment details, date, receipt number, institute branding
- Add QR code for verification
- Professional invoice template

### 1.2 Update RecordPayment Page
**File**: `pages/RecordPayment.tsx`
- After successful payment, show modal with receipt preview
- Add "Download PDF", "Share via WhatsApp", "Send Email" buttons
- Generate unique receipt number (format: RCP-YYYYMMDD-XXXX)

### 1.3 Add Receipt History
**File**: `pages/StudentDetails.tsx`
- Show all receipts in payment history
- Allow re-download/re-share of past receipts

---

## Phase 2: Automated Fee Reminders

### 2.1 Create Fee Reminder System
**File**: `components/FeeReminderSystem.tsx`
- Calculate overdue fees based on payment status
- Filter students with pending/overdue fees
- Bulk selection interface
- Template message customization

### 2.2 Add Reminder Templates
**File**: `utils/reminderTemplates.ts`
- Pre-defined message templates
- Variable substitution (name, amount, due date)
- Professional tone options

### 2.3 Dashboard Widget
**File**: `pages/Dashboard.tsx`
- "Overdue Fees" card showing count and total amount
- Quick action button to send reminders
- Link to detailed fee reminder page

---

## Phase 3: WhatsApp Integration

### 3.1 Create WhatsApp Utility
**File**: `utils/whatsapp.ts`
- Helper function to generate WhatsApp URLs
- Message templates for different scenarios
- Support for both web and mobile

### 3.2 Add WhatsApp Buttons
**Files to update**:
- `pages/StudentDetails.tsx` - Next to student mobile number
- `pages/Enquiries.tsx` - Next to each enquiry
- `pages/RecordPayment.tsx` - For fee reminders
- `components/FeeReminderSystem.tsx` - Bulk WhatsApp option

### 3.3 WhatsApp Icon Component
**File**: `components/WhatsAppButton.tsx`
- Reusable button component
- Hover effects
- Different sizes (small, medium, large)

---

## Phase 4: AI Insights Dashboard Widget

### 4.1 Create AI Insights Component
**File**: `components/AIInsights.tsx`
- Risk analysis widget
- Revenue projections
- Attendance alerts
- Dropout risk detection

### 4.2 Analytics Utilities
**File**: `utils/analytics.ts`
- Calculate dropout risk (attendance < threshold)
- Project revenue based on payment history
- Identify at-risk students
- Trend analysis

### 4.3 Dashboard Integration
**File**: `pages/Dashboard.tsx`
- Add "Smart Insights" section
- Show top 3-5 actionable insights
- Color-coded alerts (red for urgent, yellow for warning, green for positive)

---

## Implementation Order

### Step 1: WhatsApp Integration (Quickest Win)
- Create `utils/whatsapp.ts`
- Create `components/WhatsAppButton.tsx`
- Add buttons to Student Details, Enquiries, and Fee pages

### Step 2: Digital Receipts
- Create `components/ReceiptGenerator.tsx`
- Update `pages/RecordPayment.tsx`
- Add receipt history to `pages/StudentDetails.tsx`

### Step 3: Fee Reminder System
- Create `utils/reminderTemplates.ts`
- Create `components/FeeReminderSystem.tsx`
- Add dashboard widget for overdue fees

### Step 4: AI Insights
- Create `utils/analytics.ts`
- Create `components/AIInsights.tsx`
- Integrate into dashboard

---

## Database Changes Needed

### New Table: `receipts`
```sql
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "receiptNumber" TEXT UNIQUE NOT NULL,
  "studentId" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  "paidDate" DATE NOT NULL,
  "generatedAt" TIMESTAMP DEFAULT NOW(),
  "ownerEmail" TEXT NOT NULL,
  FOREIGN KEY ("studentId") REFERENCES students(id) ON DELETE CASCADE
);
```

### Add RLS Policies for receipts table

---

## Dependencies to Install

```bash
npm install jspdf
npm install qrcode.react (already installed)
```

---

## Testing Checklist

- [ ] Receipt PDF generates correctly with all details
- [ ] WhatsApp links open correctly on mobile and desktop
- [ ] Fee reminder system identifies correct overdue students
- [ ] AI insights calculate accurately
- [ ] All features work in dark mode
- [ ] Responsive design on mobile devices
- [ ] Email sharing works (if implemented)

---

## Future Enhancements

1. **SMS Integration** - Integrate with SMS gateway for text reminders
2. **Email Automation** - Scheduled email reminders
3. **Payment Gateway** - Online payment links in receipts
4. **Advanced Analytics** - More ML-based predictions
5. **Multi-language Receipts** - Support for regional languages
