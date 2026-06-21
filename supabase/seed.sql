-- Seed data for King of Shades (run AFTER 001_phase2_schema.sql)
-- Safe to re-run: uses ON CONFLICT where possible

insert into public.site_settings (business_name, phone, email, address_line1, address_line2, social_links, business_hours)
values (
  'King of Shades',
  '(555) 846-2337',
  'kingofshades2025@gmail.com',
  '1420 Chrome Avenue, Bay 7',
  'Metropolis, NJ 90210',
  '[{"label":"Instagram","href":"#","icon":"instagram"},{"label":"Facebook","href":"#","icon":"facebook"}]'::jsonb,
  '[{"day":"Monday – Friday","time":"8:00 AM – 6:00 PM"},{"day":"Saturday","time":"9:00 AM – 4:00 PM"},{"day":"Sunday","time":"Closed"}]'::jsonb
)
on conflict do nothing;

insert into public.content_sections (section_key, title, body, metadata) values
  ('hero_badge', 'Rated 5 stars by 2,100+ drivers', null, '{}'),
  ('hero_title', 'The Royal Standard in Window Tinting', null, '{"highlight":"Window Tinting"}'),
  ('hero_subtitle', null, 'Premium automotive, residential, and commercial tint plus custom vinyl — installed by certified technicians and backed by a lifetime warranty.', '{}'),
  ('about_intro', 'New Jersey''s trusted tint specialists', 'King of Shades delivers precision-cut films and custom vinyl for every glass surface.', '{}')
on conflict (section_key) do update set
  title = excluded.title,
  body = excluded.body,
  metadata = excluded.metadata;

insert into public.services (slug, title, tagline, description, category, price_label, accent, benefits, features, sort_order) values
  ('automotive', 'Automotive Window Tinting', 'Cooler rides, sharper looks, total UV defense.',
   'From daily drivers to show cars, our precision-cut films deliver a flawless finish.',
   'automotive', '$199', 'automotive',
   '["Up to 99% UV rejection","Rejects up to 88% infrared heat","Reduces glare","Protects interior"]'::jsonb,
   '[{"name":"Full Vehicle Packages","detail":"Front, rear & sides cut to spec."},{"name":"Ceramic Tint","detail":"Maximum heat rejection."}]'::jsonb, 0),
  ('residential', 'Residential Window Tinting', 'Comfort, privacy, and lower energy bills at home.',
   'Transform any room with films that cut heat and glare while protecting furnishings.',
   'residential', '$12 / sq ft', 'residential',
   '["Lower cooling costs","Daytime privacy","Glare reduction","UV protection"]'::jsonb,
   '[{"name":"Energy Efficiency","detail":"Reduce hot spots."},{"name":"Privacy Enhancement","detail":"Reflective and frosted films."}]'::jsonb, 1),
  ('commercial', 'Commercial Window Tinting', 'Professional film solutions that protect your bottom line.',
   'Improve tenant comfort, brand your storefront, and harden your glass.',
   'commercial', 'Custom quote', 'commercial',
   '["Cut cooling costs","Professional appearance","Security film options","Employee comfort"]'::jsonb,
   '[{"name":"Office Buildings","detail":"Uniform exterior look."},{"name":"Storefronts","detail":"Branding and sun control."}]'::jsonb, 2),
  ('decals', 'Decals & Vinyl Graphics', 'Custom branding that turns heads on glass and metal.',
   'Custom decals and vinyl graphics from subtle accents to full wraps.',
   'decals', '$89', 'decals',
   '["Fade-resistant designs","Clean removal","Fleet branding","Fast turnaround"]'::jsonb,
   '[{"name":"Custom Decals","detail":"Die-cut decals."},{"name":"Vehicle Graphics","detail":"Wraps and lettering."}]'::jsonb, 3)
on conflict (slug) do update set
  title = excluded.title,
  tagline = excluded.tagline,
  description = excluded.description,
  price_label = excluded.price_label,
  benefits = excluded.benefits,
  features = excluded.features;

insert into public.testimonials (customer_name, role, review, rating, is_approved, sort_order) values
  ('Marcus Reyes', 'Tesla Model 3 Owner', 'The ceramic tint on my Model 3 is flawless — no bubbles, and the cabin stays cool even in July.', 5, true, 0),
  ('Dana Whitfield', 'Homeowner, Hillcrest', 'Our west-facing living room used to be unbearable. After King of Shades tinted the windows, the glare is gone.', 5, true, 1),
  ('Priya Nair', 'Owner, Brew & Co. Café', 'They branded our entire storefront with frosted graphics and tinted the front glass.', 5, true, 2)
on conflict do nothing;

insert into public.gallery_items (title, category, description, tint, sort_order) values
  ('BMW M4 Competition', 'Cars', 'Full ceramic package', '20%', 0),
  ('Ford F-150 Lariat', 'Trucks', 'Cab + rear ceramic', '15%', 1),
  ('Range Rover Sport', 'SUVs', 'Premium ceramic tint', '35%', 2),
  ('Hillside Modern Home', 'Residential', 'Solar control film', null, 3)
on conflict do nothing;

-- After creating your admin user in Supabase Auth, run:
-- insert into public.admin_profiles (id, email, role)
-- values ('YOUR_USER_UUID', 'your@email.com', 'super_admin');
