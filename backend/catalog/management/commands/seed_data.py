from django.core.management.base import BaseCommand

from catalog.models import (
    Category,
    ColorOption,
    CustomizationOption,
    Fabric,
    GarmentModel3D,
    MeasurementField,
    Product,
    StandardSize,
    SuitType,
)
from core.models import SiteSettings

# Editorial photography used as catalog stand-ins. Replace with studio photography in production.
IMG = {
    "shirt": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=1200&q=80",
    "pants": "https://images.unsplash.com/photo-1473966968600-ce338cf86c8e?auto=format&fit=crop&w=1200&q=80",
    "kurta": "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1200&q=80",
    "pathani": "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=80",
    "waistcoat": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    "sherwani": "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=1200&q=80",
    "blazer": "https://images.unsplash.com/photo-1594938298603-c8148c6bcd4d?auto=format&fit=crop&w=1200&q=80",
    "suit2": "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=1200&q=80",
    "suit3": "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1200&q=80",
    "collar": "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?auto=format&fit=crop&w=800&q=80",
    "cuff": "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?auto=format&fit=crop&w=800&q=80",
    "workshop": "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1600&q=80",
}

SIZES = ["XS", "S", "M", "L", "XL", "XXL"]

SHIRT_MEASUREMENTS = [
    ("neck", "Neck", "Measure around the base of the neck where a collar sits."),
    ("chest", "Chest", "Measure the fullest part of the chest, tape level and snug."),
    ("waist", "Waist", "Measure around the natural waistline."),
    ("shoulder", "Shoulder width", "Measure from shoulder point to shoulder point across the back."),
    ("sleeve", "Sleeve length", "From shoulder point to the wrist bone with the arm slightly bent."),
    ("shirt_length", "Shirt length", "From the highest shoulder point down to the desired hem."),
]

PANT_MEASUREMENTS = [
    ("waist", "Waist", "Measure around the waist where the trousers will sit."),
    ("hip", "Hip", "Measure around the fullest part of the hips."),
    ("thigh", "Thigh", "Measure around the fullest part of the thigh."),
    ("knee", "Knee", "Measure around the knee."),
    ("inseam", "Inseam", "From the crotch seam to the desired hem."),
    ("outseam", "Outseam", "From the waist to the desired hem along the outside leg."),
    ("bottom", "Bottom opening", "Desired hem circumference."),
]

JACKET_MEASUREMENTS = [
    ("chest", "Chest", "Fullest part of the chest, over a shirt."),
    ("waist", "Waist", "Natural waist over a shirt."),
    ("shoulder", "Shoulder width", "Shoulder point to shoulder point."),
    ("sleeve", "Sleeve length", "Shoulder point to wrist."),
    ("jacket_length", "Jacket length", "Base of the collar to the desired hem."),
]


