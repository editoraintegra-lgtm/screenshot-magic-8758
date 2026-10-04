alter table public.articles add column search_text text generated always as (
  coalesce(title,'') || ' ' || coalesce(subtitle,'') || ' ' || coalesce(author_name,'') || ' ' || coalesce(section,'') || ' ' || coalesce(subsection,'') || ' ' || body::text
) stored;