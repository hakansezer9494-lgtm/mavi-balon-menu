# Mavi Balon Dijital Menü

QR ile açılan dijital menü. Yönetimden kaydettiğiniz kategori, fotoğraf ve fiyat Turso’da saklanır; Vercel’deki müşteri menüsü aynı listeyi gösterir. Tasarım değişince `git push` yeter.

## Yol 1: Vercel + Turso (önerilen)

### A. Turso hesabı

1. [turso.tech](https://turso.tech) üzerinden ücretsiz hesap açın
2. Veritabanı oluşturun, örneğin `mavi-balon`
3. URL ve token alın:

```bash
turso db create mavi-balon
turso db show mavi-balon --url
turso db tokens create mavi-balon
```

### B. Vercel’e yayın

1. [vercel.com](https://vercel.com) hesabı açın, bu repoyu Import edin
2. Project → Settings → Environment Variables:

| Değişken | Değer |
| --- | --- |
| `TURSO_DATABASE_URL` | Turso URL |
| `TURSO_AUTH_TOKEN` | Turso token |
| `ADMIN_PASSWORD` | Sizin belirlediğiniz yönetim şifresi |

3. Deploy edin. Size `https://....vercel.app` adresi gelir.

### C. Menüyü doldurun

1. `https://SIZIN-ADRES.vercel.app/yonetim` açın
2. `ADMIN_PASSWORD` ile giriş yapın
3. Kategori / fotoğraf / fiyat ekleyin — kayıt Turso’ya gider
4. `https://SIZIN-ADRES.vercel.app` müşteri menüsüdür
5. `/qr` sayfasından **Yazdır** → masaya yapıştırın

Sonraki tasarım değişiklikleri: kodu güncelleyip push edin. Vercel yeniden yayınlar; menü içeriği Turso’da kalır.

## Yerel geliştirme

```bash
cp .env.example .env.local
# Turso yoksa boş bırakın; data/menu.json kullanılır
npm install
npm run dev
```

[http://127.0.0.1:43123](http://127.0.0.1:43123)

## Sayfalar

| Sayfa | Adres |
| --- | --- |
| Müşteri menüsü | `/` |
| Masa QR | `/qr` |
| Yönetim (şifreli) | `/yonetim` |
