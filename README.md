# Vocali Frontend

Nuxt 3 + Pinia + Tailwind CSS project for authentication and audio transcription.

## Requirements

- Node.js 18+
- npm 9+

## Setup

1. Install dependencies:

   ```sh
   npm install --legacy-peer-deps
   ```

2. Copy the `.env` file and set your variables:

   ```sh
   cp .env.example .env
   # Edit .env with your credentials and endpoints
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

4. Open the app in your browser:
   - [http://localhost:3001](http://localhost:3001)

## Features

- Register and login with AWS Cognito
- Record and convert audio to MP3 (lamejs, no ffmpeg)
- Upload MP3 files to the backend
- Real-time transcription (coming soon)

## Useful Scripts

- `npm run dev` — Development server
- `npm run build` — Build for production
- `npm run generate` — Generate static site
- `npm run lint` — Type and lint check

## Troubleshooting

If you encounter dependency errors during installation (common with some npm versions), use the following command:

```sh
npm install --legacy-peer-deps
```

This will force npm to resolve dependencies in a way compatible with older peer dependency rules.

---

**Made with Nuxt 3, Pinia, Tailwind **
