export type Category = {
  id: string;
  name: string;
  nameEn: string;
  sortOrder: number;
};

export type Product = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  allergens: string;
  allergensEn: string;
  price: number;
  image: string;
  categoryId: string;
  featured?: boolean;
};

export type HoursRow = {
  id: string;
  label: string;
  value: string;
};

export type VenueInfo = {
  brandName: string;
  brandSubtitle: string;
  tagline: string;
  headline: string;
  subheadline: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  mapsUrl: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  statusLabel: string;
  heroImage: string;
  hours: HoursRow[];
};

export type MenuData = {
  categories: Category[];
  products: Product[];
  venue: VenueInfo;
};

export const MENU_UPDATED_EVENT = "mavi-balon-menu-updated";

const img = (file: string) => `/products/${file}`;

export const defaultVenue: VenueInfo = {
  brandName: "Mavi Balloon",
  brandSubtitle: "Döner, Burger & Sokak Lezzetleri",
  tagline: "Antakya lezzeti",
  headline: "Döner & Burger",
  subheadline: "Taze. Sıcak. Efsane.",
  addressLine1: "Caferağa, Neşet Ömer Sk. No:16 B",
  addressLine2: "Kadıköy, Istanbul",
  city: "Istanbul, Turkey",
  mapsUrl: "https://maps.google.com/?q=Cafera%C4%9Fa%2C+Ne%C5%9Fet+%C3%96mer+Sk.+No%3A16+B%2C+Kad%C4%B1k%C3%B6y",
  phone: "+902165550000",
  whatsapp: "https://wa.me/905555555555",
  instagram: "https://instagram.com/maviballoon",
  statusLabel: "Açık · 11:00 - 01:30",
  heroImage: "/brand/hero.webp",
  hours: [
    { id: "mon", label: "Pazartesi", value: "Kapalı" },
    { id: "tue-thu", label: "Salı – Perşembe", value: "11:00 - 23:30" },
    { id: "fri-sat", label: "Cuma – Cumartesi", value: "11:00 - 01:30" },
    { id: "sun", label: "Pazar", value: "12:00 - 23:00" },
  ],
};

