from django.http import JsonResponse
from django.shortcuts import render

from .compare import compare
from .models import Location, SystemARecord, SystemBEntry


def index(request):
    return render(request, "index.html")


def locations(request):
    rows = Location.objects.all().order_by("location_id").values(
        "location_id", "org_id", "name"
    )
    return JsonResponse(list(rows), safe=False)


def disagreements(request):
    org = request.GET.get("org")
    if not org:
        return JsonResponse({"error": "org is required"}, status=400)
    reason = request.GET.get("reason")
    all_a_records = SystemARecord.objects.select_related("location")
    owner_by_record = {
        record.record_id: record.location.org_id
        for record in all_a_records
    }
    a_records = [
        record
        for record in all_a_records
        if record.location.org_id == org
    ]
    a_rows = {
        record.record_id: {
            "total": record.total_value,
            "location": record.location.location_id,
            "date": record.event_date,
        }
        for record in a_records
    }
    all_b_entries = SystemBEntry.objects.select_related("location")
    b_entries = [
        entry
        for entry in all_b_entries
        if (
            entry.record_ref in a_rows
            or (
                entry.location.org_id == org
                and entry.record_ref not in owner_by_record
            )
        )
    ]
    b_rows = [
        {
            "entry_id": entry.entry_id,
            "ref": entry.record_ref,
            "value": entry.value,
            "location": entry.location.location_id,
            "date": entry.recorded_on,
        }
        for entry in b_entries
    ]
    results = compare(a_rows, b_rows)
    if reason:
        results = [result for result in results if result["reason"] == reason]
    sort = request.GET.get("sort", "")
    if sort in {"value", "-value"}:
        results.sort(key=lambda result: result["a_value"] or 0, reverse=sort == "-value")
    for result in results:
        result["a_location"] = result["a_location"] if result["a_location"] else None
        if result["b_location"]:
            b_location_org = Location.objects.filter(location_id=result["b_location"]).values_list("org_id", flat=True).first()
            if b_location_org != org:
                result["b_location"] = None
        result["location"] = result["a_location"] or result["b_location"]
    return JsonResponse(results, safe=False)
