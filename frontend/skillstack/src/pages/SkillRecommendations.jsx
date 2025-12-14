import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getSkill, getSkillRecommendations } from '../services/api';

const SkillRecommendations = () => {
  const { id } = useParams();
  const [skill, setSkill] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skillResponse, recommendationsResponse] = await Promise.all([
          getSkill(id),
          getSkillRecommendations(id)
        ]);
        
        setSkill(skillResponse.data);
        
        // Handle both paginated and non-paginated responses
        const recommendationsData = recommendationsResponse.data.results ? 
                                  recommendationsResponse.data.results : 
                                  recommendationsResponse.data;
        setRecommendations(recommendationsData);
      } catch (error) {
        console.error('Error fetching skill recommendations:', error);
        setError('Failed to fetch skill recommendations: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="text-center">Loading recommendations...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{backgroundColor: '#fee', border: '1px solid #fcc', color: '#c33'}}>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1>Recommended Resources for {skill?.name}</h1>
        <p>Based on your learning history and interests</p>
      </div>

      {error && (
        <div className="card mb-3" style={{backgroundColor: '#fee', border: '1px solid #fcc', color: '#c33'}}>
          <p>Error: {error}</p>
        </div>
      )}

      {recommendations.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Platform</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recommendations.map((resource) => (
                <tr key={resource.id}>
                  <td>
                    <div className="font-medium">
                      <a href={`/resources/${resource.id}`} className="resource-link">
                        {resource.title}
                      </a>
                    </div>
                    <div className="text-sm text-muted">{resource.description}</div>
                  </td>
                  <td>
                    <span className="badge badge-info">
                      {resource.resource_type}
                    </span>
                  </td>
                  <td>{resource.platform}</td>
                  <td>
                    <div className="btn-group">
                      <a href={`/resources/${resource.id}`} className="btn btn-small btn-outline">
                        View Details
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card text-center">
          <p>No recommendations available for this skill at this time.</p>
        </div>
      )}
    </div>
  );
};

export default SkillRecommendations;