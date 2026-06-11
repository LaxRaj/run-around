# run-around — Project Memory

> Paste this file at the start of a new session to resume with full context.
> Keep it updated as the project evolves.

---

## What this app is

**run-around** is an iOS + Android app that generates dynamic **round-trip running routes** from the user's current GPS location. The user picks a distance and difficulty; the app plots a looping route that starts and ends at their exact position.

Core product values:
- **Zero bloat** — launch → pick distance → see route in < 3 seconds
- **Premium dark-mode UI** — deep blacks, electric indigo/violet accents, fluid animations
- **Real routing** — OpenRouteService Directions API, not fake straight lines

---

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Expo SDK 56, Managed Workflow | TypeScript throughout |
| Navigation | expo-router ~56.2.10 | File-based, `expo-router/entry` as main |
| Styling | NativeWind v4 + Tailwind v3 | `global.css` → `metro.config.js withNativeWind` |
| Animations | react-native-reanimated 4.3.1 | Requires `react-native-worklets ^0.8.3` peer dep |
| Gestures | react-native-gesture-handler ~2.31.1 | Wrapped at root in `GestureHandlerRootView` |
| Map | @rnmapbox/maps 10.3.1 | **Requires dev build** — not Expo Go compatible |
| Routing API | OpenRouteService (ORS) Directions v2 | Round-trip endpoint, foot-walking / foot-hiking profiles |
| Location | expo-location ~56.0.17 | Foreground permission requested on welcome screen |
| Gradients | expo-linear-gradient ~56.0.4 | Used heavily for backgrounds and buttons |
| Storage | @react-native-async-storage/async-storage 2.2.0 | Persists onboarding state + run prefs |
| Auth/DB | Supabase | **Planned — not yet implemented** |

### Dependency quirks (important)
Running `npm install` on Node v25 leaves `@expo/cli` and `babel-preset-expo` nested inside `expo/node_modules/` instead of hoisting them. They are pinned as explicit devDependencies to force hoisting:
```json
"devDependencies": {
  "@expo/cli": "56.1.15",
  "babel-preset-expo": "56.0.15"
}
```
Always use `npm install --legacy-peer-deps` for this project.

---

## Color system (`constants/colors.ts`)

```
Background:   #0A0A0F (root)   #111118 (surface)   #1A1A25 (elevated)
Accent:       #6C3EFF (primary indigo)   #9D6FFF (light)   #3D2299 (muted)
Text:         #FFFFFF (primary)   #8B8B9A (secondary)   #4A4A5A (muted)
Difficulty:   #22D3A5 (easy/emerald)   #F59E0B (moderate/amber)   #FF3B6E (hard/red-pink)
Border:       rgba(255,255,255,0.06) (default)   rgba(108,62,255,0.4) (accent)
```

---

## File structure

```
run-around/
├── app/
│   ├── _layout.tsx              Root layout — GestureHandlerRootView + Stack navigator
│   ├── index.tsx                Splash: reads AsyncStorage → onboarding OR tabs
│   ├── onboarding/
│   │   ├── welcome.tsx          Screen 1: animated brand mark + location permission
│   │   └── preferences.tsx      Screen 2: distance tile picker + difficulty pills
│   └── (tabs)/
│       ├── _layout.tsx          Tabs layout — tab bar hidden (fullscreen map)
│       └── index.tsx            MAP SCREEN — main feature
├── components/
│   ├── map/
│   │   └── RouteSheet.tsx       Bottom sheet: settings badges, stats row, CTA buttons
│   └── ui/
│       ├── GlowButton.tsx       Gradient pill button with spring press + iOS shadow glow
│       ├── StepDots.tsx         Animated progress dots (active dot spring-expands)
│       ├── DistanceSelector.tsx Horizontal tile scroll, preset values, big number readout
│       └── DifficultySelector.tsx Three pills (Easy/Moderate/Hard) with per-color theming
├── constants/
│   └── colors.ts                Color tokens + DifficultyLevel type + DISTANCE_PRESETS
├── hooks/
│   └── useRunPreferences.ts     Loads miles + difficulty from AsyncStorage on mount
├── services/
│   └── ors.ts                   ORS API client, routeBounds(), unit formatters
├── store/
│   └── onboarding.ts            AsyncStorage helpers: prefs + onboarding complete flag
├── app.json                     Expo config — dark UI, location permissions, Mapbox plugin
├── babel.config.js              NativeWind + Reanimated babel plugins
├── metro.config.js              withNativeWind wrapper
├── tailwind.config.js           Custom color tokens matching constants/colors.ts
├── global.css                   @tailwind directives
└── .env.example                 Template for EXPO_PUBLIC_MAPBOX_TOKEN + EXPO_PUBLIC_ORS_API_KEY
```

---

## Navigation flow

```
app/index.tsx
  ├── onboarding incomplete → /onboarding/welcome
  │     └── "Allow Location" → /onboarding/preferences
  │           └── "Find My Route →" → /(tabs)   [first time]
  └── onboarding complete   → /(tabs)
        └── "edit ›" in RouteSheet → /onboarding/preferences
              └── "Save & Return →" → router.back() → /(tabs)
```

