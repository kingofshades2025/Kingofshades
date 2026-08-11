-- Replace demo contact placeholders with production King of Shades defaults.
-- Only updates rows that still look like seed/demo data.

update public.site_settings
set
  phone = '(609) 839-1584',
  address_line1 = 'Brigantine, NJ',
  address_line2 = 'Serving Atlantic County & South Jersey',
  social_links = '[{"label":"Instagram","href":"https://www.instagram.com/kingofshades609/","icon":"instagram"}]'::jsonb,
  updated_at = now()
where
  phone like '%555%'
  or address_line1 ilike '%Chrome Avenue%'
  or address_line2 ilike '%Metropolis%';
