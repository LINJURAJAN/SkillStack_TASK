import React, { useEffect, useState } from 'react';
import { getDashboardStats, getSkillsBreakdown, getDashboardRecommendations, getWeeklySummary } from '../services/api';
import Recommendations from '../components/Recommendations';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [skillsBreakdown, setSkillsBreakdown] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsResponse, skillsResponse, recommendationsResponse] = await Promise.all([
        getDashboardStats(),
        getSkillsBreakdown(),
        getDashboardRecommendations()
      ]);

      setStats(statsResponse.data);
      setSkillsBreakdown(skillsResponse.data);
      setRecommendations(recommendationsResponse.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWeeklySummary = async () => {
    try {
      const response = await getWeeklySummary();
      setWeeklySummary(response.data.summary || "No summary available.");
    } catch (error) {
      console.error('Error generating weekly summary:', error);
      setWeeklySummary("Failed to generate summary: " + error.message);
    }
  };

  const predictMasteryDate = (skill) => {
    // Simple prediction based on current progress rate
    if (skill.completion_rate === 100) {
      return 'Achieved';
    }
    
    if (skill.activity_rate === 0) {
      return 'Not started';
    }
    
    // Estimate remaining time based on current activity rate
    const remainingPercentage = 100 - skill.activity_rate;
    const estimatedDays = Math.ceil(remainingPercentage / (skill.activity_rate / 7)); // Assuming current rate continues
    
    const today = new Date();
    const predictedDate = new Date(today);
    predictedDate.setDate(today.getDate() + estimatedDays);
    
    return predictedDate.toLocaleDateString();
  };

  if (loading) {
    return <div className="text-center">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{backgroundColor: '#fee', border: '1px solid #fcc', color: '#c33'}}>
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Your learning progress and insights</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid mb-4">
        <div className="stat-card">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Skills Tracked</h3>
            <p>{stats.total_skills}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Resources</h3>
            <p>{stats.total_resources}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M16 12l-4-4-4 4M12 16V8" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Completion Rate</h3>
            <p>{stats.completion_rate.toFixed(1)}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="stat-content">
            <h3>Certifications</h3>
            <p>{stats.total_certifications}</p>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="card mt-6">
        <h3>Weekly Learning Summary</h3>
        <div className="mt-3">
          <p>{weeklySummary || "No summary available. Click 'Generate Weekly Summary' to create one."}</p>
        </div>
        <button className="btn btn-primary mt-3" onClick={handleGenerateWeeklySummary}>
          Generate Weekly Summary
        </button>
      </div>

      {/* Charts Section */}
      <div className="card-grid mt-6">
        {/* Resources by Platform */}
        {stats && stats.resources_by_platform && stats.resources_by_platform.length > 0 && (
          <div className="card">
            <h3>Resources by Platform</h3>
            <div>
              {stats.resources_by_platform.map((platform, index) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{platform.platform}</span>
                    <span>{platform.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(platform.count / stats.total_resources) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources by Type */}
        {stats && stats.resources_by_type && stats.resources_by_type.length > 0 && (
          <div className="card">
            <h3>Resources by Type</h3>
            <div>
              {stats.resources_by_type.map((type, index) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{type.resource_type.replace('_', ' ')}</span>
                    <span>{type.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(type.count / stats.total_resources) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Section */}
      <div className="mt-6">
        <Recommendations />
      </div>

      {/* Skills Breakdown with Predictions */}
      <div className="table-container mt-6">
        <h3>Skills Breakdown & Predictions</h3>
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Resources</th>
                <th>Active</th>
                <th>Completed</th>
                <th>Activity Rate</th>
                <th>Predicted Mastery Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {skillsBreakdown.map((skill) => (
                <tr key={skill.id}>
                  <td>{skill.name}</td>
                  <td>{skill.resource_count}</td>
                  <td>{skill.active_count}</td>
                  <td>{skill.completed_count}</td>
                  <td>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${skill.activity_rate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm">
                        {Math.round(skill.activity_rate)}%
                      </span>
                    </div>
                  </td>
                  <td>{predictMasteryDate(skill)}</td>
                  <td>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      skill.completion_rate === 100 ? 'bg-green-100 text-green-800' : 
                      skill.activity_rate > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {skill.completion_rate === 100 ? 'Completed' : 
                       skill.activity_rate > 0 ? 'In Progress' : 'Not Started'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;