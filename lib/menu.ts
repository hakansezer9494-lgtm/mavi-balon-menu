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
};

export type MenuData = {
  categories: Category[];
  products: Product[];
};

export const MENU_STORAGE_KEY = "mavi-balon-menu-v1";
export const MENU_UPDATED_EVENT = "mavi-balon-menu-updated";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const defaultMenu: MenuData = {
  categories: [
    { id: "hamburger", name: "Hamburger", sortOrder: 0 },
    { id: "doner", name: "Antakya Döner", sortOrder: 1 },
    { id: "broast", name: "Broast", sortOrder: 2 },
    { id: "patates", name: "Arjantin Patatesi", sortOrder: 3 },
    { id: "icecek", name: "İçecekler", sortOrder: 4 },
  ],
  products: [
    {
      id: "klasik-burger",
      name: "Klasik Hamburger",
      description: "Izgara köfte, marul, domates, turşu ve ev sosu.",
      price: 280,
      image: img("photo-1568901346375-23c9450c58cd"),
      categoryId: "hamburger",
    },
    {
      id: "cheese-burger",
      name: "Cheeseburger",
      description: "Erimiş cheddar, köfte, soğan ve özel sos.",
      price: 310,
      image: img("photo-1550547660-d9450f859349"),
      categoryId: "hamburger",
    },
    {
      id: "double-burger",
      name: "Double Mavi Burger",
      description: "Çift köfte, çift cheddar, çıtır soğan.",
      price: 390,
      image: img("photo-1572802419224-296b0aeee0d9"),
      categoryId: "hamburger",
    },
    {
      id: "antakya-durum",
      name: "Antakya Dürüm",
      description: "İnce lavaş, bol et, sumak soğanı ve acılı sos.",
      price: 270,
      image: img("photo-1529006557810-274b0b6db27d"),
      categoryId: "doner",
    },
    {
      id: "antakya-porsiyon",
      name: "Porsiyon Döner",
      description: "Pilav veya lavaş yanında Antakya usulü döner.",
      price: 340,
      image: img("photo-1603360946369-dc9bb6258143"),
      categoryId: "doner",
    },
    {
      id: "broast-porsiyon",
      name: "Broast Porsiyon",
      description: "Çıtır kaplamalı tavuk, salata ve sos ile.",
      price: 320,
      image: img("photo-1626082927389-6cd097cdc6ec"),
      categoryId: "broast",
    },
    {
      id: "broast-kanat",
      name: "Broast Kanat",
      description: "Baharatlı çıtır kanat, 8 parça.",
      price: 290,
      image: img("photo-1527477396000-e27163b481c2"),
      categoryId: "broast",
    },
    {
      id: "arjantin-kucuk",
      name: "Arjantin Patatesi (Küçük)",
      description: "Baharatlı dilim patates, özel sos.",
      price: 140,
      image: img("photo-1573080496219-bb080dd4f877"),
      categoryId: "patates",
    },
    {
      id: "arjantin-buyuk",
      name: "Arjantin Patatesi (Büyük)",
      description: "Paylaşımlık porsiyon, cheddar ve sos ile.",
      price: 210,
      image: img("photo-1630384060421-43617ea75be2"),
      categoryId: "patates",
    },
    {
      id: "kola",
      name: "Kola",
      description: "Soğuk kutu kola, 330 ml.",
      price: 55,
      image: img("photo-1629203851122-3726ecdf080e"),
      categoryId: "icecek",
    },
    {
      id: "ayran",
      name: "Ayran",
      description: "Ev yapımı kıvamında soğuk ayran.",
      price: 40,
      image: img("photo-1623065427902-21dd6dc8f144"),
      categoryId: "icecek",
    },
  ],
};

function isMenuData(value: unknown): value is MenuData {
  if (!value || typeof value !== "object") return false;
  const data = value as MenuData;
  return Array.isArray(data.categories) && Array.isArray(data.products);
}

export function loadMenu(): MenuData {
  if (typeof window === "undefined") return defaultMenu;
  try {
    const raw = window.localStorage.getItem(MENU_STORAGE_KEY);
    if (!raw) return structuredClone(defaultMenu);
    const parsed = JSON.parse(raw) as unknown;
    if (!isMenuData(parsed)) return structuredClone(defaultMenu);
    return {
      categories: [...parsed.categories].sort(
        (a, b) => a.sortOrder - b.sortOrder
      ),
      products: parsed.products,
    };
  } catch {
    return structuredClone(defaultMenu);
  }
}

export function saveMenu(data: MenuData) {
  const normalized: MenuData = {
    categories: [...data.categories]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((category, index) => ({ ...category, sortOrder: index })),
    products: data.products,
  };
  window.localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(new Event(MENU_UPDATED_EVENT));
}

export function formatPrice(price: number) {
  return `${price.toLocaleString("tr-TR")} ₺`;
}

export function newId() {
  return crypto.randomUUID();
}
