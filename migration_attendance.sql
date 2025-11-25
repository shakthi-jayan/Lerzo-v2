-- Migration Script: Create 'attendance' table
-- Run this script in your Supabase SQL Editor.

create table if not exists "attendance" (
  "id" text primary key,
  "date" text not null,
  "batchId" text,
  "studentId" text not null references students(id),
  "status" text not null, -- 'Present', 'Absent', 'Late', 'Excused'
  "ownerEmail" text not null,
  "createdAt" timestamp with time zone default now()
);

-- Add RLS Policies for attendance
alter table "attendance" enable row level security;

create policy "Users can view their own attendance records"
on "attendance" for select
using ( "ownerEmail" = current_setting('request.jwt.claim.email', true) );

create policy "Users can insert their own attendance records"
on "attendance" for insert
with check ( "ownerEmail" = current_setting('request.jwt.claim.email', true) );

create policy "Users can update their own attendance records"
on "attendance" for update
using ( "ownerEmail" = current_setting('request.jwt.claim.email', true) );

create policy "Users can delete their own attendance records"
on "attendance" for delete
using ( "ownerEmail" = current_setting('request.jwt.claim.email', true) );
