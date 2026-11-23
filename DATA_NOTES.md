# Data notes

- `locations.csv` contains 5 locations owned by ORG-A or ORG-B.
- `system_a.csv` contains 120 records, including one blank `actor_id` and one `VOIDED` record.
- `system_b.csv` contains 121 entries, including one blank value and one Indian-style amount (`1,25,400.00`).
- B references use several formats, including `rec####`, `REC - ####`, and digits only.
- B contains an orphan reference, missing A matches, and repeated references. Repeated entries include both real duplicates and a valid split whose parts sum to A's total.
- Location and date differences are present and are reported as additional disagreement reasons.
