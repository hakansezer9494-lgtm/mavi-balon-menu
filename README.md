# Mavi Balon Dijital Menü

QR kod ile açılan dijital menü. Misafirler ürün fotoğrafı ve fiyatı görür; siz yönetim panelinden kategori, ürün, fotoğraf ve fiyat eklersiniz.

## İşletmede kullanma

Üç adım: menüyü doldur, internete koy, QR’ı bas.

### 1. Menüyü doldurun

1. `npm install` ve `npm run dev`
2. [http://127.0.0.1:43123/yonetim](http://127.0.0.1:43123/yonetim) adresini açın
3. Kategori ekleyin (Hamburger, Antakya Döner, Broast, …)
4. Her ürüne fotoğraf, isim ve fiyat girin
5. [http://127.0.0.1:43123](http://127.0.0.1:43123) üzerinden menüyü kontrol edin

Yönetimdeki değişiklikler **bu tarayıcıda** saklanır. Müşterinin telefonu sizin bilgisayarınızdaki listeyi görmez. Yayına almadan önce ürünleri buradan netleştirin; yayındaki herkes örnek veya sizin sabitlediğiniz menüyü görür.

### 2. Siteyi internete yayınlayın

Müşteri telefonu `localhost` veya `127.0.0.1` açamaz. Menünün herkesin gireceği bir adresi olmalı (örnek: `https://mavibalon.vercel.app`).

[Vercel](https://vercel.com) ile (ücretsiz hesap yeter):

```bash
npm i -g vercel
vercel
```

Komut bir canlı URL verir. O URL’yi tarayıcıda açıp menünün göründüğünü kontrol edin.

Kendi sunucunuz varsa:

```bash
npm run build
npm start
```

Sunucuyu `0.0.0.0` ve 80/443 üzerinden yayınlayın; mümkünse bir alan adı bağlayın.

### 3. QR’ı yazdırıp masaya koyun

1. Canlı sitede `/qr` sayfasını açın (örnek: `https://sizin-adresiniz/qr`)
2. Kodun altındaki adres `https://...` olmalı; `127.0.0.1` ise henüz yayında değilsiniz
3. **Yazdır** deyin, A5 veya kare kart olarak masaya / kapıya yapıştırın
4. Kendi telefonunuzla okutup menünün açıldığını deneyin

Bir QR yeter; tüm masalara aynı kodu basabilirsiniz.

## Günlük kullanım

| Ne yapmak istiyorsunuz | Nereye gidin |
| --- | --- |
| Müşteri menüsü | `/` |
| Masa QR’si | `/qr` |
| Kategori, fotoğraf, fiyat | `/yonetim` |

Fiyat veya ürün değişince yönetimden kaydedin. Yayındaki menünün her telefonda aynı kalması için ürünleri proje dosyasına işleyip yeniden yayınlamak gerekir; aksi halde yalnızca sizin tarayıcınız güncellenir.

## Yerel geliştirme

```bash
npm install
npm run dev
```

Tarayıcı: [http://127.0.0.1:43123](http://127.0.0.1:43123)
