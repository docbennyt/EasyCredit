create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'superadmin'
  );
$$;

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if new.id <> old.id then
    raise exception 'Profile id cannot be changed';
  end if;

  if new.role is distinct from old.role and not public.is_superadmin() then
    raise exception 'Only a superadmin can change profile roles';
  end if;

  if new.email is distinct from old.email and not public.is_superadmin() then
    new.email = old.email;
  end if;

  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'superadmin')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ventures (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references public.ventures(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('credit_given', 'payment_received', 'change_owed', 'change_returned', 'adjustment')),
  amount numeric not null,
  note text,
  due_date date,
  status text not null default 'active',
  sync_status text not null default 'synced',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.app_error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  severity text not null default 'error',
  message text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists profiles_protect_fields on public.profiles;
create trigger profiles_protect_fields before update on public.profiles
for each row execute procedure public.protect_profile_fields();

drop trigger if exists ventures_set_updated_at on public.ventures;
create trigger ventures_set_updated_at before update on public.ventures
for each row execute procedure public.set_updated_at();

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at before update on public.customers
for each row execute procedure public.set_updated_at();

drop trigger if exists ledger_entries_set_updated_at on public.ledger_entries;
create trigger ledger_entries_set_updated_at before update on public.ledger_entries
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.ventures enable row level security;
alter table public.customers enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.admin_audit_logs enable row level security;
alter table public.app_error_logs enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (
  auth.uid() = id
  or public.is_superadmin()
);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (
  auth.uid() = id
  or public.is_superadmin()
)
with check (
  auth.uid() = id
  or public.is_superadmin()
);

drop policy if exists "ventures_owner_all" on public.ventures;
create policy "ventures_owner_all"
on public.ventures for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "customers_owner_all" on public.customers;
create policy "customers_owner_all"
on public.customers for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "ledger_entries_owner_all" on public.ledger_entries;
create policy "ledger_entries_owner_all"
on public.ledger_entries for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "admin_audit_logs_superadmin_select" on public.admin_audit_logs;
create policy "admin_audit_logs_superadmin_select"
on public.admin_audit_logs for select
using (
  public.is_superadmin()
);

drop policy if exists "admin_audit_logs_superadmin_insert" on public.admin_audit_logs;
create policy "admin_audit_logs_superadmin_insert"
on public.admin_audit_logs for insert
with check (
  public.is_superadmin()
  and admin_user_id = auth.uid()
);

drop policy if exists "app_error_logs_insert_authenticated" on public.app_error_logs;
create policy "app_error_logs_insert_authenticated"
on public.app_error_logs for insert
with check (auth.uid() = user_id or user_id is null);

drop policy if exists "app_error_logs_select_superadmin" on public.app_error_logs;
create policy "app_error_logs_select_superadmin"
on public.app_error_logs for select
using (
  public.is_superadmin()
);
