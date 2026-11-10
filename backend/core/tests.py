from django.test import TestCase
from rest_framework.test import APIClient


class SiteSettingsApiTests(TestCase):
    def test_site_endpoint_does_not_invent_contact_details(self):
        client = APIClient()
        response = client.get("/api/site/")
        self.assertEqual(response.status_code, 200)
        data = response.json()["data"]
        self.assertEqual(data["name"], "Darjee")
        self.assertEqual(data["phone"], "")
        self.assertFalse(data["contact_configured"])
