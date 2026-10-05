# 08 · Analytics

Menggunakan **Umami** self-hosted: tanpa cookie (tidak perlu banner), data milik sendiri. Alasan: ADR 0004.

## 1. Yang diukur

| Metrik | Sumber |
|---|---|
| Pengunjung unik, page views, durasi | Otomatis |
| Sumber trafik (LinkedIn, Instagram, Google, langsung) | Otomatis (referrer + UTM) |
| Negara, perangkat, browser, bahasa | Otomatis |
| Download CV / Portfolio (per bahasa) | Event |
| Klik ke LinkedIn, Instagram, GitHub, email | Event |
| Proyek yang dibuka | Event |
| Ganti bahasa | Event |
| Asal lamaran (`?ref=`) | Query param, otomatis tercatat |

## 2. Daftar event

Nama event didefinisikan di **satu tempat**: `src/lib/analytics/events.ts`. Jangan menulis string event langsung di komponen.

| Event | Data | Dipicu oleh |
|---|---|---|
| `download-cv` | `{ lang: 'en' \| 'id' }` | Tombol Download CV |
| `download-portfolio` | `{ lang }` | Tombol Portfolio PDF |
| `outbound-linkedin` / `outbound-instagram` / `outbound-github` / `outbound-email` | `{ location: 'header' \| 'hero' \| 'footer' \| 'contact' }` | Klik tautan sosial |
| `project-open` | `{ slug }` | Membuka detail proyek |
| `journey-open` | `{ milestone }` | Klik titik Journey |
| `lang-switch` | `{ to }` | Tombol bahasa |

Implementasi: atribut `data-umami-event` dan `data-umami-event-*` di elemen, dibuat oleh helper agar nama event selalu dari konstanta.

## 3. Link pelacak per lamaran

Saat melamar ke perusahaan, kirim tautan dengan parameter `ref`:

```
https://harry.mardika.my.id/?ref=tokopedia-ml-engineer
```

Di dashboard Umami, filter **Query parameters → ref** untuk melihat apakah tautan dibuka, kapan, dan apakah CV diunduh.
Gunakan format `<perusahaan>-<posisi>`, huruf kecil, tanpa spasi.

## 4. Privasi

- Script tracking hanya dimuat di production (`PUBLIC_UMAMI_WEBSITE_ID` terisi).
- Tidak ada data pribadi pengunjung yang dikumpulkan; IP tidak disimpan oleh Umami.
- Halaman `/print/*` tidak dilacak.

## 5. Counter publik

Statistik **tidak** ditampilkan di beranda. Jika ingin ditampilkan, taruh di `/homelab` sebagai "live stats" (via Umami API dari proses build, bukan dari browser, agar token tidak bocor).
