from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count, Sum
from datetime import datetime, timedelta
from .models import Skill, Resource, Progress, Category, SkillCategory, Certification
from .serializers import (
    SkillSerializer, 
    ResourceSerializer, 
    ProgressSerializer, 
    CategorySerializer,
    SkillDetailSerializer,
    ResourceDetailSerializer,
    CertificationSerializer,
    CertificationDetailSerializer
)
from .recommendations import ResourceRecommender
from .summarization import NoteSummarizer

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SkillDetailSerializer
        return SkillSerializer
        
    @action(detail=True, methods=['get'])
    def recommend_resources(self, request, pk=None):
        """Recommend resources for a specific skill"""
        skill = self.get_object()
        recommender = ResourceRecommender()
        recommendations = recommender.recommend_resources_by_skill(skill.id)
        serializer = ResourceDetailSerializer(recommendations, many=True)
        return Response(serializer.data)

class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'list':
            return ResourceDetailSerializer
        return ResourceSerializer
        
    @action(detail=True, methods=['post'])
    def start_learning(self, request, pk=None):
        resource = self.get_object()
        progress, created = Progress.objects.get_or_create(resource=resource)
        progress.status = 'started'
        progress.started_at = datetime.now()
        progress.save()
        serializer = ProgressSerializer(progress)
        return Response(serializer.data)
        
    @action(detail=True, methods=['post'])
    def mark_complete(self, request, pk=None):
        resource = self.get_object()
        progress, created = Progress.objects.get_or_create(resource=resource)
        progress.status = 'completed'
        progress.completed_at = datetime.now()
        progress.save()
        serializer = ProgressSerializer(progress)
        return Response(serializer.data)
        
    @action(detail=False, methods=['get'])
    def recommend(self, request):
        """Get recommended resources for the user"""
        recommender = ResourceRecommender()
        recommendations = recommender.recommend_resources()
        serializer = ResourceDetailSerializer(recommendations, many=True)
        return Response(serializer.data)

class ProgressViewSet(viewsets.ModelViewSet):
    queryset = Progress.objects.all()
    serializer_class = ProgressSerializer
    
    @action(detail=False, methods=['get'])
    def weekly_summary(self, request):
        """Generate a weekly summary of progress"""
        # Get progress items from the last 7 days
        week_ago = datetime.now() - timedelta(days=7)
        progress_items = Progress.objects.filter(
            updated_at__gte=week_ago
        ).select_related('resource')
        
        summarizer = NoteSummarizer()
        summary = summarizer.generate_weekly_summary(progress_items)
        
        return Response({'summary': summary})

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class DashboardViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'])
    def stats(self, request):
        total_skills = Skill.objects.count()
        total_resources = Resource.objects.count()
        completed_resources = Progress.objects.filter(status='completed').count()
        
        # Get resources by platform
        resources_by_platform = Resource.objects.values('platform').annotate(count=Count('platform'))
        
        # Get resources by type
        resources_by_type = Resource.objects.values('resource_type').annotate(count=Count('resource_type'))
        
        # Get recent activity (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        recent_activity = Progress.objects.filter(
            updated_at__gte=week_ago
        ).values('status').annotate(count=Count('status'))
        
        # Get certification count
        total_certifications = Certification.objects.count()
        
        data = {
            'total_skills': total_skills,
            'total_resources': total_resources,
            'total_certifications': total_certifications,
            'completed_resources': completed_resources,
            'completion_rate': (completed_resources / total_resources * 100) if total_resources > 0 else 0,
            'resources_by_platform': list(resources_by_platform),
            'resources_by_type': list(resources_by_type),
            'recent_activity': list(recent_activity)
        }
        
        return Response(data)
        
    @action(detail=False, methods=['get'])
    def skills_breakdown(self, request):
        # Get skills with their resource counts and completion status
        skills_data = Skill.objects.prefetch_related('resources__progress').annotate(
            resource_count=Count('resources')
        )
        
        skills_list = []
        for skill in skills_data:
            # Count resources by different statuses
            started_count = 0
            in_progress_count = 0
            completed_count = 0
            
            for resource in skill.resources.all():
                if hasattr(resource, 'progress') and resource.progress:
                    status = resource.progress.status
                    if status == 'started':
                        started_count += 1
                    elif status == 'in_progress':
                        in_progress_count += 1
                    elif status == 'completed':
                        completed_count += 1
            
            # Total active resources (started + in_progress + completed)
            active_count = started_count + in_progress_count + completed_count
            
            skills_list.append({
                'id': skill.id,
                'name': skill.name,
                'resource_count': skill.resource_count,
                'started_count': started_count,
                'in_progress_count': in_progress_count,
                'completed_count': completed_count,
                'active_count': active_count,
                'completion_rate': (completed_count / skill.resource_count * 100) if skill.resource_count > 0 else 0,
                'activity_rate': (active_count / skill.resource_count * 100) if skill.resource_count > 0 else 0
            })
            
        return Response(skills_list)
        
    @action(detail=False, methods=['get'])
    def recommendations(self, request):
        """Get skill and resource recommendations"""
        recommender = ResourceRecommender()
        recommended_skills = recommender.recommend_skills()
        recommended_resources = recommender.recommend_resources()
        
        skill_serializer = SkillSerializer(recommended_skills, many=True)
        resource_serializer = ResourceDetailSerializer(recommended_resources, many=True)
        
        return Response({
            'skills': skill_serializer.data,
            'resources': resource_serializer.data
        })
        
class CertificationViewSet(viewsets.ModelViewSet):
    queryset = Certification.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve' or self.action == 'list':
            return CertificationSerializer
        return CertificationDetailSerializer
