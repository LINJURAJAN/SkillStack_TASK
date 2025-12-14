from datetime import datetime, timedelta
from .models import Progress

class WeeklySummaryGenerator:
    """
    Generates a weekly summary of learning progress
    """
    
    def generate_weekly_summary(self, user=None):
        """
        Generate a weekly summary of learning progress
        """
        # Get progress items updated in the last 7 days
        week_ago = datetime.now() - timedelta(days=7)
        progress_items = Progress.objects.filter(updated_at__gte=week_ago).select_related('resource__skill')
        
        if not progress_items.exists():
            return "No learning activity in the past week."
        
        # Summary statistics
        total_resources = progress_items.count()
        completed_count = progress_items.filter(status='completed').count()
        in_progress_count = progress_items.filter(status='in_progress').count()
        started_count = progress_items.filter(status='started').count()
        
        # Hours spent
        total_hours = sum(float(item.hours_spent) for item in progress_items if item.hours_spent)
        
        # Skills worked on
        skills = set()
        for item in progress_items:
            if item.resource and item.resource.skill:
                skills.add(item.resource.skill.name)
        
        # Difficulty ratings
        difficulty_ratings = [item.difficulty_rating for item in progress_items if item.difficulty_rating]
        avg_difficulty = sum(difficulty_ratings) / len(difficulty_ratings) if difficulty_ratings else 0
        
        # Generate summary text
        summary = f"""
Weekly Learning Summary Report
==============================
Report Period: {week_ago.strftime('%Y-%m-%d')} to {datetime.now().strftime('%Y-%m-%d')}

Overview:
- Total resources worked on: {total_resources}
- Completed this week: {completed_count}
- In progress: {in_progress_count}
- Started: {started_count}
- Total hours spent: {total_hours:.2f} hours

Skills Developed:
{chr(10).join(f"- {skill}" for skill in sorted(skills)) if skills else "No skills data available."}

Difficulty Rating:
- Average difficulty: {avg_difficulty:.1f}/5.0

Top Achievements:
"""
        
        # Add achievements
        if completed_count > 0:
            summary += f"- Completed {completed_count} resources!\n"
            
        if total_hours > 10:
            summary += f"- Dedication award: {total_hours:.1f} hours of learning!\n"
            
        if len(skills) > 3:
            summary += f"- Diverse learner: Worked on {len(skills)} different skills!\n"
            
        # Recommendations for next week
        summary += "\nRecommendations for Next Week:\n"
        
        if completed_count == 0:
            summary += "- Try to complete at least one resource this week\n"
        elif completed_count < 3:
            summary += "- Great job! Try to complete a few more resources\n"
        else:
            summary += "- Excellent progress! Keep up the great work\n"
            
        if total_hours < 5:
            summary += "- Consider dedicating more time to your learning goals\n"
            
        if len(skills) < 2:
            summary += "- Try exploring resources in different skill areas\n"
            
        return summary.strip()
    
    def print_weekly_summary(self):
        """
        Print the weekly summary to console (for demo purposes)
        """
        summary = self.generate_weekly_summary()
        print("=" * 50)
        print("WEEKLY LEARNING SUMMARY")
        print("=" * 50)
        print(summary)
        print("=" * 50)
        return summary