# AttendPro — Amar Furniture (notes for Claude)

Staff attendance, advances and hisab for Amar Furniture. A single-page PWA on GitHub Pages
(`CNAME` → attendpro.amarfurniture.in) with Firebase Auth + Firestore. No build step.

## Workflow
- The owner wants changes live without manual steps: after committing and pushing to the working
  branch, open the pull request and merge it into `main` yourself. `main` is what the site serves.
- Every release bumps the version in: the two `brand-ver` badges in `index.html` (login + sidebar),
  a new entry at the top of the What's New dialog (`#whatsNewModal`, newest first), and `CACHE_NAME`
  in `sw.js`.
- `firestore.rules` is a copy of the live rules, which the owner pastes into the Firebase console by
  hand. If you change it, tell the owner to publish it and keep the file in step with what is live.

## Files
- `index.html` — the whole app: CSS, markup, a plain `<script>` (icons `IC` / `svgi()`, theme,
  drawer, clock) and the module script (Firebase, live data, every screen).
- `firestore.rules` — role-based access (admin / manager / employee via `uidMap/{authUid}`).
- `sw.js` — network-first service worker. `manifest.json` + icons — PWA install files.
- `ROADMAP.md` — release notes and the owner's backlog.

## UI rules (v1.2.0)
- **Look:** the orders app (orders.amarfurniture.in) "Concept A" with the liquid glass layer — keep it.
  Tokens at the top of `<style>` (`--ivory`, `--clay`, `--clay-fill`, `--ink*`, `--green`, `--amber`,
  `--red`, `--blue`, `--plum`, `--glass-*`, `--btn-dark`…), Fraunces headings + Public Sans text,
  monospace for numbers/dates/IDs, 24px round-stroke icons via `svgi(name, size)` (add new ones to `IC`).
  Don't introduce a new visual style or hard-coded colours.
- **Attendance colours:** `--a-full` / `--a-half` / `--a-ot` / `--a-dbl` / `--a-abs` (+ `-bg`), used by
  chips (`attChip()`), Daily Mark buttons (`sel-*`), calendars (`att-*`) and the register (`rt-*`).
- **Night mode:** `:root[data-theme="dark"]` block at the end of `<style>`. Every new colour needs a
  night value there. The head script sets the theme from `localStorage ap-theme` (auto / light / dark).
- **Layout (computer first):** sidebar `.rail` (Daily / Month end / Setup) + command bar `.cmd`
  (search ⌘K, clock, quick actions) + `.page-content`. Below 960px the rail becomes a drawer
  (`toggleDrawer`) and `.bottom-nav` appears; list rows (`.lrow`) fold into cards.
- **Navigation:** `navTo(key)` for every menu item; attendance sub-pages are tabs of `#pageAttendance`
  (`switchAttTab`). `syncNav()` keeps the sidebar, bottom bar and titles in step.
- **Roles:** `.staff-only` (admin + manager) and `.emp-only` are switched by `body.role-emp`.
- Shown sections use `style.display = ''` (not `'block'`) so their CSS grid/flex layout applies.

## Data + logic (don't duplicate)
- Money: one calculation for every screen and PDF — `entryEffect`, `monthWork`, `computeHisab`,
  `buildLedger`. A regular "Deduct" is record-only; "Opening Balance (Pending Salary)" counts.
- Live data: `startLiveData()` (onSnapshot listeners, role-scoped like the rules). Redraws wait while
  the user is busy (`isUserBusy`). Save All writes only rows tapped on this device (`dailyTouched`).
- Always escape user text in HTML with `esc()`, and pass values into inline handlers with `jsArg()`.

## Testing
Changes were verified with Playwright against the Firebase Auth + Firestore emulators (rules tests
with `@firebase/rules-unit-testing`; browser suites for login/migration, XSS, remarks, money, delete,
manager, live sync, register). Re-run equivalent checks before releasing.
