from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Category, Product, SuitType


class CatalogApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.shirt = Category.objects.create(
            slug="casual-shirt", name="Casual Shirt", sort_order=1, is_active=True
        )
        self.blazer = Category.objects.create(
            slug="blazer",
            name="Blazer",
            sort_order=7,
            is_active=True,
            supports_suit_types=True,
        )
        self.one = SuitType.objects.create(
            category=self.blazer, slug="one-blazer", name="One Blazer", sort_order=1
        )
        self.two = SuitType.objects.create(
            category=self.blazer,
            slug="two-piece",
            name="Two-Piece Suit",
            includes_trousers=True,
            sort_order=2,
        )
        Product.objects.create(
            category=self.shirt,
            slug="oxford-shirt",
            name="Oxford Shirt",
            garment_type="Casual Shirt",
        )
        Product.objects.create(
            category=self.blazer,
            suit_type=self.two,
            slug="navy-two-piece",
            name="Classic Navy Two-Piece",
            garment_type="Two-Piece Suit",
        )

    def test_categories_exact_order_and_public_list(self):
        Category.objects.create(slug="casual-pants", name="Casual Pants", sort_order=2)
        response = self.client.get("/api/categories/")
        self.assertEqual(response.status_code, 200)
        names = [item["name"] for item in response.json()["results"]]
        self.assertEqual(names[:2], ["Casual Shirt", "Casual Pants"])

    def test_blazer_suit_types_and_filtered_products(self):
        detail = self.client.get("/api/categories/blazer/")
        self.assertEqual(detail.status_code, 200)
        slugs = [item["slug"] for item in detail.json()["suit_types"]]
        self.assertEqual(slugs, ["one-blazer", "two-piece"])

        products = self.client.get("/api/products/?suit_type__slug=two-piece")
        self.assertEqual(products.status_code, 200)
        self.assertEqual(len(products.json()["results"]), 1)
        self.assertEqual(products.json()["results"][0]["name"], "Classic Navy Two-Piece")

    def test_write_requires_admin(self):
        response = self.client.post("/api/categories/", {"name": "Hats", "slug": "hats"}, format="json")
        self.assertIn(response.status_code, (401, 403))

        user = get_user_model().objects.create_superuser("admin", "a@b.c", "pass12345")
        self.client.force_authenticate(user)
        response = self.client.post(
            "/api/categories/",
            {"name": "Hats", "slug": "hats", "sort_order": 9},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