export const defaultMenu: MenuData = {
  categories: [
    { id: "burgerler", name: "Burgerler", nameEn: "Burgers", sortOrder: 0 },
    { id: "donerler", name: "Dönerler", nameEn: "Döner", sortOrder: 1 },
    { id: "doner-menuleri", name: "Döner Menüleri", nameEn: "Döner Menus", sortOrder: 2 },
    { id: "ekonomik", name: "Ekonomik Menüler", nameEn: "Value Menus", sortOrder: 3 },
    { id: "aperatifler", name: "Aperatifler", nameEn: "Sides", sortOrder: 4 },
    { id: "icecekler", name: "İçecekler", nameEn: "Drinks", sortOrder: 5 },
    { id: "soslar", name: "Soslar", nameEn: "Sauces", sortOrder: 6 },
  ],
  products: [
    {
      id: "smash-burger",
      name: "Smash Burger",
      nameEn: "Smash Burger",
      description:
        "2x 60 gr burger köftesi, 2x cheddar, ızgara soğan ve biber, salatalık relish ve burger sos.",
      descriptionEn:
        "2x 60g beef patties, 2x cheddar, grilled onion and pepper, pickle relish and burger sauce.",
      allergens: "Gluten, süt ürünleri, yumurta",
      allergensEn: "Gluten, dairy, egg",
      price: 495,
      image: img("smash.webp"),
      categoryId: "burgerler",
      featured: true,
    },
    {
      id: "mavi-balloon-burger",
      name: "Mavi Balloon Burger",
      nameEn: "Mavi Balloon Burger",
      description:
        "120 gr burger köftesi, Antakya peyniri, köz patlıcan, sürülebilir peynir, roka ve sriracha sos.",
      descriptionEn:
        "120g beef patty, Antakya cheese, roasted eggplant, spreadable cheese, arugula and sriracha.",
      allergens: "Gluten, süt ürünleri, yumurta",
      allergensEn: "Gluten, dairy, egg",
      price: 520,
      image: img("mavi-burger.webp"),
      categoryId: "burgerler",
      featured: true,
    },
    {
      id: "moon-piece-burger",
      name: "Moon Piece Burger",
      nameEn: "Moon Piece Burger",
      description:
        "160 gr kuzu burger köftesi, peynir, Samandağ biber reçeli, roka ve sriracha sos.",
      descriptionEn:
        "160g lamb burger patty, cheese, Samandağ pepper jam, arugula and sriracha.",
      allergens: "Gluten, süt ürünleri",
      allergensEn: "Gluten, dairy",
      price: 530,
      image: img("moon.webp"),
      categoryId: "burgerler",
      featured: true,
    },
    {
      id: "basic-burger",
      name: "Basic Burger",
      nameEn: "Basic Burger",
      description:
        "120 gr burger köftesi, 2x cheddar, karamelize soğan, salatalık relish ve burger sos.",
      descriptionEn:
        "120g beef patty, 2x cheddar, caramelized onion, pickle relish and burger sauce.",
      allergens: "Gluten, süt ürünleri, yumurta",
      allergensEn: "Gluten, dairy, egg",
      price: 495,
      image: img("smash.webp"),
      categoryId: "burgerler",
    },
    {
      id: "small-antakya-doner",
      name: "Small Antakya Döneri",
      nameEn: "Small Antakya Döner",
      description:
        "60 gr tavuk, anne patatesi, turşu, sarımsaklı mayonez ve özel sos.",
      descriptionEn:
        "60g chicken, house fries, pickles, garlic mayo and special sauce.",
      allergens: "Gluten, yumurta",
      allergensEn: "Gluten, egg",
      price: 175,
      image: img("doner.webp"),
      categoryId: "donerler",
    },
    {
      id: "nugget-doner",
      name: "Nugget Döner",
      nameEn: "Nugget Döner",
      description:
        "120 gr nugget, marul, kırmızı lahana turşusu, turşu, sarımsaklı mayonez ve sriracha sos.",
      descriptionEn:
        "120g nuggets, lettuce, red cabbage pickle, pickles, garlic mayo and sriracha.",
      allergens: "Gluten, yumurta",
      allergensEn: "Gluten, egg",
      price: 185,
      image: img("nugget-doner.webp"),
      categoryId: "donerler",
    },
    {
      id: "antakya-doner",
      name: "Antakya Döneri",
      nameEn: "Antakya Döner",
      description:
        "90 gr tavuk, anne patatesi, turşu, sarımsaklı mayonez ve özel sos.",
      descriptionEn:
        "90g chicken, house fries, pickles, garlic mayo and special sauce.",
      allergens: "Gluten, yumurta",
      allergensEn: "Gluten, egg",
      price: 220,
      image: img("doner.webp"),
      categoryId: "donerler",
    },
    {
      id: "citir-tavuk-doner",
      name: "Çıtır Tavuk Döner",
      nameEn: "Crispy Chicken Döner",
      description:
        "120 gr çıtır tavuk, marul, kırmızı lahana turşusu, sarımsaklı mayonez ve sriracha sos.",
      descriptionEn:
        "120g crispy chicken, lettuce, red cabbage pickle, garlic mayo and sriracha.",
      allergens: "Gluten, yumurta",
      allergensEn: "Gluten, egg",
      price: 260,
      image: img("nugget-doner.webp"),
      categoryId: "donerler",
    },
    {
      id: "small-doner-menu",
      name: "Small Antakya Döner Menü",
      nameEn: "Small Antakya Döner Menu",
      description: "Small Antakya Döneri, 100 gr patates ve büyük ayran.",
      descriptionEn:
        "Small Antakya Döner, 100g fries and a large ayran.",
      allergens: "Gluten, yumurta, süt ürünleri",
      allergensEn: "Gluten, egg, dairy",
      price: 299,
      image: img("doner.webp"),
      categoryId: "doner-menuleri",
    },
    {
      id: "antakya-doner-menu",
      name: "Antakya Döner Menü",
      nameEn: "Antakya Döner Menu",
      description: "Antakya Döneri, 150 gr patates ve istenilen içecek.",
      descriptionEn:
        "Antakya Döner, 150g fries and a drink of your choice.",
      allergens: "Gluten, yumurta",
      allergensEn: "Gluten, egg",
      price: 350,
      image: img("doner.webp"),
      categoryId: "doner-menuleri",
    },
    {
      id: "eko-2-small",
      name: "2x Small Döner + 1 Lt Cola",
      nameEn: "2x Small Döner + 1L Cola",
      description: "2 Small Döner ve 1 litre Coca-Cola.",
      descriptionEn:
        "2 Small Döner and 1 liter Coca-Cola.",
      allergens: "Gluten, yumurta",
      allergensEn: "Gluten, egg",
      price: 420,
      image: img("doner.webp"),
      categoryId: "ekonomik",
    },
    {
      id: "eko-2-antakya",
      name: "2x Antakya Döneri + 1 Lt Cola",
      nameEn: "2x Antakya Döner + 1L Cola",
      description: "2 Antakya Döneri ve 1 litre Coca-Cola.",
      descriptionEn:
        "2 Antakya Döner and 1 liter Coca-Cola.",
      allergens: "Gluten, yumurta",
      allergensEn: "Gluten, egg",
      price: 520,
      image: img("doner.webp"),
      categoryId: "ekonomik",
    },
    {
      id: "arjantin-patates",
      name: "Arjantin Patates",
      nameEn: "Argentine Fries",
      description: "Yeşillikler, patates ve özel sos ile hazırlanan aperatif.",
      descriptionEn:
        "Greens, fries and special sauce.",
      allergens: "Süt ürünleri",
      allergensEn: "Dairy",
      price: 270,
      image: img("patates.webp"),
      categoryId: "aperatifler",
    },
    {
      id: "sogan-halkasi",
      name: "Soğan Halkası",
      nameEn: "Onion Rings",
      description: "Çıtır soğan halkaları.",
      descriptionEn:
        "Crispy onion rings.",
      allergens: "Gluten",
      allergensEn: "Gluten",
      price: 50,
      image: img("aperatif.webp"),
      categoryId: "aperatifler",
    },
    {
      id: "nugget",
      name: "Nugget",
      nameEn: "Nuggets",
      description: "Çıtır tavuk nugget.",
      descriptionEn:
        "Crispy chicken nuggets.",
      allergens: "Gluten, yumurta",
      allergensEn: "Gluten, egg",
      price: 65,
      image: img("aperatif.webp"),
      categoryId: "aperatifler",
    },
    {
      id: "patates",
      name: "Patates",
      nameEn: "Fries",
      description: "Klasik patates kızartması.",
      descriptionEn:
        "Classic french fries.",
      allergens: "",
      allergensEn: "",
      price: 130,
      image: img("patates.webp"),
      categoryId: "aperatifler",
    },
    {
      id: "cola",
      name: "Coca-Cola",
      nameEn: "Coca-Cola",
      description: "330 ml",
      descriptionEn:
        "330 ml",
      allergens: "",
      allergensEn: "",
      price: 90,
      image: img("icecek.webp"),
      categoryId: "icecekler",
    },
    {
      id: "ayran",
      name: "Ayran",
      nameEn: "Ayran",
      description: "200 ml",
      descriptionEn:
        "200 ml",
      allergens: "Süt ürünleri",
      allergensEn: "Dairy",
      price: 45,
      image: img("icecek.webp"),
      categoryId: "icecekler",
    },
    {
      id: "su",
      name: "Su",
      nameEn: "Water",
      description: "500 ml",
      descriptionEn:
        "500 ml",
      allergens: "",
      allergensEn: "",
      price: 25,
      image: img("icecek.webp"),
      categoryId: "icecekler",
    },
    {
      id: "aci-sos",
      name: "Acı Sos",
      nameEn: "Hot Sauce",
      description: "Tatlı acı sos.",
      descriptionEn:
        "Sweet-hot sauce.",
      allergens: "",
      allergensEn: "",
      price: 25,
      image: img("aperatif.webp"),
      categoryId: "soslar",
    },
    {
      id: "sarimsakli-mayonez",
      name: "Sarımsaklı Mayonez",
      nameEn: "Garlic Mayo",
      description: "Ev yapımı sarımsaklı mayonez.",
      descriptionEn:
        "House-made garlic mayonnaise.",
      allergens: "Yumurta",
      allergensEn: "Egg",
      price: 25,
      image: img("aperatif.webp"),
      categoryId: "soslar",
    },
  ],
  venue: defaultVenue,
};

