from datetime import date
from decimal import Decimal

from django.test import SimpleTestCase

from reconcile.compare import compare
from reconcile.importer import normalize_ref, parse_amount


def a_row(total="100.00"):
    return {"total": Decimal(total), "location": "L1", "date": date(2026, 3, 1)}


def b_entry(entry_id="E1", ref="REC-1", value="100.00", location="L1"):
    return {"entry_id": entry_id, "ref": ref, "value": parse_amount(value), "location": location, "date": date(2026, 3, 1)}


class CompareTests(SimpleTestCase):
    def test_missing(self):
        self.assertEqual(compare({"REC-1": a_row()}, [] )[0]["reason"], "MISSING_IN_B")

    def test_orphan(self):
        self.assertEqual(compare({}, [b_entry(ref="REC-9")])[0]["reason"], "ORPHAN_IN_B")

    def test_duplicate(self):
        result = compare({"REC-1": a_row()}, [b_entry(), b_entry("E2")])
        self.assertEqual(result[0]["reason"], "DUPLICATE_IN_B")

    def test_value_mismatch_and_blank(self):
        self.assertEqual(compare({"REC-1": a_row()}, [b_entry(value="99")])[0]["reason"], "VALUE_MISMATCH")
        self.assertEqual(compare({"REC-1": a_row()}, [b_entry(value="")])[0]["reason"], "VALUE_MISMATCH")

    def test_split_is_valid(self):
        entries = [b_entry(value="40"), b_entry("E2", value="60")]
        self.assertEqual(compare({"REC-1": a_row()}, entries), [])

    def test_cleaning_and_clean_row(self):
        self.assertEqual(normalize_ref(" REC - 1070 "), "REC-1070")
        self.assertEqual(normalize_ref("1112"), "REC-1112")
        self.assertEqual(compare({"REC-1": a_row()}, [b_entry()]), [])

    def test_location_and_date_mismatch(self):
        location_result = compare({"REC-1": a_row()}, [b_entry(location="L2")])
        self.assertEqual(location_result[0]["reason"], "LOCATION_MISMATCH")
        date_entry = b_entry()
        date_entry["date"] = date(2026, 3, 2)
        date_result = compare({"REC-1": a_row()}, [date_entry])
        self.assertEqual(date_result[0]["reason"], "DATE_MISMATCH")

    def test_messy_reference_and_indian_amount(self):
        self.assertEqual(normalize_ref("rec1034"), "REC-1034")
        self.assertEqual(normalize_ref(" REC - 1070 "), "REC-1070")
        self.assertEqual(normalize_ref("1112"), "REC-1112")
        self.assertEqual(parse_amount("1,25,400.00"), Decimal("125400.00"))

    def test_voided_record_is_not_special_cased(self):
        voided = a_row()
        voided["state"] = "VOIDED"
        self.assertEqual(compare({"REC-1": voided}, [b_entry()]), [])
