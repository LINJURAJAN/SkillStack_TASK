import React, { useState, useEffect } from 'react';
import { getAllCertifications, createCertification, updateCertification, deleteCertification, getAllSkills } from '../services/api';

const Certifications = () => {
  const [certifications, setCertifications] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCertification, setEditingCertification] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    issuing_organization: '',
    description: '',
    skills: [],
    issue_date: '',
    expiration_date: '',
    credential_id: '',
    credential_url: ''
  });

  useEffect(() => {
    fetchCertifications();
    fetchSkills();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await getAllCertifications();
      
      // Handle both paginated and non-paginated responses
      const certificationsData = response.data.results ? response.data.results : response.data;
      
      setCertifications(certificationsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching certifications:', error);
      setError('Failed to fetch certifications: ' + error.message);
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
      // Prepare certification data - clean up all fields
      let certData = {
        name: formData.name.trim(),
        issuing_organization: formData.issuing_organization.trim(),
        issue_date: formData.issue_date
      };
      
      // Add optional fields only if they have values
      if (formData.description && formData.description.trim() !== '') {
        certData.description = formData.description.trim();
      }
      
      if (formData.expiration_date && formData.expiration_date.trim() !== '') {
        certData.expiration_date = formData.expiration_date;
      }
      
      if (formData.credential_id && formData.credential_id.trim() !== '') {
        certData.credential_id = formData.credential_id.trim();
      }
      
      if (formData.credential_url && formData.credential_url.trim() !== '') {
        certData.credential_url = formData.credential_url.trim();
      }
      
      // Only include skills if there are any selected
      if (formData.skills && formData.skills.length > 0) {
        certData.skills = formData.skills.map(skillId => {
          // Handle both string and number skill IDs
          const id = typeof skillId === 'string' ? parseInt(skillId, 10) : skillId;
          return isNaN(id) ? skillId : id;
        });
      }
      
      if (editingCertification) {
        await updateCertification(editingCertification.id, certData);
      } else {
        await createCertification(certData);
      }
      fetchCertifications();
      resetForm();
    } catch (error) {
      console.error('Error saving certification:', error);
      if (error.response && error.response.data) {
        console.error('Error details:', error.response.data);
        // Check if it's a validation error from Django
        if (error.response.data.detail) {
          setError('Failed to save certification: ' + error.response.data.detail);
        } else if (typeof error.response.data === 'object') {
          // Handle field-specific errors
          const errorMessages = Object.entries(error.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('; ');
          setError('Failed to save certification: ' + errorMessages);
        } else {
          setError('Failed to save certification: ' + (error.response.data.error || error.response.data || error.message));
        }
      } else {
        setError('Failed to save certification: ' + error.message);
      }
    }
  };

  const handleEdit = (certification) => {
    setEditingCertification(certification);
    setFormData({
      name: certification.name,
      issuing_organization: certification.issuing_organization,
      description: certification.description || '',
      skills: certification.skills ? certification.skills.map(skill => skill.id.toString()) : [],
      issue_date: certification.issue_date,
      expiration_date: certification.expiration_date || '',
      credential_id: certification.credential_id || '',
      credential_url: certification.credential_url || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this certification?')) {
      try {
        await deleteCertification(id);
        fetchCertifications();
      } catch (error) {
        console.error('Error deleting certification:', error);
        setError('Failed to delete certification: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setEditingCertification(null);
    setFormData({
      name: '',
      issuing_organization: '',
      description: '',
      skills: [],
      issue_date: '',
      expiration_date: '',
      credential_id: '',
      credential_url: ''
    });
    setShowForm(false);
    setError(null);
  };

  const handleSkillChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({
      ...formData,
      skills: selectedOptions
    });
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1>Certifications</h1>
        <p>Manage your earned certifications and credentials</p>
      </div>

      {error && (
        <div className="card mb-3" style={{backgroundColor: '#fee', border: '1px solid #fcc', color: '#c33'}}>
          <p>Error: {error}</p>
        </div>
      )}

      {!showForm ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2>All Certifications</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Add New Certification
            </button>
          </div>

          {certifications.length === 0 ? (
            <div className="card text-center">
              <p>You haven't added any certifications yet.</p>
              <button 
                className="btn btn-primary mt-2"
                onClick={() => setShowForm(true)}
              >
                Add Your First Certification
              </button>
            </div>
          ) : (
            <div className="card-grid">
              {certifications.map((certification) => (
                <div key={certification.id} className="card">
                  <h3>{certification.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{certification.issuing_organization}</p>
                  <p className="mb-3">{certification.description}</p>
                  
                  <div className="mb-3">
                    <strong>Issue Date:</strong> {certification.issue_date}
                  </div>
                  
                  {certification.expiration_date && (
                    <div className="mb-3">
                      <strong>Expiration Date:</strong> {certification.expiration_date}
                      {new Date(certification.expiration_date) < new Date() && (
                        <span className="badge badge-warning ml-2">Expired</span>
                      )}
                    </div>
                  )}
                  
                  {certification.credential_id && (
                    <div className="mb-3">
                      <strong>Credential ID:</strong> {certification.credential_id}
                    </div>
                  )}
                  
                  {certification.skills && certification.skills.length > 0 && (
                    <div className="mb-3">
                      <strong>Related Skills:</strong>
                      <div className="mt-1">
                        {certification.skills.map((skill) => (
                          <span key={skill.id} className="badge badge-info mr-1">
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="btn-group mt-3">
                    <button 
                      className="btn btn-small btn-outline"
                      onClick={() => handleEdit(certification)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(certification.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="form-container">
          <h2 className="mb-3">{editingCertification ? 'Edit Certification' : 'Add New Certification'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Certification Name *</label>
              <input
                type="text"
                id="name"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="issuing_organization">Issuing Organization *</label>
              <input
                type="text"
                id="issuing_organization"
                className="form-control"
                value={formData.issuing_organization}
                onChange={(e) => setFormData({...formData, issuing_organization: e.target.value})}
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="issue_date">Issue Date *</label>
                <input
                  type="date"
                  id="issue_date"
                  className="form-control"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({...formData, issue_date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="expiration_date">Expiration Date</label>
                <input
                  type="date"
                  id="expiration_date"
                  className="form-control"
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({...formData, expiration_date: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="credential_id">Credential ID</label>
              <input
                type="text"
                id="credential_id"
                className="form-control"
                value={formData.credential_id}
                onChange={(e) => setFormData({...formData, credential_id: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label htmlFor="credential_url">Credential URL</label>
              <input
                type="url"
                id="credential_url"
                className="form-control"
                value={formData.credential_url}
                onChange={(e) => setFormData({...formData, credential_url: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label htmlFor="skills">Related Skills</label>
              <select
                id="skills"
                className="form-control"
                multiple
                value={formData.skills}
                onChange={handleSkillChange}
              >
                {skills.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
              <small className="text-muted">Hold Ctrl/Cmd to select multiple skills</small>
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary">
                {editingCertification ? 'Update Certification' : 'Add Certification'}
              </button>
              <button type="button" className="btn btn-secondary ml-2" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Certifications;