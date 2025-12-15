SkillStack
A Personal Skill-Building Tracker for Courses, Tutorials, and Certifications

SkillStack is a full-stack web application designed to help users track, organize, and manage their learning journey across multiple online platforms such as YouTube, Udemy, and Coursera.
The application enables users to add skills, associate learning resources, manually update progress, and visualize skill growth through an interactive dashboard.

🚀 Features

Add and manage learning skills
Store learning resources (videos, courses, articles)
Manual progress tracking:

Not Started

In Progress

Completed

Record hours spent and personal learning notes
Rate difficulty level of each skill

Dashboard with:

Skill insights
Category-wise progress breakdown

🛠️ Tech Stack
Frontend

ReactJS
HTML5
CSS3
JavaScript

Backend

Python
Django
Django REST Framework

Database

SQLite (for development)

🔄 Project Workflow

User logs into the system
Dashboard displays an overview of learning progress
User adds skills under the Skills section
Learning resources are added under Resources
User manually updates progress after learning externally
Dashboard updates automatically based on progress

Note: SkillStack does not automatically track activity from external platforms. All progress updates are done manually by the user.

🔗 API Endpoints

/api/skills/

/api/resources/

/api/progress/

/api/categories/

/api/certifications/

⚙️ Setup Instructions
Backend Setup (Django)

Project Name: SkillTrack
App Name: tracker

cd skillstack/backend
python -m venv venv


Activate virtual environment:

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate


Install dependencies and run the server:

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

Frontend Setup (React)
cd skillstack/frontend
npm install
npm start

🤖 AI Features Included (Optional Enhancements)

Learning resource recommendations

Notes summarization

Skill categorization

Skill mastery date prediction

👤 Author

Linju Rajan
