import React, { useState, useEffect } from 'react';
import { getAllSkills, createSkill, updateSkill, deleteSkill } from '../services/api';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    target_hours: '',
    difficulty_level: 'Beginner'
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await getAllSkills();
      
      // Handle both paginated and non-paginated responses
      const skillsData = response.data.results ? response.data.results : response.data;
      
      setSkills(skillsData);
      setError(null);
    } catch (error) {
      console.error('Error fetching skills:', error);
      setError('Failed to fetch skills: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert target_hours to number if provided
      const skillData = {
        ...formData,
        target_hours: formData.target_hours ? parseFloat(formData.target_hours) : 0
      };
      
      if (editingSkill) {
        await updateSkill(editingSkill.id, skillData);
      } else {
        await createSkill(skillData);
      }
      fetchSkills();
      resetForm();
    } catch (error) {
      console.error('Error saving skill:', error);
      setError('Failed to save skill: ' + error.message);
    }
  };

  const handleEdit = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      description: skill.description || '',
      category: skill.category || '',
      target_hours: skill.target_hours || '',
      difficulty_level: skill.difficulty_level || 'Beginner'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await deleteSkill(id);
        fetchSkills();
      } catch (error) {
        console.error('Error deleting skill:', error);
        setError('Failed to delete skill: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setEditingSkill(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      target_hours: '',
      difficulty_level: 'Beginner'
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
        <h1>Skills</h1>
        <p>Manage your learning skills and track progress</p>
      </div>

      {error && (
        <div className="card mb-3" style={{backgroundColor: '#fee', border: '1px solid #fcc', color: '#c33'}}>
          <p>Error: {error}</p>
        </div>
      )}

      {!showForm ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2>All Skills</h2>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setShowForm(true);
              }}
            >
              Add New Skill
            </button>
          </div>

          {skills.length === 0 ? (
            <div className="card text-center">
              <p>You haven't added any skills yet.</p>
              <button 
                className="btn btn-primary mt-2"
                onClick={() => {
                  setShowForm(true);
                }}
              >
                Add Your First Skill
              </button>
            </div>
          ) : (
            <div className="card-grid">
              {skills.map((skill) => (
                <div key={skill.id} className="card">
                  <h3>{skill.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{skill.category}</p>
                  <p className="mb-3">{skill.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      Target: {skill.target_hours} hours
                    </span>
                    <span className="text-sm">
                      {skill.difficulty_level}
                    </span>
                  </div>
                  <div className="btn-group mt-3">
                    <button 
                      className="btn btn-small btn-outline"
                      onClick={() => handleEdit(skill)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(skill.id)}
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
          <h2 className="mb-3">{editingSkill ? 'Edit Skill' : 'Add New Skill'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Skill Name *</label>
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
              <label htmlFor="category">Category</label>
              <input
                type="text"
                id="category"
                className="form-control"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label htmlFor="target_hours">Target Hours</label>
              <input
                type="number"
                id="target_hours"
                className="form-control"
                value={formData.target_hours}
                onChange={(e) => setFormData({...formData, target_hours: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label htmlFor="difficulty_level">Difficulty Level</label>
              <select
                id="difficulty_level"
                className="form-control"
                value={formData.difficulty_level}
                onChange={(e) => setFormData({...formData, difficulty_level: e.target.value})}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="btn-group">
              <button type="submit" className="btn btn-primary">
                {editingSkill ? 'Update Skill' : 'Add Skill'}
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

export default Skills;