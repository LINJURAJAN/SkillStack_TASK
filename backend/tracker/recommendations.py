from collections import defaultdict
from .models import Resource, Skill

class ResourceRecommender:
    """
    A simple recommendation system based on user's past learning history
    """
    
    def recommend_resources(self, user_id=None, limit=5):
        """
        Recommend resources based on the user's past learning history
        For now, we'll implement a simple popularity-based recommendation
        """
        # In a real implementation, we would use user_id to personalize recommendations
        # For now, we'll just recommend popular resources based on completion rates
        
        # Get all resources with their completion status
        resources = Resource.objects.select_related('skill', 'progress').all()
        
        # Calculate completion rate for each resource
        resource_scores = []
        for resource in resources:
            # Simple scoring based on resource type and platform popularity
            score = self._calculate_resource_score(resource)
            resource_scores.append((resource, score))
        
        # Sort by score and return top recommendations
        resource_scores.sort(key=lambda x: x[1], reverse=True)
        recommendations = [resource for resource, score in resource_scores[:limit]]
        
        return recommendations
    
    def recommend_resources_by_skill(self, skill_id, limit=5):
        """
        Recommend resources related to a specific skill
        """
        # Get resources for the specified skill, sorted by completion rate
        resources = Resource.objects.filter(skill_id=skill_id).select_related('skill', 'progress')
        
        # Calculate scores for each resource
        resource_scores = []
        for resource in resources:
            score = self._calculate_resource_score(resource)
            resource_scores.append((resource, score))
        
        # Sort by score and return top recommendations
        resource_scores.sort(key=lambda x: x[1], reverse=True)
        recommendations = [resource for resource, score in resource_scores[:limit]]
        
        return recommendations
    
    def _calculate_resource_score(self, resource):
        """
        Calculate a score for a resource based on various factors
        """
        # Base score
        score = 0
        
        # Factor 1: Resource type (courses might be more comprehensive)
        if resource.resource_type == 'course':
            score += 3
        elif resource.resource_type == 'video':
            score += 2
        else:  # article
            score += 1
            
        # Factor 2: Platform popularity (based on common preference)
        platform_weights = {
            'udemy': 5,
            'coursera': 4,
            'youtube': 3,
            'edx': 2,
            'other': 1
        }
        score += platform_weights.get(resource.platform, 1)
        
        # Factor 3: Completion status (if exists)
        if hasattr(resource, 'progress') and resource.progress:
            if resource.progress.status == 'completed':
                score += 5
            elif resource.progress.status == 'in_progress':
                score += 2
            elif resource.progress.status == 'started':
                score += 1
                
        return score
    
    def recommend_skills(self, user_id=None, limit=5):
        """
        Recommend skills based on user's interests and market demand
        """
        # Get all skills with their resource counts
        skills = Skill.objects.prefetch_related('resources').all()
        
        # Calculate scores for each skill
        skill_scores = []
        for skill in skills:
            score = self._calculate_skill_score(skill)
            skill_scores.append((skill, score))
        
        # Sort by score and return top recommendations
        skill_scores.sort(key=lambda x: x[1], reverse=True)
        recommendations = [skill for skill, score in skill_scores[:limit]]
        
        return recommendations
    
    def _calculate_skill_score(self, skill):
        """
        Calculate a score for a skill based on various factors
        """
        # Base score
        score = 0
        
        # Factor 1: Number of resources (more resources = more comprehensive)
        resource_count = skill.resources.count()
        score += resource_count * 2
        
        # Factor 2: Completion rates of resources (higher completion = more valuable)
        completed_count = 0
        total_resources = 0
        
        for resource in skill.resources.all():
            total_resources += 1
            if hasattr(resource, 'progress') and resource.progress:
                if resource.progress.status == 'completed':
                    completed_count += 1
                    
        if total_resources > 0:
            completion_rate = completed_count / total_resources
            score += completion_rate * 10
            
        return score