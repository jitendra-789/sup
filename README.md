# For you, with love

A responsive, six-chapter proposal scrapbook built with React, Vite, Tailwind CSS v4, Framer Motion, and Canvas Confetti. Includes opt-in reaction recording, private Supabase uploads, and local video playback / saving.

## Run

Requires Node.js 20.19+ (Node 22 LTS recommended).

```sh
npm install
npm run dev
```

```sh
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
```

## Make it yours

Edit `src/content.js`: names, opening paragraphs, exact proposal question, closing message, three trivia questions, six reasons, photo labels, and hotspot annotations. The included names, memories, and answers are **sample content**, not personal facts.

Place your files here:

```text
public/assets/photos/1.jpg
public/assets/photos/2.jpg
public/assets/photos/3.jpg
public/assets/background-music.mp3  (optional)
```

Portrait photos work best. Keep at least two entries in `content.photos`; add more as needed. Pins use percentage coordinates `[left, top]`. Missing personal photos fall back to remote Unsplash demo images; replace these before sharing. The welcome collage automatically uses the first two photo entries. Fonts are loaded from Google Fonts; system serif/sans fallbacks are included. Host fonts and images locally for a fully self-contained experience.

Audio never autoplays. The header speaker starts optional background music at volume `0.15`. Missing audio gracefully disables its control. Keep music off for the cleanest microphone recording. The opening chapter is a written letter; no voice recording is needed.

## Recording and privacy

- The Magic Mirror welcome dialog asks consent for reaction recording and, when configured, automatic private delivery. “Enable the magic mirror” opens the normal browser camera/microphone permission prompt. Skipping or denying access never blocks the chapters. The final playback reveal is not disclosed in advance.
- Camera/microphone permission is requested at the beginning, but **recording starts only on the proposal chapter**. The browser camera indicator may stay on while the earlier chapters are open because permission keeps the stream ready.
- The recorder tries `video/mp4;codecs=avc1`, `video/mp4`, `video/webm;codecs=vp9`, and `video/webm`, then the browser default.
- Yes stops the recording after 2.5 seconds and enables private delivery when configured. A three-minute safety limit also stops it if the page stays open, but never uploads before Yes. A confirmed No discards the recording and stops the camera/microphone.
- Camera access requires **HTTPS** (or localhost). Mobile testing over an ordinary LAN HTTP address will not provide camera access; use an HTTPS deployment or trusted tunnel.
- iOS may require sharing the file to save to Photos; download can save to Files instead. Native sharing is shown only when supported. The modal uses `playsInline` and native playback controls.
- Safari / Android may pause or interrupt recording when backgrounded, locked, or during calls. Video cannot be guaranteed under those conditions. Keep the page foregrounded. Streams stop on unmount; the recording is never persisted locally automatically.
- A failed background upload never triggers a popup and has no automatic retry. You can still save the local recording. No recording is made when permissions are unavailable.
- The upload contains the whole proposal-chapter recording (up to three minutes), not a trimmed final smile clip. Tell your recipient who receives it, how long you will retain it, and obtain meaningful consent.

## Supabase private storage

Copy `.env.example` to `.env.local` and fill in the project URL and **anon/publishable browser key** (never a service-role key):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Create a **private**, not public, Storage bucket called `reaction-videos`. An authenticated project owner can retrieve recordings from the dashboard. Do not add anonymous SELECT, UPDATE, or DELETE policies. The app plays the local blob, so it does not need read access.

In the Supabase SQL editor:

```sql
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reaction-videos', 'reaction-videos', false, 104857600,
  array['video/mp4', 'video/webm']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Anonymous reaction insert only"
on storage.objects for insert
to anon
with check (
  bucket_id = 'reaction-videos'
  and name ~ '^reaction-[0-9]+-[0-9a-f-]+\.(mp4|webm)$'
);
```

