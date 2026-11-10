from django.test import TestCase
from rest_framework.test import APIClient

from .models import ContactInquiry


class ContactInquiryTests(TestCase):
    def test_contact_form_persists(self):
        client = APIClient()
        response = client.post(
            "/api/contact-inquiries/",
            {
                "full_name": "Asha Rao",
                "phone": "9999999999",
                "email": "asha@example.com",
                "subject": "Sherwani consultation",
                "message": "I would like to discuss a wedding sherwani fitting.",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.json()["ok"])
        self.assertEqual(ContactInquiry.objects.count(), 1)

    def test_short_message_rejected(self):
        client = APIClient()
        response = client.post(
            "/api/contact-inquiries/",
            {
                "full_name": "Asha Rao",
                "phone": "9999999999",
                "subject": "Hi",
                "message": "Hello",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ContactInquiry.objects.count(), 0)
