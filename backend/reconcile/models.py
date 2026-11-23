from django.db import models


class Location(models.Model):
    location_id = models.CharField(max_length=32, unique=True)
    org_id = models.CharField(max_length=32)
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.location_id


class SystemARecord(models.Model):
    record_id = models.CharField(max_length=64, unique=True)
    location = models.ForeignKey(Location, on_delete=models.PROTECT)
    event_date = models.DateField(null=True)
    category_code = models.CharField(max_length=64, blank=True)
    actor_id = models.CharField(max_length=64, null=True, blank=True)
    base_value = models.DecimalField(max_digits=14, decimal_places=2, null=True)
    adjustment = models.DecimalField(max_digits=14, decimal_places=2, null=True)
    total_value = models.DecimalField(max_digits=14, decimal_places=2, null=True)
    state = models.CharField(max_length=32, blank=True)


class SystemBEntry(models.Model):
    entry_id = models.CharField(max_length=64, unique=True)
    record_ref_raw = models.CharField(max_length=128, blank=True)
    record_ref = models.CharField(max_length=64, null=True, blank=True, db_index=True)
    location = models.ForeignKey(Location, on_delete=models.PROTECT)
    recorded_on = models.DateField(null=True)
    value_raw = models.CharField(max_length=128, blank=True)
    value = models.DecimalField(max_digits=14, decimal_places=2, null=True)
    label = models.CharField(max_length=255, blank=True)
