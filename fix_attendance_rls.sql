-- Fix RLS Policies for 'attendance' and 'staff_attendance' tables
-- Run this script in your Supabase SQL Editor.

-- 1. Fix 'attendance' table policies
alter table "attendance" enable row level security;

drop policy if exists "Users can view their own attendance records" on "attendance";
drop policy if exists "Users can insert their own attendance records" on "attendance";
drop policy if exists "Users can update their own attendance records" on "attendance";
drop policy if exists "Users can delete their own attendance records" on "attendance";

create policy "Users can view their own attendance records"
on "attendance" for select
using ( "ownerEmail" = (auth.jwt() ->> 'email') );

create policy "Users can insert their own attendance records"
on "attendance" for insert
with check ( "ownerEmail" = (auth.jwt() ->> 'email') );

create policy "Users can update their own attendance records"
on "attendance" for update
using ( "ownerEmail" = (auth.jwt() ->> 'email') );

create policy "Users can delete their own attendance records"
on "attendance" for delete
using ( "ownerEmail" = (auth.jwt() ->> 'email') );


-- 2. Fix 'staff_attendance' table policies
alter table "staff_attendance" enable row level security;

drop policy if exists "Users can view their own staff_attendance records" on "staff_attendance";
drop policy if exists "Users can insert their own staff_attendance records" on "staff_attendance";
drop policy if exists "Users can update their own staff_attendance records" on "staff_attendance";
drop policy if exists "Users can delete their own staff_attendance records" on "staff_attendance";

create policy "Users can view their own staff_attendance records"
on "staff_attendance" for select
using ( "ownerEmail" = (auth.jwt() ->> 'email') );

create policy "Users can insert their own staff_attendance records"
on "staff_attendance" for insert
with check ( "ownerEmail" = (auth.jwt() ->> 'email') );

create policy "Users can update their own staff_attendance records"
on "staff_attendance" for update
using ( "ownerEmail" = (auth.jwt() ->> 'email') );

create policy "Users can delete their own staff_attendance records"
on "staff_attendance" for delete
using ( "ownerEmail" = (auth.jwt() ->> 'email') );
