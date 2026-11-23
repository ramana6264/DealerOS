from collections import defaultdict
from decimal import Decimal


def compare(a_rows, b_rows):
    """Return disagreement dictionaries for normalized A and B records."""
    output = []
    by_ref = defaultdict(list)
    for entry in b_rows:
        by_ref[entry.get("ref")].append(entry)

    for ref, entries in by_ref.items():
        if ref not in a_rows:
            for entry in entries:
                output.append(_result("ORPHAN_IN_B", ref, None, entry))

    for record_id, a in a_rows.items():
        entries = by_ref.get(record_id, [])
        if not entries:
            output.append(_result("MISSING_IN_B", record_id, a, None))
            continue
        values = [entry.get("value") for entry in entries]
        if any(value is None for value in values):
            output.append(_result("VALUE_MISMATCH", record_id, a, entries[0]))
            continue
        if len(entries) > 1:
            if sum(values, Decimal("0")) != a.get("total"):
                output.append(_result("DUPLICATE_IN_B", record_id, a, entries[0]))
            continue
        entry = entries[0]
        if entry.get("value") != a.get("total"):
            output.append(_result("VALUE_MISMATCH", record_id, a, entry))
        if entry.get("location") != a.get("location"):
            output.append(_result("LOCATION_MISMATCH", record_id, a, entry))
        if entry.get("date") != a.get("date"):
            output.append(_result("DATE_MISMATCH", record_id, a, entry))
    return output


def _result(reason, record_id, a, b):
    return {
        "reason": reason,
        "record_id": record_id,
        "a_value": a.get("total") if a else None,
        "b_value": b.get("value") if b else None,
        "a_location": a.get("location") if a else None,
        "b_location": b.get("location") if b else None,
        "a_date": a.get("date") if a else None,
        "b_date": b.get("date") if b else None,
        "entry_id": b.get("entry_id") if b else None,
    }
