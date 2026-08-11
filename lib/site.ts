export const site = {
  name: "King of Shades",
  shortName: "KOS",
  tagline: "Premium Window Tinting & Custom Vinyl",
  phone: "(609) 839-1584",
  phoneHref: "tel:+16098391584",
  email: "kingofshades2025@gmail.com",
  emailHref: "mailto:kingofshades2025@gmail.com",
  domain: "kingofshadesnj.com",
  url: "https://kingofshadesnj.com",
  address: {
    line1: "Brigantine, NJ",
    line2: "Serving Atlantic County & South Jersey",
  },
  hours: [
    { day: "Monday – Friday", time: "8:00 AM – 6:00 PM" },
    { day: "Saturday", time: "9:00 AM – 4:00 PM" },
    { day: "Sunday", time: "Closed" },
  ],
  socials: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/kingofshades609/",
      icon: "instagram",
    },
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
  { label: "Calendar", href: "/admin/calendar", icon: "calendar" },
  { label: "Appointments", href: "/admin/appointments", icon: "calendar" },
  { label: "Quotes", href: "/admin/quotes", icon: "edit" },
  { label: "Customers", href: "/admin/customers", icon: "users" },
  { label: "Services", href: "/admin/services", icon: "tag" },
  { label: "Gallery", href: "/admin/gallery", icon: "image" },
  { label: "Testimonials", href: "/admin/testimonials", icon: "quote" },
  { label: "Content", href: "/admin/content", icon: "edit" },
  { label: "Payments", href: "/admin/payments", icon: "card" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
] as const;
