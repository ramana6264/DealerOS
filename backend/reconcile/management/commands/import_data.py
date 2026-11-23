import csv
from datetime import date
from pathlib import Path

from django.core.management.base import BaseCommand

from reconcile.importer import normalize_ref, parse_amount
from reconcile.models import Location, SystemARecord, SystemBEntry


def parse_date(value):
    try:
        return date.fromisoformat(value.strip()) if value and value.strip() else None
    except ValueError:
        return None


class Command(BaseCommand):
    help = "Import the assessment CSV files without dropping dirty rows."

    def handle(self, *args, **options):
        data_dir = Path(__file__).resolve().parents[3] / "data"
        locations = self._read(data_dir / "locations.csv")
        for row in locations:
            Location.objects.update_or_create(
                location_id=row["location_id"].strip(),
                defaults={
                    "org_id": row["org_id"].strip(),
                    "name": row["location_name"].strip(),
                },
            )

        a_rows = self._read(data_dir / "system_a.csv")
        a_saved = 0
        for row in a_rows:
            location = Location.objects.get(location_id=row["location_id"].strip())
            SystemARecord.objects.update_or_create(
                record_id=row["record_id"].strip(),
                defaults={
                    "location": location,
                    "event_date": parse_date(row["event_date"]),
                    "category_code": row["category_code"].strip(),
                    "actor_id": row["actor_id"].strip() or None,
                    "base_value": parse_amount(row["base_value"]),
                    "adjustment": parse_amount(row["adjustment"]),
                    "total_value": parse_amount(row["total_value"]),
                    "state": row["state"].strip(),
                },
            )
            a_saved += 1

        b_rows = self._read(data_dir / "system_b.csv")
        b_saved = 0
        blank_values = 0
        for row in b_rows:
            value = parse_amount(row["value"])
            blank_values += value is None
            location = Location.objects.get(location_id=row["location_id"].strip())
            SystemBEntry.objects.update_or_create(
                entry_id=row["entry_id"].strip(),
                defaults={
                    "record_ref_raw": row["record_ref"].strip(),
                    "record_ref": normalize_ref(row["record_ref"]),
                    "location": location,
                    "recorded_on": parse_date(row["recorded_on"]),
                    "value_raw": row["value"].strip(),
                    "value": value,
                    "label": row["label"].strip(),
                },
            )
            b_saved += 1
        self.stdout.write(
            self.style.SUCCESS(
                f"A: {len(a_rows)} read, {a_saved} saved; "
                f"B: {len(b_rows)} read, {b_saved} saved; "
                f"values left empty: {blank_values}"
            )
        )

    @staticmethod
    def _read(path):
        with path.open(newline="", encoding="utf-8-sig") as source:
            return list(csv.DictReader(source))
