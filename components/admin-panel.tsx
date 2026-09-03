"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { BalloonField } from "@/components/balloon-mark";
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
  defaultMenu,
  formatPrice,
  newId,
  type Category,
  type MenuData,
  type Product,
} from "@/lib/menu";

type ProductForm = {
  id?: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  image: string;
};

const emptyProductForm = (categoryId = ""): ProductForm => ({
  name: "",
  description: "",
  price: "",
  categoryId,
  image: "",
});

export function AdminPanel({ initialMenu }: { initialMenu: MenuData }) {
  const { menu, updateMenu, saving, saveError } = useMenu(initialMenu);
  const [authChecked, setAuthChecked] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [cloudStore, setCloudStore] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [productOpen, setProductOpen] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm());
  const [productError, setProductError] = useState("");
  const [imageBusy, setImageBusy] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function checkAuth() {
      try {
        const statusResponse = await fetch("/api/admin/status", { cache: "no-store" });
        const status = (await statusResponse.json()) as {
          authRequired: boolean;
          cloudStore: boolean;
        };
        if (cancelled) return;
        setCloudStore(status.cloudStore);
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

  const categories = menu?.categories ?? [];
  const products = menu?.products ?? [];

  const productsByCategory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of menu?.products ?? []) {
      counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [menu]);

  if (!authChecked) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center text-sky-100/70">
        Yönetim paneli hazırlanıyor…
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="relative flex min-h-full flex-1 flex-col">
        <BalloonField />
        <SiteHeader eyebrow="İşletme paneli" compact />
        <main className="relative mx-auto flex w-full max-w-sm flex-1 flex-col px-4 pb-16">
          <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
            <CardHeader>
              <CardTitle className="text-white">İşletme girişi</CardTitle>
              <CardDescription className="text-sky-100/60">
                Müşteri menüsünden ayrı portal. Vercel’de verdiğiniz
                ADMIN_PASSWORD ile giriş yapın.
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
              <Link href="/portal" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                Portala dön
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
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
        { id: newId(), name, sortOrder: current.categories.length },
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
        category.id === editingCategory.id ? { ...category, name } : category
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
      description: product.description,
      price: String(product.price),
      categoryId: product.categoryId,
      image: product.image,
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
      description: productForm.description.trim(),
      price: Math.round(price * 100) / 100,
      image: productForm.image,
      categoryId: productForm.categoryId,
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

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <BalloonField />
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
                  : cloudStore
                    ? "Kayıtlar Turso’da; yayındaki menü güncellenir."
                    : "Yerel kayıt. Yayında Turso bağlayın."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/portal" className={cn(buttonVariants({ variant: "outline" }))}>
              Portal
            </Link>
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              Müşteri menüsü
            </Link>
            <Link href="/qr" className={cn(buttonVariants({ variant: "outline" }))}>
              QR kod
            </Link>
            <Button
              variant="ghost"
              onClick={() => {
                clearStoredAdminPassword();
                setUnlocked(false);
                setPassword("");
              }}
            >
              Çıkış
            </Button>
            <Button variant="ghost" onClick={() => setResetOpen(true)}>
              Örneği yükle
            </Button>
          </div>
        </div>

        <Card className="bg-[oklch(0.22_0.04_250)] text-white ring-white/10">
          <CardHeader>
            <CardTitle className="text-white">Kategoriler</CardTitle>
            <CardDescription className="text-sky-100/60">
              Hamburger, döner, broast gibi bölümler oluşturun. Menüdeki sekmeler
              buradan gelir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                      <Input
                        value={editingCategory.name}
                        onChange={(event) =>
                          setEditingCategory({
                            ...editingCategory,
                            name: event.target.value,
                          })
                        }
                        className="h-9 flex-1 bg-white/5 text-white"
                        autoFocus
                        onKeyDown={(event) => {
                          if (event.key === "Enter") saveCategoryEdit();
                          if (event.key === "Escape") setEditingCategory(null);
                        }}
                      />
                    ) : (
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{category.name}</p>
                        <p className="text-xs text-sky-100/50">
                          {productsByCategory.get(category.id) ?? 0} ürün
                        </p>
                      </div>
                    )}
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === 0}
                        onClick={() => moveCategory(category.id, -1)}
                        aria-label="Yukarı taşı"
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        disabled={index === categories.length - 1}
                        onClick={() => moveCategory(category.id, 1)}
                        aria-label="Aşağı taşı"
                      >
                        <ArrowDown />
                      </Button>
                      {editingCategory?.id === category.id ? (
                        <Button size="sm" onClick={saveCategoryEdit}>
                          Kaydet
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditingCategory(category)}
                          aria-label="Düzenle"
                        >
                          <Pencil />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
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
                        onClick={() => openEditProduct(product)}
                        aria-label="Ürünü düzenle"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
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
              <Label htmlFor="product-name">Ürün adı</Label>
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
              <Label htmlFor="product-desc">Açıklama (isteğe bağlı)</Label>
              <Textarea
                id="product-desc"
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Kısa tarif"
                className="min-h-20 bg-white/5 text-white"
              />
            </div>

            {productError ? (
              <p className="text-sm text-red-300">{productError}</p>
            ) : null}
          </div>

          <DialogFooter className="border-white/10 bg-transparent">
            <Button variant="outline" onClick={() => setProductOpen(false)}>
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

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="bg-[oklch(0.2_0.04_250)] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Örnek menüyü yükle</DialogTitle>
            <DialogDescription className="text-sky-100/60">
              Mevcut kategori ve ürünleriniz örnek hamburger, döner, broast ve
              patates menüsüyle değişir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-white/10 bg-transparent">
            <Button variant="outline" onClick={() => setResetOpen(false)}>
              Vazgeç
            </Button>
            <Button
              onClick={() => {
                updateMenu(structuredClone(defaultMenu));
                setResetOpen(false);
              }}
            >
              Yükle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
