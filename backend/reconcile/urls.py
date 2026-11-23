from django.urls import path

from .views import disagreements, index, locations

urlpatterns = [
    path("", index, name="index"),
    path("api/locations/", locations, name="locations"),
    path("api/disagreements/", disagreements, name="disagreements"),
]
