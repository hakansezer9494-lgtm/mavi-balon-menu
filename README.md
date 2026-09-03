# Mavi Balon Dijital Menü

QR kod ile açılan dijital menü. Yönetimden kaydettiğiniz kategori, fotoğraf ve fiyat sunucuya yazılır; müşteri menüsü aynı listeyi gösterir.

## İşletmede kullanma

### 1. İçeriği güncelleyin

`/yonetim` sayfasından kategori ekleyin, ürün fotoğrafı ve fiyat girin. Kayıt `data/menu.json` dosyasına gider. Misafir menüsü birkaç saniye içinde yenilenir; sayfayı yenilemek de yeter.

### 2. Siteyi yayınlayın

Müşteri telefonu `localhost` açamaz. Menünün sürekli çalışan bir adresi olmalı.

Bu proje **dosyaya yazar**. Sunucu açık kaldığı sürece (`npm run dev` veya `npm start`) güncellemeler kalır.

Kendi sunucu / VPS:

```bash
npm install
npm run build
npm start
```

80 veya 443 portunu ve bir alan adını bağlayın. `/yonetim` ile fiyat değiştirin; QR aynı kalır, menü güncellenir.

Vercel gibi geçici diskli servislerde kayıt bir süre sonra silinebilir. Canlı menü için bu uygulamayı sürekli açık bir sunucuda çalıştırın.

### 3. QR’ı yazdırın

Yayındaki sitede `/qr` açın, adres `https://` ile başlamalı, **Yazdır** deyin. Tüm masalara aynı kod yeter.

## Sayfalar

| Sayfa | Adres |
| --- | --- |
| Müşteri menüsü | `/` |
| Masa QR | `/qr` |
| Yönetim | `/yonetim` |

## Yerel geliştirme

```bash
npm install
npm run dev
```

[http://127.0.0.1:43123](http://127.0.0.1:43123)
