from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SkillViewSet, ResourceViewSet, ProgressViewSet, CategoryViewSet, DashboardViewSet, CertificationViewSet

router = DefaultRouter()
router.register(r'skills', SkillViewSet)
router.register(r'resources', ResourceViewSet)
router.register(r'progress', ProgressViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'certifications', CertificationViewSet)
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('api/', include(router.urls)),
]