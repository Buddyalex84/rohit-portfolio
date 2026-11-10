from catalog.models import Category, CustomizationOption, MeasurementField, Product, SuitType


SHIRT_ONLY_GROUPS = {"collar", "cuff"}
PANTS_SLUG = "casual-pants"
SHIRT_SLUG = "casual-shirt"
BLAZER_SLUG = "blazer"


def validate_customization_payload(category: Category, selections: list[dict]) -> list[str]:
    errors: list[str] = []
    allowed_groups = set(category.customization_groups or [])
    for selection in selections:
        group = selection.get("group")
        option_id = selection.get("option_id")
        if group not in allowed_groups:
            errors.append(f"Option group '{group}' is not available for {category.name}.")
            continue
        if group in SHIRT_ONLY_GROUPS and category.slug != SHIRT_SLUG:
            errors.append("Collar and cuff options apply only to casual shirts.")
            continue
        if option_id:
            try:
                option = CustomizationOption.objects.get(pk=option_id, is_active=True)
            except CustomizationOption.DoesNotExist:
                errors.append("Unknown customization option.")
                continue
            if option.category_id != category.id:
                errors.append(f"{option.name} is not valid for {category.name}.")
            if option.group != group:
                errors.append("Customization group does not match the selected option.")
    return errors


def validate_item(category: Category, product: Product | None, suit_type: SuitType | None) -> list[str]:
    errors: list[str] = []
    if product and product.category_id != category.id:
        errors.append("Selected product does not belong to this category.")
    if product and suit_type and product.suit_type_id and product.suit_type_id != suit_type.id:
        errors.append("Selected product does not match the chosen suit type.")
    if category.supports_suit_types and not suit_type:
        errors.append("Please choose One Blazer, Two-Piece Suit, or Three-Piece Suit.")
    if suit_type and suit_type.category_id != category.id:
        errors.append("Suit type is not valid for this category.")
    if suit_type and not category.supports_suit_types:
        errors.append("Suit types are only used for blazers and suits.")
    return errors


def validate_measurements(category: Category, size_mode: str, size_code: str, measurements: list[dict], unit: str) -> list[str]:
    errors: list[str] = []
    if unit not in {"cm", "in"}:
        errors.append("Unit must be cm or in.")
    if size_mode == "standard":
        if not size_code:
            errors.append("A standard size is required.")
        elif not category.sizes.filter(code=size_code).exists():
            errors.append("That size is not available for this garment.")
        return errors
    if size_mode != "custom":
        errors.append("Choose a standard size or custom measurements.")
        return errors
    required = list(MeasurementField.objects.filter(category=category))
    provided = {item.get("field_key"): item for item in measurements}
    for field in required:
        if field.key not in provided:
            errors.append(f"Missing measurement: {field.label}.")
            continue
        try:
            value = float(provided[field.key]["value"])
        except (TypeError, ValueError, KeyError):
            errors.append(f"Invalid value for {field.label}.")
            continue
        value_cm = value if unit == "cm" else value * 2.54
        if value_cm < float(field.min_cm) or value_cm > float(field.max_cm):
            errors.append(f"{field.label} is outside the accepted range.")
    return errors
