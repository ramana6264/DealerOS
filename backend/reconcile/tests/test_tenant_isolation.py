from datetime import date
from decimal import Decimal

from django.test import TestCase

from reconcile.models import Location, SystemARecord, SystemBEntry


class TenantIsolationTests(TestCase):
    def setUp(self):
        location_a = Location.objects.create(location_id="L-A", org_id="ORG-A", name="A")
        location_b = Location.objects.create(location_id="L-B", org_id="ORG-B", name="B")
        SystemARecord.objects.create(
            record_id="REC-A",
            location=location_a,
            event_date=date(2026, 1, 1),
            total_value=Decimal("10.00"),
        )
        SystemARecord.objects.create(
            record_id="REC-CROSS",
            location=location_a,
            event_date=date(2026, 1, 2),
            total_value=Decimal("30.00"),
        )
        SystemBEntry.objects.create(
            entry_id="ENTRY-B",
            record_ref="REC-B",
            record_ref_raw="REC-B",
            location=location_b,
            recorded_on=date(2026, 1, 1),
            value=Decimal("20.00"),
        )
        SystemBEntry.objects.create(
            entry_id="ENTRY-CROSS",
            record_ref="REC-CROSS",
            record_ref_raw="REC-CROSS",
            location=location_b,
            recorded_on=date(2026, 1, 2),
            value=Decimal("30.00"),
        )

    def test_org_a_response_has_no_org_b_data(self):
        response = self.client.get("/api/disagreements/?org=ORG-A")
        self.assertEqual(response.status_code, 200)
        rows = response.json()
        self.assertTrue(all(row["location"] != "L-B" for row in rows))
        self.assertTrue(all(row["b_location"] != "L-B" for row in rows))
        cross = next(row for row in rows if row["record_id"] == "REC-CROSS")
        self.assertEqual(cross["reason"], "LOCATION_MISMATCH")
        self.assertIsNone(cross["b_location"])

    def test_org_b_response_has_no_org_a_data(self):
        response = self.client.get("/api/disagreements/?org=ORG-B")
        self.assertEqual(response.status_code, 200)
        rows = response.json()
        self.assertTrue(all(row["location"] != "L-A" for row in rows))
        self.assertTrue(all(row["record_id"] not in {"REC-A", "REC-CROSS"} for row in rows))
