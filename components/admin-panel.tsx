"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronDown, Download, Pencil, Plus, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  clearStoredAdminPassword,
  getStoredAdminPassword,
  setStoredAdminPassword,
  useMenu,
} from "@/hooks/use-menu";
import { compressImage } from "@/lib/image";
import {
  defaultSignature,
  defaultVenue,
  formatPrice,
  HERO_CORNER_IDS,
  HERO_CORNER_LABELS,
  HERO_TEXT_SIZE_OPTIONS,
  newId,
  type Category,
  type HeroCornerConfig,
  type HeroCornerId,
  type HeroTextStyle,
  type MenuData,
  type Product,
  type SignatureSection,
  type VenueInfo,
} from "@/lib/menu";

type ProductForm = {
  id?: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  allergens: string;
  allergensEn: string;
  price: string;
  categoryId: string;
  image: string;
  featured: boolean;
};

const emptyProductForm = (categoryId = ""): ProductForm => ({
  name: "",
  nameEn: "",
  description: "",
  descriptionEn: "",
  allergens: "",
  allergensEn: "",
  price: "",
  categoryId,
  image: "",
  featured: false,
});

function subscribeOrigin() {
  return () => {};
}

const FALLBACK_ORIGIN = "http://127.0.0.1:43123";

/** Outline/ghost on light page chrome */
const lightOutline =
  "border-slate-300 bg-white text-slate-800 hover:bg-slate-100 hover:text-slate-900";
const lightGhost = "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900";

/** Outline/ghost inside dark admin cards / dialogs */
const darkOutline =
  "border-white/30 bg-white/15 text-white hover:bg-white/25 hover:text-white";
const darkGhost = "text-sky-100 hover:bg-white/15 hover:text-white";

