# Yayın: Neon + Vercel

Veritabanı Neon. Tek bağlantı adresi yeter. Supabase, pooler ve DIRECT_URL yok.

## 1. Neon

1. [https://neon.tech](https://neon.tech) → GitHub ile kayıt.
2. **Create project**. Bölge olarak Avrupa (Frankfurt) seçebilirsin.
3. **Connection string** kutusundan adresi kopyala. `sslmode=require` ile biter.

## 2. Bilgisayarında dene

`calorie-tracker\.env`:

```env
DATABASE_URL="neon-adresin"
NEXTAUTH_SECRET="en-az-32-karakter-rastgele"
NEXTAUTH_URL="http://localhost:3000"
```

`DIRECT_URL` satırını sil.

```powershell
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## 3. Vercel

1. Projeyi GitHub'a koy. `.env` repoya girmesin.
2. [vercel.com](https://vercel.com) → **Add New → Project**.
3. Environment Variables:

| Ad | Değer |
|---|---|
| `DATABASE_URL` | Neon adresin |
| `NEXTAUTH_SECRET` | Aynı gizli anahtar |
| `NEXTAUTH_URL` | `https://satin-alacagin-domain.com` |

4. Deploy.

## 4. Domain

Vercel → projen → **Settings → Domains** → satın aldığın adresi yaz. Vercel sana DNS kaydını gösterir. Onu domain firmasının panelinde ekle. Sertifika kendiliğinden gelir.

Domain bağlanınca `NEXTAUTH_URL` değerini `https://adresin.com` yapıp yeniden deploy et.
