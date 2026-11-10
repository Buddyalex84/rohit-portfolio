from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import ConsultationAppointment, TailoringRequest
from .serializers import (
    ConsultationSerializer,
    ReferenceImageSerializer,
    TailoringRequestCreateSerializer,
    TailoringRequestReadSerializer,
)


class TailoringRequestCreateView(APIView):
    authentication_classes: list = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "requests"

    def post(self, request):
        serializer = TailoringRequestCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        obj = serializer.save()
        return Response(
            {
                "ok": True,
                "message": "Your tailoring inquiry has been saved. A specialist will confirm details before production.",
                "data": TailoringRequestReadSerializer(obj).data,
            },
            status=status.HTTP_201_CREATED,
        )


class TailoringRequestDetailView(APIView):
    authentication_classes: list = []
    permission_classes = [AllowAny]

    def get(self, request, reference):
        try:
            obj = TailoringRequest.objects.select_related("customer").prefetch_related("items__category").get(
                reference=reference
            )
        except TailoringRequest.DoesNotExist:
            return Response({"ok": False, "error": "Request not found."}, status=404)
        return Response({"ok": True, "data": TailoringRequestReadSerializer(obj).data})


class AdminTailoringRequestListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = TailoringRequest.objects.select_related("customer").all()[:100]
        return Response({"ok": True, "data": TailoringRequestReadSerializer(qs, many=True).data})


class ReferenceImageUploadView(APIView):
    authentication_classes: list = []
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "uploads"

    def post(self, request):
        serializer = ReferenceImageSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        image = serializer.save()
        return Response(
            {
                "ok": True,
                "data": {
                    "id": image.id,
                    "field_key": image.field_key,
                    "url": request.build_absolute_uri(image.image.url),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class ConsultationRequestView(APIView):
    authentication_classes: list = []
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "inquiries"

    def post(self, request):
        serializer = ConsultationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        appointment = serializer.save()
        return Response(
            {
                "ok": True,
                "message": "Consultation requested. Availability will be confirmed before an appointment is accepted.",
                "data": ConsultationSerializer(appointment).data,
            },
            status=status.HTTP_201_CREATED,
        )
