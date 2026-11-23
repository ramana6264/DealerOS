# Decisions

## Decision: compare B's value with A's `total_value`
- Rejected: comparing B with `base_value`.
- Why: B records represent the complete event amount, which matches A's `total_value`.

## Decision: preserve dirty values as null
- Rejected: converting blanks or invalid amounts to zero.
- Why: blank means unknown, so it is stored as null and reported as a value mismatch.

## Decision: treat matching split entries as valid
- Rejected: flagging every record with multiple B entries.
- Why: multiple entries are valid when their exact Decimal sum equals A's total; otherwise they are duplicates.

## Decision: flag `VOIDED` rows normally
- Rejected: suppressing all reconciliation results for voided records.
- Why: a matching B entry is usable evidence, while missing or mismatched B entries should still be visible to operators.

## Decision: count date and location differences
- Rejected: comparing only amounts.
- Why: the extra mismatch fields show that A and B disagree on the event's location or date even when the amount matches.

## Decision: use SQLite and Decimal values
- Rejected: float comparisons and an external database.
- Why: SQLite needs no setup for this assessment, and Decimal preserves exact money values.

## Decision: normalize B references but preserve raw text
- Rejected: replacing the original B reference.
- Why: the cleaned reference enables matching while `record_ref_raw` retains the source text for auditability.

## Decision: keep tenant boundaries in database queries
- Rejected: fetching all records and filtering in the browser.
- Why: A and B queries are filtered by the requested organization's location before comparison, preventing cross-tenant data leakage.

## Decision: hide a cross-tenant B location
- Rejected: exposing both locations for a cross-tenant mismatch.
- Why: when an A record belongs to ORG-A but B is recorded under an ORG-B location, ORG-A sees the disagreement using its own location and System B value, while the foreign location is removed. ORG-B does not receive the A-owned row.
