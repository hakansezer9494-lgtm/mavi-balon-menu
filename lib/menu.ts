export type Category = {
  id: string;
  name: string;
  sortOrder: number;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  featured?: boolean;
};

export type MenuData = {
  categories: Category[];
  products: Product[];
};

export const MENU_UPDATED_EVENT = "mavi-balon-menu-updated";

const img = (file: string) => `/products/${file}`;

export const defaultMenu: MenuData = {
  categories: [
    { id: "burgerler", name: "Burgerler", sortOrder: 0 },
    { id: "donerler", name: "Dönerler", sortOrder: 1 },
    { id: "doner-menuleri", name: "Döner Menüleri", sortOrder: 2 },
    { id: "ekonomik", name: "Ekonomik Menüler", sortOrder: 3 },
    { id: "aperatifler", name: "Aperatifler", sortOrder: 4 },
    { id: "icecekler", name: "İçecekler", sortOrder: 5 },
    { id: "soslar", name: "Soslar", sortOrder: 6 },
  ],
  products: [
    {
      id: "smash-burger",
      name: "Smash Burger",
      description:
        "2x 60 gr burger köftesi, 2x cheddar, ızgara soğan ve biber, salatalık relish ve burger sos.",
      price: 495,
      image: img("smash.webp"),
      categoryId: "burgerler",
      featured: true,
    },
    {
      id: "mavi-balloon-burger",
      name: "Mavi Balloon Burger",
      description:
        "120 gr burger köftesi, Antakya peyniri, köz patlıcan, sürülebilir peynir, roka ve sriracha sos.",
      price: 520,
      image: img("mavi-burger.webp"),
      categoryId: "burgerler",
      featured: true,
    },
    {
      id: "moon-piece-burger",
      name: "Moon Piece Burger",
      description:
        "160 gr kuzu burger köftesi, peynir, Samandağ biber reçeli, roka ve sriracha sos.",
      price: 530,
      image: img("moon.webp"),
      categoryId: "burgerler",
      featured: true,
    },
    {
      id: "basic-burger",
      name: "Basic Burger",
      description:
        "120 gr burger köftesi, 2x cheddar, karamelize soğan, salatalık relish ve burger sos.",
      price: 495,
      image: img("smash.webp"),
      categoryId: "burgerler",
    },
    {
      id: "small-antakya-doner",
      name: "Small Antakya Döneri",
      description:
        "60 gr tavuk, anne patatesi, turşu, sarımsaklı mayonez ve özel sos.",
      price: 175,
      image: img("doner.webp"),
      categoryId: "donerler",
    },
    {
      id: "nugget-doner",
      name: "Nugget Döner",
      description:
        "120 gr nugget, marul, kırmızı lahana turşusu, turşu, sarımsaklı mayonez ve sriracha sos.",
      price: 185,
      image: img("nugget-doner.webp"),
      categoryId: "donerler",
    },
    {
      id: "antakya-doner",
      name: "Antakya Döneri",
      description:
        "90 gr tavuk, anne patatesi, turşu, sarımsaklı mayonez ve özel sos.",
      price: 220,
      image: img("doner.webp"),
      categoryId: "donerler",
    },
    {
      id: "citir-tavuk-doner",
      name: "Çıtır Tavuk Döner",
      description:
        "120 gr çıtır tavuk, marul, kırmızı lahana turşusu, sarımsaklı mayonez ve sriracha sos.",
      price: 260,
      image: img("nugget-doner.webp"),
      categoryId: "donerler",
    },
    {
      id: "small-doner-menu",
      name: "Small Antakya Döner Menü",
      description: "Small Antakya Döneri, 100 gr patates ve büyük ayran.",
      price: 299,
      image: img("doner.webp"),
      categoryId: "doner-menuleri",
    },
    {
      id: "antakya-doner-menu",
      name: "Antakya Döner Menü",
      description: "Antakya Döneri, 150 gr patates ve istenilen içecek.",
      price: 350,
      image: img("doner.webp"),
      categoryId: "doner-menuleri",
    },
    {
      id: "eko-2-small",
      name: "2x Small Döner + 1 Lt Cola",
      description: "2 Small Döner ve 1 litre Coca-Cola.",
      price: 420,
      image: img("doner.webp"),
      categoryId: "ekonomik",
    },
    {
      id: "eko-2-antakya",
      name: "2x Antakya Döneri + 1 Lt Cola",
      description: "2 Antakya Döneri ve 1 litre Coca-Cola.",
      price: 520,
      image: img("doner.webp"),
      categoryId: "ekonomik",
    },
    {
      id: "arjantin-patates",
      name: "Arjantin Patates",
      description: "Yeşillikler, patates ve özel sos ile hazırlanan aperatif.",
      price: 270,
      image: img("patates.webp"),
      categoryId: "aperatifler",
    },
    {
      id: "sogan-halkasi",
      name: "Soğan Halkası",
      description: "Çıtır soğan halkaları.",
      price: 50,
      image: img("aperatif.webp"),
      categoryId: "aperatifler",
    },
    {
      id: "nugget",
      name: "Nugget",
      description: "Çıtır tavuk nugget.",
      price: 65,
      image: img("aperatif.webp"),
      categoryId: "aperatifler",
    },
    {
      id: "patates",
      name: "Patates",
      description: "Klasik patates kızartması.",
      price: 130,
      image: img("patates.webp"),
      categoryId: "aperatifler",
    },
    {
      id: "cola",
      name: "Coca-Cola",
      description: "330 ml",
      price: 90,
      image: img("icecek.webp"),
      categoryId: "icecekler",
    },
    {
      id: "ayran",
      name: "Ayran",
      description: "200 ml",
      price: 45,
      image: img("icecek.webp"),
      categoryId: "icecekler",
    },
    {
      id: "su",
      name: "Su",
      description: "500 ml",
      price: 25,
      image: img("icecek.webp"),
      categoryId: "icecekler",
    },
    {
      id: "aci-sos",
      name: "Acı Sos",
      description: "Tatlı acı sos.",
      price: 25,
      image: img("aperatif.webp"),
      categoryId: "soslar",
    },
    {
      id: "sarimsakli-mayonez",
      name: "Sarımsaklı Mayonez",
      description: "Ev yapımı sarımsaklı mayonez.",
      price: 25,
      image: img("aperatif.webp"),
      categoryId: "soslar",
    },
  ],
};

