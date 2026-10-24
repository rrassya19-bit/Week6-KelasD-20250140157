# Ragam — Katalog Produk & Nota Pesanan

![Tampilan hero](<screenshot/Screenshot 2026-10-24 162050.png>)

![Tampilan katalog](<screenshot/Screenshot 2026-10-24 162118.png>)

![Tampilan nota pesanan](<screenshot/Screenshot 2026-10-24 162212.png>)

## Daftar Isi

- [Tentang Proyek](#tentang-proyek)
- [Fitur Utama](#fitur-utama)
- [Teknologi](#teknologi)
- [Struktur Proyek](#struktur-proyek)
- [Penjelasan Tiap File](#penjelasan-tiap-file)
- [Cara Menjalankan](#cara-menjalankan)
- [Alur Penggunaan](#alur-penggunaan)
- [Catatan](#catatan)
- [Kredit](#kredit)

## Tentang Proyek

**Ragam** adalah aplikasi web satu halaman untuk memilih produk dari katalog lalu
mencetak nota pesanan. Seluruh data produk (nama, harga, stok, kategori, gambar)
diambil langsung dari API publik [dummyjson.com](https://dummyjson.com).

Pengguna menekan tombol **Pesan** pada salah satu kartu produk, mengisi form
(nama, jumlah, catatan), lalu nota pesanan langsung muncul di halaman yang sama
tanpa reload. Proyek ini dibuat sebagai tugas praktikum Pengembangan Aplikasi Web
(PAW) Week 6 dan sengaja tidak memakai framework, build tool, maupun library
tambahan — semuanya HTML, CSS, dan JavaScript murni.

## Fitur Utama

- **Katalog produk** — 30 produk dari `https://dummyjson.com/products` dengan
  gambar, kategori, merek, harga, dan stok.
- **Pemuatan bertahap** — skeleton loading berdenyut saat data dimuat, serta
  pesan error dan tombol **Coba lagi** bila permintaan gagal.
- **Pemilihan produk** — kartu yang dipilih ditandai, detailnya tampil di form,
  dan batas jumlah otomatis mengikuti stok serta `minimumOrderQuantity`.
- **Validasi form** — nama 3–60 karakter, jumlah berupa bilangan bulat antara
  minimal order dan stok, catatan maksimal 120 karakter. Pesan kesalahan muncul
  tepat di bawah isian yang bermasalah dan fokus diarahkan ke isian pertama.
- **Nota pesanan** — nomor nota berurutan (`No. 001`), tanggal, rincian
  `jumlah x harga`, total, nama pemesan, dan catatan opsional.
- **Animasi** — parallax saat scroll, dinding gambar produk bergerak di hero,
  marquee berjalan, reveal dua arah, dan statistik yang menghitung naik.
- **Aksesibilitas** — skip link, `aria-live` untuk status, `aria-invalid` pada
  isian yang salah, label form, fokus yang terlihat, dan dukungan
  `prefers-reduced-motion` untuk mematikan animasi.
- **Responsif** — tata letak menyesuaikan desktop, tablet, dan ponsel.

## Teknologi

| Bagian | Keterangan |
| --- | --- |
| Markup | HTML5 semantik |
| Styling | CSS3 — custom properties, Grid, Flexbox, animasi/keyframes |
| Logika | JavaScript (ES6+) tanpa framework |
| Data | REST API `dummyjson.com/products` |
| API browser | Fetch API, IntersectionObserver, ResizeObserver, `requestAnimationFrame`, `matchMedia` |
| Build tool | Tidak ada — cukup buka file HTML |

## Struktur Proyek

```
Week6-KelasD-20250140157/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── script.js
├── screenshot/
│   ├── Screenshot 2026-10-24 162050.png
│   ├── Screenshot 2026-10-24 162118.png
│   └── Screenshot 2026-10-24 162212.png
└── README.md
```

## Penjelasan Tiap File

### `index.html`

Kerangka halaman sekaligus tempat semua elemen yang dikendalikan JavaScript
(ditandai `id`). Bagian-bagiannya:

- **`<head>`** — meta charset, viewport, deskripsi SEO, preconnect ke CDN
  dummyjson, favicon SVG inline, stylesheet, dan skrip kecil yang menambahkan
  class `js` ke `<html>` (dipakai CSS agar animasi hanya aktif bila JS berjalan).
- **Header (`#kepala`)** — logo "ragam.", navigasi ke Katalog dan Nota, tombol
  **Buat nota**. Bersifat sticky dan mengecil saat halaman digulir.
- **Hero (`#panggung`)** — latar parallax dengan tirai gelap, dinding gambar
  produk (`#dindingHero`), judul dua baris, deskripsi, dan dua tombol aksi.
- **Statistik (`#fakta`)** — jumlah barang (`#faktaBarang`), jumlah kategori
  (`#faktaKategori`), dan rentang harga (`#faktaHarga`).
- **Marquee** — teks berjalan berisi langkah penggunaan, murni dekoratif
  (`aria-hidden`).
- **Katalog (`#katalog`, `#daftarProduk`)** — judul bagian, jumlah produk
  (`#jumlahProduk`), status memuat (`#statusMemuat`), blok error (`#statusGagal`
  + `#tombolCobaLagi`), dan grid tempat kartu produk dirender.
- **Nota (`#nota`)** — dua kolom: form pesanan (`#formPesanan`) berisi nama
  (`#namaPemesan`), jumlah (`#jumlah`), catatan (`#catatan`), tombol
  **Buat nota**/**Kosongkan**, serta kertas nota (`#isiNotaKertas`) dengan
  `#nomorNota`, `#notaKosong`, dan `#isiNota`.
- **Footer** — identitas proyek, tautan navigasi, kredit penulis, dan copyright.

### `css/style.css`

Satu berkas stylesheet untuk seluruh tampilan. Isinya dikelompokkan dengan
komentar per bagian:

1. **Token desain (`:root`)** — palet warna (hijau tua, krem, sage, merah untuk
   error), radius, skala spacing `--s1`–`--s9`, lebar maksimum `--lebar`,
   durasi/easing animasi, dan font stack sistem.
2. **Reset & dasar** — `box-sizing`, normalisasi margin, `[hidden]`, fokus
   `:focus-visible`, skip link, dan pengaturan `scroll-behavior`.
3. **Komponen** — header, tombol (garis, gelap, krem, teks), kartu produk,
   kerangka (skeleton), form dan pesan error, kertas nota, serta footer.
4. **Efek visual** — tirai gradient, parallax `--geser`, dinding kolom hero,
   blob, marquee, dan keyframes (`dindingNaik`, `blobSatu`, `denyut`, `naik`,
   `geser`).
5. **Animasi reveal** — class `.reveal`, arah masuk `reveal--dari-atas`/
   `reveal--dari-bawah`, dan state `.is-visible`.
6. **Responsif** — media query `1080px`, `900px`, dan `640px` (grid katalog,
   tata letak nota, ukuran judul, penyederhanaan hero).
7. **`prefers-reduced-motion`** — mematikan animasi, transisi, parallax, dan
   marquee bagi pengguna yang mengaktifkan pengurangan gerak.

Latar panggung parallax memakai gradient CSS, jadi proyek tidak membutuhkan
berkas gambar eksternal.

### `js/script.js`

Seluruh logika aplikasi dalam satu berkas, tanpa dependency. Bagian pentingnya:

- **Konstanta & state** — alamat API, ambang animasi, media query
  (`prefers-reduced-motion`, mouse desktop, layar sempit), `state.produk`,
  `state.terpilih`, `state.nomor`, dan data statistik.
- **Animasi masuk** — `IntersectionObserver` untuk `.reveal`, hero, judul, dan
  statistik; class reveal dilepas saat elemen keluar layar sehingga animasi
  dapat terulang dua arah.
- **Loop scroll** — smooth scroll, parallax, dan efek kursor dijalankan dalam
  satu `requestAnimationFrame` agar hemat dan tidak saling bertabrakan. Input
  roda, tombol panah/PageUp/PageDown/Home/End, dan klik anchor ikut ditangani,
  dengan pengecualian untuk area yang memang bisa digulir sendiri.
- **`isiDindingHero()`** — membangun 3 kolom (2 di ponsel) gambar produk yang
  bergerak naik-turun tanpa henti.
- **`ambilProduk()`** — mengambil data via `fetch`, menangani status loading,
  error, dan respons tak terduga, lalu memanggil render katalog serta statistik.
- **Render katalog** — `renderKerangka()` untuk skeleton, `buatKartu()` untuk
  satu kartu, `renderKatalog()` untuk seluruh grid.
- **Statistik** — `isiFakta()` menghitung jumlah barang/kategori dan rentang
  harga, `mulaiHitungFakta()` menganimasikan angka naik dengan easing.
- **Pemilihan & validasi** — `pilihProduk()` menyimpan barang terpilih,
  `validasiForm()` memeriksa semua isian, `tampilkanError()`/`hapusError()`
  mengatur pesan dan `aria-invalid`.
- **Nota** — `buatNota()` menyusun tanggal, rincian, total, dan nomor nota
  berurutan, lalu menampilkannya di kertas nota.
- **Event** — submit form, input (membersihkan error), tombol kosongkan, tombol
  coba lagi, resize, perubahan media query, serta inisialisasi saat halaman
  dimuat.

### `screenshot/`

Dokumentasi visual aplikasi yang dipakai di bagian atas README:

| Berkas | Isi |
| --- | --- |
| `Screenshot 2026-10-24 162050.png` | Hero dan statistik katalog |
| `Screenshot 2026-10-24 162118.png` | Grid katalog produk |
| `Screenshot 2026-10-24 162212.png` | Form pesanan dan kertas nota |

### `README.md`

Dokumen ini — menjelaskan proyek, fitur, struktur, dan cara menjalankan.

## Cara Menjalankan

Tidak ada proses instalasi atau build. Pilih salah satu:

1. **Langsung** — buka `index.html` di browser (klik dua kali).
2. **Live Server** — buka folder proyek di VS Code, klik kanan `index.html`,
   lalu **Open with Live Server**.
3. **Server lokal** — jalankan dari folder proyek:
   ```bash
   python -m http.server 8000
   ```
   lalu buka `http://localhost:8000`.

Koneksi internet diperlukan karena katalog diambil dari API dummyjson. Bila
permintaan gagal, akan muncul pesan error dan tombol **Coba lagi**.

## Alur Penggunaan

1. Gulir ke bagian **Katalog** (atau tekan **Lihat katalog** di hero).
2. Tekan **Pesan** pada produk yang diinginkan.
3. Isi **Nama pemesan**, **Jumlah**, dan **Catatan** (opsional).
4. Tekan **Buat nota** — nota muncul di kolom kanan dengan nomor dan total.
5. Tekan **Kosongkan** untuk memulai pesanan baru.

## Catatan

- Harga ditampilkan dalam dolar AS (USD) mengikuti data dummyjson, dengan format
  `en-US`.
- Data pesanan hanya disimpan di memori halaman; nomor nota kembali ke
  `No. 001` setelah halaman dimuat ulang.
- Proyek tidak memakai framework, library, atau build tool apa pun.

## Kredit

Dikembangkan oleh **Ahmad Rassya Maulana (20250140157)** — Teknologi Informasi,
Universitas Muhammadiyah Yogyakarta.

Tugas Praktikum Pengembangan Aplikasi Web (PAW) Week 6.

Sumber data produk: [dummyjson.com](https://dummyjson.com).
