export type Locale = "tr" | "en";

type UiCopy = {
  menuExplore: string;
  searchPlaceholder: string;
  searchEmpty: string;
  searchEmptyBody: string;
  signature: string;
  chefPick: string;
  chefPickShort: string;
  content: string;
  allergens: string;
  allergensNone: string;
  productFallback: string;
  location: string;
  phone: string;
  days: string;
  hours: string;
  closed: string;
  footerTagline: string;
  menuPreparing: string;
  menuPreparingBody: string;
  noPhoto: string;
  langSwitch: string;
  langSwitchAria: string;
  myCart: string;
  qty: string;
  decrease: string;
  increase: string;
  note: string;
  notePlaceholder: string;
  addToCart: string;
  cartItemsCount: (count: number) => string;
  cartEmpty: string;
  cartEmptyHint: string;
  closeCart: string;
  noteLabel: string;
  noProductDescription: string;
  remove: string;
  tableNo: string;
  selectTable: string;
  tableOption: (n: string) => string;
  noTablesDefined: string;
  total: string;
  placeOrder: string;
  placingOrder: string;
  selectTableError: string;
  emptyCartError: string;
  orderFailed: string;
  orderSuccess: string;
};

const ui: Record<Locale, UiCopy> = {
  tr: {
    menuExplore: "Menü Keşfi",
    searchPlaceholder: "Yemek ara…",
    searchEmpty: "Sonuç bulunamadı",
    searchEmptyBody: "Farklı bir isim deneyin.",
    signature: "İmza Seçkisi",
    chefPick: "Şefin Seçimi",
    chefPickShort: "İmza",
    content: "İçerik",
    allergens: "Alerjenler",
    allergensNone: "Belirtilmemiş",
    productFallback: "Mavi Balloon menü ürünü",
    location: "Konum",
    phone: "Telefon",
    days: "Günler",
    hours: "Saatler",
    closed: "Kapalı",
    footerTagline: "Antakya Döner ve Özel Burgerler",
    menuPreparing: "Menü hazırlanıyor",
    menuPreparingBody: "Ürünler birazdan burada görünecek.",
    noPhoto: "Fotoğraf yok",
    langSwitch: "EN",
    langSwitchAria: "Switch to English",
    myCart: "Sepetim",
    qty: "Adet",
    decrease: "Azalt",
    increase: "Artır",
    note: "Açıklama",
    notePlaceholder: "Örn. az pişmiş, soğansız…",
    addToCart: "Sepete at",
    cartItemsCount: (count) => `${count} ürün`,
    cartEmpty: "Henüz ürün yok",
    cartEmptyHint: "Ürün eklemek için menüden bir yemek seçin.",
    closeCart: "Sepeti kapat",
    noteLabel: "Açıklama",
    noProductDescription: "Bu ürün için menü açıklaması yok.",
    remove: "Kaldır",
    tableNo: "Masa no",
    selectTable: "Masa seçin",
    tableOption: (n) => `Masa ${n}`,
    noTablesDefined:
      "Henüz masa tanımlanmamış. Yönetim panelinden masa ekleyin.",
    total: "Toplam",
    placeOrder: "Sipariş Ver",
    placingOrder: "Gönderiliyor…",
    selectTableError: "Sipariş vermek için masa seçin.",
    emptyCartError: "Sepet boş.",
    orderFailed: "Sipariş gönderilemedi.",
    orderSuccess: "Siparişiniz alındı. Afiyet olsun!",
  },
  en: {
    menuExplore: "Explore Menu",
    searchPlaceholder: "Search dishes…",
    searchEmpty: "No results",
    searchEmptyBody: "Try a different name.",
    signature: "Signature Picks",
    chefPick: "Chef's Pick",
    chefPickShort: "Sig.",
    content: "Ingredients",
    allergens: "Allergens",
    allergensNone: "Not specified",
    productFallback: "Mavi Balloon menu item",
    location: "Location",
    phone: "Phone",
    days: "Days",
    hours: "Hours",
    closed: "Closed",
    footerTagline: "Antakya Döner & Specialty Burgers",
    menuPreparing: "Menu coming soon",
    menuPreparingBody: "Items will appear here shortly.",
    noPhoto: "No photo",
    langSwitch: "TR",
    langSwitchAria: "Türkçeye geç",
    myCart: "My cart",
    qty: "Quantity",
    decrease: "Decrease",
    increase: "Increase",
    note: "Note",
    notePlaceholder: "e.g. medium rare, no onion…",
    addToCart: "Add to cart",
    cartItemsCount: (count) =>
      count === 1 ? "1 item" : `${count} items`,
    cartEmpty: "No items yet",
    cartEmptyHint: "Pick a dish from the menu to add it here.",
    closeCart: "Close cart",
    noteLabel: "Note",
    noProductDescription: "No menu description for this item.",
    remove: "Remove",
    tableNo: "Table no",
    selectTable: "Select a table",
    tableOption: (n) => `Table ${n}`,
    noTablesDefined:
      "No tables yet. Add tables from the admin panel.",
    total: "Total",
    placeOrder: "Place order",
    placingOrder: "Sending…",
    selectTableError: "Select a table to place an order.",
    emptyCartError: "Cart is empty.",
    orderFailed: "Could not send the order.",
    orderSuccess: "Order received. Enjoy!",
  },
};

