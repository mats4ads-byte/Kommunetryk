# Kommunal Grafisk Platform — MVP (Next.js + Prisma)

Dette projekt er en **kodestart** baseret på låste Kapitel 1–3:
- Organisation & brugere (flere brugere pr. kommune)
- Leverandører (manuel godkendelse)
- Skilte (konfigurator + levering + send til leverandører)
- Default produktionskrav = **EU**

## 1) Krav
- Node.js 18+
- En Postgres database (lokalt eller cloud)

## 2) Opsætning
1. Kopiér `.env.example` til `.env` og ret `DATABASE_URL` + `SESSION_SECRET`
2. Installer dependencies:
   ```bash
   npm install
   ```
3. Kør migrationer:
   ```bash
   npm run prisma:migrate
   ```
4. Seed demo-data:
   ```bash
   npm run seed
   ```
5. Start dev server:
   ```bash
   npm run dev
   ```

## 3) Demo logins (efter seed)
- Kommune admin: `admin@syddjurs.demo` / `Demo1234!`
- Kommune bruger: `user@syddjurs.demo` / `Demo1234!`
- Leverandør: `supplier@leverandoer.demo` / `Demo1234!`

## 4) MVP-flows der er lagt ind
- Kommune: Dashboard → Opgaver → Opret skilte-opgave → Gem kladde → Send til leverandører
- Leverandør: Dashboard → Leverandør opgaver (invitations)

## 5) Næste moduler (Kapitel 4–6)
- Tilbud (leverandør): prisopdeling, dokumentation-upload
- Kommune: tilbudssammenligning + tildeling inkl. EAN/fakturaref/kontakt
- Arkiv + eksport

## Noter
- Session er en enkel cookie-baseret MVP-løsning (ikke production-ready).
- I production anbefales Auth.js eller Supabase Auth + proper CSRF + rotation.

