# AttendPro — Amar Furniture (notes for Claude)

Staff attendance, advances and hisab for Amar Furniture. A single-page PWA on GitHub Pages
(`CNAME` → attendpro.amarfurniture.in) with Firebase Auth + Firestore. No build step.

## Workflow
- The owner wants changes live without manual steps: after committing and pushing to the working
  branch, open the pull request and merge it into `main` yourself. `main` is what the site serves.
- Every release bumps the version in: `const APP_VERSION` in `index.html` (the plain script; it fills
  the `brand-ver` badges — update their fallback text too), a new entry at the top of the What's New
  dialog (`#whatsNewModal`, newest first, move the `new` class to it), and `CACHE_NAME` in `sw.js`.
- Self-update (v1.2.1, same approach as the orders app): `checkForUpdate()` fetches the live
  `index.html` (no-store) 4 s after load, on return to the app and every 5 min; if its `APP_VERSION`
  differs it shows the "New version · Update now" bar and reloads after 10 s, waiting while the user
  is busy (`userBusy()` / `window.apIsBusy`). Once per version per session (`sessionStorage
  ap-updated-to`). `sw.js` fetches our own files with `cache: 'no-store'` (GitHub Pages caches for
  10 min) and precaches with `cache: 'reload'`. Forgetting to bump APP_VERSION means no update prompt.
- **Help & guide (v1.2.3):** the in-app documentation lives in the `HELP` array (its own `<script>` just
  before the app module). Every feature change updates the matching article in the same release
  (and the quick list in `#shortcutsModal` for shortcuts). Articles have `roles` ('all' | 'staff' | 'emp'),
  role-specific parts use `data-roles="staff|emp|admin"`; `.staff-only` / `.emp-only` spans also work.
  Links between articles: `<a data-help="id">`. Write it product-neutral ("your team"), it's meant to
  serve future customers too.
- `firestore.rules` is a copy of the live rules, which the owner pastes into the Firebase console by
  hand. If you change it, tell the owner to publish it and keep the file in step with what is live.

## Files
- `index.html` — the whole app: CSS, markup, a plain `<script>` (icons `IC` / `svgi()`, theme,
  drawer, clock) and the module script (Firebase, live data, every screen).
- `firestore.rules` — role-based access (admin / manager / employee via `uidMap/{authUid}`).
- `sw.js` — network-first service worker. `manifest.json` + icons — PWA install files. The icon is
  the ivory calendar-tick mark on a full clay square (`#C1602F`), mark ≈ half the tile so every crop works.
- `ROADMAP.md` — release notes and the owner's backlog.

## UI rules (v1.2.0)
- **Look:** the orders app (orders.amarfurniture.in) "Concept A" with the liquid glass layer — keep it.
  Tokens at the top of `<style>` (`--ivory`, `--clay`, `--clay-fill`, `--ink*`, `--green`, `--amber`,
  `--red`, `--blue`, `--plum`, `--glass-*`, `--btn-dark`…), Fraunces headings + Public Sans text,
  monospace for numbers/dates/IDs, 24px round-stroke icons via `svgi(name, size)` (add new ones to `IC`).
  Don't introduce a new visual style or hard-coded colours.
- **Attendance colours:** `--a-full` / `--a-half` / `--a-ot` / `--a-dbl` / `--a-abs` / `--a-pl` (+ `-bg`), used by
  chips (`attChip()`), Daily Mark buttons (`sel-*`), calendars (`att-*`) and the register (`rt-*`).
- **Night mode:** `:root[data-theme="dark"]` block at the end of `<style>`. Every new colour needs a
  night value there. The head script sets the theme from `localStorage ap-theme` (auto / light / dark).
- **Layout (computer first):** sidebar `.rail` (Daily / Month end / Setup) + command bar `.cmd`
  (search ⌘K, clock, quick actions) + `.page-content`. Below 960px the rail becomes a drawer
  (`toggleDrawer`) and `.bottom-nav` appears; list rows (`.lrow`) fold into cards.
- **Navigation:** `navTo(key)` for every menu item; attendance sub-pages are tabs of `#pageAttendance`
  (`switchAttTab`). `syncNav()` keeps the sidebar, bottom bar and titles in step.
- **Staff colours:** always `staffColor(u)` (maps the pre-v1.2 bright palette onto `NEW_COLORS`).
- **Roles:** `.staff-only` (admin + manager) and `.emp-only` are switched by `body.role-emp`.
- Shown sections use `style.display = ''` (not `'block'`) so their CSS grid/flex layout applies.