export function getUi(locale: Locale): UiCopy {
  return ui[locale];
}

const categoryById: Record<string, { tr: string; en: string }> = {
  imza: { tr: "İmza Seçkisi", en: "Signature Picks" },
  burgerler: { tr: "Burgerler", en: "Burgers" },
  donerler: { tr: "Dönerler", en: "Döner" },
  "doner-menuleri": { tr: "Döner Menüleri", en: "Döner Menus" },
  ekonomik: { tr: "Ekonomik Menüler", en: "Value Menus" },
  aperatifler: { tr: "Aperatifler", en: "Sides" },
  icecekler: { tr: "İçecekler", en: "Drinks" },
  soslar: { tr: "Soslar", en: "Sauces" },
};

const categoryByTrName: Record<string, string> = {
  "İmza Seçkisi": "Signature Picks",
  Burgerler: "Burgers",
  Dönerler: "Döner",
  "Döner Menüleri": "Döner Menus",
  "Ekonomik Menüler": "Value Menus",
  Aperatifler: "Sides",
  İçecekler: "Drinks",
  Soslar: "Sauces",
};

const hourLabelEn: Record<string, string> = {
  Pazartesi: "Monday",
  "Salı – Perşembe": "Tue – Thu",
  "Cuma – Cumartesi": "Fri – Sat",
  Pazar: "Sunday",
  Salı: "Tuesday",
  Çarşamba: "Wednesday",
  Perşembe: "Thursday",
  Cuma: "Friday",
  Cumartesi: "Saturday",
  Kapalı: "Closed",
};

const allergenEn: Record<string, string> = {
  Gluten: "Gluten",
  "süt ürünleri": "dairy",
  "Süt ürünleri": "Dairy",
  yumurta: "egg",
  Yumurta: "Egg",
  Belirtilmemiş: "Not specified",
};

export function translateCategory(
  locale: Locale,
  id: string,
  fallbackName: string
) {
  if (locale === "tr") {
    return categoryById[id]?.tr ?? fallbackName;
  }
  return categoryById[id]?.en ?? categoryByTrName[fallbackName] ?? fallbackName;
}

export function translateHourLabel(locale: Locale, label: string) {
  if (locale === "tr") return label;
  return hourLabelEn[label] ?? label;
}

export function translateHourValue(locale: Locale, value: string) {
  if (locale === "tr") return value;
  if (value === "Kapalı") return "Closed";
  return value;
}

export function translateAllergens(locale: Locale, value: string) {
  if (locale === "tr" || !value.trim()) return value;
  return value
    .split(",")
    .map((part) => {
      const trimmed = part.trim();
      return allergenEn[trimmed] ?? trimmed;
    })
    .join(", ");
}

export function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

export function matchesSearch(haystack: string, query: string) {
  if (!query) return true;
  return normalizeSearch(haystack).includes(normalizeSearch(query));
}
