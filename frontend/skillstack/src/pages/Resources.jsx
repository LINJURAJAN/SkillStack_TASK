import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllResources, createResource, updateResource, deleteResource, getAllSkills } from '../services/api';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    resource_type: 'article',
    platform: 'other',
    skill: ''
  });
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    fetchResources();
    fetchSkills();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await getAllResources();
      
      // Handle both paginated and non-paginated responses
      const resourcesData = response.data.results ? response.data.results : response.data;
      
      setResources(resourcesData);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to fetch resources: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await getAllSkills();
      
      // Handle both paginated and non-paginated responses
      const skillsData = response.data.results ? response.data.results : response.data;
      
      setSkills(skillsData);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate that a skill is selected
      if (!formData.skill) {
        setError('Please select a skill for this resource');
        return;
      }
      
      // Prepare resource data - only include fields that belong to the Resource model
      const resourceData = {
        title: formData.title,
        skill: parseInt(formData.skill),
        resource_type: formData.resource_type,
        platform: formData.platform,
        url: formData.url,
        description: formData.description
      };
      
      if (editingResource) {
        await updateResource(editingResource.id, resourceData);
      } else {
        await createResource(resourceData);
      }
      fetchResources();
      resetForm();
    } catch (error) {
      console.error('Error saving resource:', error);
      setError('Failed to save resource: ' + error.message);
    }
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      url: resource.url || '',
      resource_type: resource.resource_type || 'article',
      platform: resource.platform || 'other',
      skill: resource.skill || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await deleteResource(id);
        fetchResources();
      } catch (error) {
        console.error('Error deleting resource:', error);
        setError('Failed to delete resource: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setEditingResource(null);
    setFormData({
      title: '',
      description: '',
      url: '',
      resource_type: 'article',
      platform: 'other',
      skill: ''
    });
    setShowForm(false);
    setError(null);
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Resources</h1>
        <p>Manage your learning resources and track progress</p>
      </div>

      {error && (
        <div className="card mb-3" style={{backgroundColor: '#fee', border: '1px solid #fcc', color: '#c33'}}>
          <p>Error: {error}</p>
        </div>
      )}

      {!showForm ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2>All Resources</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add New Resource
            </button>
          </div>

          {resources.length === 0 ? (
            <div className="card text-center">
              <p>You haven't added any resources yet.</p>
              <button 
                className="btn btn-primary mt-2"
                onClick={() => setShowForm(true)}
              >
                Add Your First Resource
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Platform</th>
                    <th>Skill</th>
                    <th>Status</th>
                    <th>Hours</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource) => (
                    <tr key={resource.id}>
                      <td>
                        <div className="font-medium">
                          <Link to={`/resources/${resource.id}`} className="resource-link">
                            {resource.title}
                          </Link>
                        </div>
                        <div className="text-sm text-muted">{resource.description}</div>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {resource.resource_type}
                        </span>
                      </td>
                      <td>{resource.platform}</td>
                      <td>{resource.skill_name}</td>
                      <td>
                        <span className={`badge ${
                          resource.progress?.status === 'completed' ? 'badge-success' :
                          resource.progress?.status === 'in_progress' ? 'badge-warning' :
                          resource.progress?.status === 'started' ? 'badge-info' :
                          'badge-secondary'
                        }`}>
                          {resource.progress?.status ? resource.progress.status.replace('_', ' ') : 'not started'}
                        </span>
                      </td>
                      <td>{resource.progress?.hours_spent || 0} hrs</td>
                      <td>
                        <div className="btn-group">
                          <button 
                            className="btn btn-small btn-outline"
                            onClick={() => handleEdit(resource)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-small btn-danger"
                            onClick={() => handleDelete(resource.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="form-container">
          <h2 className="mb-3">{editingResource ? 'Edit Resource' : 'Add New Resource'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                className="form-control"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                className="form-control"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="url">URL</label>
              <input
                type="url"
                id="url"
                className="form-control"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label htmlFor="resource_type">Resource Type</label>
              <select
                id="resource_type"
                className="form-control"
                value={formData.resource_type}
                onChange={(e) => setFormData({...formData, resource_type: e.target.value})}
              >
                <option value="article">Article</option>
                <option value="video">Video</option>
                <option value="course">Course</option>
                <option value="book">Book</option>
                <option value="tutorial">Tutorial</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="platform">Platform</label>
              <select
                id="platform"
                className="form-control"
                value={formData.platform}
                onChange={(e) => setFormData({...formData, platform: e.target.value})}
              >
                <option value="udemy">Udemy</option>
                <option value="coursera">Coursera</option>
                <option value="youtube">YouTube</option>
                <option value="pluralsight">Pluralsight</option>
                <option value="linkedin_learning">LinkedIn Learning</option>
                <option value="edx">edX</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="skill">Skill *</label>
              <select
                id="skill"
                className="form-control"
                value={formData.skill}
                onChange={(e) => setFormData({...formData, skill: e.target.value})}
                required
              >
                <option value="">Select a skill</option>
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>{skill.name}</option>
                ))}
              </select>
            </div>

            <div className="btn-group">
              <button type="submit" className="btn btn-primary">
                {editingResource ? 'Update Resource' : 'Add Resource'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Resources;