# Tasarım sistemi

Sakin, sıcak, göz yormayan. Saf beyaz ve saf siyah yok. Tema, işletim sisteminin açık/koyu ayarını izler.

## Renk

Tailwind sınıfları CSS değişkenine bağlıdır. `bg-bg`, `bg-surface`, `text-ink`, `text-muted`, `bg-primary`, `border-line`.

| Token | Açık | Koyu | Kullanım |
|---|---|---|---|
| `bg` | `#F7F5F0` | `#181C1A` | Sayfa zemini |
| `surface` | `#FFFFFF` | `#222823` | Kart |
| `ink` | `#2B2F2A` | `#E8EAE5` | Ana metin |
| `muted` | `#6B7168` | `#9AA39B` | İkincil metin |
| `primary` | `#7FA88A` | `#8FBF9B` | Marka, çip, ikon |
| `primary-hover` | `#5F8A6B` | `#9DCCAA` | Hover yüzeyi |
| `accent` | `#E8B98A` | `#E3B58A` | Vurgu, seçili gün |
| `line` | `#E6E2D8` | `#323A34` | Kenarlık |
| `success` | `#7FA88A` | `#8FBF9B` | Dolgu, ikon |
| `warning` | `#E5B567` | `#E5B567` | Dolgu, ikon |
| `danger` | `#D98A7E` | `#D98A7E` | Dolgu, ikon |

Açık temada adaçayı üstüne beyaz yazı 2.7:1 kalır. Buton dolgusu bu yüzden `primary-fill` (`#3E6A4D`), hover `#345C42`, yazı `on-primary` (`#F7F5F0`). `#5F8A6B` ikon ve kenarlık içindir, küçük yazı zemini değildir. Koyu temada dolgu `#8FBF9B`, yazı `#181C1A`.

Durum metni ayrı token kullanır. Açıkta `danger-text` `#8F4A42`, `warning-text` `#7A5A1C`. Koyuda `#E7B2A8` ve `#F0D09A`. Renk tek başına yetmez: metnin yanında "Hata" veya "Uyarı" yaz.

## Makrolar

Grafik ve lejant aynı tokeni kullanır. Açık zeminde koyulaştırıldı, koyu zeminde açıldı. Hepsi kart üstünde en az 3:1.

| | Açık | Koyu | Sınıf |
|---|---|---|---|
| Kalori | `#C06E2E` | `#E3A56A` | `bg-kcal` / `text-kcal` |
| Protein | `#5F8A6B` | `#8FBF9B` | `bg-protein` |
| Karbonhidrat | `#5C86B4` | `#8FB4D6` | `bg-carb` |
| Yağ | `#A68516` | `#E2C56A` | `bg-fat` |

Lejantta rengin yanında adı yazar: "Protein".

## Yazı

- Başlık: Nunito, `font-display`. `text-h1` 28px, `text-h2` 22px, `text-h3` 18px.
- Gövde: Inter, `font-sans`, 16px, satır 1.6.

## Şekil

- Kart `rounded-card` (16px), `shadow-soft`, iç boşluk en az `p-5` (20px).
- Buton ve input `rounded-control` (12px), yükseklik 48px.
- Aralıklar 8px katı: 8, 16, 24, 32.

## Erişilebilirlik

- Odak: 2px halka, 3px dış boşluk. `focus-visible` yeter.
- `prefers-reduced-motion` animasyonu kapatır.
- Hazır sınıflar: `card`, `btn`, `field`.
