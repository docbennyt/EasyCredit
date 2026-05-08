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
    return new;
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

insert into public.profiles (id, email, full_name, role, onboarding_completed)
select
  au.id,
  coalesce(au.email, ''),
  coalesce(au.raw_user_meta_data ->> 'full_name', au.raw_user_meta_data ->> 'name'),
  case
    when lower(coalesce(au.email, '')) = 'dr.bennyt.09@gmail.com' then 'superadmin'
    else 'user'
  end,
  false
from auth.users au
where not exists (
  select 1
  from public.profiles p
  where p.id = au.id
);

update public.profiles
set role = 'superadmin'
where lower(email) = 'dr.bennyt.09@gmail.com';

drop trigger if exists profiles_protect_fields on public.profiles;
create trigger profiles_protect_fields
before update on public.profiles
for each row execute procedure public.protect_profile_fields();

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (
  auth.uid() = id
  or public.is_superadmin()
);

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

drop policy if exists "admin_audit_logs_superadmin_select" on public.admin_audit_logs;
create policy "admin_audit_logs_superadmin_select"
on public.admin_audit_logs for select
using (public.is_superadmin());

drop policy if exists "admin_audit_logs_superadmin_insert" on public.admin_audit_logs;
create policy "admin_audit_logs_superadmin_insert"
on public.admin_audit_logs for insert
with check (
  public.is_superadmin()
  and admin_user_id = auth.uid()
);

drop policy if exists "app_error_logs_select_superadmin" on public.app_error_logs;
create policy "app_error_logs_select_superadmin"
on public.app_error_logs for select
using (public.is_superadmin());