Audit any pre-existing storage policies: permissive policies combine with OR. A private bucket plus the policy above does not override an older public-read policy. Large recordings may exceed the 100 MiB limit and fail silently; local playback remains available. Configure limits for your intended recording length.

**Security limitation:** Vite environment variables are visible in the browser. An insert-only anon policy prevents reads and overwrites, but anyone with the public key can attempt uploads and consume your quota. For a public-facing production app, replace direct uploads with a rate-limited server/Edge Function issuing short-lived, single-use upload authorization, ideally scoped to an invited recipient. Never place privileged credentials in this frontend.

If no Supabase environment variables are configured, remote delivery is simply disabled; opt-in local recording and saving still work. Recipient consent text must be customized to accurately identify the sender/recipient.

## Deploy

### Pull recordings to your computer

After a recording appears in Supabase, copy `.env.download.example` to `.env.download.local` and set `SUPABASE_SERVICE_ROLE_KEY` to the project's legacy **service_role** key (a server secret key can also be used). Keep `VITE_SUPABASE_URL` in `.env.local`. The browser publishable/anon key cannot read this private bucket.

```sh
npm run videos:pull
```

This downloads root-level MP4/WebM files from `reaction-videos` into the project's `videos/` directory. Run it again to fetch new recordings; existing filenames are skipped and remote originals are never deleted. There is no automatic background sync. `.env.download.local` and `videos/` are excluded from Git. **Never put the private key in a `VITE_` variable, browser code, chat, or frontend deployment settings.** This privileged key is only for running the local script. Local recordings are sensitive; store them securely and respect the recipient's agreed retention preferences.

### Hosting

**Vercel:** import the project; framework Vite; build `npm run build`; output `dist`. Add the two environment variables in project settings and redeploy.

**Netlify:** import the project; build `npm run build`; publish `dist`; set the same environment variables and deploy. No routing rewrites are necessary: chapters are in-memory state, not separate routes.

Both provide HTTPS. Chapter state and unsaved local recordings reset on refresh intentionally. Do not reload before saving a reaction.

## Architecture

- `src/App.jsx`: progressive chapter state, ambient music, navigation progress
- `src/content.js`: editable personalization
- `src/components/CameraGate.jsx`: welcome, consent, permission fallback
- `src/components/OpeningChapter.jsx`: animated written letter
- `src/components/PhotoAnnotations.jsx`: Polaroids and interactive hotspots
- `src/components/TriviaAndReasons.jsx`: trivia and flip cards
- `src/components/ProposalFinale.jsx`: question and bounded playful button
- `src/components/Celebration.jsx`: confetti and keepsake reveal
- `src/components/ReactionRevealModal.jsx`: accessible playback, download, native sharing
- `src/hooks/useReactionRecorder.js`: stream, recorder, cleanup, delayed stop, upload

Reduced-motion preferences disable ambient animation/confetti and the hover dodge. The secondary button remains keyboard reachable and never changes the answer; Yes is always stationary and available. Touch targets, safe-area padding, and dynamic viewport sizing are included.

Memories appear one at a time with previous/next controls; the final photo gets a “cutest scene ever” reveal. After the first playful No-button attempt, a 15-second timer reveals a stationary “Is it really a no? 🙂” option. Confirmation respects a real No with a quiet closing page, without confetti or a reaction upload. Adjust `noButtonDelayMs` in `src/content.js` to change the delay (for example, `10000` for 10 seconds). Cards 3–5 are entries 3–5 of `content.reasons`; the final Yes message is `content.closing`.

## Before sending

Test the full flow on a real iPhone Safari, Android Chrome, and desktop, including denied permission, unavailable camera, offline upload, native video saving, reduced motion, keyboard navigation, and missing audio. Unit tests cover codec selection. Playwright covers the full flow, consent, denial, focus trapping, pending-permission cancellation, and actual recording/playback/download with synthetic camera input in desktop and mobile Chromium viewports. This is not a substitute for real Safari/device checks.
