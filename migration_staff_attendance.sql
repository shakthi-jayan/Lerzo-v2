-- Migration Script: Re-create 'staff_attendance' table
-- Run this script in your Supabase SQL Editor.

-- 1. Drop existing policies to avoid conflicts
drop policy if exists "Users can view their own staff_attendance records" on "staff_attendance";
drop policy if exists "Users can insert their own staff_attendance records" on "staff_attendance";
drop policy if exists "Users can update their own staff_attendance records" on "staff_attendance";
drop policy if exists "Users can delete their own staff_attendance records" on "staff_attendance";

-- 2. Drop the table to ensure we create it with the correct schema (UUID for staffId)
-- WARNING: This will delete any existing staff attendance data.
drop table if exists "staff_attendance";

-- 3. Create the table with the correct schema
create table "staff_attendance" (
  "id" text primary key,
  "date" text not null,
  "staffId" uuid not null references staff(id),
  "status" text not null, -- 'Present', 'Absent', 'Leave'
  "ownerEmail" text not null,
  "createdAt" timestamp with time zone default now()
);

-- 4. Enable RLS
alter table "staff_attendance" enable row level security;

-- 5. Re-create Policies
create policy "Users can view their own staff_attendance records"
on "staff_attendance" for select
using ( "ownerEmail" = current_setting('request.jwt.claim.email', true) );

create policy "Users can insert their own staff_attendance records"
on "staff_attendance" for insert
with check ( "ownerEmail" = current_setting('request.jwt.claim.email', true) );

create policy "Users can update their own staff_attendance records"
on "staff_attendance" for update
using ( "ownerEmail" = current_setting('request.jwt.claim.email', true) );

create policy "Users can delete their own staff_attendance records"
on "staff_attendance" for delete
using ( "ownerEmail" = current_setting('request.jwt.claim.email', true) );
