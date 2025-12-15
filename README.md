SkillStack
A Personal Skill-Building Tracker for Courses, Tutorials, and Certifications

SkillStack is a full-stack web application that helps users track and manage their learning journey across different online platforms such as YouTube, Udemy, and Coursera. The application allows users to add skills, associate learning resources, manually update progress, and visualize skill growth through a dashboard.

Features

Add and manage learning skills
Store learning resources (videos, courses, articles)
Track progress manually (Not Started, In Progress, Completed)
Record hours spent and learning notes
Rate difficulty level of skills
Dashboard with skill insights and category-wise breakdown

Tech Stack
Frontend

ReactJS
HTML5, CSS3
JavaScript

Backend

Python
Django
Django REST Framework

Database

SQLite (development)


Project Workflow

User logs into the system
Dashboard displays learning overview
User adds skills in the Skills section
Learning resources are added under Resources
User manually updates progress after learning externally
Dashboard updates automatically based on progress

Note: SkillStack does not automatically track activity from external platforms. All progress updates are manual.

API Endpoints

/api/skills/
/api/resources/
/api/progress/
/api/categories/
/api/certifications/

Setup Instructions

Backend Setup (Django)
cd skillstack/backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


Frontend Setup (React)

cd skillstack/frontend
npm install
npm start


AI Features Included

Learning resource recommendations,
Notes summarization,
Skill mastery date prediction,
Categorization of skills,


Author
Linju Rajan



