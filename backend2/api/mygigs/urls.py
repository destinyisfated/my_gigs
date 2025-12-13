from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from .views import (
    whoami,
    FreelancerProfileUpdateView,
    FreelancerViewSet,
    ProfessionViewSet,
    ReviewViewSet,
    JobViewSet,
    TestimonialViewSet,
)

router = DefaultRouter()
router.register(r'freelancers', FreelancerViewSet, basename='freelancer')
router.register(r'reviews', ReviewViewSet, basename='review')  # 👈 IMPORTANT
router.register(r'professions', ProfessionViewSet, basename='profession')
router.register(r'job', JobViewSet, basename='job')
router.register(r'testimonials', TestimonialViewSet, basename='testimonial')

freelancer_router = NestedDefaultRouter(
    router, r'freelancers', lookup='freelancer'
)
freelancer_router.register(
    r'reviews',
    ReviewViewSet,
    basename='freelancer-reviews'
)

urlpatterns = [
    path("freelancers/me/", FreelancerProfileUpdateView.as_view(), name="freelancer-profile-update"),
    path("whoami/", whoami, name="whoami"),
    path("", include(router.urls)),
    path("", include(freelancer_router.urls)),
]
