# Mavi Balon Dijital Menü

QR kod ile açılan dijital menü. Misafirler ürün fotoğrafı ve fiyatı görür; siz yönetim panelinden kategori, ürün, fotoğraf ve fiyat eklersiniz.

## Çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda [http://127.0.0.1:43123](http://127.0.0.1:43123) adresini açın.

## Sayfalar

- `/` — Misafir menüsü (QR buraya gider)
- `/qr` — Masaya basılacak QR kod
- `/yonetim` — Kategori oluşturma, ürün fotoğrafı ve fiyat girişi

Veriler bu tarayıcının `localStorage` alanında tutulur. İlk açılışta hamburger, Antakya döner, broast, Arjantin patatesi ve içecek örnekleri yüklenir.

## Üretim notu

QR kod, uygulamanın açık olduğu adresi kodlar. Telefonda denemek için aynı ağdaki gerçek URL’yi kullanın (`localhost` telefonda açılmaz).
