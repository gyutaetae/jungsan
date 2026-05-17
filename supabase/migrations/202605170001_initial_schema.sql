create extension if not exists pgcrypto;

create type public.ledger_source as enum ('receipt', 'spreadsheet', 'camera', 'sample');
create type public.ledger_status as enum ('queued', 'processing', 'needs_review', 'confirmed', 'failed');
create type public.vat_status as enum ('confirmed', 'missing', 'estimated');
create type public.expense_category as enum (
  '소모품비',
  '여비교통비',
  '접대비',
  '통신비',
  '지급수수료',
  '광고선전비',
  '차량유지비',
  '기타경비'
);
create type public.proof_type as enum (
  '카드영수증',
  '현금영수증',
  '세금계산서',
  '간이영수증',
  '기타'
);
create type public.import_status as enum ('pending', 'processing', 'done', 'failed');
create type public.import_source_type as enum ('receipt', 'spreadsheet', 'camera', 'sample');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  business_number text,
  tax_year integer not null check (tax_year between 2000 and 2100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, business_name, tax_year)
);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  source_type public.import_source_type not null,
  status public.import_status not null default 'pending',
  item_count integer not null default 0 check (item_count >= 0),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.source_files (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references public.import_batches(id) on delete cascade,
  original_file_name text not null,
  storage_path text,
  mime_type text,
  status public.import_status not null default 'pending',
  error_message text,
  created_at timestamptz not null default now()
);

create table public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  batch_id uuid references public.import_batches(id) on delete set null,
  source_file_id uuid references public.source_files(id) on delete set null,
  source public.ledger_source not null,
  status public.ledger_status not null default 'needs_review',
  transaction_date date not null,
  vendor_name text not null,
  business_number text,
  description text not null default '',
  total_amount numeric(14, 2) not null check (total_amount >= 0),
  supply_amount numeric(14, 2) check (supply_amount is null or supply_amount >= 0),
  vat_amount numeric(14, 2) check (vat_amount is null or vat_amount >= 0),
  vat_status public.vat_status not null default 'missing',
  category public.expense_category not null default '기타경비',
  proof_type public.proof_type not null default '기타',
  confidence numeric(5, 4) check (confidence is null or confidence between 0 and 1),
  memo text,
  original_file_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ledger_entries_vat_consistency check (
    vat_status <> 'confirmed'
    or (supply_amount is not null and vat_amount is not null)
  )
);

create table public.tax_prep_summaries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  tax_year integer not null check (tax_year between 2000 and 2100),
  total_income_amount numeric(14, 2) not null default 0 check (total_income_amount >= 0),
  total_expense_amount numeric(14, 2) not null default 0 check (total_expense_amount >= 0),
  estimated_income_amount numeric(14, 2) generated always as (total_income_amount - total_expense_amount) stored,
  supply_amount numeric(14, 2) not null default 0 check (supply_amount >= 0),
  vat_amount numeric(14, 2) not null default 0 check (vat_amount >= 0),
  needs_review_count integer not null default 0 check (needs_review_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, tax_year)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

create trigger ledger_entries_set_updated_at
before update on public.ledger_entries
for each row execute function public.set_updated_at();

create trigger tax_prep_summaries_set_updated_at
before update on public.tax_prep_summaries
for each row execute function public.set_updated_at();

create index businesses_owner_year_idx on public.businesses(owner_id, tax_year);
create index import_batches_business_created_idx on public.import_batches(business_id, created_at desc);
create index source_files_batch_idx on public.source_files(batch_id);
create index ledger_entries_business_date_idx on public.ledger_entries(business_id, transaction_date desc);
create index ledger_entries_business_category_idx on public.ledger_entries(business_id, category);
create index ledger_entries_business_proof_type_idx on public.ledger_entries(business_id, proof_type);
create index ledger_entries_status_idx on public.ledger_entries(status);
create index tax_prep_summaries_business_year_idx on public.tax_prep_summaries(business_id, tax_year);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.import_batches enable row level security;
alter table public.source_files enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.tax_prep_summaries enable row level security;

create policy "profiles are owned by auth user"
on public.profiles
for all
using (id = auth.uid())
with check (id = auth.uid());

create policy "businesses are owned by auth user"
on public.businesses
for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "import batches follow business owner"
on public.import_batches
for all
using (
  exists (
    select 1 from public.businesses
    where businesses.id = import_batches.business_id
      and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = import_batches.business_id
      and businesses.owner_id = auth.uid()
  )
);

create policy "source files follow batch business owner"
on public.source_files
for all
using (
  exists (
    select 1
    from public.import_batches
    join public.businesses on businesses.id = import_batches.business_id
    where import_batches.id = source_files.batch_id
      and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.import_batches
    join public.businesses on businesses.id = import_batches.business_id
    where import_batches.id = source_files.batch_id
      and businesses.owner_id = auth.uid()
  )
);

create policy "ledger entries follow business owner"
on public.ledger_entries
for all
using (
  exists (
    select 1 from public.businesses
    where businesses.id = ledger_entries.business_id
      and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = ledger_entries.business_id
      and businesses.owner_id = auth.uid()
  )
);

create policy "tax prep summaries follow business owner"
on public.tax_prep_summaries
for all
using (
  exists (
    select 1 from public.businesses
    where businesses.id = tax_prep_summaries.business_id
      and businesses.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = tax_prep_summaries.business_id
      and businesses.owner_id = auth.uid()
  )
);

create or replace view public.monthly_expense_summary
with (security_invoker = true)
as
select
  business_id,
  date_trunc('month', transaction_date)::date as month,
  count(*) as entry_count,
  sum(total_amount) as total_amount,
  sum(coalesce(supply_amount, 0)) as supply_amount,
  sum(coalesce(vat_amount, 0)) as vat_amount
from public.ledger_entries
where status = 'confirmed'
group by business_id, date_trunc('month', transaction_date)::date;

create or replace view public.category_expense_summary
with (security_invoker = true)
as
select
  business_id,
  category,
  count(*) as entry_count,
  sum(total_amount) as total_amount
from public.ledger_entries
where status = 'confirmed'
group by business_id, category;

create or replace view public.proof_type_expense_summary
with (security_invoker = true)
as
select
  business_id,
  proof_type,
  count(*) as entry_count,
  sum(total_amount) as total_amount
from public.ledger_entries
where status = 'confirmed'
group by business_id, proof_type;

create or replace view public.needs_review_entries
with (security_invoker = true)
as
select *
from public.ledger_entries
where status = 'needs_review' or vat_status <> 'confirmed';
