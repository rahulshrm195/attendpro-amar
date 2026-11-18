# AttendPro — Roadmap & Notes

## Release checklist (do once all review items are finished)
1. Firebase console → Authentication → enable **Email/Password**
2. Deploy the new code to the live site
3. Log in as admin → Profile → **🔐 Secure all staff logins**
4. Firestore → Rules → paste `firestore.rules` → Publish
5. Test one employee + admin login; change the admin password
6. Spot-check 2–3 employees' Hisab/Ledger balances (deduction / settlement / pre-join work now counted consistently)
7. Optional: bump the version label (v1.0.16 in header/login) and add a What's New entry

## Planned features

### ✅ Monthly attendance register (grid view) — built (Attendance → Register tab)
A single-screen month register for admin/manager, replacing the need to open
each employee's calendar one by one.

- **Layout:** one row per employee, one column per day of the month (1–30/31),
  with day-of-week letters (S M T W T F S) above the dates. Sundays / each
  employee's weekly-off day highlighted in the header.
- **Row header:** avatar initials (in the employee's colour), name, and a
  sub-line with their schedule, e.g. `Off Tue · 10:15–21:30`.
- **Day cells:** small rounded tiles with a letter code and colour:
  - `P` Present (green) · `A` Absent (red) · short/half day (purple)
  - blank grey = weekly off / unmarked, outlined tile = worked on weekly off
  - holiday (blue), leave (amber)
  - for AttendPro values: `½` half, `1` full, `1.5` OT, `2` double
- **Indicators:** small orange dot on a tile for "late" (or for days that
  have a remark, until punch times exist).
- **Totals on the right:** Present, Absent, Late counts per employee
  (for AttendPro: total days and earned amount are also useful).
- **Legend** bar above the grid; **month switcher** (‹ November 2026 ›) at top right.
- **Interaction:** click a day tile to open the existing Edit Attendance modal
  (value + remark) for that employee/date.
- **Responsive:** horizontal scroll on phones with the name column sticky.

Reference: screenshot shared on 18 Nov 2026 (third-party "Attendance register" screen) —
use it for the layout idea only; build it in AttendPro's own styling.

## Code review follow-ups (from 18 Nov 2026 review)

Done:
- [x] #1–3 Firebase Auth login + Firestore security rules (`firestore.rules`)
- [x] #4 Escape user-entered text (XSS) and fix handler arguments for names with apostrophes
- [x] #5 Employee home crash · #12 admin profile crash · Home "✕" clear button
- [x] #6 Daily Mark remarks now saved by "Save All" (clearing the box removes the remark)
- [x] #7 Remark keys no longer make day counts show `NaN`
- [x] #8 One shared balance calculation for Hisab screen, Hisab PDF, month detail, Ledger and Ledger PDF
      (regular "Deduct" = record only; "Opening Balance (Pending Salary)" still counts in employee's favour)
- [x] #9 Employee screens use wage history (per-day wage)
- [x] #13 Managers can edit attendance and see admin notifications; staff passwords are admin-only
- [x] Deactivated staff can no longer log in (enforced in rules too)
- [x] #16 Night summary wired up (skips inactive staff); `.text-yellow` added; Daily Mark Tab/Shift+Tab skip inactive staff; unused admin-salary code removed
- [x] Service worker: notification tap opens the right page; cache name bumped to v1.1.0
- [x] Manifest: separate `any` / `maskable` icons (new navy maskable icons); pinch-zoom no longer blocked
- [x] #15 Live sync between devices (Firestore listeners); Save All only writes rows tapped on this device
- [x] #10 Delete staff warns what will be lost and suggests Deactivate; "Delete everything" really removes all records

Open:
- (none — all review items done)
