-- Point Instagram social link at the real profile (was placeholder "#")
update public.site_settings
set social_links = (
  select coalesce(
    jsonb_agg(
      case
        when lower(coalesce(elem->>'icon', '')) = 'instagram'
          or lower(coalesce(elem->>'label', '')) = 'instagram'
        then jsonb_set(
          elem,
          '{href}',
          to_jsonb('https://www.instagram.com/kingofshades609/'::text)
        )
        else elem
      end
    ),
    '[]'::jsonb
  )
  from jsonb_array_elements(coalesce(social_links, '[]'::jsonb)) as elem
)
where social_links is not null
  and jsonb_typeof(social_links) = 'array'
  and exists (
    select 1
    from jsonb_array_elements(social_links) as elem
    where (
      lower(coalesce(elem->>'icon', '')) = 'instagram'
      or lower(coalesce(elem->>'label', '')) = 'instagram'
    )
    and coalesce(elem->>'href', '#') in ('#', '', '/')
  );
