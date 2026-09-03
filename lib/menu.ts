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
    })),
  };
}

export function formatPrice(price: number) {
  return `${price.toLocaleString("tr-TR")} ₺`;
}

export function newId() {
  return crypto.randomUUID();
}