---

## Map screen detail (`app/(tabs)/index.tsx`)

**On mount:**
1. Acquires foreground location permission (already granted from onboarding)
2. Gets current GPS coords, flies camera to user at zoom 14.5
3. Loads run prefs from AsyncStorage via `useRunPreferences`

**Route generation flow:**
1. `fetchRoundTripRoute(lat, lng, miles, difficulty, seed)` → POST to ORS
2. Route fades in (Reanimated opacity 0 → 1, 600ms)
3. Camera `fitBounds()` to route bounding box with 340px bottom padding (clears the sheet)
4. Stats card animates up: distance / est. time / elevation gain

**Mapbox layers (3-layer glow effect):**
```
routeGlow  — lineColor: #9D6FFF, lineWidth: 16, lineBlur: 8, opacity: 20%
routeHalo  — lineColor: #6C3EFF, lineWidth: 8,  opacity: driven by routeOpacity
routeCore  — lineColor: #FFFFFF, lineWidth: 2.5, opacity: driven by routeOpacity
```

**Start/finish markers:**
- Outer ring: indigo circle, 30% opacity
- Inner dot: white circle with indigo stroke

**Fallback when no Mapbox token:** dark grid placeholder renders instead of crashing. ORS sheet still works.

---

## ORS API (`services/ors.ts`)

**Endpoint:** `POST https://api.openrouteservice.org/v2/directions/{profile}/geojson`

**Profile mapping:**
```
easy     → foot-walking
moderate → foot-hiking
hard     → foot-hiking  + steepness_difficulty: { level: 3 }
```

**Request body:**
```json
{
  "coordinates": [[longitude, latitude]],
  "options": {
    "round_trip": { "length": <meters>, "points": 3, "seed": <int> }
  },
  "elevation": true
}
```

**Seed:** random int per generation, new seed on "Try different" → different route shape each time.

**Response fields used:**
- `features[0].geometry.coordinates` → `[lng, lat][]` (already in GeoJSON order)
- `features[0].properties.summary.distance` → meters
- `features[0].properties.summary.duration` → seconds
- `features[0].properties.ascent` → meters elevation gain

**Exported helpers:** `metersToMiles()`, `secondsToMinutes()`, `metersToFeet()`, `routeBounds()`

---

## Environment variables

```bash
EXPO_PUBLIC_MAPBOX_TOKEN=pk.xxx   # Public token — safe to ship in app bundle
EXPO_PUBLIC_ORS_API_KEY=xxx       # ORS key — also public-facing in this setup
```

Get Mapbox token: https://account.mapbox.com/access-tokens/
Get ORS key: https://openrouteservice.org/dev/#/signup

---

## Running the project

```bash
# Start Metro (dev server)
npm start

# The @expo/cli symlink fix needed after fresh npm install:
ln -sf node_modules/expo/node_modules/@expo/cli node_modules/@expo/cli
```

**Metro is at `http://localhost:8081`** — confirm with `curl localhost:8081/status`.

### To get the app running on a real device

`@rnmapbox/maps` requires a **native dev build** — Expo Go will not work.

**Option A — EAS Build (no Xcode needed):**
```bash
npm install -g eas-cli && eas login
cp .env.example .env  # fill in tokens
eas build --platform ios --profile development
```

**Option B — Local native (requires Xcode):**
```bash
cp .env.example .env
npx expo run:ios
```

> Xcode is **not** currently installed on this machine. Only CLT (`xcode-select -p` → `/Library/Developer/CommandLineTools`). EAS Build is the recommended path.

---

## What's done

- [x] Expo SDK 56 project scaffolded with expo-router
- [x] NativeWind v4 configured (babel + metro + tailwind)
- [x] Onboarding Screen 1 — welcome, brand mark animation, location permission
- [x] Onboarding Screen 2 — distance tile picker, difficulty pills, summary card
- [x] `AsyncStorage` prefs persistence (`miles`, `difficulty`)
- [x] Map screen with Mapbox dark-v11 style
- [x] 3-layer glow route polyline
- [x] ORS round-trip route generation
- [x] Camera fly-to-fit on route arrival
- [x] RouteSheet — stats (distance / time / elevation), regenerate, edit prefs
- [x] Edit prefs → map back-navigation flow
- [x] `.gitignore` (node_modules, .expo, .env excluded)
- [x] Everything pushed to `github.com/LaxRaj/run-around` → main

## What's next

- [ ] **Supabase** — auth (email/Apple), user profiles table
- [ ] **Save route** — "Save this loop" → stores GeoJSON + stats in Supabase
- [ ] **Saved routes screen** — list of past loops with map thumbnails
- [ ] **Active run mode** — real-time GPS tracking overlay on the route, distance counter
- [ ] **Elevation profile** — mini chart below the stats row in RouteSheet
- [ ] **Route sharing** — deep link that opens a saved route for another user
- [ ] **App icon + splash screen** — custom branded assets
- [ ] **EAS build config** — `eas.json` with dev/preview/production profiles
- [ ] **Push notifications** — weekly run streak reminder (Expo Notifications)
