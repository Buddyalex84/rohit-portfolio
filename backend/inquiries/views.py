from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework import serializers

from orders.emails import notify_staff_request

from .models import ContactInquiry


class ContactInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = ("full_name", "phone", "email", "subject", "message")

    def validate_message(self, value):
        if len(value.strip()) < 12:
            raise serializers.ValidationError("Please include a short note so we can help.")
        return value


class ContactInquiryView(APIView):
    authentication_classes: list = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "inquiries"

    def post(self, request):
        serializer = ContactInquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        inquiry = ContactInquiry.objects.create(
            **serializer.validated_data,
            ip_address=self._client_ip(request),
        )
        notify_staff_request(
            "CONTACT",
            f"Contact inquiry from {inquiry.full_name}: {inquiry.subject}\n\n{inquiry.message}",
        )
        return Response(
            {"ok": True, "message": "Inquiry received. We will respond using the details you provided."},
            status=status.HTTP_201_CREATED,
        )

    def _client_ip(self, request):
        forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR")
