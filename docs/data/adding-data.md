# Adding real data (hospitals, clinics and other businesses)

**Today** the apps show clearly-labelled _sample_ data (`packages/sample-data`). Real listings
need the business tables and API from **Sprint 3**. This guide is the plan for getting real
hospitals, clinics and other listings into the database once those tables exist.

## Four ways data gets in (all end in the same database)

| #   | Method                                   | Who                      | When       | Best for                                    |
| --- | ---------------------------------------- | ------------------------ | ---------- | ------------------------------------------- |
| 1   | **Spreadsheet (CSV) import**             | You / data team          | Sprint 3   | Loading the first hundreds of listings      |
| 2   | Admin dashboard form                     | District / Taluka admins | Sprint 6   | Adding and correcting one listing at a time |
| 3   | "Register your business" form in the app | Business owners          | Sprint 6–8 | Owners keeping their own details current    |
| 4   | "Report incorrect information"           | Public users             | Sprint 6   | Finding mistakes                            |

Every imported or submitted listing starts as **pending verification**. It only shows the
"Verified" badge after an admin confirms it, and it records _who_ verified it, _when_ and _from
which source_.

## Recommended start: CSV import (method 1)

1. Copy [`businesses-template.csv`](businesses-template.csv) and fill one row per hospital or
   clinic, using Excel or Google Sheets and saving as CSV (UTF-8, so Marathi text survives).
2. Keep the real file **outside this repository**. The repo is public, and contact details
   belong in the database, not on GitHub.
3. Validate without saving anything (planned Sprint 3 command):

   ```bash
   docker compose run --rm -v "C:/data:/data" migrate \
     python -m app.importer businesses /data/hospitals-dapoli.csv --dry-run
   ```

   The dry run reports every problem by row: unknown taluka, invalid phone number, missing
   Marathi name, possible duplicate ("Care Hospital, Chiplun" already exists), and so on.

4. Fix the sheet, then run the same command without `--dry-run`. Re-running is safe: rows are
   matched by name + village, so fixing a typo updates the row instead of duplicating it.

### Columns (see the template)

| Column                       | Required | Rules                                                                  |
| ---------------------------- | -------- | ---------------------------------------------------------------------- |
| `name_en`, `name_mr`         | yes      | Marathi in Devanagari. `name_hi` is optional                           |
| `category`                   | yes      | One of: `hospitals`, `clinics`, `medical-stores`, `hotels`, …          |
| `district`, `taluka`         | yes      | Slugs from the region seed, e.g. `ratnagiri`, `dapoli`                 |
| `village`                    | yes      | Village or town name                                                   |
| `address_line`, `pincode`    | no       | PIN code = 6 digits                                                    |
| `phone`                      | yes      | 10-digit Indian mobile or landline with STD code                       |
| `whatsapp`                   | no       | Only with the owner's permission                                       |
| `latitude`, `longitude`      | no       | Decimal degrees, from the map pin at the entrance, not the town centre |
| `opening_hours`              | no       | e.g. `Mon-Sat 09:30-19:30; Sun closed` or `24x7`                       |
| `emergency_24x7`             | no       | `yes` / `no` (hospitals)                                               |
| `source`                     | yes      | Where the data came from (see below)                                   |
| `verified_on`, `verified_by` | no       | Date (YYYY-MM-DD) and person who confirmed it by phone or visit        |

## Where to get hospital and clinic data (and what to avoid)

Prefer sources you are allowed to use and can verify:

- **Official lists:** district civil hospital and Zilla Parishad health office (PHC/RH lists),
  Maharashtra Public Health Department, the National Health Facility Registry (ABDM HFR).
  Check each source's terms before bulk use.
- **Direct contact:** phone or visit the facility and ask permission to list the number. This
  is the best verification and is what earns the "Verified" badge.
- **Business owners themselves** via the app's registration form (method 3).

Avoid copying from Google Maps, Justdial or similar sites: their terms forbid it, and stale
copies are exactly the "wrong phone number" problem this app exists to solve.

**Medical safety:** never guess hours, emergency availability or phone numbers. Leave a field
empty when unknown; the apps show "Opening hours not available" rather than a guess.

## Privacy

- Store only what a listing needs. A doctor's _personal_ mobile number needs their consent.
- Real data files never go into this public repository, and `data/` is gitignored.
- Each listing keeps `source`, `verified_by` and `verified_on`, so stale entries can be found
  and re-verified (for example, every 6 months for hospitals).
