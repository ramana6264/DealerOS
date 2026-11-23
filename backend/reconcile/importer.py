import re
from decimal import Decimal, InvalidOperation


def normalize_ref(raw):
    match = re.search(r"\d+", raw or "")
    return f"REC-{match.group()}" if match else None


def parse_amount(raw):
    value = (raw or "").strip().replace(",", "")
    if not value:
        return None
    try:
        return Decimal(value)
    except InvalidOperation:
        return None
