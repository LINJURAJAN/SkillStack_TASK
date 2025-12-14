import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardRecommendations, getSkillRecommendations } from '../services/api';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState({ skills: [], resources: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const response = await getDashboardRecommendations();
      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError('Failed to fetch recommendations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading recommendations...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="recommendations-section">
      <h3>Recommended for You</h3>
      
      {recommendations.skills && recommendations.skills.length > 0 && (
        <div className="mb-4">
          <h4>Recommended Skills</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.skills.map((skill) => (
              <div key={skill.id} className="card">
                <div className="card-body">
                  <h5 className="card-title">{skill.name}</h5>
                  <p className="card-text">{skill.description || 'No description available'}</p>
                  <Link to={`/skills/${skill.id}/recommend_resources/`} className="btn btn-primary btn-sm">
                    View Resources
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {recommendations.resources && recommendations.resources.length > 0 && (
        <div>
          <h4>Recommended Resources</h4>
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Platform</th>
                  <th>Skill</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.resources.map((resource) => (
                  <tr key={resource.id}>
                    <td>
                      <Link to={`/resources/${resource.id}`} className="resource-link">
                        {resource.title}
                      </Link>
                      <div className="text-sm text-muted">{resource.description}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{resource.resource_type}</span>
                    </td>
                    <td>{resource.platform}</td>
                    <td>{resource.skill_name}</td>
                    <td>
                      <Link to={`/resources/${resource.id}`} className="btn btn-outline btn-sm">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(recommendations.skills.length === 0 && recommendations.resources.length === 0) && (
        <div className="text-center">
          <p>No recommendations available at this time.</p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;