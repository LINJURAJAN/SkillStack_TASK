from rest_framework import serializers
from .models import Skill, Resource, Progress, Category, SkillCategory, Certification

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'description', 'category', 'target_hours', 'difficulty_level', 'created_at', 'updated_at']

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at']

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['id', 'title', 'skill', 'resource_type', 'platform', 'url', 'description', 'created_at', 'updated_at']

class ProgressSerializer(serializers.ModelSerializer):
    summary = serializers.SerializerMethodField()
    key_points = serializers.SerializerMethodField()
    
    class Meta:
        model = Progress
        fields = ['id', 'resource', 'status', 'hours_spent', 'notes', 'difficulty_rating', 
                  'started_at', 'completed_at', 'created_at', 'updated_at', 'summary', 'key_points']
        read_only_fields = ['created_at', 'updated_at', 'summary', 'key_points']
        
    def get_summary(self, obj):
        return obj.get_summary()
        
    def get_key_points(self, obj):
        return obj.get_key_points()

class SkillDetailSerializer(serializers.ModelSerializer):
    resources = ResourceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Skill
        fields = ['id', 'name', 'description', 'category', 'target_hours', 'difficulty_level', 'resources', 'created_at', 'updated_at']

class ResourceDetailSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    progress = ProgressSerializer(read_only=True)
    
    class Meta:
        model = Resource
        fields = ['id', 'title', 'skill', 'skill_name', 'resource_type', 'platform', 'url', 'description',
                  'progress', 'created_at', 'updated_at']

class CertificationSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    
    class Meta:
        model = Certification
        fields = ['id', 'name', 'issuing_organization', 'description', 'skills', 
                  'issue_date', 'expiration_date', 'credential_id', 'credential_url',
                  'created_at', 'updated_at']

class CertificationDetailSerializer(serializers.ModelSerializer):
    skills = serializers.PrimaryKeyRelatedField(queryset=Skill.objects.all(), many=True, required=False)
    
    class Meta:
        model = Certification
        fields = ['id', 'name', 'issuing_organization', 'description', 'skills', 
                  'issue_date', 'expiration_date', 'credential_id', 'credential_url',
                  'created_at', 'updated_at']