function CornerTextField({
  id,
  label,
  value,
  placeholder,
  textStyle,
  multiline = false,
  onValueChange,
  onStyleChange,
}: {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  textStyle: HeroTextStyle;
  multiline?: boolean;
  onValueChange: (value: string) => void;
  onStyleChange: (patch: Partial<HeroTextStyle>) => void;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-start gap-2">
        {multiline ? (
          <textarea
            id={id}
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder={placeholder}
            rows={3}
            className="min-h-[4.5rem] min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-sky-100/35 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/20"
          />
        ) : (
          <Input
            id={id}
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder={placeholder}
            className="h-10 min-w-0 flex-1 bg-white/5 text-white"
          />
        )}
        <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
          <select
            aria-label={`${label} yazı boyutu`}
            value={textStyle.size}
            onChange={(event) =>
              onStyleChange({
                size: event.target.value as HeroTextStyle["size"],
              })
            }
            className="h-10 rounded-lg border border-white/10 bg-white/5 px-2 text-xs text-white outline-none focus:border-sky-400/50"
          >
            {HERO_TEXT_SIZE_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-slate-900"
              >
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="color"
            aria-label={`${label} yazı rengi`}
            value={textStyle.color || "#ffffff"}
            onChange={(event) => onStyleChange({ color: event.target.value })}
            className="h-10 w-10 cursor-pointer rounded-lg border border-white/10 bg-transparent p-1"
          />
        </div>
      </div>
    </div>
  );
}

export function AdminPanel({ initialMenu }: { initialMenu: MenuData }) {
  const { menu, updateMenu, saving, saveError } = useMenu(initialMenu, {
    pollMs: false,
  });
  const [authChecked, setAuthChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [cloudStore, setCloudStore] = useState(false);
  const [cloudWarning, setCloudWarning] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [productOpen, setProductOpen] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm());
  const [productError, setProductError] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [venueForm, setVenueForm] = useState<VenueInfo>(
    () => structuredClone(initialMenu.venue ?? defaultVenue)
  );
  const [signatureForm, setSignatureForm] = useState<SignatureSection>(
    () => initialMenu.signature ?? defaultSignature
  );
  const [editingSignature, setEditingSignature] = useState(false);
  const [venueMessage, setVenueMessage] = useState("");
  const [selectedCorner, setSelectedCorner] =
    useState<HeroCornerId>("bottomRight");
  const [cornerMenuOpen, setCornerMenuOpen] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [logoError, setLogoError] = useState("");
  const [heroBusy, setHeroBusy] = useState(false);
  const [heroError, setHeroError] = useState("");
  const menuOrigin = useSyncExternalStore(
    subscribeOrigin,
    () => window.location.origin,
    () => FALLBACK_ORIGIN
  );

  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      try {
        const statusResponse = await fetch("/api/admin/status", { cache: "no-store" });
        const status = (await statusResponse.json()) as {
          authRequired: boolean;
          cloudStore: boolean;
          cloudError?: string | null;
        };
        if (cancelled) return;
        setCloudStore(status.cloudStore);
        if (status.cloudError) {
          setCloudWarning(
            `Turso bağlantı uyarısı: ${status.cloudError}. URL ve token’ı kontrol edin.`
          );
        } else {
          setCloudWarning("");
        }
        if (!status.authRequired) {
          setUnlocked(true);
          setAuthChecked(true);
          return;
        }
        const stored = getStoredAdminPassword();
        if (!stored) {
          setUnlocked(false);
          setAuthChecked(true);
          return;
        }
        const loginResponse = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: stored }),
        });
        if (cancelled) return;
        if (loginResponse.ok) {
          setUnlocked(true);
        } else {
          clearStoredAdminPassword();
          setUnlocked(false);
        }
      } catch {
        if (!cancelled) setUnlocked(false);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    }
    void checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogin() {
    setLoginError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      setLoginError("Şifre hatalı.");
      return;
    }
    setStoredAdminPassword(password);
    setUnlocked(true);
  }

  const categories = useMemo(
    () =>
      [...(menu?.categories ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [menu?.categories]
  );
  const products = menu?.products ?? [];

  const productsByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of menu?.products ?? []) {
      counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [menu]);

  useEffect(() => {
    setVenueForm(structuredClone(menu.venue ?? defaultVenue));
    setSignatureForm(structuredClone(menu.signature ?? defaultSignature));
  }, [menu.venue, menu.signature]);


  if (!authChecked) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center text-slate-600">
        Yönetim paneli hazırlanıyor…
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="relative flex min-h-full flex-1 flex-col">
        <SiteHeader eyebrow="İşletme paneli" compact />
        <main className="relative mx-auto flex w-full max-w-sm flex-1 flex-col px-4 pb-16">
          <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
            <CardHeader>
              <CardTitle className="text-white">İşletme girişi</CardTitle>
              <CardDescription className="text-sky-100/60">
                Müşteri menüsünden ayrı portal. Yönetim şifrenizle giriş yapın.
                Şifreyi panel içinden değiştirebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor="admin-password">Şifre</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-10 bg-white/5 text-white"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void handleLogin();
                  }}
                />
              </div>
              {loginError ? <p className="text-sm text-red-300">{loginError}</p> : null}
              <Button
                className="w-full bg-sky-400 text-[oklch(0.18_0.05_250)] hover:bg-sky-300"
                onClick={() => void handleLogin()}
              >
                Giriş yap
              </Button>
              <Link
                href="/portal"
                className={cn(buttonVariants({ variant: "outline" }), darkOutline, "w-full")}
              >
                Portala dön
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  async function handlePasswordChange() {
    setPasswordError("");
    setPasswordMessage("");
    if (newPassword.length < 6) {
      setPasswordError("Yeni şifre en az 6 karakter olmalı.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Yeni şifreler eşleşmiyor.");
      return;
    }
    setPasswordBusy(true);
    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": getStoredAdminPassword(),
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setPasswordError(payload.error || "Şifre değiştirilemedi.");
        return;
      }
      setStoredAdminPassword(newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Şifre güncellendi. Bundan sonra yeni şifreyle giriş yapın.");
    } catch {
      setPasswordError("Bağlantı hatası. Tekrar deneyin.");
    } finally {
      setPasswordBusy(false);
    }
  }

  function saveSignatureEdit() {
    const name = signatureForm.name.trim();
    if (!name) {
      setCategoryError("İmza seçkisi adı boş olamaz.");
      return;
    }
    updateMenu((current) => ({
      ...current,
      signature: {
        name,
        nameEn: signatureForm.nameEn.trim(),
      },
    }));
    setEditingSignature(false);
    setCategoryError("");
  }

  function addCategory() {
    const name = categoryName.trim();
    if (!name) {
      setCategoryError("Kategori adı yazın.");
      return;
    }
    if (categories.some((category) => category.name.toLocaleLowerCase("tr") === name.toLocaleLowerCase("tr"))) {
      setCategoryError("Bu isimde bir kategori zaten var.");
      return;
    }
    updateMenu((current) => ({
      ...current,
      categories: [
        ...current.categories,
        {
          id: newId(),
          name,
          nameEn: "",
          sortOrder: current.categories.length,
        },
      ],
    }));
    setCategoryName("");
    setCategoryError("");
  }

  function saveCategoryEdit() {
    if (!editingCategory) return;
    const name = editingCategory.name.trim();
    if (!name) {
      setCategoryError("Kategori adı boş olamaz.");
      return;
    }
    updateMenu((current) => ({
      ...current,
      categories: current.categories.map((category) =>
        category.id === editingCategory.id
          ? {
              ...category,
              name,
              nameEn: String(editingCategory.nameEn ?? "").trim(),
            }
          : category
      ),
    }));
    setEditingCategory(null);
    setCategoryError("");
  }

  function deleteCategory(category: Category) {
    const count = productsByCategory.get(category.id) ?? 0;
    if (count > 0) {
      setCategoryError(
        `"${category.name}" içinde ${count} ürün var. Önce ürünleri silin veya başka kategoriye taşıyın.`
      );
      return;
    }
    updateMenu((current) => ({
      ...current,
      categories: current.categories.filter((item) => item.id !== category.id),
    }));
    setCategoryError("");
  }

  function moveCategory(id: string, direction: -1 | 1) {
    updateMenu((current) => {
      const sorted = [...current.categories].sort((a, b) => a.sortOrder - b.sortOrder);
      const index = sorted.findIndex((category) => category.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= sorted.length) return current;
      const swap = sorted[index];
      sorted[index] = sorted[nextIndex];
      sorted[nextIndex] = swap;
      return {
        ...current,
        categories: sorted.map((category, sortOrder) => ({ ...category, sortOrder })),
      };
    });
  }

  function openNewProduct() {
    setProductForm(emptyProductForm(categories[0]?.id ?? ""));
    setProductError("");
    setProductOpen(true);
  }

  function openEditProduct(product: Product) {
    setProductForm({
      id: product.id,
      name: product.name,
      nameEn: product.nameEn ?? "",
      description: product.description,
      descriptionEn: product.descriptionEn ?? "",
      allergens: product.allergens ?? "",
      allergensEn: product.allergensEn ?? "",
      price: String(product.price),
      categoryId: product.categoryId,
      image: product.image,
      featured: Boolean(product.featured),
    });
    setProductError("");
    setProductOpen(true);
  }

  async function onPhotoChange(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProductError("Lütfen bir ürün fotoğrafı seçin.");
      return;
    }
    setImageBusy(true);
    setProductError("");
    try {
      const image = await compressImage(file);
      setProductForm((current) => ({ ...current, image }));
    } catch {
      setProductError("Fotoğraf yüklenemedi. Başka bir görsel deneyin.");
    } finally {
      setImageBusy(false);
    }
  }

  function saveProduct() {
    const name = productForm.name.trim();
    const price = Number(productForm.price.replace(",", "."));
    if (!name) {
      setProductError("Ürün adını yazın.");
      return;
    }
    if (!productForm.categoryId) {
      setProductError("Önce bir kategori oluşturun ve seçin.");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setProductError("Geçerli bir fiyat girin.");
      return;
    }

    const nextProduct: Product = {
      id: productForm.id ?? newId(),
      name,
      nameEn: productForm.nameEn.trim(),
      description: productForm.description.trim(),
      descriptionEn: productForm.descriptionEn.trim(),
      allergens: productForm.allergens.trim(),
      allergensEn: productForm.allergensEn.trim(),
      price: Math.round(price * 100) / 100,
      image: productForm.image,
      categoryId: productForm.categoryId,
      featured: productForm.featured,
    };

    updateMenu((current) => {
      const exists = current.products.some((product) => product.id === nextProduct.id);
      return {
        ...current,
        products: exists
          ? current.products.map((product) =>
              product.id === nextProduct.id ? nextProduct : product
            )
          : [...current.products, nextProduct],
      };
    });
    setProductOpen(false);
  }

  function deleteProduct(id: string) {
    updateMenu((current) => ({
      ...current,
      products: current.products.filter((product) => product.id !== id),
    }));
  }

  function categoryNameById(id: string) {
    return categories.find((category) => category.id === id)?.name ?? "Kategorisiz";
  }

  function updateVenueField<K extends keyof VenueInfo>(key: K, value: VenueInfo[K]) {
    setVenueForm((current) => ({ ...current, [key]: value }));
    setVenueMessage("");
  }


  function cloneCorner(corner: HeroCornerConfig): HeroCornerConfig {
    return {
      ...corner,
      badgeStyle: { ...corner.badgeStyle },
      titleStyle: { ...corner.titleStyle },
      subtitleStyle: { ...corner.subtitleStyle },
      descriptionStyle: { ...corner.descriptionStyle },
      addressStyle: { ...corner.addressStyle },
    };
  }

  function updateCornerField<K extends keyof HeroCornerConfig>(
    id: HeroCornerId,
    key: K,
    value: HeroCornerConfig[K]
  ) {
    setVenueForm((current) => {
      // Deep-clone every corner so the four regions never share references.
      const nextCorners = {
        topLeft: cloneCorner(current.heroCorners.topLeft),
        topRight: cloneCorner(current.heroCorners.topRight),
        bottomLeft: cloneCorner(current.heroCorners.bottomLeft),
        bottomRight: cloneCorner(current.heroCorners.bottomRight),
      };
      nextCorners[id] = { ...nextCorners[id], [key]: value };

      // Logo can live in only one corner at a time.
      if (key === "showLogo" && value === true) {
        for (const other of HERO_CORNER_IDS) {
          if (other !== id) nextCorners[other].showLogo = false;
        }
      }

      return {
        ...current,
        heroCorners: nextCorners,
        statusLabel:
          id === "bottomLeft" && key === "badgeText"
            ? String(value)
            : current.statusLabel,
      };
    });
    setVenueMessage("");
  }

  function updateCornerTextStyle(
    id: HeroCornerId,
    styleKey:
      | "badgeStyle"
      | "titleStyle"
      | "subtitleStyle"
      | "descriptionStyle"
      | "addressStyle",
    patch: Partial<HeroTextStyle>
  ) {
    setVenueForm((current) => {
      const nextCorners = {
        topLeft: cloneCorner(current.heroCorners.topLeft),
        topRight: cloneCorner(current.heroCorners.topRight),
        bottomLeft: cloneCorner(current.heroCorners.bottomLeft),
        bottomRight: cloneCorner(current.heroCorners.bottomRight),
      };
      nextCorners[id] = {
        ...nextCorners[id],
        [styleKey]: { ...nextCorners[id][styleKey], ...patch },
      };
      return { ...current, heroCorners: nextCorners };
    });
    setVenueMessage("");
  }

  async function onLogoChange(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoError("Lütfen bir logo görseli seçin.");
      return;
    }
    setLogoBusy(true);
    setLogoError("");
    try {
      const logoImage = await compressImage(file, {
        maxSize: 900,
        quality: 0.9,
      });
      setVenueForm((current) => ({ ...current, logoImage }));
      setVenueMessage("");
    } catch {
      setLogoError("Logo yüklenemedi.");
    } finally {
      setLogoBusy(false);
    }
  }

  async function onCornerLogoChange(
    cornerId: HeroCornerId,
    file: File | undefined
  ) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoError("Lütfen bir logo görseli seçin.");
      return;
    }
    setLogoBusy(true);
    setLogoError("");
    try {
      const logoImage = await compressImage(file, {
        maxSize: 900,
        quality: 0.9,
      });
      setVenueForm((current) => {
        const nextCorners = {
          topLeft: { ...current.heroCorners.topLeft },
          topRight: { ...current.heroCorners.topRight },
          bottomLeft: { ...current.heroCorners.bottomLeft },
          bottomRight: { ...current.heroCorners.bottomRight },
        };
        nextCorners[cornerId] = {
          ...nextCorners[cornerId],
          logoImage,
          showLogo: true,
        };
        return { ...current, heroCorners: nextCorners };
      });
      setVenueMessage("");
    } catch {
      setLogoError("Köşe logosu yüklenemedi.");
    } finally {
      setLogoBusy(false);
    }
  }

  function saveVenue() {
    updateMenu((current) => ({
      ...current,
      venue: {
        ...venueForm,
        brandName: venueForm.brandName.trim(),
        brandSubtitle: venueForm.brandSubtitle.trim(),
        tagline: venueForm.tagline.trim(),
        headline: venueForm.headline.trim(),
        subheadline: venueForm.subheadline.trim(),
        addressLine1: venueForm.addressLine1.trim(),
        addressLine2: venueForm.addressLine2.trim(),
        city: venueForm.city.trim(),
        mapsUrl: venueForm.mapsUrl.trim(),
        phone: venueForm.phone.trim(),
        whatsapp: venueForm.whatsapp.trim(),
        instagram: venueForm.instagram.trim(),
        statusLabel: venueForm.heroCorners.bottomLeft.badgeText.trim(),
        heroImage: venueForm.heroImage.trim() || defaultVenue.heroImage,
        logoImage: venueForm.logoImage.trim() || defaultVenue.logoImage,
        showBalloons: Boolean(venueForm.showBalloons),
        pageBackground:
          venueForm.pageBackground.trim() || defaultVenue.pageBackground,
        productCardColor:
          venueForm.productCardColor.trim() || defaultVenue.productCardColor,
        heroCorners: {
          topLeft: { ...venueForm.heroCorners.topLeft },
          topRight: { ...venueForm.heroCorners.topRight },
          bottomLeft: { ...venueForm.heroCorners.bottomLeft },
          bottomRight: { ...venueForm.heroCorners.bottomRight },
        },
        hours: venueForm.hours.map((row) => ({
          ...row,
          label: row.label.trim(),
          value: row.value.trim(),
        })),
      },
    }));
    setVenueMessage("İşletme bilgileri kaydedildi.");
  }

  async function onHeroChange(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setHeroError("Lütfen bir fotoğraf seçin.");
      return;
    }
    setHeroBusy(true);
    setHeroError("");
    try {
      const heroImage = await compressImage(file, {
        maxSize: 1800,
        quality: 0.88,
      });
      setVenueForm((current) => ({ ...current, heroImage }));
      setVenueMessage("");
    } catch {
      setHeroError("Kapak fotoğrafı yüklenemedi.");
    } finally {
      setHeroBusy(false);
    }
  }

  async function downloadAdminQr() {
    const svg = document.getElementById("admin-menu-qr-svg");
    if (!(svg instanceof SVGSVGElement)) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("QR yüklenemedi"));
        img.src = url;
      });
      const size = 1024;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(image, 64, 64, size - 128, size - 128);
      const png = canvas.toDataURL("image/png");
      const anchor = document.createElement("a");
      anchor.href = png;
      anchor.download = "mavi-balloon-menu-qr.png";
      anchor.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function updateHourRow(id: string, field: "label" | "value", value: string) {
    setVenueForm((current) => ({
      ...current,
      hours: current.hours.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    }));
    setVenueMessage("");
  }

  function addHourRow() {
    setVenueForm((current) => ({
      ...current,
      hours: [
        ...current.hours,
        { id: newId(), label: "Yeni gün", value: "11:00 - 23:00" },
      ],
    }));
  }

  function removeHourRow(id: string) {
    setVenueForm((current) => ({
      ...current,
      hours: current.hours.filter((row) => row.id !== id),
    }));
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <SiteHeader eyebrow="İşletme paneli" compact />

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 pb-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="max-w-xl text-sm text-sky-100/70">
              Kategori, fotoğraf ve fiyat buradan kaydedilir. QR menüsü tüm
              telefonlarda aynı listeyi gösterir.
            </p>
            <p className="mt-2 text-xs text-sky-200/70">
              {saving
                ? "Kaydediliyor…"
                : saveError
                  ? saveError
                  : cloudWarning
                    ? cloudWarning
                  : cloudStore
                    ? "Kayıtlar Turso’da; yayındaki menü güncellenir."
                    : "Yerel kayıt. Yayında Turso bağlayın."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/yonetim/siparisler"
              className={cn(buttonVariants({ variant: "outline" }), lightOutline)}
            >
              Siparişler
            </Link>
            <Link
              href="/portal"
              className={cn(buttonVariants({ variant: "outline" }), lightOutline)}
            >
              Portal
            </Link>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }), lightOutline)}
            >
              Müşteri menüsü
            </Link>
            <Link
              href="/qr"
              className={cn(buttonVariants({ variant: "outline" }), lightOutline)}
            >
              QR kod
            </Link>
            <Button
              variant="ghost"
              className={lightGhost}
              onClick={() => {
                clearStoredAdminPassword();
                setUnlocked(false);
                setPassword("");
              }}
            >
              Çıkış
            </Button>
          </div>
        </div>

        <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
          <CardHeader>
            <CardTitle className="text-white">Kategoriler</CardTitle>
            <CardDescription className="text-sky-100/60">
              Oklarla sıralayın; misafir menüsündeki ürün grubu ve üst sekmelerin
              sırası da aynı şekilde değişir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-[#007AFF]/15 px-3 py-3 ring-1 ring-[#007AFF]/25">
              <div className="flex items-start gap-2">
                {editingSignature ? (
                  <div className="grid min-w-0 flex-1 gap-1.5">
                    <Input
                      value={signatureForm.name}
                      onChange={(event) =>
                        setSignatureForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      className="h-9 bg-white/5 text-white"
                      autoFocus
                      placeholder="İmza seçkisi (TR)"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") saveSignatureEdit();
                        if (event.key === "Escape") {
                          setSignatureForm(menu.signature ?? defaultSignature);
                          setEditingSignature(false);
                        }
                      }}
                    />
                    <Input
                      value={signatureForm.nameEn}
                      onChange={(event) =>
                        setSignatureForm((current) => ({
                          ...current,
                          nameEn: event.target.value,
                        }))
                      }
                      className="h-9 bg-white/5 text-white"
                      placeholder="Signature (EN)"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") saveSignatureEdit();
                        if (event.key === "Escape") {
                          setSignatureForm(menu.signature ?? defaultSignature);
                          setEditingSignature(false);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {menu.signature?.name ?? defaultSignature.name}
                    </p>
                    <p className="truncate text-xs text-sky-100/50">
                      {menu.signature?.nameEn
                        ? `EN: ${menu.signature.nameEn} · `
                        : ""}
                      Öne çıkan ürünler (silinemez kategori)
                    </p>
                  </div>
                )}
                <div className="flex shrink-0 items-center gap-1">
                  {editingSignature ? (
                    <Button
                      size="sm"
                      className="bg-sky-400 text-[oklch(0.18_0.05_250)] hover:bg-sky-300"
                      onClick={saveSignatureEdit}
                    >
                      Kaydet
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={darkGhost}
                      onClick={() => {
                        setSignatureForm(menu.signature ?? defaultSignature);
                        setEditingSignature(true);
                      }}
                      aria-label="İmza seçkisini düzenle"
                    >
                      <Pencil />
                    </Button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-xs text-sky-100/55">
                Bu özel kategori silinemez. Ürünleri ürün kartındaki “İmza
                seçkisinde göster” ile ekleyin.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="Yeni kategori adı"
                className="h-10 bg-white/5 text-white placeholder:text-sky-100/40"
                onKeyDown={(event) => {
                  if (event.key === "Enter") addCategory();
                }}
              />
              <Button className="h-10 bg-sky-400 text-[oklch(0.18_0.05_250)] hover:bg-sky-300" onClick={addCategory}>
                <Plus />
                Kategori ekle
              </Button>
            </div>
            {categoryError ? (
              <p className="text-sm text-red-300">{categoryError}</p>
            ) : null}

            {categories.length === 0 ? (
              <p className="rounded-xl bg-white/5 px-4 py-8 text-center text-sm text-sky-100/60">
                Henüz kategori yok. Ürün eklemeden önce bir kategori oluşturun.
              </p>
            ) : (
              <ul className="space-y-2">
                {categories.map((category, index) => (
                  <li
                    key={category.id}
                    className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/8"
                  >
                    {editingCategory?.id === category.id ? (
                      <div className="grid min-w-0 flex-1 gap-1.5">
                        <Input
                          value={editingCategory.name}
                          onChange={(event) =>
                            setEditingCategory({
                              ...editingCategory,
                              name: event.target.value,
                            })
                          }
                          className="h-9 bg-white/5 text-white"
                          autoFocus
                          placeholder="Kategori (TR)"
                          onKeyDown={(event) => {
                            if (event.key === "Enter") saveCategoryEdit();
                            if (event.key === "Escape") setEditingCategory(null);
                          }}
                        />
                        <Input
                          value={editingCategory.nameEn ?? ""}
                          onChange={(event) =>
                            setEditingCategory({
                              ...editingCategory,
                              nameEn: event.target.value,
                            })
                          }
                          className="h-9 bg-white/5 text-white"
                          placeholder="Category (EN)"
                          onKeyDown={(event) => {
                            if (event.key === "Enter") saveCategoryEdit();
                            if (event.key === "Escape") setEditingCategory(null);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{category.name}</p>
                        <p className="truncate text-xs text-sky-100/50">
                          {category.nameEn
                            ? `EN: ${category.nameEn} · `
                            : ""}
                          {productsByCategory.get(category.id) ?? 0} ürün
                        </p>
                      </div>
                    )}
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={darkGhost}
                        disabled={index === 0}
                        onClick={() => moveCategory(category.id, -1)}
                        aria-label="Yukarı taşı"
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={darkGhost}
                        disabled={index === categories.length - 1}
                        onClick={() => moveCategory(category.id, 1)}
                        aria-label="Aşağı taşı"
                      >
                        <ArrowDown />
                      </Button>
                      {editingCategory?.id === category.id ? (
                        <Button
                          size="sm"
                          className="bg-sky-400 text-[oklch(0.18_0.05_250)] hover:bg-sky-300"
                          onClick={saveCategoryEdit}
                        >
                          Kaydet
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className={darkGhost}
                          onClick={() => setEditingCategory(category)}
                          aria-label="Düzenle"
                        >
                          <Pencil />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={darkGhost}
                        onClick={() => deleteCategory(category)}
                        aria-label="Sil"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle className="text-white">Ürünler</CardTitle>
              <CardDescription className="text-sky-100/60">
                Fotoğraf, isim ve fiyat. Misafir menüsünde böyle görünür.
              </CardDescription>
            </div>
            <Button
              className="bg-sky-400 text-[oklch(0.18_0.05_250)] hover:bg-sky-300"
              onClick={openNewProduct}
              disabled={categories.length === 0}
            >
              <Plus />
              Ürün ekle
            </Button>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <p className="rounded-xl bg-white/5 px-4 py-8 text-center text-sm text-sky-100/60">
                Henüz ürün yok. Fotoğraf ve fiyat ekleyerek menüyü doldurun.
              </p>
            ) : (
              <ul className="space-y-3">
                {products.map((product) => (
                  <li
                    key={product.id}
                    className="flex gap-3 rounded-xl bg-white/5 p-2 ring-1 ring-white/8 sm:p-3"
                  >
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-black/20">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-sky-100/40">
                          Foto yok
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="text-xs text-sky-100/50">
                        {categoryNameById(product.categoryId)}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-sky-200">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={darkGhost}
                        onClick={() => openEditProduct(product)}
                        aria-label="Ürünü düzenle"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className={darkGhost}
                        onClick={() => deleteProduct(product.id)}
                        aria-label="Ürünü sil"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
          <CardHeader>
            <CardTitle className="text-white">Kapak (Header)</CardTitle>
            <CardDescription className="text-sky-100/60">
              Kapak fotoğrafı, logo, balonlar, renkler ve dört köşe. Her köşeye
              kendi başlık, alt başlık (adres metni) ve logosunu yazabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="hero-photo">Kapak fotoğrafı</Label>
              <Input
                id="hero-photo"
                type="file"
                accept="image/*"
                className="h-10 bg-white/5 file:text-sky-100"
                onChange={(event) => void onHeroChange(event.target.files?.[0])}
              />
              {heroBusy ? (
                <p className="text-xs text-sky-200">Kapak hazırlanıyor…</p>
              ) : null}
              {heroError ? (
                <p className="text-sm text-red-300">{heroError}</p>
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={venueForm.heroImage || "/brand/hero.webp"}
                alt="Kapak önizleme"
                className="mt-1 h-40 w-full rounded-xl object-cover ring-1 ring-white/10"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn("w-fit", darkOutline)}
                onClick={() =>
                  updateVenueField("heroImage", defaultVenue.heroImage)
                }
              >
                Varsayılan kapağa dön
              </Button>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="logo-photo">Marka logosu</Label>
              <Input
                id="logo-photo"
                type="file"
                accept="image/*"
                className="h-10 bg-white/5 file:text-sky-100"
                onChange={(event) => void onLogoChange(event.target.files?.[0])}
              />
              {logoBusy ? (
                <p className="text-xs text-sky-200">Logo hazırlanıyor…</p>
              ) : null}
              {logoError ? (
                <p className="text-sm text-red-300">{logoError}</p>
              ) : null}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={venueForm.logoImage || defaultVenue.logoImage}
                alt="Logo önizleme"
                className="mt-1 h-16 w-auto max-w-[10rem] rounded-lg bg-white/90 object-contain p-2 ring-1 ring-white/10"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn("w-fit", darkOutline)}
                onClick={() =>
                  updateVenueField("logoImage", defaultVenue.logoImage)
                }
              >
                Varsayılan logoya dön
              </Button>
            </div>

            <div className="grid gap-1.5 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <Label>Görünüm</Label>
              <label className="mt-1 flex items-center justify-between gap-3 text-sm text-sky-100/80">
                <span>Arka plan balonları</span>
                <input
                  type="checkbox"
                  checked={venueForm.showBalloons}
                  onChange={(event) =>
                    updateVenueField("showBalloons", event.target.checked)
                  }
                  className="size-4 accent-sky-400"
                />
              </label>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="page-bg">Sayfa arka plan rengi</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="page-bg"
                      type="color"
                      value={venueForm.pageBackground || "#fdfcfb"}
                      onChange={(event) =>
                        updateVenueField("pageBackground", event.target.value)
                      }
                      className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent"
                    />
                    <Input
                      value={venueForm.pageBackground}
                      onChange={(event) =>
                        updateVenueField("pageBackground", event.target.value)
                      }
                      className="h-10 bg-white/5 text-white"
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="card-bg">Ürün kartı rengi</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="card-bg"
                      type="color"
                      value={venueForm.productCardColor || "#e9ecef"}
                      onChange={(event) =>
                        updateVenueField("productCardColor", event.target.value)
                      }
                      className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent"
                    />
                    <Input
                      value={venueForm.productCardColor}
                      onChange={(event) =>
                        updateVenueField("productCardColor", event.target.value)
                      }
                      className="h-10 bg-white/5 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label>Kapak köşesi</Label>
                <p className="text-xs text-sky-100/55">
                  Köşeyi seçin; alttaki tüm alanlar yalnızca seçili köşeye aittir.
                </p>
                <div className="relative">
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-left text-sm font-medium text-white ring-1 ring-white/10 hover:bg-white/[0.07]"
                    onClick={() => setCornerMenuOpen((open) => !open)}
                    aria-expanded={cornerMenuOpen}
                  >
                    <span>{HERO_CORNER_LABELS[selectedCorner]}</span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-sky-100/70 transition",
                        cornerMenuOpen ? "rotate-180" : ""
                      )}
                    />
                  </button>
                  {cornerMenuOpen ? (
                    <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl bg-[oklch(0.26_0.04_250)] shadow-xl ring-1 ring-white/15">
                      {HERO_CORNER_IDS.map((cornerId) => (
                        <button
                          key={cornerId}
                          type="button"
                          className={cn(
                            "flex w-full items-center justify-between px-3 py-2.5 text-left text-sm text-white hover:bg-white/10",
                            cornerId === selectedCorner
                              ? "bg-sky-400/20 font-semibold text-sky-100"
                              : ""
                          )}
                          onClick={() => {
                            setSelectedCorner(cornerId);
                            setCornerMenuOpen(false);
                          }}
                        >
                          <span>{HERO_CORNER_LABELS[cornerId]}</span>
                          {cornerId === selectedCorner ? (
                            <span className="text-[10px] tracking-wide text-sky-200 uppercase">
                              Seçili
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              {(() => {
                const corner = venueForm.heroCorners[selectedCorner];
                const cornerId = selectedCorner;
                return (
                  <div className="space-y-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
                    <p className="text-xs font-medium tracking-wide text-sky-200/80 uppercase">
                      {HERO_CORNER_LABELS[cornerId]} özelleştirme
                    </p>
                    <CornerTextField
                      id={`badge-${cornerId}`}
                      label="Rozet (isteğe bağlı)"
                      value={corner.badgeText}
                      placeholder="Örn. Açık · 11:00 - 01:30"
                      textStyle={corner.badgeStyle}
                      onValueChange={(value) =>
                        updateCornerField(cornerId, "badgeText", value)
                      }
                      onStyleChange={(patch) =>
                        updateCornerTextStyle(cornerId, "badgeStyle", patch)
                      }
                    />
                    <CornerTextField
                      id={`title-${cornerId}`}
                      label="Başlık"
                      value={corner.title}
                      placeholder="Bu köşeye özel başlık"
                      textStyle={corner.titleStyle}
                      onValueChange={(value) =>
                        updateCornerField(cornerId, "title", value)
                      }
                      onStyleChange={(patch) =>
                        updateCornerTextStyle(cornerId, "titleStyle", patch)
                      }
                    />
                    <CornerTextField
                      id={`subtitle-${cornerId}`}
                      label="Alt başlık"
                      value={corner.subtitle}
                      placeholder="Slogan"
                      textStyle={corner.subtitleStyle}
                      onValueChange={(value) =>
                        updateCornerField(cornerId, "subtitle", value)
                      }
                      onStyleChange={(patch) =>
                        updateCornerTextStyle(cornerId, "subtitleStyle", patch)
                      }
                    />
                    <CornerTextField
                      id={`description-${cornerId}`}
                      label="Açıklama"
                      value={corner.description}
                      placeholder="Alt başlığın altında kısa açıklama"
                      multiline
                      textStyle={corner.descriptionStyle}
                      onValueChange={(value) =>
                        updateCornerField(cornerId, "description", value)
                      }
                      onStyleChange={(patch) =>
                        updateCornerTextStyle(
                          cornerId,
                          "descriptionStyle",
                          patch
                        )
                      }
                    />
                    <div className="space-y-1.5">
                      <CornerTextField
                        id={`address-${cornerId}`}
                        label="Adres metni"
                        value={corner.addressText}
                        placeholder={
                          "Örn. Caferağa, Neşet Ömer Sk. No:16 B\nKadıköy"
                        }
                        multiline
                        textStyle={corner.addressStyle}
                        onValueChange={(value) =>
                          updateCornerField(cornerId, "addressText", value)
                        }
                        onStyleChange={(patch) =>
                          updateCornerTextStyle(cornerId, "addressStyle", patch)
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn("w-fit", darkOutline)}
                        onClick={() => {
                          const address = [
                            venueForm.addressLine1.trim(),
                            venueForm.addressLine2.trim(),
                          ]
                            .filter(Boolean)
                            .join("\n");
                          updateCornerField(cornerId, "addressText", address);
                        }}
                      >
                        İşletme adresini buraya doldur
                      </Button>
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor={`corner-logo-${cornerId}`}>
                        Bu köşenin logosu
                      </Label>
                      <Input
                        id={`corner-logo-${cornerId}`}
                        type="file"
                        accept="image/*"
                        className="h-10 bg-white/5 file:text-sky-100"
                        onChange={(event) =>
                          void onCornerLogoChange(
                            cornerId,
                            event.target.files?.[0]
                          )
                        }
                      />
                      {(corner.logoImage ||
                        (corner.showLogo && venueForm.logoImage)) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={
                            corner.logoImage ||
                            venueForm.logoImage ||
                            defaultVenue.logoImage
                          }
                          alt={`${HERO_CORNER_LABELS[cornerId]} logo`}
                          className="mt-1 h-14 w-auto max-w-[9rem] rounded-lg bg-white/90 object-contain p-2 ring-1 ring-white/10"
                        />
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn("w-fit", darkOutline)}
                          onClick={() => {
                            updateCornerField(
                              cornerId,
                              "logoImage",
                              venueForm.logoImage || defaultVenue.logoImage
                            );
                            updateCornerField(cornerId, "showLogo", true);
                          }}
                        >
                          Genel marka logosunu kullan
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn("w-fit", darkOutline)}
                          onClick={() => {
                            updateCornerField(cornerId, "logoImage", "");
                            updateCornerField(cornerId, "showLogo", false);
                          }}
                        >
                          Logoyu kaldır
                        </Button>
                      </div>
                    </div>
                    <label className="flex items-center justify-between gap-3 text-sm text-sky-100/80">
                      <span>Adresi Google Maps’e bağla (ikon + metin)</span>
                      <input
                        type="checkbox"
                        checked={corner.linkMaps}
                        onChange={(event) =>
                          updateCornerField(
                            cornerId,
                            "linkMaps",
                            event.target.checked
                          )
                        }
                        className="size-4 accent-sky-400"
                      />
                    </label>
                    <p className="text-[11px] text-sky-100/45">
                      Her yazı kutusunun sağından punto ve renk seçebilirsiniz.
                      Logo bu köşeye özeldir.
                    </p>
                  </div>
                );
              })()}
            </div>
            {venueMessage ? (
              <p className="text-sm text-sky-200">{venueMessage}</p>
            ) : null}
            <Button
              className="w-fit bg-sky-400 text-[oklch(0.18_0.05_250)] hover:bg-sky-300"
              onClick={saveVenue}
              disabled={saving || heroBusy || logoBusy}
            >
              Kapak ayarlarını kaydet
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
          <CardHeader>
            <CardTitle className="text-white">İşletme & iletişim</CardTitle>
            <CardDescription className="text-sky-100/60">
              Adres, Google Maps ve sosyal iletişim bilgileri.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="address-1">Adres satırı 1</Label>
                <Input
                  id="address-1"
                  value={venueForm.addressLine1}
                  onChange={(event) =>
                    updateVenueField("addressLine1", event.target.value)
                  }
                  className="h-10 bg-white/5 text-white"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="address-2">Adres satırı 2</Label>
                <Input
                  id="address-2"
                  value={venueForm.addressLine2}
                  onChange={(event) =>
                    updateVenueField("addressLine2", event.target.value)
                  }
                  className="h-10 bg-white/5 text-white"
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="maps-url">Google Maps konum linki</Label>
                <Input
                  id="maps-url"
                  value={venueForm.mapsUrl}
                  onChange={(event) =>
                    updateVenueField("mapsUrl", event.target.value)
                  }
                  placeholder="https://maps.google.com/..."
                  className="h-10 bg-white/5 text-white"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={venueForm.phone}
                  onChange={(event) =>
                    updateVenueField("phone", event.target.value)
                  }
                  placeholder="+90..."
                  className="h-10 bg-white/5 text-white"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={venueForm.whatsapp}
                  onChange={(event) =>
                    updateVenueField("whatsapp", event.target.value)
                  }
                  placeholder="https://wa.me/90... veya numara"
                  className="h-10 bg-white/5 text-white"
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={venueForm.instagram}
                  onChange={(event) =>
                    updateVenueField("instagram", event.target.value)
                  }
                  placeholder="@maviballoon veya profil linki"
                  className="h-10 bg-white/5 text-white"
                />
              </div>
            </div>

            {venueMessage ? (
              <p className="text-sm text-sky-200">{venueMessage}</p>
            ) : null}
            <Button
              className="w-fit bg-sky-400 text-[oklch(0.18_0.05_250)] hover:bg-sky-300"
              onClick={saveVenue}
              disabled={saving}
            >
              İletişim bilgilerini kaydet
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
          <CardHeader>
            <CardTitle className="text-white">Footer</CardTitle>
            <CardDescription className="text-sky-100/60">
              Menünün en altında görünen marka, iletişim ikonları ve açılış
              saatleri.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="footer-brand-name">Footer marka adı</Label>
              <Input
                id="footer-brand-name"
                value={venueForm.brandName}
                onChange={(event) =>
                  updateVenueField("brandName", event.target.value)
                }
                placeholder="Sayfa en altında ayrı blok olarak görünür"
                className="h-10 bg-white/5 text-white"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="footer-brand-subtitle">Footer alt yazı</Label>
              <Input
                id="footer-brand-subtitle"
                value={venueForm.brandSubtitle}
                onChange={(event) =>
                  updateVenueField("brandSubtitle", event.target.value)
                }
                placeholder="Markanın altında kısa açıklama (isteğe bağlı)"
                className="h-10 bg-white/5 text-white"
              />
            </div>
            <p className="rounded-xl bg-white/5 px-3 py-2 text-xs text-sky-100/60 ring-1 ring-white/10">
              İletişim ikonları İşletme & iletişim kartından gelir. Saatler
              başlığı listenin üstünde tam genişlikte durur.
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Açılış saatleri</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className={darkOutline}
                  onClick={addHourRow}
                >
                  <Plus />
                  Satır ekle
                </Button>
              </div>
              <ul className="space-y-2">
                {venueForm.hours.map((row) => (
                  <li
                    key={row.id}
                    className="grid gap-2 rounded-xl bg-white/5 p-2 sm:grid-cols-[1fr_1fr_auto]"
                  >
                    <Input
                      value={row.label}
                      onChange={(event) =>
                        updateHourRow(row.id, "label", event.target.value)
                      }
                      placeholder="Gün"
                      className="h-9 bg-white/5 text-white"
                    />
                    <Input
                      value={row.value}
                      onChange={(event) =>
                        updateHourRow(row.id, "value", event.target.value)
                      }
                      placeholder="11:00 - 23:00"
                      className="h-9 bg-white/5 text-white"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className={darkGhost}
                      onClick={() => removeHourRow(row.id)}
                      aria-label="Saat satırını sil"
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {venueMessage ? (
              <p className="text-sm text-sky-200">{venueMessage}</p>
            ) : null}
            <Button
              className="w-fit bg-sky-400 text-[oklch(0.18_0.05_250)] hover:bg-sky-300"
              onClick={saveVenue}
              disabled={saving}
            >
              Footer ayarlarını kaydet
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
          <CardHeader>
            <CardTitle className="text-white">Masa QR kodu</CardTitle>
            <CardDescription className="text-sky-100/60">
              PNG olarak indirip yazdırın. Yayın adresiniz bu tarayıcıdaki site
              adresidir.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="rounded-2xl bg-white p-3">
              <QRCodeSVG
                id="admin-menu-qr-svg"
                value={menuOrigin}
                size={148}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="space-y-2">
              <p className="break-all text-xs text-sky-100/60">{menuOrigin}</p>
              <Button
                className="bg-sky-400 text-[oklch(0.18_0.05_250)] hover:bg-sky-300"
                onClick={() => void downloadAdminQr()}
              >
                <Download />
                QR indir
              </Button>
              <Link
                href="/qr"
                className={cn(buttonVariants({ variant: "outline" }), darkOutline)}
              >
                QR sayfasını aç
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
          <CardHeader>
            <CardTitle className="text-white">Şifre değiştir</CardTitle>
            <CardDescription className="text-sky-100/60">
              Yeni şifre kaydedilir. Vercel’deki ADMIN_PASSWORD her zaman yedek
              giriş olarak da çalışır.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid max-w-md gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="current-password">Mevcut şifre</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="h-10 bg-white/5 text-white"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new-password">Yeni şifre</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="h-10 bg-white/5 text-white"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirm-password">Yeni şifre (tekrar)</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-10 bg-white/5 text-white"
              />
            </div>
            {passwordError ? (
              <p className="text-sm text-red-300">{passwordError}</p>
            ) : null}
            {passwordMessage ? (
              <p className="text-sm text-sky-200">{passwordMessage}</p>
            ) : null}
            <Button
              className="w-fit bg-sky-400 text-[oklch(0.18_0.05_250)] hover:bg-sky-300"
              disabled={passwordBusy}
              onClick={() => void handlePasswordChange()}
            >
              {passwordBusy ? "Kaydediliyor…" : "Şifreyi kaydet"}
            </Button>
          </CardContent>
        </Card>
      </main>

      <Dialog open={productOpen} onOpenChange={setProductOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto bg-[oklch(0.2_0.04_250)] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              {productForm.id ? "Ürünü düzenle" : "Yeni ürün"}
            </DialogTitle>
            <DialogDescription className="text-sky-100/60">
              Fotoğraf yükleyin, fiyatı TL olarak girin.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="product-photo">Ürün fotoğrafı</Label>
              <Input
                id="product-photo"
                type="file"
                accept="image/*"
                className="h-10 bg-white/5 file:text-sky-100"
                onChange={(event) => onPhotoChange(event.target.files?.[0])}
              />
              {imageBusy ? (
                <p className="text-xs text-sky-200">Fotoğraf hazırlanıyor…</p>
              ) : null}
              {productForm.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={productForm.image}
                  alt="Önizleme"
                  className="mt-1 h-36 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-36 items-center justify-center rounded-lg bg-white/5 text-sm text-sky-100/45">
                  Önizleme yok
                </div>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="product-name">Ürün adı (TR)</Label>
              <Input
                id="product-name"
                value={productForm.name}
                onChange={(event) =>
                  setProductForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Örn. Double Mavi Burger"
                className="h-10 bg-white/5 text-white"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="product-name-en">Ürün adı (EN)</Label>
              <Input
                id="product-name-en"
                value={productForm.nameEn}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    nameEn: event.target.value,
                  }))
                }
                placeholder="e.g. Double Mavi Burger"
                className="h-10 bg-white/5 text-white"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="product-price">Fiyat (₺)</Label>
              <Input
                id="product-price"
                inputMode="decimal"
                value={productForm.price}
                onChange={(event) =>
                  setProductForm((current) => ({ ...current, price: event.target.value }))
                }
                placeholder="280"
                className="h-10 bg-white/5 text-white"
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Kategori</Label>
              {categories.length === 0 ? (
                <p className="text-sm text-red-300">Önce kategori oluşturun.</p>
              ) : (
                <Select
                  value={productForm.categoryId}
                  onValueChange={(value) => {
                    if (typeof value === "string") {
                      setProductForm((current) => ({ ...current, categoryId: value }));
                    }
                  }}
                >
                  <SelectTrigger className="h-10 w-full bg-white/5 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="product-desc">İçerik / açıklama (TR)</Label>
              <Textarea
                id="product-desc"
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Ürün içeriği"
                className="min-h-24 bg-white/5 text-white"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="product-desc-en">İçerik / açıklama (EN)</Label>
              <Textarea
                id="product-desc-en"
                value={productForm.descriptionEn}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    descriptionEn: event.target.value,
                  }))
                }
                placeholder="Product description in English"
                className="min-h-24 bg-white/5 text-white"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="product-allergens">Alerjenler (TR)</Label>
              <Textarea
                id="product-allergens"
                value={productForm.allergens}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    allergens: event.target.value,
                  }))
                }
                placeholder="Gluten, süt ürünleri, yumurta…"
                className="min-h-16 bg-white/5 text-white"
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="product-allergens-en">Alerjenler (EN)</Label>
              <Textarea
                id="product-allergens-en"
                value={productForm.allergensEn}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    allergensEn: event.target.value,
                  }))
                }
                placeholder="Gluten, dairy, egg…"
                className="min-h-16 bg-white/5 text-white"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-sky-100/80">
              <input
                type="checkbox"
                checked={productForm.featured}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    featured: event.target.checked,
                  }))
                }
                className="size-4 rounded border-white/20 bg-white/5"
              />
              {(
                menu.signature?.name?.trim() ||
                signatureForm.name.trim() ||
                defaultSignature.name
              )}{" "}
              bölümünde göster
            </label>

            {productError ? (
              <p className="text-sm text-red-300">{productError}</p>
            ) : null}
          </div>

          <DialogFooter className="border-white/10 bg-transparent">
            <Button
              variant="outline"
              className={darkOutline}
              onClick={() => setProductOpen(false)}
            >
              Vazgeç
            </Button>
            <Button
              className="bg-sky-400 text-[oklch(0.18_0.05_250)] hover:bg-sky-300"
              onClick={saveProduct}
              disabled={imageBusy || categories.length === 0}
            >
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
