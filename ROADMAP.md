# AttendPro — Roadmap & Notes

## Planned features

### Monthly attendance register (grid view)
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

Open:
- [ ] #6 Daily Mark remarks are not saved by "Save All"
- [ ] #7 Remark keys make day counts show `NaN` (employee home / calendar / salary)
- [ ] #8 Four different balance calculations (Hisab screen, Hisab PDF, Ledger, Ledger PDF) — unify
- [ ] #9 Employee screens use current wage instead of wage history
- [ ] #10 Deleting staff leaves attendance/advances behind (dialog says they are removed)
- [ ] #13 Manager role: can't edit attendance from calendar, doesn't see admin notifications
- [ ] #15 No live sync between devices (one-time load; concurrent edits can overwrite)
- [ ] #16 Small items: dead `checkNightSummary`, `.text-yellow` missing, Shift+Tab uses inactive staff
- [ ] Service worker `notificationclick` uses `event.data` (should be `event.notification.data`)
- [ ] Manifest: separate `any` / `maskable` icons; allow pinch-zoom
