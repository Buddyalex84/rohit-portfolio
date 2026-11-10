from django.conf import settings
from django.core.mail import send_mail


def notify_staff_request(reference: str, summary: str) -> bool:
    if not settings.EMAIL_CONFIGURED:
        return False
    recipient = settings.STAFF_NOTIFY_EMAIL or settings.EMAIL_HOST_USER
    if not recipient:
        return False
    send_mail(
        subject=f"New Darjee tailoring request {reference}",
        message=summary,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient],
        fail_silently=True,
    )
    return True
