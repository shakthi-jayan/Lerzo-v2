-- Fix RLS Policies for ALL tables to ensure data visibility and security
-- Run this script in your Supabase SQL Editor.

-- Helper function to simplify policy creation (optional, but good practice)
-- For this script, we will write explicit policies for clarity.

-- List of tables to secure:
-- students, enquiries, courses, batches, schemes, payments, attendance, staff, staff_attendance, settings

-- 1. STUDENTS
alter table "students" enable row level security;

drop policy if exists "Users can view their own students" on "students";
drop policy if exists "Users can insert their own students" on "students";
drop policy if exists "Users can update their own students" on "students";
drop policy if exists "Users can delete their own students" on "students";

create policy "Users can view their own students" on "students" for select using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can insert their own students" on "students" for insert with check ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can update their own students" on "students" for update using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can delete their own students" on "students" for delete using ( "ownerEmail" = (auth.jwt() ->> 'email') );

-- 2. ENQUIRIES
alter table "enquiries" enable row level security;

drop policy if exists "Users can view their own enquiries" on "enquiries";
drop policy if exists "Users can insert their own enquiries" on "enquiries";
drop policy if exists "Users can update their own enquiries" on "enquiries";
drop policy if exists "Users can delete their own enquiries" on "enquiries";

create policy "Users can view their own enquiries" on "enquiries" for select using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can insert their own enquiries" on "enquiries" for insert with check ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can update their own enquiries" on "enquiries" for update using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can delete their own enquiries" on "enquiries" for delete using ( "ownerEmail" = (auth.jwt() ->> 'email') );

-- 3. COURSES
alter table "courses" enable row level security;

drop policy if exists "Users can view their own courses" on "courses";
drop policy if exists "Users can insert their own courses" on "courses";
drop policy if exists "Users can update their own courses" on "courses";
drop policy if exists "Users can delete their own courses" on "courses";

create policy "Users can view their own courses" on "courses" for select using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can insert their own courses" on "courses" for insert with check ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can update their own courses" on "courses" for update using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can delete their own courses" on "courses" for delete using ( "ownerEmail" = (auth.jwt() ->> 'email') );

-- 4. BATCHES
alter table "batches" enable row level security;

drop policy if exists "Users can view their own batches" on "batches";
drop policy if exists "Users can insert their own batches" on "batches";
drop policy if exists "Users can update their own batches" on "batches";
drop policy if exists "Users can delete their own batches" on "batches";

create policy "Users can view their own batches" on "batches" for select using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can insert their own batches" on "batches" for insert with check ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can update their own batches" on "batches" for update using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can delete their own batches" on "batches" for delete using ( "ownerEmail" = (auth.jwt() ->> 'email') );

-- 5. SCHEMES
alter table "schemes" enable row level security;

drop policy if exists "Users can view their own schemes" on "schemes";
drop policy if exists "Users can insert their own schemes" on "schemes";
drop policy if exists "Users can update their own schemes" on "schemes";
drop policy if exists "Users can delete their own schemes" on "schemes";

create policy "Users can view their own schemes" on "schemes" for select using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can insert their own schemes" on "schemes" for insert with check ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can update their own schemes" on "schemes" for update using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can delete their own schemes" on "schemes" for delete using ( "ownerEmail" = (auth.jwt() ->> 'email') );

-- 6. PAYMENTS
alter table "payments" enable row level security;

drop policy if exists "Users can view their own payments" on "payments";
drop policy if exists "Users can insert their own payments" on "payments";
drop policy if exists "Users can update their own payments" on "payments";
drop policy if exists "Users can delete their own payments" on "payments";

create policy "Users can view their own payments" on "payments" for select using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can insert their own payments" on "payments" for insert with check ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can update their own payments" on "payments" for update using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can delete their own payments" on "payments" for delete using ( "ownerEmail" = (auth.jwt() ->> 'email') );

-- 7. ATTENDANCE
alter table "attendance" enable row level security;

drop policy if exists "Users can view their own attendance" on "attendance";
drop policy if exists "Users can insert their own attendance" on "attendance";
drop policy if exists "Users can update their own attendance" on "attendance";
drop policy if exists "Users can delete their own attendance" on "attendance";

create policy "Users can view their own attendance" on "attendance" for select using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can insert their own attendance" on "attendance" for insert with check ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can update their own attendance" on "attendance" for update using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can delete their own attendance" on "attendance" for delete using ( "ownerEmail" = (auth.jwt() ->> 'email') );

-- 8. STAFF
alter table "staff" enable row level security;

drop policy if exists "Users can view their own staff" on "staff";
drop policy if exists "Users can insert their own staff" on "staff";
drop policy if exists "Users can update their own staff" on "staff";
drop policy if exists "Users can delete their own staff" on "staff";

create policy "Users can view their own staff" on "staff" for select using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can insert their own staff" on "staff" for insert with check ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can update their own staff" on "staff" for update using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can delete their own staff" on "staff" for delete using ( "ownerEmail" = (auth.jwt() ->> 'email') );

-- 9. STAFF ATTENDANCE
alter table "staff_attendance" enable row level security;

drop policy if exists "Users can view their own staff_attendance" on "staff_attendance";
drop policy if exists "Users can insert their own staff_attendance" on "staff_attendance";
drop policy if exists "Users can update their own staff_attendance" on "staff_attendance";
drop policy if exists "Users can delete their own staff_attendance" on "staff_attendance";

create policy "Users can view their own staff_attendance" on "staff_attendance" for select using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can insert their own staff_attendance" on "staff_attendance" for insert with check ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can update their own staff_attendance" on "staff_attendance" for update using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can delete their own staff_attendance" on "staff_attendance" for delete using ( "ownerEmail" = (auth.jwt() ->> 'email') );

-- 10. SETTINGS
alter table "settings" enable row level security;

drop policy if exists "Users can view their own settings" on "settings";
drop policy if exists "Users can insert their own settings" on "settings";
drop policy if exists "Users can update their own settings" on "settings";
drop policy if exists "Users can delete their own settings" on "settings";

create policy "Users can view their own settings" on "settings" for select using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can insert their own settings" on "settings" for insert with check ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can update their own settings" on "settings" for update using ( "ownerEmail" = (auth.jwt() ->> 'email') );
create policy "Users can delete their own settings" on "settings" for delete using ( "ownerEmail" = (auth.jwt() ->> 'email') );
