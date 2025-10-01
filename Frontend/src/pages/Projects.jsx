import React, { useState, useEffect } from 'react';
import { ExternalLink, Github, Code2, ChevronDown, Plus, Edit, Trash2, Search, Filter, Calendar, Tag, Eye, Rocket, Star } from 'lucide-react';
import { projectsAPI, uploadAPI, apiUtils } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Projects = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);
  
  const { user, isAuthenticated } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    status: 'idea',
    repoUrl: '',
    liveUrl: '',
    images: [],
    startDate: '',
    endDate: '',
    contributors: []
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    fetchProjects();
    if (isAuthenticated) {
      fetchStats();
    }
  }, [currentPage, searchQuery, statusFilter, tagFilter, isAuthenticated]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 9,
        ...(searchQuery && { q: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
        ...(tagFilter && { tags: tagFilter }),
        sort: '-createdAt'
      };

      const response = await projectsAPI.getAll(params);
      setProjects(response.data);
      setTotalPages(response.meta.totalPages);
      setError(null);
    } catch (err) {
      setError(apiUtils.handleError(err, 'Failed to fetch projects'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await projectsAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Project form submission started');
    console.log('📝 Form data before processing:', formData);
    
    // Get current auth state
    const { user: currentUser, isAuthenticated: currentAuthStatus } = useAuth();
    console.log('🔐 User authentication status:', currentAuthStatus);
    console.log('👤 Current user:', currentUser);
    
    try {
      const projectData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim()),
        contributors: formData.contributors.filter(email => email.trim()),
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined
      };

      console.log('📊 Processed project data:', projectData);
      console.log('🔄 Operation type:', editingProject ? 'UPDATE' : 'CREATE');
      
      if (editingProject) {
        console.log('✏️ Updating project with ID:', editingProject._id);
        const response = await projectsAPI.update(editingProject._id, projectData);
        console.log('✅ Update response:', response);
      } else {
        console.log('➕ Creating new project');
        const response = await projectsAPI.create(projectData);
        console.log('✅ Create response:', response);
      }

      console.log('🎉 Project saved successfully');
      setShowForm(false);
      setEditingProject(null);
      resetForm();
      fetchProjects();
      if (currentAuthStatus) fetchStats();
    } catch (err) {
      console.error('❌ Error saving project:', err);
      console.error('📋 Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      
      // Log the full error object for debugging
      console.error('🔍 Full error object:', err);
      
      setError(apiUtils.handleError(err, 'Failed to save project'));
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      tags: project.tags || [],
      status: project.status,
      repoUrl: project.repoUrl || '',
      liveUrl: project.liveUrl || '',
      images: project.images || [],
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
      contributors: project.contributors || []
    });
    setShowForm(true);
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await projectsAPI.delete(projectId);
      fetchProjects();
      if (isAuthenticated) fetchStats();
    } catch (err) {
      setError(apiUtils.handleError(err, 'Failed to delete project'));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tags: [],
      status: 'idea',
      repoUrl: '',
      liveUrl: '',
      images: [],
      startDate: '',
      endDate: '',
      contributors: []
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    try {
      const uploadPromises = files.map(file => uploadAPI.uploadImage(file));
      const responses = await Promise.all(uploadPromises);
      const imageUrls = responses.map(response => response.data.url);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    } catch (err) {
      setError(apiUtils.handleError(err, 'Failed to upload images'));
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addContributor = (email) => {
    if (email && !formData.contributors.includes(email)) {
      setFormData(prev => ({
        ...prev,
        contributors: [...prev.contributors, email]
      }));
    }
  };

  const removeContributor = (index) => {
    setFormData(prev => ({
      ...prev,
      contributors: prev.contributors.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'idea': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20">
        <div 
          className="absolute w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
          style={{
            left: mousePosition.x * 0.02 + '%',
            top: mousePosition.y * 0.02 + '%',
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl"
          style={{
            right: (100 - mousePosition.x * 0.03) + '%',
            bottom: (100 - mousePosition.y * 0.03) + '%',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="space-y-8 z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-purple-600/20 rounded-full border border-purple-400/30 backdrop-blur-sm">
                <Rocket className="w-4 h-4 text-purple-400 mr-2" />
                <span className="text-sm font-medium">Innovation & Development</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  Projects
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
                Exploring the intersection of <span className="text-purple-400 font-semibold">technology</span> and 
                <span className="text-cyan-400 font-semibold"> innovation</span> through meaningful projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {stats && (
        <section className="py-12 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { number: stats.total, label: 'Total Projects', icon: Code2, color: 'from-purple-600/20 to-purple-800/20' },
                { number: stats.completed, label: 'Completed', icon: Star, color: 'from-green-600/20 to-green-800/20' },
                { number: stats.inProgress, label: 'In Progress', icon: Rocket, color: 'from-cyan-600/20 to-cyan-800/20' },
                { number: stats.ideas, label: 'Ideas', icon: Eye, color: 'from-yellow-600/20 to-yellow-800/20' }
              ].map((stat, index) => (
                <div key={index} className={`bg-gradient-to-br ${stat.color} backdrop-blur-sm rounded-xl p-6 border border-white/10 text-center group hover:scale-105 transition-transform duration-300`}>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Search and Filter Section */}
      <section className="py-8 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-purple-600/10 to-cyan-600/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors duration-300"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors duration-300"
                >
                  <option value="">All Status</option>
                  <option value="idea">Ideas</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <input
                  type="text"
                  placeholder="Filter by tag..."
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors duration-300"
                />
              </div>

              {isAuthenticated && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg font-semibold text-white hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Project
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-8 px-6 relative">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gradient-to-r from-purple-600/10 to-cyan-600/10 backdrop-blur-sm rounded-xl p-12 border border-white/10 max-w-md mx-auto">
                <Code2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Projects Found</h3>
                <p className="text-gray-400">Start by creating your first project!</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div key={project._id} className="group relative">
                  <div className="bg-gradient-to-br from-purple-600/10 to-cyan-600/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:transform hover:scale-105 h-full flex flex-col">
                    {/* Project Image */}
                    {project.images && project.images.length > 0 && (
                      <div className="mb-4 rounded-lg overflow-hidden">
                        <img
                          src={project.images[0]}
                          alt={project.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        project.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        project.status === 'in-progress' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </span>
                      
                      {isAuthenticated && user?.id === project.createdBy?._id && (
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => handleEdit(project)}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors duration-300"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(project._id)}
                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Project Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors duration-300">
                        {project.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed mb-4 line-clamp-3">
                        {project.description}
                      </p>

                      {/* Tags */}
                      {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-md text-xs border border-purple-500/30"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-md text-xs border border-gray-500/30">
                              +{project.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Project Links */}
                    <div className="flex space-x-3 mt-4">
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 bg-gray-600/20 text-gray-300 rounded-lg hover:bg-gray-600/30 transition-colors duration-300 text-sm"
                        >
                          <Github className="w-4 h-4 mr-2" />
                          GitHub Link
                        </a>
                      )}
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 text-white rounded-lg hover:from-purple-600/30 hover:to-cyan-600/30 transition-colors duration-300 text-sm border border-purple-400/30"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Live Demo
                        </a>
                      )}
                    </div>

                    {/* Date */}
                    {project.startDate && (
                      <div className="flex items-center text-gray-500 text-sm mt-4 pt-4 border-t border-white/10">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(project.startDate).toLocaleDateString()}
                        {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
                        : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Project Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-purple-900/90 to-cyan-900/90 backdrop-blur-sm rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/20">
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {editingProject ? 'Edit Project' : 'Add New Project'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors duration-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors duration-300"
                  >
                    <option value="idea">Idea</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Repository URL</label>
                  <input
                    type="url"
                    value={formData.repoUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, repoUrl: e.target.value }))}
                    className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors duration-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Live URL</label>
                <input
                  type="url"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors duration-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors duration-300"
                  />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-purple-300 hover:text-white transition-colors duration-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add tag and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors duration-300"
                />
              </div>

              {/* Contributors */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Contributors (Email)</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.contributors.map((email, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm border border-cyan-500/30"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => removeContributor(index)}
                        className="text-cyan-300 hover:text-white transition-colors duration-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="email"
                  placeholder="Add contributor email and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addContributor(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors duration-300"
                />
              </div>

              {/* Images */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors duration-300"
                />
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors duration-300"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg font-semibold text-white hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                >
                  {editingProject ? 'Update Project' : 'Create Project'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProject(null);
                    resetForm();
                  }}
                  className="px-6 py-2 bg-gray-600/20 text-gray-300 rounded-lg hover:bg-gray-600/30 transition-colors duration-300 border border-gray-500/30"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;