## Keyboard (v1.2.3 — the owner asked for one-key marking on top of the Tab path)
- Daily Mark value keys on a person's value buttons / ✕ (`dmQuickKey`, `dmKeyValue`; `L` = paid-leave tick; with no row focused a value key goes to the first unmarked person): `1`/`P` full, `H`/`.` half,
  `O` 1.5, `D`/`2` double, `0`/`A` absent → marks and moves to the next person; `Backspace` clears (stays).
  Digits are read from `e.code`, so ⇧ + the same key = `bulkMark(v)` and ⇧Backspace = `clearAllDay()`
  (in `initKeyboardShortcuts`). Never active while typing in a box.
- The five value buttons are one Tab stop (roving tabindex: `dmSetStop` / `dmStop` / `dmFocusPerson`): Tab lands
  on the person's value (else 0), ← → move between values, Space/Enter chooses (cursor stays), ↑ ↓ previous /
  next person. Tab path: values → ✕ (only when marked) → Advance ₹ → Note → Remark → next person
  (`remarkKeydown`); chip ✕ buttons are `tabindex="-1"`. After the last person → `#saveAllBtn`.
- `[` `]` also work inside Daily Mark's own boxes (Advance / Note / Remark). Every day change goes through
  `dailyGoTo(date)`, which asks and runs `saveAllAttendance()` first if `dailyUnsavedCount()` > 0.
- `setDailyAtt` updates the row before the network write finishes (fast typing never waits) and rolls back
  with a toast if the write fails.
- Opens on the first unmarked person (`focusFirstUnmarked`, computer only); redraws keep focus.
- `bulkMark(v)` marks everyone not marked yet (all, after a confirm, if everyone is marked);
  `clearAllDay()`; both write one `writeBatch` (`writeAttendance`) and are undoable.
- Undo: `pushUndo(label, [{userId,date,prev}])` → toast with Undo + ⌘Z (`undoLast`). Used by single
  marks, clears, the edit dialog and the bulk actions.
- Keys (not while typing in a box): `[` `]` `T` day, `/` find person, `?` help (`#shortcutsModal`),
  ⌘S save all, ⌘Z undo. ⌘K palette: one letter per page (`PAGE_KEYS`), ⇧Enter on a person = add advance.
  Dialogs with `data-enter="fn"` save on Enter in an input.
- Dialogs (v1.2.5): `openModal` moves focus in (`[data-autofocus]`, else a form's first box on a computer,
  else the sheet), Tab is trapped in `topModal()`, `closeModal` / Esc restore it (`modalReturn`). Buttons with
  `data-key="x"` are pressed by that letter while the dialog is open (person details: A / D / L / E).
- Add advance's Employee box is a combobox (`advCombo*`, owner: "like the DispatchPro customer field"): list of
  `dailyMarkUsers()` on focus, filters as you type, ↑ ↓ / Enter / Tab pick, Esc closes the list; `#advEmpSelect` is
  the hidden id. No native `<select>` for picking people.

## Data + logic (don't duplicate)
- Attendance values: numbers `0 0.5 1 1.5 2` (pay). Paid leave (v1.2.8) is a separate tick `'<date>_pl': true` on a
  paid value — paid at the value, never present (`isPLDay`, `isPresentDay`, `dayLabel`, `attChip(v, ua, date)`).
  Staff write value + tick with `saveDay` / `writeAttendance(changes, valueOf, plOf)`; undo entries carry `prevPl`.
  Daily Mark: `.pl-tog` next to ✕ (not in the Tab path), key `L` (`togglePaidLeave`), ⇧L `bulkPaidLeave`. The v1.2.7
  value `'PL'` (= 1 + tick) is converted by `syncPaidLeaveValues()`; `attPay` still reads it. Employees can't mark it.
- Money: one calculation for every screen and PDF — `entryEffect`, `monthWork`, `computeHisab`,
  `buildLedger`. A regular "Deduct" is record-only; "Opening Balance (Pending Salary)" counts.
- Opening balance (v1.2.6): an advances doc whose note contains "Opening Balance" (`isOpeningBal`, `OB_NOTE`):
  type `advance` = they owe (−), `deduction` = pending salary (+). Dated on the person's join date;
  `syncOpeningBalanceDates()` (admin, at start and after saving staff) keeps it there unless `customDate`.
  Added / edited in `openObDialog` (person details → Add opening balance, key O).
- Live data: `startLiveData()` (onSnapshot listeners, role-scoped like the rules). Redraws wait while
  the user is busy (`isUserBusy`). Save All writes only rows tapped on this device (`dailyTouched`).
- Always escape user text in HTML with `esc()`, and pass values into inline handlers with `jsArg()`.

## Testing
Changes were verified with Playwright against the Firebase Auth + Firestore emulators (rules tests
with `@firebase/rules-unit-testing`; browser suites for login/migration, XSS, remarks, money, delete,
manager, live sync, register). Re-run equivalent checks before releasing.
