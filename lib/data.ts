/* Mock data for the Phase 1 frontend prototype. No backend — display only. */

export type Service = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  benefits: string[];
  startingAt: string;
  features: { name: string; detail: string }[];
  accent: "automotive" | "residential" | "commercial" | "decals";
};

export const services: Service[] = [
  {
    slug: "automotive",
    title: "Automotive Window Tinting",
    tagline: "Cooler rides, sharper looks, total UV defense.",
    description:
      "From daily drivers to show cars, our precision-cut films deliver a flawless, bubble-free finish backed by a lifetime workmanship guarantee. Choose the exact shade and performance level for your build.",
    benefits: [
      "Up to 99% UV ray rejection",
      "Rejects up to 88% of infrared heat",
      "Reduces glare for safer driving",
      "Protects interior from fading & cracking",
    ],
    startingAt: "$199",
    features: [
      { name: "Full Vehicle Packages", detail: "Front, rear & sides cut to spec for any make or model." },
      { name: "Windshield Tinting", detail: "Heat-rejecting clear and shaded windshield options." },
      { name: "Ceramic Tint", detail: "Nano-ceramic films for maximum heat rejection without signal loss." },
      { name: "UV & Heat Rejection", detail: "Block harmful rays and keep your cabin noticeably cooler." },
    ],
    accent: "automotive",
  },
  {
    slug: "residential",
    title: "Residential Window Tinting",
    tagline: "Comfort, privacy, and lower energy bills at home.",
    description:
      "Transform any room with films that cut heat and glare while protecting your furnishings. Enjoy daytime privacy and a more comfortable, energy-efficient home year round.",
    benefits: [
      "Lower cooling costs & energy use",
      "Daytime privacy without losing the view",
      "Eliminates harsh glare on screens",
      "Blocks 99% of fading UV rays",
    ],
    startingAt: "$12 / sq ft",
    features: [
      { name: "Energy Efficiency", detail: "Reduce hot spots and ease the load on your HVAC system." },
      { name: "Privacy Enhancement", detail: "Reflective and frosted films for comfortable privacy." },
      { name: "Glare Reduction", detail: "Work and relax without squinting at bright windows." },
      { name: "UV Protection", detail: "Shield floors, art, and furniture from sun damage." },
    ],
    accent: "residential",
  },
  {
    slug: "commercial",
    title: "Commercial Window Tinting",
    tagline: "Professional film solutions that protect your bottom line.",
    description:
      "Improve tenant comfort, brand your storefront, and harden your glass against break-ins. Our commercial-grade films are installed with minimal disruption to your operations.",
    benefits: [
      "Cut peak cooling demand & costs",
      "Consistent, professional building appearance",
      "Safety & security film options",
      "Improved employee comfort & productivity",
    ],
    startingAt: "Custom quote",
    features: [
      { name: "Office Buildings", detail: "Uniform exterior look with interior comfort control." },
      { name: "Storefronts", detail: "Branding, privacy, and sun control for retail glass." },
      { name: "Security Films", detail: "Hold shattered glass in place against forced entry." },
      { name: "Energy Savings", detail: "Measurable reductions in HVAC load and operating cost." },
    ],
    accent: "commercial",
  },
  {
    slug: "decals",
    title: "Decals & Vinyl Graphics",
    tagline: "Custom branding that turns heads on glass and metal.",
    description:
      "Our in-house design team creates and installs premium decals and vinyl graphics — from subtle accents to full vehicle wraps and statement storefront signage.",
    benefits: [
      "Bold, fade-resistant custom designs",
      "Clean removal that protects surfaces",
      "Consistent branding across your fleet",
      "Fast turnaround on custom artwork",
    ],
    startingAt: "$89",
    features: [
      { name: "Custom Decals", detail: "Die-cut decals in any size, color, or finish." },
      { name: "Business Branding", detail: "Logos, hours, and graphics for doors and windows." },
      { name: "Vehicle Graphics", detail: "Partial and full wraps, lettering, and accents." },
      { name: "Window Graphics", detail: "Frosted, perforated, and printed window films." },
    ],
    accent: "decals",
  },
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  rating: number;
};

