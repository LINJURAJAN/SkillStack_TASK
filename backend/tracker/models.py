from django.db import models
from django.contrib.auth.models import User
from .summarization import NoteSummarizer

class Skill(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    target_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    difficulty_level = models.CharField(
        max_length=20, 
        choices=[
            ('Beginner', 'Beginner'),
            ('Intermediate', 'Intermediate'),
            ('Advanced', 'Advanced')
        ],
        default='Beginner'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
        
    class Meta:
        ordering = ['-created_at']

class Resource(models.Model):
    RESOURCE_TYPES = [
        ('video', 'Video'),
        ('course', 'Course'),
        ('article', 'Article'),
        ('book', 'Book'),
        ('tutorial', 'Tutorial'),
        ('other', 'Other'),
    ]
    
    PLATFORMS = [
        ('udemy', 'Udemy'),
        ('youtube', 'YouTube'),
        ('coursera', 'Coursera'),
        ('edx', 'edX'),
        ('pluralsight', 'Pluralsight'),
        ('linkedin_learning', 'LinkedIn Learning'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='resources')
    resource_type = models.CharField(max_length=20, choices=RESOURCE_TYPES)
    platform = models.CharField(max_length=30, choices=PLATFORMS)
    url = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.get_resource_type_display()})"
        
    class Meta:
        ordering = ['-created_at']

class Progress(models.Model):
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('started', 'Started'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]
    
    resource = models.OneToOneField(Resource, on_delete=models.CASCADE, related_name='progress')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    hours_spent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    notes = models.TextField(blank=True, null=True)
    difficulty_rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)], null=True, blank=True)  # 1-5 scale
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.resource.title} - {self.get_status_display()}"
        
    def get_summary(self, max_sentences=3):
        """
        Get a summary of the notes
        """
        if not self.notes:
            return "No notes available."
            
        summarizer = NoteSummarizer()
        return summarizer.summarize_notes(self.notes, max_sentences)
        
    def get_key_points(self, max_points=5):
        """
        Get key points from the notes
        """
        if not self.notes:
            return []
            
        summarizer = NoteSummarizer()
        return summarizer.extract_key_points(self.notes, max_points)
        
    class Meta:
        ordering = ['-created_at']

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
        
    class Meta:
        ordering = ['name']

# Many-to-many relationship between Skills and Categories
class SkillCategory(models.Model):
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('skill', 'category')
        ordering = ['-assigned_at']

# Certification model for tracking earned certifications
class Certification(models.Model):
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    skills = models.ManyToManyField(Skill, related_name='certifications', blank=True)
    issue_date = models.DateField()
    expiration_date = models.DateField(blank=True, null=True)
    credential_id = models.CharField(max_length=100, blank=True, null=True)
    credential_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.issuing_organization}"
        
    def is_expired(self):
        if self.expiration_date:
            from django.utils import timezone
            return self.expiration_date < timezone.now().date()
        return False
        
    class Meta:
        ordering = ['-issue_date']