function isHoursRow(value: unknown): value is HoursRow {
  if (!value || typeof value !== "object") return false;
  const row = value as HoursRow;
  return (
    typeof row.id === "string" &&
    typeof row.label === "string" &&
    typeof row.value === "string"
  );
}

function isVenueInfo(value: unknown): value is VenueInfo {
  if (!value || typeof value !== "object") return false;
  const venue = value as VenueInfo;
  return (
    typeof venue.brandName === "string" &&
    typeof venue.brandSubtitle === "string" &&
    typeof venue.tagline === "string" &&
    typeof venue.headline === "string" &&
    typeof venue.subheadline === "string" &&
    typeof venue.addressLine1 === "string" &&
    typeof venue.addressLine2 === "string" &&
    typeof venue.city === "string" &&
    typeof venue.mapsUrl === "string" &&
    typeof venue.phone === "string" &&
    typeof venue.whatsapp === "string" &&
    typeof venue.instagram === "string" &&
    typeof venue.statusLabel === "string" &&
    Array.isArray(venue.hours) &&
    venue.hours.every(isHoursRow)
  );
}

export function isMenuData(value: unknown): value is MenuData {
  if (!value || typeof value !== "object") return false;
  const data = value as MenuData;
  if (!Array.isArray(data.categories) || !Array.isArray(data.products)) {
    return false;
  }
  const productsOk = data.products.every(
    (product) =>
      typeof product?.id === "string" &&
      typeof product?.name === "string" &&
      typeof product?.description === "string" &&
      typeof product?.price === "number" &&
      typeof product?.image === "string" &&
      typeof product?.categoryId === "string"
  );
  const categoriesOk = data.categories.every(
    (category) =>
      typeof category?.id === "string" &&
      typeof category?.name === "string" &&
      typeof category?.sortOrder === "number"
  );
  if (!productsOk || !categoriesOk) return false;
  if (data.venue === undefined) return true;
  return isVenueInfo(data.venue);
}