export const testimonials: Testimonial[] = [
  {
    name: "Marcus Reyes",
    role: "Tesla Model 3 Owner",
    quote:
      "The ceramic tint on my Model 3 is flawless — no purple fade, no bubbles, and the cabin stays cool even in July. Genuinely the cleanest install I've ever seen.",
    rating: 5,
  },
  {
    name: "Dana Whitfield",
    role: "Homeowner, Hillcrest",
    quote:
      "Our west-facing living room used to be unbearable. After King of Shades tinted the windows, the glare is gone and our AC finally gets a break. Worth every penny.",
    rating: 5,
  },
  {
    name: "Priya Nair",
    role: "Owner, Brew & Co. Café",
    quote:
      "They branded our entire storefront with frosted graphics and tinted the front glass. Customers comment on it constantly — total transformation of our curb appeal.",
    rating: 5,
  },
  {
    name: "Tyrone Banks",
    role: "Fleet Manager, Apex Logistics",
    quote:
      "Twelve vans wrapped and tinted on schedule with zero downtime to our routes. The consistency across the fleet looks incredibly professional.",
    rating: 5,
  },
];

export type GalleryCategory =
  | "Cars"
  | "Trucks"
  | "SUVs"
  | "Residential"
  | "Commercial"
  | "Decals";

export const galleryCategories: GalleryCategory[] = [
  "Cars",
  "Trucks",
  "SUVs",
  "Residential",
  "Commercial",
  "Decals",
];

export type GalleryItem = {
  id: number;
  title: string;
  category: GalleryCategory;
  detail: string;
  tint?: string;
  imageUrl?: string;
};

export const galleryItems: GalleryItem[] = [
  { id: 1, title: "BMW M4 Competition", category: "Cars", detail: "Full ceramic package", tint: "20%" },
  { id: 2, title: "Ford F-150 Lariat", category: "Trucks", detail: "Cab + rear ceramic", tint: "15%" },
  { id: 3, title: "Range Rover Sport", category: "SUVs", detail: "Premium ceramic tint", tint: "35%" },
  { id: 4, title: "Hillside Modern Home", category: "Residential", detail: "Solar control film" },
  { id: 5, title: "Brew & Co. Storefront", category: "Commercial", detail: "Frosted branding + tint" },
  { id: 6, title: "Apex Logistics Van", category: "Decals", detail: "Full fleet wrap" },
  { id: 7, title: "Tesla Model S Plaid", category: "Cars", detail: "Nano-ceramic, full", tint: "20%" },
  { id: 8, title: "RAM 1500 TRX", category: "Trucks", detail: "Windshield + sides", tint: "5%" },
  { id: 9, title: "Toyota 4Runner", category: "SUVs", detail: "Heat-rejection ceramic", tint: "20%" },
  { id: 10, title: "Lakeview Penthouse", category: "Residential", detail: "Privacy + UV film" },
  { id: 11, title: "Summit Office Tower", category: "Commercial", detail: "Security + solar film" },
  { id: 12, title: "Street Racer Livery", category: "Decals", detail: "Custom vinyl graphics" },
  { id: 13, title: "Porsche 911 Carrera", category: "Cars", detail: "Carbon ceramic tint", tint: "30%" },
  { id: 14, title: "Chevy Silverado ZR2", category: "Trucks", detail: "Full ceramic package", tint: "20%" },
  { id: 15, title: "Audi Q7 Prestige", category: "SUVs", detail: "Family heat package", tint: "25%" },
  { id: 16, title: "Coastal Glass Villa", category: "Residential", detail: "Floor-to-ceiling film" },
  { id: 17, title: "Metro Bank Branch", category: "Commercial", detail: "Anti-graffiti film" },
  { id: 18, title: "Food Truck Branding", category: "Decals", detail: "Full panel graphics" },
];

