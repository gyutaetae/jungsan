-- Category totals for the 필요경비명세서 section.
select
  category,
  entry_count,
  total_amount
from public.category_expense_summary
where business_id = :business_id
order by total_amount desc;

-- Monthly spending trend for a 신고 전 검토 dashboard.
select
  month,
  entry_count,
  total_amount,
  supply_amount,
  vat_amount
from public.monthly_expense_summary
where business_id = :business_id
order by month;

-- Rows the user must review before exporting final drafts.
select
  transaction_date,
  vendor_name,
  total_amount,
  vat_status,
  category,
  proof_type,
  original_file_name
from public.needs_review_entries
where business_id = :business_id
order by transaction_date desc;

-- Rebuild the saved tax prep summary from confirmed ledger rows.
insert into public.tax_prep_summaries (
  business_id,
  tax_year,
  total_income_amount,
  total_expense_amount,
  supply_amount,
  vat_amount,
  needs_review_count
)
select
  :business_id,
  :tax_year,
  :total_income_amount,
  coalesce(sum(total_amount) filter (where status = 'confirmed'), 0),
  coalesce(sum(supply_amount) filter (where status = 'confirmed'), 0),
  coalesce(sum(vat_amount) filter (where status = 'confirmed'), 0),
  count(*) filter (where status = 'needs_review' or vat_status <> 'confirmed')
from public.ledger_entries
where business_id = :business_id
on conflict (business_id, tax_year)
do update set
  total_income_amount = excluded.total_income_amount,
  total_expense_amount = excluded.total_expense_amount,
  supply_amount = excluded.supply_amount,
  vat_amount = excluded.vat_amount,
  needs_review_count = excluded.needs_review_count,
  updated_at = now();
