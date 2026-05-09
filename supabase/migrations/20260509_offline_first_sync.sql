alter table public.ventures
  add column if not exists deleted_at timestamptz;

alter table public.customers
  add column if not exists deleted_at timestamptz;

alter table public.ledger_entries
  add column if not exists deleted_at timestamptz;

create index if not exists ventures_owner_updated_at_idx
  on public.ventures (owner_id, updated_at desc);

create index if not exists customers_owner_updated_at_idx
  on public.customers (owner_id, updated_at desc);

create index if not exists ledger_entries_owner_updated_at_idx
  on public.ledger_entries (owner_id, updated_at desc);