/* Each gallery category maps to a base hue for its tinted-glass placeholder. */
export const categoryHue: Record<GalleryCategory, number> = {
  Cars: 210,
  Trucks: 28,
  SUVs: 150,
  Residential: 280,
  Commercial: 195,
  Decals: 340,
};

export const whyChoose = [
  {
    title: "Lifetime Warranty",
    description:
      "Every install is backed by a lifetime workmanship guarantee against bubbling, peeling, and fading.",
    icon: "shield",
  },
  {
    title: "Certified Installers",
    description:
      "Factory-trained, manufacturer-certified technicians with thousands of flawless installs.",
    icon: "badge",
  },
  {
    title: "Premium Films Only",
    description:
      "We exclusively use top-tier nano-ceramic and carbon films — never cheap dyed alternatives.",
    icon: "gem",
  },
  {
    title: "Same-Week Booking",
    description:
      "Fast scheduling and most vehicles completed in a single visit, often the same day.",
    icon: "clock",
  },
];

export const stats = [
  { label: "Vehicles Tinted", value: "12,400+" },
  { label: "5-Star Reviews", value: "2,100+" },
  { label: "Years in Business", value: "15" },
  { label: "Warranty", value: "Lifetime" },
];

export const processSteps = [
  { step: "01", title: "Consult & Quote", description: "Tell us your goals and get a transparent, itemized estimate." },
  { step: "02", title: "Choose Your Film", description: "Pick the perfect shade and performance tier with expert guidance." },
  { step: "03", title: "Precision Install", description: "Computer-cut film applied in our dust-controlled install bays." },
  { step: "04", title: "Cure & Enjoy", description: "Drive away with care instructions and a lifetime warranty." },
];

/* ----------------------------- Admin mock data ---------------------------- */

export const adminStats = [
  { label: "Total Appointments", value: "1,284", delta: "+12.4%", trend: "up", icon: "calendar" },
  { label: "Upcoming Appointments", value: "37", delta: "+5 this week", trend: "up", icon: "clock" },
  { label: "Revenue (30d)", value: "$84,920", delta: "+8.1%", trend: "up", icon: "card" },
  { label: "Quotes Requested", value: "146", delta: "+22 new", trend: "up", icon: "quote" },
  { label: "New Customers", value: "63", delta: "+3.2%", trend: "up", icon: "users" },
];

export type AppointmentStatus = "Confirmed" | "Pending" | "Completed" | "Cancelled";

export type Appointment = {
  id: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  status: AppointmentStatus;
};

export const appointments: Appointment[] = [
  { id: "APT-1042", customer: "Marcus Reyes", service: "Automotive — Ceramic Full", date: "Jun 18, 2026", time: "9:00 AM", status: "Confirmed" },
  { id: "APT-1041", customer: "Dana Whitfield", service: "Residential — Solar Control", date: "Jun 18, 2026", time: "11:30 AM", status: "Pending" },
  { id: "APT-1040", customer: "Priya Nair", service: "Commercial — Storefront", date: "Jun 19, 2026", time: "8:00 AM", status: "Confirmed" },
  { id: "APT-1039", customer: "Tyrone Banks", service: "Decals — Fleet Wrap", date: "Jun 19, 2026", time: "1:00 PM", status: "Pending" },
  { id: "APT-1038", customer: "Sofia Marin", service: "Automotive — Windshield", date: "Jun 16, 2026", time: "10:00 AM", status: "Completed" },
  { id: "APT-1037", customer: "Liam Foster", service: "SUV — Heat Package", date: "Jun 16, 2026", time: "2:30 PM", status: "Completed" },
  { id: "APT-1036", customer: "Grace Kim", service: "Residential — Privacy Film", date: "Jun 15, 2026", time: "9:30 AM", status: "Cancelled" },
  { id: "APT-1035", customer: "Andre Cole", service: "Automotive — Ceramic Full", date: "Jun 20, 2026", time: "12:00 PM", status: "Confirmed" },
];

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  totalSpent: string;
  lastService: string;
};