export function isMenuData(value: unknown): value is MenuData {
  if (!value || typeof value !== "object") return false;
  const data = value as MenuData;
  if (!Array.isArray(data.categories) || !Array.isArray(data.products)) {
    return false;
  }
  return (
    data.categories.every(
      (category) =>
        typeof category?.id === "string" &&
        typeof category?.name === "string" &&
        typeof category?.sortOrder === "number"
    ) &&
    data.products.every(
      (product) =>
        typeof product?.id === "string" &&
        typeof product?.name === "string" &&
        typeof product?.description === "string" &&
        typeof product?.price === "number" &&
        typeof product?.image === "string" &&
        typeof product?.categoryId === "string"
    )
  );
}

export function normalizeMenu(data: MenuData): MenuData {
  return {
    categories: [...data.categories]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((category, index) => ({
        id: category.id,
        name: category.name.trim(),
        sortOrder: index,
      })),
    products: data.products.map((product) => ({
      id: product.id,
      name: product.name.trim(),
      description: product.description.trim(),
      price: product.price,
      image: product.image,
      categoryId: product.categoryId,
      featured: Boolean(product.featured),
    })),
  };
}

export function formatPrice(price: number) {
  return `₺${price.toLocaleString("tr-TR")}`;
}

export function newId() {
  return crypto.randomUUID();
}
