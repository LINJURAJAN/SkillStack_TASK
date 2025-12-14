import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResource, updateResource, deleteResource, updateProgress, startLearningResource, markResourceComplete } from '../services/api';

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: '',
    hours_spent: '',
    notes: '',
    difficulty_rating: 3
  });

  useEffect(() => {
    fetchResource();
  }, [id]);

  const fetchResource = async () => {
    try {
      const response = await getResource(id);
      setResource(response.data);
      setFormData({
        status: response.data.progress?.status || 'not_started',
        hours_spent: response.data.progress?.hours_spent || '',
        notes: response.data.progress?.notes || '',
        difficulty_rating: response.data.progress?.difficulty_rating || 3
      });
    } catch (error) {
      console.error('Error fetching resource:', error);
      setError('Failed to fetch resource: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      // Update progress using the progress API
      if (resource.progress) {
        // Existing progress record
        await updateProgress(resource.progress.id, {
          status: formData.status,
          hours_spent: parseFloat(formData.hours_spent) || 0,
          notes: formData.notes,
          difficulty_rating: parseInt(formData.difficulty_rating)
        });
      } else {
        // Create new progress record
        // We'll create a new progress by calling the appropriate endpoint
        if (formData.status === 'started' || formData.status === 'in_progress') {
          await startLearningResource(id);
          // Then update with additional details
          const response = await getResource(id);
          if (response.data.progress) {
            await updateProgress(response.data.progress.id, {
              status: formData.status,
              hours_spent: parseFloat(formData.hours_spent) || 0,
              notes: formData.notes,
              difficulty_rating: parseInt(formData.difficulty_rating)
            });
          }
        } else if (formData.status === 'completed') {
          await markResourceComplete(id);
          // Then update with additional details
          const response = await getResource(id);
          if (response.data.progress) {
            await updateProgress(response.data.progress.id, {
              status: formData.status,
              hours_spent: parseFloat(formData.hours_spent) || 0,
              notes: formData.notes,
              difficulty_rating: parseInt(formData.difficulty_rating)
            });
          }
        }
      }
      
      // Refresh the resource data
      await fetchResource();
      setEditing(false);
    } catch (error) {
      console.error('Error updating resource:', error);
      setError('Failed to update resource: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id);
        navigate('/resources');
      } catch (error) {
        console.error('Error deleting resource:', error);
        setError('Failed to delete resource: ' + error.message);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="text-center">Loading resource details...</div>;
  }

  if (error) {
    return (
      <div className="card" style={{backgroundColor: '#fee', border: '1px solid #fcc', color: '#c33'}}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!resource) {
    return <div className="text-center">Resource not found</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>{resource.title}</h1>
        <p>Resource Details</p>
      </div>

      {error && (
        <div className="card mb-3" style={{backgroundColor: '#fee', border: '1px solid #fcc', color: '#c33'}}>
          <p>Error: {error}</p>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header">
          <h2>Resource Information</h2>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Description:</strong> {resource.description || 'No description provided'}</p>
              <p><strong>URL:</strong> {resource.url ? <a href={resource.url} target="_blank" rel="noopener noreferrer">{resource.url}</a> : 'N/A'}</p>
              <p><strong>Type:</strong> 
                <span className="badge ml-2" style={{backgroundColor: '#e3f2fd', color: '#1976d2'}}>
                  {resource.resource_type}
                </span>
              </p>
              <p><strong>Platform:</strong> 
                <span className="badge ml-2" style={{backgroundColor: '#f3e5f5', color: '#7b1fa2'}}>
                  {resource.platform}
                </span>
              </p>
              <p><strong>Skill:</strong> 
                <span className="badge ml-2" style={{backgroundColor: '#e8f5e8', color: '#388e3c'}}>
                  {resource.skill_name}
                </span>
              </p>
            </div>
            <div className="col-md-6">
              <p><strong>Created:</strong> {formatDate(resource.created_at)}</p>
              <p><strong>Last Updated:</strong> {formatDate(resource.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <h2>Progress Tracking</h2>
        </div>
        <div className="card-body">
          {!editing ? (
            <div>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Status:</strong> 
                    <span className={`badge ml-2 ${
                      resource.progress?.status === 'completed' ? 'bg-success' :
                      resource.progress?.status === 'in_progress' ? 'bg-warning' :
                      resource.progress?.status === 'started' ? 'bg-info' :
                      'bg-secondary'
                    }`}>
                      {resource.progress?.status?.replace('_', ' ') || 'Not tracked'}
                    </span>
                  </p>
                  <p><strong>Hours Spent:</strong> {resource.progress?.hours_spent || 0} hours</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Difficulty Rating:</strong> {resource.progress?.difficulty_rating || 'N/A'}/5</p>
                  <p><strong>Completion Date:</strong> {formatDate(resource.progress?.completed_at)}</p>
                </div>
              </div>
              
              {resource.progress?.notes && (
                <div className="mt-3">
                  <p><strong>Notes:</strong></p>
                  <div className="border p-3 rounded">
                    {resource.progress.notes}
                  </div>
                </div>
              )}
              
              {resource.progress?.summary && (
                <div className="mt-3">
                  <p><strong>Summary:</strong></p>
                  <div className="border p-3 rounded bg-light">
                    {resource.progress.summary}
                  </div>
                </div>
              )}
              
              {resource.progress?.key_points && resource.progress.key_points.length > 0 && (
                <div className="mt-3">
                  <p><strong>Key Points:</strong></p>
                  <ul className="border p-3 rounded bg-light">
                    {resource.progress.key_points.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="btn-group mt-3">
                <button className="btn btn-primary" onClick={() => setEditing(true)}>
                  Update Progress
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete Resource
                </button>
                <button className="btn btn-secondary" onClick={() => navigate('/resources')}>
                  Back to Resources
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  className="form-control"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="not_started">Not Started</option>
                  <option value="started">Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="hours_spent">Hours Spent</label>
                <input
                  type="number"
                  id="hours_spent"
                  className="form-control"
                  value={formData.hours_spent}
                  onChange={(e) => setFormData({...formData, hours_spent: e.target.value})}
                  step="0.5"
                />
              </div>

              <div className="form-group">
                <label htmlFor="difficulty_rating">Difficulty Rating (1-5)</label>
                <input
                  type="range"
                  id="difficulty_rating"
                  className="form-control"
                  min="1"
                  max="5"
                  value={formData.difficulty_rating}
                  onChange={(e) => setFormData({...formData, difficulty_rating: parseInt(e.target.value)})}
                />
                <div className="text-center">{formData.difficulty_rating}/5</div>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  className="form-control"
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="btn-group">
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail;