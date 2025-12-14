class NoteSummarizer:
    """
    A simple note summarization utility
    In a real implementation, this would use NLP techniques or AI models
    For now, we'll implement a basic extractive summarization approach
    """
    
    def summarize_notes(self, notes, max_sentences=3):
        """
        Summarize notes by extracting the most important sentences
        """
        if not notes:
            return "No notes available."
            
        # Split notes into sentences
        sentences = self._split_into_sentences(notes)
        
        if len(sentences) <= max_sentences:
            return notes
            
        # For now, we'll just return the first few sentences as a simple summary
        # In a real implementation, we would use more sophisticated techniques
        summary_sentences = sentences[:max_sentences]
        return ". ".join(summary_sentences) + "."
    
    def _split_into_sentences(self, text):
        """
        Split text into sentences
        """
        import re
        # Simple sentence splitting - in a real implementation, use NLTK or spaCy
        sentences = re.split(r'[.!?]+', text)
        # Remove empty sentences and strip whitespace
        sentences = [s.strip() for s in sentences if s.strip()]
        return sentences
    
    def extract_key_points(self, notes, max_points=5):
        """
        Extract key points from notes
        """
        if not notes:
            return []
            
        # Split into lines and filter out empty lines
        lines = [line.strip() for line in notes.split('\n') if line.strip()]
        
        # Look for lines that start with bullet points or numbers
        key_points = []
        for line in lines:
            if line.startswith(('-', '*', '•', '1', '2', '3', '4', '5', '6', '7', '8', '9')):
                key_points.append(line.lstrip('-*•0123456789 .'))
            elif ':' in line and len(line) < 100:  # Likely a heading or key point
                key_points.append(line)
                
        # If we didn't find structured key points, return the first few lines
        if not key_points:
            key_points = lines[:max_points]
        else:
            key_points = key_points[:max_points]
            
        return key_points
    
    def generate_weekly_summary(self, progress_items):
        """
        Generate a weekly summary from progress items
        """
        if not progress_items:
            return "No learning activities recorded this week."
            
        summary_parts = []
        
        # Calculate total hours spent
        total_hours = sum(float(item.hours_spent) for item in progress_items if item.hours_spent)
        
        # Count resources by status
        status_counts = {}
        for item in progress_items:
            status = item.status
            status_counts[status] = status_counts.get(status, 0) + 1
            
        # Add summary of activities
        summary_parts.append(f"This week, you spent {total_hours:.1f} hours on learning.")
        
        # Add status summary
        status_summary = ", ".join([f"{count} {status.replace('_', ' ')}" for status, count in status_counts.items()])
        summary_parts.append(f"You worked on {len(progress_items)} resources: {status_summary}.")
        
        # Add completed resources
        completed = [item for item in progress_items if item.status == 'completed']
        if completed:
            completed_titles = [getattr(item, 'resource', getattr(item, '__str__', lambda: 'Unknown')()).title 
                              for item in completed if hasattr(item, 'resource')]
            summary_parts.append(f"You completed: {', '.join(completed_titles[:3])}{'' if len(completed_titles) <= 3 else ', and more'}.")
            
        # Add in-progress resources
        in_progress = [item for item in progress_items if item.status == 'in_progress']
        if in_progress:
            in_progress_titles = [getattr(item, 'resource', getattr(item, '__str__', lambda: 'Unknown')()).title 
                                for item in in_progress if hasattr(item, 'resource')]
            summary_parts.append(f"You're currently working on: {', '.join(in_progress_titles[:3])}{'' if len(in_progress_titles) <= 3 else ', and more'}.")
            
        return " ".join(summary_parts)
    
    def generate_summary_from_progress(self, progress_items):
        """
        Generate a summary from a list of progress items
        """
        if not progress_items:
            return "No progress data available."
            
        summary_parts = []
        
        # Count resources by status
        status_counts = {}
        for item in progress_items:
            status = item.status
            status_counts[status] = status_counts.get(status, 0) + 1
            
        # Add status summary
        status_summary = ", ".join([f"{count} {status.replace('_', ' ')}" for status, count in status_counts.items()])
        summary_parts.append(f"You have {len(progress_items)} learning resources: {status_summary}.")
        
        # Add completed resources
        completed = [item for item in progress_items if item.status == 'completed']
        if completed:
            summary_parts.append(f"You've completed {len(completed)} resources.")
            
        # Add in-progress resources
        in_progress = [item for item in progress_items if item.status == 'in_progress']
        if in_progress:
            summary_parts.append(f"You're currently working on {len(in_progress)} resources.")
            
        return " ".join(summary_parts)