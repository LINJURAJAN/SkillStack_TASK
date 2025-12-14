from django.core.management.base import BaseCommand
from tracker.weekly_summary import WeeklySummaryGenerator

class Command(BaseCommand):
    help = 'Generate and display weekly learning summary'

    def handle(self, *args, **options):
        generator = WeeklySummaryGenerator()
        summary = generator.print_weekly_summary()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully generated weekly summary')
        )