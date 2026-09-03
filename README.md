# Mavi Balon Dijital Menü

QR ile açılan dijital menü. Yönetimden kaydettiğiniz kategori, fotoğraf ve fiyat Turso’da saklanır; Vercel’deki müşteri menüsü aynı listeyi gösterir. Tasarım değişince kodu güncelleyip gönderirsiniz; menü içeriği silinmez.

---

## 1) Turso (menünün kaydedileceği yer)

Bu adım ücretsizdir. Kart istenebilir; Free / Starter planda kalın.

1. [https://turso.tech](https://turso.tech) adresine gidin, hesap açın.
2. Yeni bir veritabanı oluşturun. İsim örneği: `mavi-balon`
3. Veritabanı sayfasından şunları kopyalayın:
   - **Database URL** → `libsql://...turso.io` gibi görünür
   - **Token** → **read-write** (salt okunur / read-only olmasın)

Bunları bir yere not edin; birazdan Vercel’e yapıştıracağız.

Terminal kullanırsanız:

```bash
turso db create mavi-balon
turso db show mavi-balon --url
turso db tokens create mavi-balon
```

---

## 2) Vercel (siteyi internete koyma) — adım adım

Vercel, menü sitesini ücretsiz yayınlar. Müşteri telefonu buradaki adresi açar.

### Adım 1 — Hesap açın

1. [https://vercel.com](https://vercel.com) açın.
2. **Sign Up** deyin.
3. Mümkünse **Continue with GitHub** seçin (en kolayı).
4. GitHub’a izin verin.

### Adım 2 — Projeyi Vercel’e bağlayın

1. Vercel ana sayfada **Add New…** → **Project**
2. GitHub hesabınızdaki bu menü reposunu listeden bulun.
3. **Import** deyin.

Repoyu henüz GitHub’a koymadıysanız önce GitHub’da bir repo oluşturup kodu oraya yüklemeniz gerekir. Vercel, GitHub’daki projeyi okuyup yayınlar.

### Adım 3 — Ortam değişkenlerini yazın (çok önemli)

Import ekranında veya sonra **Settings → Environment Variables** bölümüne gidin.

Şu **üç** satırı tek tek ekleyin:

| Name (isim) | Value (değer) | Ne işe yarar |
| --- | --- | --- |
| `TURSO_DATABASE_URL` | Turso’dan aldığınız URL | Menü verisinin adresi |
| `TURSO_AUTH_TOKEN` | Turso read-write token | Menüyü okuma/yazma izni |
| `ADMIN_PASSWORD` | Sizin uydurduğunuz şifre | `/yonetim` giriş şifresi |

Dikkat:

- İsimleri **tıpatıp** böyle yazın (büyük/küçük harf önemli).
- Değerlerin başında/sonunda boşluk olmasın.
- Environment seçeneklerinde **Production**, **Preview**, **Development** hepsini işaretleyin (veya en azından Production).
- Her satırdan sonra **Save** / **Add** deyin.

### Adım 4 — Yayınlayın (Deploy)

1. **Deploy** butonuna basın.
2. 1–2 dakika bekleyin. Yeşil **Ready** / **Success** görünmeli.
3. Üstte veya proje kartında bir adres çıkar, örnek:

`https://mavi-balon-xxxx.vercel.app`

Bu sizin canlı menü adresinizdir.

Hata alırsanız çoğu zaman sebep: ortam değişkeni eksik veya yanlış. Variables’ı kontrol edip **Redeploy** yapın.

### Adım 5 — Çalıştığını kontrol edin

Tarayıcıda sırayla açın:

1. `https://SIZIN-ADRES.vercel.app`  
   → Menü görünmeli
2. `https://SIZIN-ADRES.vercel.app/yonetim`  
   → `ADMIN_PASSWORD` ile giriş
3. Bir ürün/fiyat kaydedin
4. Menü sayfasını yenileyin → değişiklik görünmeli
5. `https://SIZIN-ADRES.vercel.app/qr`  
   → **Yazdır** → masaya koyun  
   → Telefondan okutunca menü açılmalı

Önemli: QR’daki adres `https://...vercel.app` olmalı. `127.0.0.1` veya `localhost` görürseniz henüz canlı adreste değilsiniz; o kodu masaya basmayın.

---

## 3) Günlük kullanım

| Ne yapmak istiyorsunuz | Nereye gidin |
| --- | --- |
| Müşteri menüsü | `/` |
| Masa QR yazdırma | `/qr` |
| Kategori, fotoğraf, fiyat | `/yonetim` (şifre ile) |

Fiyat değişince sadece `/yonetim` yeterli. QR’ı yeniden basmanıza gerek yok.

Tasarım değişince: kodu güncelleyip GitHub’a push edin. Vercel otomatik yeniden yayınlar. Turso’daki ürünler kalır.

---

## Yerel deneme (bilgisayarınızda)

```bash
cp .env.example .env.local
npm install
npm run dev
```

[http://127.0.0.1:43123](http://127.0.0.1:43123)

Turso satırlarını boş bırakırsanız menü geçici olarak bilgisayardaki dosyada tutulur. Canlı müşteri menüsü için yine Vercel + Turso gerekir.
