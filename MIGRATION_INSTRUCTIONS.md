# Database Migration Instructions

## 🚨 IMPORTANT: Run These in Order

### Migration 1: Add Email Columns
**File**: `migration_add_email.sql`

```sql
ALTER TABLE students ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE enquiries ADD COLUMN IF NOT EXISTS email TEXT;
```

**How to run**:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the above SQL
4. Click "Run"

---

### Migration 2: Create Attendance Table
**File**: `migration_attendance.sql`

**How to run**:
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Open the file `migration_attendance.sql` in your code editor
4. Copy ALL the contents
5. Paste into Supabase SQL Editor
6. Click "Run"

**What it creates**:
- `attendance` table with columns:
  - `id` (primary key)
  - `date` (attendance date)
  - `studentId` (reference to student)
  - `batchId` (optional batch reference)
  - `status` (Present/Absent/Late)
  - `ownerEmail` (for RLS)
  - `createdAt` (timestamp)

- RLS Policies for data security

---

## ✅ Verification

After running migrations, verify in Supabase:

1. Go to **Table Editor**
2. Check that you see:
   - `students` table has `email` column
   - `enquiries` table has `email` column
   - `attendance` table exists with all columns

3. Go to **Authentication** > **Policies**
4. Verify `attendance` table has 4 RLS policies

---

## 🎯 Quick Test

After migrations:
1. Start your app: `npm run dev`
2. Login to the app
3. Navigate to `/attendance`
4. Try marking attendance
5. Check Supabase Table Editor to see if data appears in `attendance` table

---

**Status**: Ready to migrate ✨
