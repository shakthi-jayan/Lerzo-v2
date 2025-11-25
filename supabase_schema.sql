-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Centre Settings Table
create table "settings" (
  "id" uuid primary key default uuid_generate_v4(),
  "ownerEmail" text not null unique,
  "name" text,
  "email" text,
  "phone" text,
  "address1" text,
  "city" text,
  "pincode" text,
  "logoUrl" text, -- Storing base64 or URL
  "createdAt" timestamp with time zone default now()
);

-- 2. Courses Table
create table "courses" (
  "id" text primary key, -- Keeping text ID to match client-generated IDs if any, or we can use UUID
  "ownerEmail" text not null,
  "name" text not null,
  "description" text,
  "duration" numeric,
  "fees" numeric,
  "status" text default 'Active',
  "studentsEnrolled" numeric default 0,
  "createdAt" timestamp with time zone default now()
);

-- 3. Batches Table
create table "batches" (
  "id" text primary key,
  "ownerEmail" text not null,
  "name" text not null,
  "timing" text,
  "startTime" text,
  "endTime" text,
  "status" text default 'Active',
  "studentsEnrolled" numeric default 0,
  "createdAt" timestamp with time zone default now()
);

-- 4. Schemes Table
create table "schemes" (
  "id" text primary key,
  "ownerEmail" text not null,
  "name" text not null,
  "description" text,
  "discountPercent" numeric default 0,
  "createdAt" timestamp with time zone default now()
);

-- 5. Enquiries Table
create table "enquiries" (
  "id" text primary key,
  "ownerEmail" text not null,
  "name" text not null,
  "mobile" text,
  "mobile2" text,
  "courseInterested" text,
  "qualification" text,
  "status" text default 'Active',
  "fathersName" text,
  "sex" text,
  "address1" text,
  "address2" text,
  "city" text,
  "pincode" text,
  "employmentStatus" text,
  "scheme" text,
  "reason" text,
  "joiningPlan" text,
  "source" text,
  "email" text,
  "addedOn" timestamp with time zone default now()
);

-- 6. Students Table
create table "students" (
  "id" text primary key,
  "ownerEmail" text not null,
  "enrollmentNo" text,
  "name" text not null,
  "fathersName" text,
  "sex" text,
  "dob" text, -- Storing as string to match frontend 'YYYY-MM-DD'
  "age" numeric,
  "address1" text,
  "address2" text,
  "city" text,
  "pincode" text,
  "mobile" text,
  "mobile2" text,
  "email" text,
  "qualification" text,
  
  "course" text,
  "batch" text,
  "scheme" text,

  "feeStatus" text,
  "totalFee" numeric default 0,
  "concession" numeric default 0,
  "paidFee" numeric default 0,
  "balance" numeric default 0,
  
  "joinDate" text,
  "createdAt" timestamp with time zone default now()
);

-- 7. Payments Table
create table "payments" (
  "id" text primary key,
  "ownerEmail" text not null,
  "studentId" text references "students"("id") on delete cascade,
  "amount" numeric not null,
  "date" text,
  "method" text,
  "receiptNo" text,
  "notes" text,
  "createdAt" timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table "settings" enable row level security;
alter table "courses" enable row level security;
alter table "batches" enable row level security;
alter table "schemes" enable row level security;
alter table "enquiries" enable row level security;
alter table "students" enable row level security;
alter table "payments" enable row level security;

-- Create Policies (Strict RLS for Method 2 Security)
-- These policies ensure a user can ONLY see and modify data where ownerEmail matches their login email.
-- This effectively creates a "Separate Database" for each user.

-- Settings: Users can only see/edit their own settings
create policy "Enable access for owner" on "settings" 
  for all using (auth.jwt() ->> 'email' = "ownerEmail") 
  with check (auth.jwt() ->> 'email' = "ownerEmail");

-- Courses
create policy "Enable access for owner" on "courses" 
  for all using (auth.jwt() ->> 'email' = "ownerEmail") 
  with check (auth.jwt() ->> 'email' = "ownerEmail");

-- Batches
create policy "Enable access for owner" on "batches" 
  for all using (auth.jwt() ->> 'email' = "ownerEmail") 
  with check (auth.jwt() ->> 'email' = "ownerEmail");

-- Schemes
create policy "Enable access for owner" on "schemes" 
  for all using (auth.jwt() ->> 'email' = "ownerEmail") 
  with check (auth.jwt() ->> 'email' = "ownerEmail");

-- Enquiries
create policy "Enable access for owner" on "enquiries" 
  for all using (auth.jwt() ->> 'email' = "ownerEmail") 
  with check (auth.jwt() ->> 'email' = "ownerEmail");

-- Students
create policy "Enable access for owner" on "students" 
  for all using (auth.jwt() ->> 'email' = "ownerEmail") 
  with check (auth.jwt() ->> 'email' = "ownerEmail");

-- Payments
create policy "Enable access for owner" on "payments" 
  for all using (auth.jwt() ->> 'email' = "ownerEmail") 
  with check (auth.jwt() ->> 'email' = "ownerEmail");
