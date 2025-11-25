create table if not exists staff (
  id uuid default uuid_generate_v4() primary key,
  "staffId" text,
  name text not null,
  designation text not null,
  mobile text not null,
  email text not null,
  "joiningDate" text not null,
  status text not null,
  specialization text,
  "ownerEmail" text
);

-- Safely add staffId column if it doesn't exist (for existing tables)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'staff' and column_name = 'staffId') then
    alter table staff add column "staffId" text;
  end if;
end $$;

alter table staff enable row level security;

-- Drop existing policies to avoid errors on re-run
drop policy if exists "Users can view their own staff" on staff;
drop policy if exists "Users can insert their own staff" on staff;
drop policy if exists "Users can update their own staff" on staff;
drop policy if exists "Users can delete their own staff" on staff;

create policy "Users can view their own staff"
  on staff for select
  using ( "ownerEmail" = auth.jwt() ->> 'email' );

create policy "Users can insert their own staff"
  on staff for insert
  with check ( "ownerEmail" = auth.jwt() ->> 'email' );

create policy "Users can update their own staff"
  on staff for update
  using ( "ownerEmail" = auth.jwt() ->> 'email' );

create policy "Users can delete their own staff"
  on staff for delete
  using ( "ownerEmail" = auth.jwt() ->> 'email' );