export function normalizeVenue(venue?: Partial<VenueInfo> | null): VenueInfo {
  const base = { ...defaultVenue, ...(venue ?? {}) };
  const hours =
    Array.isArray(venue?.hours) && venue.hours.length > 0
      ? venue.hours
          .filter(isHoursRow)
          .map((row) => ({
            id: row.id || newId(),
            label: row.label.trim(),
            value: row.value.trim(),
          }))
      : defaultVenue.hours;
  return {
    brandName: String(base.brandName ?? defaultVenue.brandName).trim(),
    brandSubtitle: String(base.brandSubtitle ?? defaultVenue.brandSubtitle).trim(),
    tagline: String(base.tagline ?? defaultVenue.tagline).trim(),
    headline: String(base.headline ?? defaultVenue.headline).trim(),
    subheadline: String(base.subheadline ?? defaultVenue.subheadline).trim(),
    addressLine1: String(base.addressLine1 ?? defaultVenue.addressLine1).trim(),
    addressLine2: String(base.addressLine2 ?? defaultVenue.addressLine2).trim(),
    city: String(base.city ?? defaultVenue.city).trim(),
    mapsUrl: String(base.mapsUrl ?? defaultVenue.mapsUrl).trim(),
    phone: String(base.phone ?? defaultVenue.phone).trim(),
    whatsapp: String(base.whatsapp ?? defaultVenue.whatsapp).trim(),
    instagram: String(base.instagram ?? defaultVenue.instagram).trim(),
    statusLabel: String(base.statusLabel ?? defaultVenue.statusLabel).trim(),
    heroImage:
      String(base.heroImage ?? defaultVenue.heroImage).trim() ||
      defaultVenue.heroImage,
    hours,
  };
}

export function normalizeMenu(data: MenuData): MenuData {
  return {
    categories: [...data.categories]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((category, index) => ({
        id: category.id,
        name: category.name.trim(),
        nameEn: String(category.nameEn ?? "").trim(),
        sortOrder: index,
      })),
    products: data.products.map((product) => ({
      id: product.id,
      name: product.name.trim(),
      nameEn: String(product.nameEn ?? "").trim(),
      description: product.description.trim(),
      descriptionEn: String(product.descriptionEn ?? "").trim(),
      allergens: String(product.allergens ?? "").trim(),
      allergensEn: String(product.allergensEn ?? "").trim(),
      price: product.price,
      image: product.image,
      categoryId: product.categoryId,
      featured: Boolean(product.featured),
    })),
    venue: normalizeVenue(data.venue),
  };
}

export function localizedProduct(
  product: Product,
  locale: "tr" | "en"
): Pick<Product, "name" | "description" | "allergens"> {
  if (locale === "en") {
    return {
      name: product.nameEn.trim() || product.name,
      description: product.descriptionEn.trim() || product.description,
      allergens: product.allergensEn.trim() || product.allergens,
    };
  }
  return {
    name: product.name,
    description: product.description,
    allergens: product.allergens,
  };
}

export function localizedCategoryName(
  category: Category,
  locale: "tr" | "en"
) {
  if (locale === "en") {
    return category.nameEn.trim() || category.name;
  }
  return category.name;
}

export function formatPrice(price: number) {
  return `₺${price.toLocaleString("tr-TR")}`;
}

export function newId() {
  return crypto.randomUUID();
}

export function phoneHref(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : "";
}

export function whatsappHref(value: string) {
  if (!value.trim()) return "";
  if (/^https?:\/\//i.test(value)) return value.trim();
  const digits = value.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

export function instagramHref(value: string) {
  if (!value.trim()) return "";
  if (/^https?:\/\//i.test(value)) return value.trim();
  const handle = value.replace(/^@/, "").trim();
  return handle ? `https://instagram.com/${handle}` : "";
}
