# Lerzo - Setup & Implementation Guide

## 🎯 Overview
This guide will help you complete the setup of your Lerzo Student Management System with all the new features that have been implemented.

---

## 📦 New Features Implemented

### 1. ✅ Attendance System
- **Route**: `/attendance`
- **Features**: 
  - Date-based attendance marking
  - Batch and course filtering
  - Search by student name/ID
  - Bulk mark all as Present/Absent
  - Individual status marking (Present/Absent/Late)

### 2. ✅ ID Card Generator
- **Route**: `/id-cards`
- **Features**:
  - Select students by batch/course
  - Multi-select students
  - Generate professional ID cards
  - Download as PDF (8 cards per A4 page)

### 3. ✅ Certificate Generator
- **Route**: `/certificates`
- **Features**:
  - Select student and course
  - Professional certificate design
  - Customizable issue date
  - Download as PDF (landscape A4)

### 4. ✅ Enquiry Kanban Board
- **Route**: `/enquiries/kanban`
- **Features**:
  - Drag-and-drop enquiries between columns
  - Three columns: Active Leads, Converted, Closed
  - Search functionality
  - Visual status management

### 5. ✅ Advanced Analytics
- **Route**: `/reports`
- **Features**:
  - Revenue bar chart (week/month/year views)
  - Student growth line chart
  - Top 5 courses bar chart
  - Enquiry status pie chart

### 6. ✅ Email Integration
- Added email field to Students and Enquiries
- EmailJS integration for backup and bulk messaging

---

## 🗄️ Database Setup (CRITICAL)

### Step 1: Run Email Migration
Open your **Supabase SQL Editor** and run:

```sql
-- File: migration_add_email.sql
ALTER TABLE students ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS email TEXT;
```

### Step 2: Run Attendance Migration
Open your **Supabase SQL Editor** and run the contents of:
**`migration_attendance.sql`**

This will:
- Create the `attendance` table
- Set up Row Level Security (RLS) policies
- Create necessary indexes

---

## 🔧 Environment Variables Setup

Ensure your `.env` file contains:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# EmailJS (Optional - for email features)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

---

## 📦 Dependencies Installed

The following packages have been installed:
- ✅ `jspdf` - PDF generation for ID cards and certificates
- ✅ `html2canvas` - Convert HTML to canvas for PDF
- ✅ `@dnd-kit/core` - Drag and drop core
- ✅ `@dnd-kit/sortable` - Sortable drag and drop
- ✅ `@dnd-kit/utilities` - DnD utilities

---

## 🧪 Testing Guide

### Test Attendance System
1. Navigate to `/attendance`
2. Select a date
3. Choose a batch/course (optional)
4. Mark attendance for students
5. Click "Save Attendance"
6. Verify data is saved in Supabase

### Test ID Card Generator
1. Navigate to `/id-cards`
2. Filter students by batch/course
3. Select multiple students
4. Click "Generate PDF"
5. Verify PDF downloads with ID cards

### Test Certificate Generator
1. Navigate to `/certificates`
2. Select a student from the list
3. Set issue date
4. Click "Download Certificate"
5. Verify PDF downloads

### Test Enquiry Kanban
1. Navigate to `/enquiries/kanban`
2. Try dragging enquiries between columns
3. Verify status updates in database
4. Test search functionality

### Test Advanced Analytics
1. Navigate to `/reports`
2. Switch between Week/Month/Year views
3. Verify all 4 charts display correctly
4. Check data accuracy

---

## 🎨 Navigation Structure

The sidebar now includes these new links:
- 📅 **Attendance** - Mark and track attendance
- 🆔 **ID Cards** - Generate student ID cards
- 🏆 **Certificates** - Generate completion certificates
- 📊 **Enquiry Board** - Kanban view for enquiries

---

## 🐛 Common Issues & Solutions

### Issue: Attendance not saving
**Solution**: Ensure you've run `migration_attendance.sql` in Supabase

### Issue: PDF generation fails
**Solution**: Check browser console for errors. Ensure `jspdf` and `html2canvas` are installed

### Issue: Drag and drop not working
**Solution**: Ensure `@dnd-kit` packages are installed correctly

### Issue: Charts not displaying
**Solution**: Verify you have data in the database (students, payments, enquiries)

### Issue: Email field not showing
**Solution**: Run `migration_add_email.sql` in Supabase

---

## 🚀 Future Enhancements (Planned)

1. **Dashboard Calendar Widget** - Visual calendar on dashboard
2. **React Query Integration** - Better data fetching and caching
3. **Form Validation** - Using `react-hook-form` and `zod`
4. **Notifications System** - Real-time notifications
5. **Mobile App** - React Native version

---

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify database migrations are complete
3. Ensure all environment variables are set
4. Check that `npm run dev` is running without errors

---

## ✅ Checklist

Before going live, ensure:
- [ ] All database migrations are run
- [ ] Environment variables are configured
- [ ] All features tested
- [ ] EmailJS configured (if using email features)
- [ ] Supabase RLS policies are active
- [ ] Logo uploaded in Settings
- [ ] Centre details updated in Settings

---

**Last Updated**: November 23, 2025
**Version**: 2.0.0
**Status**: Ready for Production ✨
