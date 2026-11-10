from django.urls import path

from .views import (
    AdminTailoringRequestListView,
    ConsultationRequestView,
    ReferenceImageUploadView,
    TailoringRequestCreateView,
    TailoringRequestDetailView,
)

urlpatterns = [
    path("tailoring-requests/", TailoringRequestCreateView.as_view(), name="tailoring-requests"),
    path(
        "tailoring-requests/<str:reference>/",
        TailoringRequestDetailView.as_view(),
        name="tailoring-request-detail",
    ),
    path("admin/tailoring-requests/", AdminTailoringRequestListView.as_view(), name="admin-tailoring-requests"),
    path("reference-images/", ReferenceImageUploadView.as_view(), name="reference-images"),
    path("consultation-requests/", ConsultationRequestView.as_view(), name="consultation-requests"),
]
