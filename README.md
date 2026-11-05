# Kalori Takip

Next.js + Prisma + Neon (PostgreSQL).

`.env` içinde tek adres var: `DATABASE_URL`. Sonra:

```powershell
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Testler: `npm test`

Yayın: [DEPLOY.md](DEPLOY.md)

## Üyelik

- `/giris` `/kayit` `/sifre-sifirla`
- Şifreler bcrypt ile hashlenir
- Oturum httpOnly JWT çerezindedir
- `/dashboard` ve `/log` girişsiz açılmaz
- 5 hatalı girişten sonra aynı IP 15 dakika kilitlenir
- Yerel sürümde sıfırlama bağlantısı ekranda gösterilir (e-posta sunucusu yok)
