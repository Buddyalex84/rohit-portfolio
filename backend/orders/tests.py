from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from catalog.models import Category, CustomizationOption, MeasurementField, Product, StandardSize, SuitType
from orders.models import TailoringRequest


def seed_shirt():
    category = Category.objects.create(
        slug="casual-shirt",
        name="Casual Shirt",
        customization_groups=["fit", "collar", "cuff"],
        is_active=True,
    )
    StandardSize.objects.create(category=category, code="M")
    MeasurementField.objects.create(category=category, key="chest", label="Chest", min_cm=60, max_cm=160)
    fit = CustomizationOption.objects.create(
        category=category, group="fit", slug="slim-fit", name="Slim Fit Shirt"
    )
    Product.objects.create(category=category, slug="sky-oxford-shirt", name="Sky Oxford", garment_type="Casual Shirt")
    return category, fit


class TailoringRequestTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.category, self.fit = seed_shirt()

    def _payload(self, **overrides):
        data = {
            "full_name": "Imran Khan",
            "phone": "9811111111",
            "email": "imran@example.com",
            "preferred_contact_method": "whatsapp",
            "category_slug": "casual-shirt",
            "product_slug": "sky-oxford-shirt",
            "measurement_method": "provide_garment",
            "garment_dropoff_notes": "Drop-off at the atelier on Friday afternoon.",
            "size_mode": "standard",
            "size_code": "M",
            "unit": "cm",
            "selections": [{"group": "fit", "option_id": self.fit.id}],
        }
        data.update(overrides)
        return data

    def test_creates_persistent_request_with_reference(self):
        response = self.client.post("/api/tailoring-requests/", self._payload(), format="json")
        self.assertEqual(response.status_code, 201, response.content)
        self.assertTrue(response.json()["ok"])
        reference = response.json()["data"]["reference"]
        self.assertTrue(reference.startswith("DJ-"))
        self.assertEqual(TailoringRequest.objects.count(), 1)

    def test_rejects_shirt_options_on_other_garments(self):
        pants = Category.objects.create(
            slug="casual-pants", name="Casual Pants", customization_groups=["fit"], is_active=True
        )
        StandardSize.objects.create(category=pants, code="M")
        payload = self._payload(category_slug="casual-pants", product_slug="")
        payload["selections"] = [{"group": "collar", "option_id": self.fit.id}]
        response = self.client.post("/api/tailoring-requests/", payload, format="json")
        self.assertEqual(response.status_code, 400)

    def test_blazer_requires_suit_type(self):
        blazer = Category.objects.create(
            slug="blazer",
            name="Blazer",
            supports_suit_types=True,
            customization_groups=["fit", "lapel"],
            is_active=True,
        )
        StandardSize.objects.create(category=blazer, code="L")
        response = self.client.post(
            "/api/tailoring-requests/",
            self._payload(category_slug="blazer", product_slug=""),
            format="json",
        )
        self.assertEqual(response.status_code, 400)

        SuitType.objects.create(category=blazer, slug="two-piece", name="Two-Piece Suit")
        response = self.client.post(
            "/api/tailoring-requests/",
            self._payload(category_slug="blazer", product_slug="", suit_type_slug="two-piece"),
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.content)

    def test_custom_measurement_range(self):
        response = self.client.post(
            "/api/tailoring-requests/",
            self._payload(
                size_mode="custom",
                size_code="",
                measurements=[{"field_key": "chest", "label": "Chest", "value": 8}],
            ),
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_reference_upload_rejects_non_image(self):
        create = self.client.post("/api/tailoring-requests/", self._payload(), format="json")
        reference = create.json()["data"]["reference"]
        fake = SimpleUploadedFile("notes.txt", b"not an image", content_type="text/plain")
        response = self.client.post(
            "/api/reference-images/",
            {"reference": reference, "field_key": "shirt_fit", "image": fake},
            format="multipart",
        )
        self.assertEqual(response.status_code, 400)

    def test_reference_upload_accepts_jpeg(self):
        create = self.client.post("/api/tailoring-requests/", self._payload(), format="json")
        reference = create.json()["data"]["reference"]
        jpeg = SimpleUploadedFile(
            "collar.jpg",
            b"\xff\xd8\xff\xdb" + b"\x00" * 32,
            content_type="image/jpeg",
        )
        response = self.client.post(
            "/api/reference-images/",
            {"reference": reference, "field_key": "shirt_collar", "image": jpeg, "notes": "Closer spread"},
            format="multipart",
        )
        self.assertEqual(response.status_code, 201, response.content)

    def test_admin_list_requires_auth(self):
        response = self.client.get("/api/admin/tailoring-requests/")
        self.assertIn(response.status_code, (401, 403))
        admin = get_user_model().objects.create_superuser("atelier", "a@b.c", "pass12345")
        self.client.force_authenticate(admin)
        response = self.client.get("/api/admin/tailoring-requests/")
        self.assertEqual(response.status_code, 200)