export const customers: Customer[] = [
  { id: "C-501", name: "Marcus Reyes", phone: "(555) 201-7788", email: "marcus.reyes@email.com", visits: 4, totalSpent: "$1,640", lastService: "Ceramic Full Tint" },
  { id: "C-502", name: "Dana Whitfield", phone: "(555) 332-1190", email: "dana.w@email.com", visits: 2, totalSpent: "$2,310", lastService: "Residential Solar Film" },
  { id: "C-503", name: "Priya Nair", phone: "(555) 884-0021", email: "priya@brewandco.com", visits: 3, totalSpent: "$5,870", lastService: "Storefront Branding" },
  { id: "C-504", name: "Tyrone Banks", phone: "(555) 410-5566", email: "tbanks@apexlog.com", visits: 6, totalSpent: "$18,200", lastService: "Fleet Wrap (x12)" },
  { id: "C-505", name: "Sofia Marin", phone: "(555) 778-9043", email: "sofia.marin@email.com", visits: 1, totalSpent: "$240", lastService: "Windshield Tint" },
  { id: "C-506", name: "Liam Foster", phone: "(555) 615-2277", email: "liam.foster@email.com", visits: 2, totalSpent: "$760", lastService: "SUV Heat Package" },
  { id: "C-507", name: "Grace Kim", phone: "(555) 909-3321", email: "grace.kim@email.com", visits: 1, totalSpent: "$0", lastService: "Cancelled" },
];

export type Invoice = {
  id: string;
  customer: string;
  amount: string;
  date: string;
  status: "Paid" | "Pending" | "Refunded";
  method: string;
};

export const invoices: Invoice[] = [
  { id: "INV-9001", customer: "Marcus Reyes", amount: "$540", date: "Jun 16, 2026", status: "Paid", method: "Visa •• 4242" },
  { id: "INV-9000", customer: "Liam Foster", amount: "$420", date: "Jun 16, 2026", status: "Paid", method: "Apple Pay" },
  { id: "INV-8999", customer: "Priya Nair", amount: "$2,950", date: "Jun 14, 2026", status: "Pending", method: "Invoice / Net 15" },
  { id: "INV-8998", customer: "Sofia Marin", amount: "$240", date: "Jun 13, 2026", status: "Paid", method: "Mastercard •• 8810" },
  { id: "INV-8997", customer: "Grace Kim", amount: "$180", date: "Jun 12, 2026", status: "Refunded", method: "Visa •• 1107" },
  { id: "INV-8996", customer: "Tyrone Banks", amount: "$9,400", date: "Jun 10, 2026", status: "Paid", method: "ACH Transfer" },
];

export const revenueByMonth = [
  { month: "Jan", value: 42 },
  { month: "Feb", value: 51 },
  { month: "Mar", value: 60 },
  { month: "Apr", value: 58 },
  { month: "May", value: 72 },
  { month: "Jun", value: 85 },
];

/* ------------------------------ Booking data ------------------------------ */

export const bookingServices = [
  { id: "automotive", title: "Automotive", description: "Cars, trucks, SUVs & windshields", icon: "car", from: "$199" },
  { id: "residential", title: "Residential", description: "Homes, condos & apartments", icon: "home", from: "$12/sq ft" },
  { id: "commercial", title: "Commercial", description: "Offices, storefronts & security", icon: "building", from: "Quote" },
  { id: "decals", title: "Decals & Vinyl", description: "Custom graphics & wraps", icon: "sticker", from: "$89" },
];

export const tintPercentages = ["5% (Limo)", "15%", "20%", "35%", "50%", "70% (Clear)"];

export const timeSlots = [
  "8:00 AM",
  "9:30 AM",
  "11:00 AM",
  "12:30 PM",
  "2:00 PM",
  "3:30 PM",
  "5:00 PM",
];
