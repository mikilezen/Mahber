# Mahber

![Mahber Logo](/assets/Group.png)

Mahber is a Next.js community platform for Ethiopian mahbers with real-time style engagement flows, role-based admin tools, social authentication, and MongoDB-backed persistence.

## Highlights

- Community feed with trending and wars views
- Mahber creation with optional social links
- Detail pages with polls, join, and boost actions
- Verification request flow and super-admin approval
- War creation for selected mahber pairs (admin)
- TikTok and Google login support
- MongoDB as source of truth

## Tech Stack

- Next.js 16 (App Router)
- React 19
- MongoDB Node.js driver
- ESLint (Next.js config)

## Project Structure

```text
app/
app/api/
app/api/auth/
app/api/mahbers/
app/api/wars/
app/admin/
app/login/
app/mahber/[slug]/
app/user/
components/
components/auth/
components/ui/
lib/
lib/auth/
lib/mongodb.js
public/
public/assets/
```

## Prerequisites

- Node.js 20+
- npm 10+
- MongoDB database (local or hosted)

## Environment Variables

Create a `.env.local` file in the project root.

```bash
MONGODB_URI=
MONGODB_DB=mahber

SUPER_ADMIN_USERNAME=mikile

TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

Notes:

- If TikTok credentials are missing, TikTok login redirects back to login.
- If Google credentials are missing, Google login shows not configured message.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build production bundle
- `npm run start` - Run production server
- `npm run lint` - Run lint checks

## Authentication Model

- Session profile is stored in a secure HTTP-only cookie (`tiktok_profile`)
- Social auth callbacks normalize profile data to the same session format
- Admin-only operations validate super-admin identity on server routes

## Production Notes

- API routes include request-size and page-size controls
- Join/boost counters are persisted server-side
- Poll and interaction writes are protected behind session checks

## Deployment

Recommended: Vercel.

1. Import repository
2. Add all environment variables in project settings
3. Deploy

For self-hosting:

```bash
npm run build
npm run start
```

## Troubleshooting

### Hydration mismatch warnings

If you see warnings with injected attributes like `bis_skin_checked`, this is often caused by browser extensions modifying DOM before hydration. Test in Incognito or disable extensions for localhost.

### Git push rejected (non-fast-forward or unrelated histories)

Use:

```bash
git pull --no-rebase --allow-unrelated-histories origin main
git push --set-upstream origin main
```

## License

This repository includes a `LICENSE` file.