class Command(BaseCommand):
    help = "Seed Darjee catalog, customization options, and site settings."

    def handle(self, *args, **options):
        settings = SiteSettings.load()
        settings.name = "Darjee"
        settings.tagline = "Tailored to Perfection"
        settings.save()

        fabrics = {
            "cotton": Fabric.objects.update_or_create(
                slug="cotton",
                defaults={"name": "Cotton", "texture_note": "Breathable everyday weave", "image_url": IMG["shirt"]},
            )[0],
            "linen": Fabric.objects.update_or_create(
                slug="linen",
                defaults={"name": "Linen", "texture_note": "Light, textured summer cloth", "image_url": IMG["kurta"]},
            )[0],
            "oxford": Fabric.objects.update_or_create(
                slug="oxford",
                defaults={"name": "Oxford", "texture_note": "Basket-weave shirting", "image_url": IMG["collar"]},
            )[0],
            "silk": Fabric.objects.update_or_create(
                slug="silk",
                defaults={"name": "Silk", "texture_note": "Smooth occasion cloth", "image_url": IMG["sherwani"]},
            )[0],
            "wool": Fabric.objects.update_or_create(
                slug="wool",
                defaults={"name": "Wool blend", "texture_note": "Structured suiting", "image_url": IMG["blazer"]},
            )[0],
        }
        colors = []
        for slug, name, hex_value in [
            ("navy", "Navy", "#1B2A4A"),
            ("ivory", "Ivory", "#F4EFE6"),
            ("charcoal", "Charcoal", "#2C2A28"),
            ("sky", "Sky blue", "#8FB4D4"),
            ("white", "White", "#F8F6F2"),
            ("maroon", "Maroon", "#6B2D3C"),
            ("gold", "Antique gold", "#C4A574"),
            ("black", "Black", "#111111"),
        ]:
            colors.append(
                ColorOption.objects.update_or_create(
                    slug=slug, defaults={"name": name, "hex_value": hex_value}
                )[0]
            )

        categories = [
            {
                "slug": "casual-shirt",
                "name": "Casual Shirt",
                "tagline": "Everyday ease, considered construction",
                "description": "Soft-shouldered shirts cut from breathable cloths, finished for daily wear.",
                "image": IMG["shirt"],
                "groups": ["fit", "collar", "cuff", "pattern"],
                "preset": "shirt",
                "measurements": SHIRT_MEASUREMENTS,
                "options": {
                    "fit": [
                        ("slim-fit", "Slim Fit Shirt", "Closer through the chest and waist, still comfortable to move.", "slim"),
                        ("regular-fit", "Regular Fit Shirt", "A balanced cut through the torso with ease at the waist.", "regular"),
                        ("relaxed-fit", "Relaxed / Oversized Shirt", "A generous drape with extra room through the body.", "relaxed"),
                        ("preference", "Tell Us Your Preference", "Describe the shirt silhouette you prefer.", None, True),
                    ],
                    "collar": [
                        ("spread", "Spread Collar", "Open spread that frames the neck and pairs with a tie or open collar.", "spread"),
                        ("point", "Point Collar", "Classic points with a narrower spread.", "point"),
                        ("button-down", "Button-Down Collar", "Points secured with small buttons for a casual finish.", "button-down"),
                        ("mandarin", "Mandarin / Band Collar", "A standing band with no points.", "mandarin"),
                        ("preference", "Tell Us Your Preference", "Share a collar reference or notes.", None, True),
                    ],
                    "cuff": [
                        ("single", "Single-Button Cuff", "A barrel cuff fastened with one button.", "single"),
                        ("two-button", "Two-Button Cuff", "A barrel cuff with two buttons for a slightly dressier close.", "two-button"),
                        ("french", "French Cuff / Double Cuff", "A double-length cuff worn with cufflinks.", "french"),
                        ("preference", "Tell Us Your Preference", "Describe the cuff you want reproduced.", None, True),
                    ],
                },
                "products": [
                    ("sky-oxford-shirt", "Sky Oxford Shirt", "Casual Shirt", IMG["shirt"]),
                    ("ivory-linen-shirt", "Ivory Linen Shirt", "Casual Shirt", IMG["kurta"]),
                ],
            },
            {
                "slug": "casual-pants",
                "name": "Casual Pants",
                "tagline": "Clean lines, considered ease",
                "description": "Trousers drafted for everyday movement, with fits from straight to wide-leg.",
                "image": IMG["pants"],
                "groups": ["fit"],
                "preset": "pants",
                "measurements": PANT_MEASUREMENTS,
                "options": {
                    "fit": [
                        ("straight", "Straight Fit", "A clean, even fall from hip to hem.", "straight"),
                        ("body-fit", "Body Fit / Skinny Fit", "Closer through the thigh and knee.", "skinny"),
                        ("regular", "Regular Fit", "Classic ease through the seat and thigh.", "regular"),
                        ("bootcut", "Bootcut Fit", "Slightly flared from the knee.", "bootcut"),
                        ("wide", "Wide-Leg / Loose Fit", "A generous, contemporary drape.", "wide"),
                        ("preference", "Tell Us Your Preference", "Describe the trouser silhouette you prefer.", None, True),
                    ]
                },
                "products": [
                    ("sand-chino", "Sand Cotton Trousers", "Casual Pants", IMG["pants"]),
                    ("olive-linen-pant", "Olive Linen Trousers", "Casual Pants", IMG["pants"]),
                ],
            },
            {
                "slug": "kurta-pajama",
                "name": "Kurta Pajama",
                "tagline": "Traditional ease for every day",
                "description": "Kurtas and pajama sets with configurable length, neckline, and sleeve.",
                "image": IMG["kurta"],
                "groups": ["fit", "neckline", "sleeve", "length"],
                "preset": "kurta",
                "measurements": SHIRT_MEASUREMENTS + [("pajama_waist", "Pajama waist", "Waist where the pajama will sit.")],
                "options": {
                    "fit": [
                        ("straight", "Straight Kurta", "A classic straight fall.", "straight"),
                        ("fitted", "Fitted Kurta", "Slightly shaped through the waist.", "fitted"),
                    ],
                    "neckline": [
                        ("band", "Band Collar", "A standing collar.", "mandarin"),
                        ("round", "Round Neck", "A simple round opening.", "round"),
                    ],
                    "sleeve": [
                        ("full", "Full Sleeve", "Wrist length.", "full"),
                        ("three-quarter", "Three-Quarter", "Mid-forearm.", "three-quarter"),
                    ],
                    "length": [
                        ("hip", "Hip Length", "Ends near the hip.", "hip"),
                        ("knee", "Knee Length", "A longer traditional fall.", "knee"),
                    ],
                },
                "products": [
                    ("ivory-cotton-kurta", "Ivory Cotton Kurta Set", "Kurta Pajama", IMG["kurta"]),
                ],
            },
            {
                "slug": "pathani-suit",
                "name": "Pathani Suit",
                "tagline": "Classic lines, considered presence",
                "description": "Pathani sets with configurable collar, length, and pajama style.",
                "image": IMG["pathani"],
                "groups": ["fit", "collar", "length"],
                "preset": "pathani",
                "measurements": JACKET_MEASUREMENTS,
                "options": {
                    "fit": [
                        ("regular", "Regular Pathani", "Traditional ease.", "regular"),
                        ("slim", "Slim Pathani", "A closer contemporary line.", "slim"),
                    ],
                    "collar": [
                        ("mandarin", "Mandarin Collar", "Standing collar.", "mandarin"),
                        ("open", "Open Neck", "A slightly open front.", "open"),
                    ],
                    "length": [
                        ("knee", "Knee Length", "Classic Pathani length.", "knee"),
                        ("mid", "Mid-Calf", "A longer ceremonial fall.", "mid"),
                    ],
                },
                "products": [
                    ("navy-pathani", "Navy Pathani Suit", "Pathani Suit", IMG["pathani"]),
                ],
            },
            {
                "slug": "waistcoats",
                "name": "Waistcoats",
                "tagline": "Layered structure",
                "description": "Waistcoats cut to sit cleanly over a shirt, with configurable fronts and pockets.",
                "image": IMG["waistcoat"],
                "groups": ["fit", "closure", "pocket"],
                "preset": "waistcoat",
                "measurements": [("chest", "Chest", "Fullest part of the chest."), ("waist", "Waist", "Natural waist.")],
                "options": {
                    "fit": [
                        ("fitted", "Fitted", "Close through the waist.", "fitted"),
                        ("regular", "Regular", "A little more ease.", "regular"),
                    ],
                    "closure": [
                        ("five-button", "Five Button", "Classic front.", "five"),
                        ("six-button", "Six Button", "A slightly higher close.", "six"),
                    ],
                    "pocket": [
                        ("welt", "Welt Pockets", "Clean welt pockets.", "welt"),
                        ("none", "No Pockets", "A plain front.", "none"),
                    ],
                },
                "products": [
                    ("navy-wool-waistcoat", "Navy Wool Waistcoat", "Waistcoat", IMG["waistcoat"]),
                ],
            },
            {
                "slug": "sherwani",
                "name": "Sherwani",
                "tagline": "Regal and grand",
                "description": "Occasion sherwanis with configurable length, closure, and lining.",
                "image": IMG["sherwani"],
                "groups": ["fit", "length", "closure", "lining"],
                "preset": "sherwani",
                "measurements": JACKET_MEASUREMENTS,
                "options": {
                    "fit": [
                        ("classic", "Classic Sherwani", "A traditional ceremonial line.", "classic"),
                        ("contemporary", "Contemporary", "A cleaner, slimmer silhouette.", "contemporary"),
                    ],
                    "length": [
                        ("knee", "Knee Length", "Classic wedding length.", "knee"),
                        ("below-knee", "Below Knee", "A longer regal fall.", "below-knee"),
                    ],
                    "closure": [
                        ("hook", "Hidden Hooks", "A clean closed front.", "hook"),
                        ("buttons", "Decorative Buttons", "Visible front buttons.", "buttons"),
                    ],
                    "lining": [
                        ("satin", "Satin Lining", "Smooth occasion lining.", "satin"),
                        ("cotton", "Cotton Lining", "A lighter lining.", "cotton"),
                    ],
                },
                "products": [
                    ("ivory-sherwani", "Ivory Occasion Sherwani", "Sherwani", IMG["sherwani"]),
                    ("maroon-sherwani", "Maroon Silk Sherwani", "Sherwani", IMG["sherwani"]),
                ],
            },
            {
                "slug": "blazer",
                "name": "Blazer",
                "tagline": "Formal wear for every occasion",
                "description": "Single blazers, two-piece suits, and three-piece suits drafted to your measurements.",
                "image": IMG["blazer"],
                "groups": ["fit", "lapel", "pocket", "lining"],
                "preset": "blazer",
                "supports_suit_types": True,
                "measurements": JACKET_MEASUREMENTS
                + [("trouser_waist", "Trouser waist", "If trousers are included."), ("inseam", "Inseam", "If trousers are included.")],
                "options": {
                    "fit": [
                        ("slim", "Slim Jacket", "Closer through the chest and waist.", "slim"),
                        ("regular", "Regular Jacket", "A classic tailored ease.", "regular"),
                    ],
                    "lapel": [
                        ("notch", "Notch Lapel", "The standard business lapel.", "notch"),
                        ("peak", "Peak Lapel", "A more formal upward peak.", "peak"),
                        ("shawl", "Shawl Lapel", "A continuous ceremonial curve.", "shawl"),
                    ],
                    "pocket": [
                        ("flap", "Flap Pockets", "Classic flap pockets.", "flap"),
                        ("jetted", "Jetted Pockets", "Clean jetted pockets.", "jetted"),
                    ],
                    "lining": [
                        ("navy", "Navy Lining", "A discreet lining.", "navy"),
                        ("gold", "Gold Lining", "A warmer lining accent.", "gold"),
                    ],
                },
                "products": [],
            },
        ]

        created_categories = {}
        for order, spec in enumerate(categories, start=1):
            category, _ = Category.objects.update_or_create(
                slug=spec["slug"],
                defaults={
                    "name": spec["name"],
                    "tagline": spec["tagline"],
                    "description": spec["description"],
                    "image_url": spec["image"],
                    "sort_order": order,
                    "is_active": True,
                    "supports_suit_types": spec.get("supports_suit_types", False),
                    "customization_groups": spec["groups"],
                },
            )
            created_categories[spec["slug"]] = category
            category.sizes.all().delete()
            for i, code in enumerate(SIZES):
                StandardSize.objects.create(category=category, code=code, label=code, sort_order=i)
            category.measurement_fields.all().delete()
            for i, (key, label, instruction) in enumerate(spec["measurements"]):
                MeasurementField.objects.create(
                    category=category, key=key, label=label, instruction=instruction, sort_order=i
                )
            category.options.all().delete()
            for group, options in spec["options"].items():
                for i, option in enumerate(options):
                    slug, name, description, variant, *rest = option
                    preference = rest[0] if rest else False
                    CustomizationOption.objects.create(
                        category=category,
                        group=group,
                        slug=slug,
                        name=name,
                        description=description,
                        viewer_variant=variant or "",
                        is_preference_prompt=preference,
                        image_url=spec["image"],
                        sort_order=i,
                    )
            GarmentModel3D.objects.update_or_create(
                category=category,
                name=f"{category.name} viewer",
                defaults={
                    "procedural_preset": spec["preset"],
                    "supported_options": {
                        "color": True,
                        "fit": spec["preset"] in {"shirt", "pants", "blazer"},
                        "collar": spec["preset"] == "shirt",
                        "cuff": spec["preset"] == "shirt",
                        "lapel": spec["preset"] == "blazer",
                    },
                    "fallback_note": "Procedural preview. Dedicated GLB assets can be linked in admin without changing the customization UI.",
                    "is_active": True,
                },
            )
            for slug, name, garment_type, image in spec["products"]:
                product, _ = Product.objects.update_or_create(
                    slug=slug,
                    defaults={
                        "category": category,
                        "name": name,
                        "garment_type": garment_type,
                        "description": spec["description"],
                        "image_url": image,
                        "quote_only": True,
                        "is_active": True,
                    },
                )
                product.fabrics.set(list(fabrics.values())[:3])
                product.colors.set(colors[:5])

        blazer = created_categories["blazer"]
        suit_types = [
            ("one-blazer", "One Blazer", "A single tailored blazer. Trousers are not included by default.", False, False, IMG["blazer"]),
            ("two-piece", "Two-Piece Suit", "A matching blazer and trousers.", True, False, IMG["suit2"]),
            ("three-piece", "Three-Piece Suit", "A matching blazer, trousers, and waistcoat.", True, True, IMG["suit3"]),
        ]
        created_types = {}
        for i, (slug, name, description, trousers, waistcoat, image) in enumerate(suit_types, start=1):
            created_types[slug] = SuitType.objects.update_or_create(
                category=blazer,
                slug=slug,
                defaults={
                    "name": name,
                    "description": description,
                    "includes_trousers": trousers,
                    "includes_waistcoat": waistcoat,
                    "image_url": image,
                    "sort_order": i,
                    "is_active": True,
                },
            )[0]

        blazer_products = [
            ("classic-navy-blazer", "Classic Navy Blazer", "One Blazer", "one-blazer", IMG["blazer"]),
            ("charcoal-single-blazer", "Charcoal Single Blazer", "One Blazer", "one-blazer", IMG["blazer"]),
            ("navy-two-piece", "Classic Navy Two-Piece", "Two-Piece Suit", "two-piece", IMG["suit2"]),
            ("ivory-two-piece", "Ivory Wedding Two-Piece", "Two-Piece Suit", "two-piece", IMG["suit2"]),
            ("navy-three-piece", "Navy Three-Piece Suit", "Three-Piece Suit", "three-piece", IMG["suit3"]),
            ("charcoal-three-piece", "Charcoal Three-Piece Suit", "Three-Piece Suit", "three-piece", IMG["suit3"]),
        ]
        for slug, name, garment_type, suit_slug, image in blazer_products:
            product, _ = Product.objects.update_or_create(
                slug=slug,
                defaults={
                    "category": blazer,
                    "suit_type": created_types[suit_slug],
                    "name": name,
                    "garment_type": garment_type,
                    "description": "Bespoke suiting drafted after measurements and a consultation.",
                    "image_url": image,
                    "quote_only": True,
                    "is_active": True,
                },
            )
            product.fabrics.set([fabrics["wool"], fabrics["silk"]])
            product.colors.set(colors[:4])

        self.stdout.write(self.style.SUCCESS("Seeded Darjee catalog."))
