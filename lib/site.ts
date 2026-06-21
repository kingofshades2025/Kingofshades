export const site = {
  name: "King of Shades",
  shortName: "KOS",
  tagline: "Premium Window Tinting & Custom Vinyl",
  phone: "(555) 846-2337",
  phoneHref: "tel:+15558462337",
  email: "kingofshades2025@gmail.com",
  emailHref: "mailto:kingofshades2025@gmail.com",
  domain: "kingofshadesnj.com",
  url: "https://kingofshadesnj.com",
  address: {
    line1: "1420 Chrome Avenue, Bay 7",
    line2: "Metropolis, CA 90210",
  },
  hours: [
    { day: "Monday – Friday", time: "8:00 AM – 6:00 PM" },
    { day: "Saturday", time: "9:00 AM – 4:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
  socials: [
    { label: "Instagram", href: "#", icon: "instagram" },
    { label: "Facebook", href: "#", icon: "facebook" },
    { label: "TikTok", href: "#", icon: "tiktok" },
    { label: "YouTube", href: "#", icon: "youtube" },
  ],
} as const;

export const mainNav = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Book Appointment", href: "/booking" },
  { label: "Contact Us", href: "/contact" },
] as const;

export const adminNav = [
  { label: "Dashboard", href: "/admin", icon: "dashboard" },
  { label: "Appointments", href: "/admin/appointments", icon: "calendar" },
  { label: "Customers", href: "/admin/customers", icon: "users" },
  { label: "Services", href: "/admin/services", icon: "tag" },
  { label: "Gallery", href: "/admin/gallery", icon: "image" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "quote" },
  { label: "Content", href: "/admin/content", icon: "edit" },
  { label: "Payments", href: "/admin/payments", icon: "card" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
] as const;
