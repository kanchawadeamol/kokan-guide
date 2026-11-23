# Mobile app

Expo SDK 58 + React Native 0.88 + Expo Router + TypeScript (strict). Android and iOS.
Accessibility target: TalkBack / VoiceOver, system text scaling, 48dp touch targets.

## Preview in a browser (quickest)

```bash
npm run web -w apps/mobile        # http://localhost:8081, use a phone-sized window
```

Screens: Home dashboard (every feature with a description and "Login required" / "Coming
soon" badges), Search, Saved, Profile tabs; owner dashboard (`/owner`); coming-soon pages
(`/feature/map`, `/feature/assistant`, `/feature/trip`); category and listing pages; login
(`/auth/login`, preview OTP **123456**); register; business registration
(`/business/new`); report and review; settings. All data is clearly-labelled sample data and
no form sends anything to a server yet. Which features need login: `docs/mobile/access.md`.

## Test on your phone (Expo Go, no Android/Java build needed)

1. Install **Expo Go** (Play Store / App Store). Phone and PC on the **same Wi-Fi**.
2. From the repo root: `npm run mobile:lan`. It finds this PC's Wi-Fi IP, writes
   `apps/mobile/.env.local` and sets `API_BIND_ADDRESS` in `.env` (this PC's LAN IP only;
   the database stays private).
3. `docker compose up -d --wait`: restarts the API listening on that IP. Allow Docker through
   Windows Firewall if asked. On the phone's browser, `http://<ip>:8000/api/v1/health` should
   show `{"status":"ok"...}`.
4. `npm run start -w apps/mobile`, then scan the QR code (Android: in Expo Go; iPhone: Camera
   app).
5. When finished: `npm run mobile:lan -- --off && docker compose up -d --wait`.

If the phone cannot connect (guest Wi-Fi, client isolation): `npx expo start --tunnel`.

## Test in the Android Studio emulator (Expo Go)

No native build and no Java 17 needed: Expo Go runs the JavaScript bundle on the emulator.

1. Android Studio → **Device Manager** → start a virtual device (any API 29+ image, e.g.
   "Pixel 3 API 29"). Or from a terminal:
   `& "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe" -avd Pixel_3_API_29`
2. Point the app at the API through the emulator's host alias. In `apps/mobile/.env.local`:
   `EXPO_PUBLIC_API_URL=http://10.0.2.2:8000` (`10.0.2.2` is this PC's `127.0.0.1` as seen
   from the emulator, so the default Compose binding works unchanged).
3. From the repo root: `docker compose up -d --wait`.
4. `npm run android -w apps/mobile`. Expo installs Expo Go on the emulator the first time and
   opens the app. Press `r` in the terminal to reload, `m` for the dev menu.

If Expo cannot find the emulator, check `adb devices` (in
`%LOCALAPPDATA%\Android\Sdk\platform-tools`) lists it. A standalone APK
(`npx expo run:android` or an EAS build) needs Java 17+; this machine has Java 8.

## Run

```bash
docker compose up -d --wait            # from repo root: backend API
npm run start -w apps/mobile           # Metro + Expo dev tools
```

The API URL is a build-time public variable. Expo reads `.env*` files from `apps/mobile`, not
the repository root. Create `apps/mobile/.env.local` (gitignored):

```bash
# Your computer's LAN IP; 127.0.0.1 on a phone is the phone itself.
# Android emulator: http://10.0.2.2:8000
EXPO_PUBLIC_API_URL=http://192.168.1.10:8000
```

Read it only as the literal `process.env.EXPO_PUBLIC_API_URL`: Expo inlines public
variables for dot notation only. Each one is declared in `src/env.d.ts`. Never put secrets in
`EXPO_PUBLIC_*` variables: they ship inside the app bundle.

Note: the dev Compose stack binds the API to `127.0.0.1`. To reach it from a physical device,
publish it on your LAN IP temporarily, or use the Android emulator (`10.0.2.2`).

If the URL is missing or invalid, the app shows a localized configuration error instead of
crashing (`src/screens/ConfigErrorScreen.tsx`).

## Structure

```
app/                 # Expo Router routes (_layout.tsx, index.tsx)
src/
  AppProviders.tsx   # SafeArea + i18n + API client providers (also used by tests)
  i18n/              # messages (en/mr/hi), provider (device languages via expo-localization)
  theme/useTheme.ts  # light/dark semantic tokens from @konkan/design-tokens
  components/        # LanguagePicker (accessible radio group)
  features/          # system-status (shared fetchReadiness from @konkan/api-client)
  screens/
.maestro/            # Maestro end-to-end flows
```

Styles use `StyleSheet.create` with design tokens via `createStyles(theme)` factories, with no
raw colours or ad-hoc inline styles.

## Tests and checks

```bash
npm run test -w apps/mobile        # Jest + jest-expo + React Native Testing Library
npm run typecheck -w apps/mobile
npm run doctor -w apps/mobile      # expo-doctor: SDK version compatibility, duplicate deps
```

RNTL 14 notes: `render` and `fireEvent` are async, so always `await` them. `render` flushes
resolved promises, so test loading states with a request that never settles.
`react-native-safe-area-context` is mocked in `jest.setup.js` (it renders nothing without
native inset measurements).

Accessibility is asserted through roles, states and names (what TalkBack/VoiceOver read),
plus a check that every interactive control has a 48dp minimum height.

### Maestro (end-to-end)

Requires **Java 17+**, the Maestro CLI, a dev build of the app and a running emulator or
device:

```bash
npx expo run:android               # dev build (Gradle also needs Java 17+)
maestro test .maestro -e APP_ID=<android package of the dev build>
```

The smoke flow (`.maestro/smoke.yaml`) is written but **not yet run**: this machine has
Java 8. See `docs/development-checklist.md`.

## Monorepo notes

- Expo SDK 58 pins React to exactly `19.3.0`; React Native checks that `react` matches its
  renderer at runtime. The whole repo uses React 19.3.0 via root `overrides`, with one hoisted
  copy. `expo-doctor` checks for duplicates.
- Metro's monorepo support is automatic (SDK 52+); workspace packages are resolved through
  their `exports` field and compiled from TypeScript source.
