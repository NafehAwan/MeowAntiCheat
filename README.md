# Halal Scanner

Scan a barcode and get a Halal / Doubtful / Haram verdict, with the reason for every flagged ingredient. Android first. See `CLAUDE.md` for the full plan.

```
app/            Expo app (expo-router screens in app/src/app)
packages/rules  Rules engine + ingredient database + tests
```

## Get the app running on your Android phone (M0)

You do these steps once, on your own computer (Windows, Mac or Linux). You don't need Android Studio: EAS builds the app in the cloud.

### 1. Install the tools

- **Node.js 22 or newer** from https://nodejs.org (pick the LTS version). Check it worked by running `node -v`.
- **Git** from https://git-scm.com.
- A free **Expo account** at https://expo.dev/signup.

### 2. Get the code and install packages

```bash
git clone https://github.com/NafehAwan/MeowAntiCheat.git halal-scanner
cd halal-scanner
git checkout claude/busy-cori-xbjz4o
npm install          # downloads all packages (takes a few minutes)
npm test             # runs the rules-engine tests; should say all passed
```

### 3. Log in to EAS and link the project

```bash
cd app
npx eas-cli@latest login     # your Expo account email and password
npx eas-cli@latest init      # creates the project on expo.dev and saves its id in app.json
```

Before your first build, open `app/app.json` and check two things:

- `android.package` is `com.nafehawan.halalscanner`. **This ID is permanent once you upload to Google Play.** Change it now if you want a different one.
- Replace `SET-YOUR-SUPPORT-EMAIL` under `extra.offContactEmail` with the support email you'll use for the app. Open Food Facts asks apps to include a contact address in every request.

### 4. Build the development app (in the cloud)

```bash
npx eas-cli@latest build --profile development --platform android
```

- If it asks to create an Android keystore, say **yes** (EAS stores it safely for you).
- The build takes about 10–20 minutes. When it finishes, it shows a QR code and a link.
- Open that link on your phone and install the APK. Android will ask you to allow installing from your browser. Allow it for this one install.

You only rebuild this development app when we add a new native package (for example payments). Everyday code changes don't need a rebuild.

### 5. Run the code on your phone

```bash
npm start            # from the app/ folder
```

- Open the **Halal Scanner** development app on your phone and scan the QR code shown in the terminal. Your phone and computer must be on the same Wi-Fi.
- If that doesn't connect, run `npx expo start --dev-client --tunnel` instead.
- Allow camera access, then scan any food barcode.

## Build profiles (`app/eas.json`)

| Profile | What it's for | Unreviewed database entries |
|---|---|---|
| `development` | Your phone, live code reload | Shown with their status, plus a "test build" banner |
| `preview` | Shareable APK for quick tests | Same as development |
| `closed-test` | Google Play closed testing track (AAB) | Same as development |
| `production` | Public Play Store release | **Always shown as doubtful** until reviewed |

Closed-test build for Google Play:

```bash
npx eas-cli@latest build --profile closed-test --platform android
```

Upload the `.aab` file it produces in Play Console → Testing → Closed testing.

## Useful commands (from the repo root)

```bash
npm test             # rules-engine unit tests
npm run typecheck    # TypeScript checks for the app and the rules engine
```

## Before public launch

A qualified, knowledgeable person must review every entry in `packages/rules/data/knowledge-base.json`. Until they do, every entry stays `reviewed: false`, and production builds show those entries as doubtful.
