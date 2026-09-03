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

export const MENU_STORAGE_KEY = "mavi-balon-menu-v2";
export const MENU_UPDATED_EVENT = "mavi-balon-menu-updated";

const img = (file: string) => `/products/${file}`;

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
      image: img("klasik-burger.jpg"),
      categoryId: "hamburger",
    },
    {
      id: "cheese-burger",
      name: "Cheeseburger",
      description: "Erimiş cheddar, köfte, soğan ve özel sos.",
      price: 310,
      image: img("cheese-burger.jpg"),
      categoryId: "hamburger",
    },
    {
      id: "double-burger",
      name: "Double Mavi Burger",
      description: "Çift köfte, çift cheddar, çıtır soğan.",
      price: 390,
      image: img("double-burger.jpg"),
      categoryId: "hamburger",
    },
    {
      id: "antakya-durum",
      name: "Antakya Dürüm",
      description: "İnce lavaş, bol et, sumak soğanı ve acılı sos.",
      price: 270,
      image: img("antakya-durum.jpg"),
      categoryId: "doner",
    },
    {
      id: "antakya-porsiyon",
      name: "Porsiyon Döner",
      description: "Pilav veya lavaş yanında Antakya usulü döner.",
      price: 340,
      image: img("antakya-porsiyon.jpg"),
      categoryId: "doner",
    },
    {
      id: "broast-porsiyon",
      name: "Broast Porsiyon",
      description: "Çıtır kaplamalı tavuk, salata ve sos ile.",
      price: 320,
      image: img("broast-porsiyon.jpg"),
      categoryId: "broast",
    },
    {
      id: "broast-kanat",
      name: "Broast Kanat",
      description: "Baharatlı çıtır kanat, 8 parça.",
      price: 290,
      image: img("broast-kanat.jpg"),
      categoryId: "broast",
    },
    {
      id: "arjantin-kucuk",
      name: "Arjantin Patatesi (Küçük)",
      description: "Baharatlı dilim patates, özel sos.",
      price: 140,
      image: img("arjantin-kucuk.jpg"),
      categoryId: "patates",
    },
    {
      id: "arjantin-buyuk",
      name: "Arjantin Patatesi (Büyük)",
      description: "Paylaşımlık porsiyon, cheddar ve sos ile.",
      price: 210,
      image: img("arjantin-buyuk.jpg"),
      categoryId: "patates",
    },
    {
      id: "kola",
      name: "Kola",
      description: "Soğuk kutu kola, 330 ml.",
      price: 55,
      image: img("kola.jpg"),
      categoryId: "icecek",
    },
    {
      id: "ayran",
      name: "Ayran",
      description: "Ev yapımı kıvamında soğuk ayran.",
      price: 40,
      image: img("ayran.jpg"),
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
