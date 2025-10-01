import React, { useState, useEffect } from 'react';
import { Award, Trophy, Star, Calendar, ExternalLink, Search, Plus, Edit, Trash2, Medal, Target, TrendingUp } from 'lucide-react';
import { achievementsAPI, uploadAPI, apiUtils } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Achievements = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);
  
  const { user, isAuthenticated } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'award',
    date: '',
    organization: '',
    location: '',
    certificateUrl: '',
    evidenceImage: null,
    url: '',
    tags: [],
    featured: false
  });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    fetchAchievements();
    if (isAuthenticated) {
      fetchStats();
    }
  }, [currentPage, searchQuery, categoryFilter, isAuthenticated]);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching achievements...');
      const params = {
        page: currentPage,
        limit: 9,
        ...(searchQuery && { q: searchQuery }),
        ...(categoryFilter && { category: categoryFilter }),
        sort: '-date'
      };
      console.log('📋 API request params:', params);

      const response = await achievementsAPI.getAll(params);
      console.log('✅ Achievements API response:', response);
      console.log('📊 Number of achievements received:', response.data?.length || 0);
      
      // Log each achievement's image data
      response.data?.forEach((achievement, index) => {
        console.log(`🎯 Achievement ${index + 1}:`, {
          id: achievement._id,
          title: achievement.title,
          evidenceImage: achievement.evidenceImage,
          hasImage: !!achievement.evidenceImage,
          imageUrl: achievement.evidenceImage ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/uploads/images/${achievement.evidenceImage}` : 'No image'
        });
      });

      setAchievements(response.data);
      setTotalPages(response.meta.totalPages);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching achievements:', err);
      setError(apiUtils.handleError(err, 'Failed to fetch achievements'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await achievementsAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let achievementData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim()),
        date: formData.date || undefined
      };

      // Handle image upload if there's a file
      if (formData.evidenceImage && formData.evidenceImage instanceof File) {
        try {
          console.log('📸 Starting image upload...', formData.evidenceImage.name);
          const imageFormData = new FormData();
          imageFormData.append('image', formData.evidenceImage);
          
          const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/image`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
              // Note: Don't set Content-Type for FormData - browser sets it automatically with boundary
            },
            body: imageFormData
          });
          
          console.log('📸 Upload response status:', uploadResponse.status);
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            console.log('✅ Image uploaded successfully:', uploadResult);
            achievementData.evidenceImage = uploadResult.data.filename;
          } else {
            const errorText = await uploadResponse.text();
            console.error('❌ Image upload failed:', uploadResponse.status, errorText);
            throw new Error(`Image upload failed: ${uploadResponse.status} - ${errorText}`);
          }
        } catch (uploadError) {
          console.error('❌ CRITICAL: Image upload error:', uploadError);
          setError('Failed to upload image. Please try again.');
          return;
        }
      } else if (!formData.evidenceImage) {
        // Remove evidenceImage field if no image is selected
        delete achievementData.evidenceImage;
      }

      if (editingAchievement) {
        await achievementsAPI.update(editingAchievement._id, achievementData);
      } else {
        await achievementsAPI.create(achievementData);
      }

      setShowForm(false);
      setEditingAchievement(null);
      resetForm();
      fetchAchievements();
      if (isAuthenticated) fetchStats();
    } catch (err) {
      setError(apiUtils.handleError(err, 'Failed to save achievement'));
    }
  };

  const handleEdit = (achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      title: achievement.title,
      description: achievement.description || '',
      category: achievement.category,
      date: achievement.date ? achievement.date.split('T')[0] : '',
      organization: achievement.organization || '',
      location: achievement.location || '',
      certificateUrl: achievement.certificateUrl || '',
      evidenceImage: achievement.evidenceImage || null,
      url: achievement.url || '',
      tags: achievement.tags || [],
      featured: achievement.featured || false
    });
    setShowForm(true);
  };

  const handleDelete = async (achievementId) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) return;
    
    try {
      await achievementsAPI.delete(achievementId);
      fetchAchievements();
      if (isAuthenticated) fetchStats();
    } catch (err) {
      setError(apiUtils.handleError(err, 'Failed to delete achievement'));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'award',
      date: '',
      organization: '',
      location: '',
      certificateUrl: '',
      evidenceImage: null,
      url: '',
      tags: [],
      featured: false
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData(prev => ({
      ...prev,
      evidenceImage: file
    }));
  };

  const handleCertificateUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await uploadAPI.uploadFile(file);
      setFormData(prev => ({
        ...prev,
        certificateUrl: response.data.url
      }));
    } catch (err) {
      setError(apiUtils.handleError(err, 'Failed to upload certificate'));
    }
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'award': return <Award className="w-4 h-4" />;
      case 'certification': return <Medal className="w-4 h-4" />;
      case 'competition': return <Trophy className="w-4 h-4" />;
      case 'recognition': return <Star className="w-4 h-4" />;
      case 'milestone': return <Target className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'award': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'certification': return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'competition': return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'recognition': return 'bg-green-500/20 text-green-300 border-green-400/30';
      case 'milestone': return 'bg-red-500/20 text-red-300 border-red-400/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background - Matching Home.jsx exactly */}
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
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="space-y-8 z-10">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-purple-600/20 rounded-full border border-purple-400/30 backdrop-blur-sm">
                <Trophy className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-sm font-medium">Achievements & Recognition</span>
              </div>
              
              <h1 className="text-6xl lg:text-8xl font-bold">
                <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  Achievements
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
                Celebrating milestones and <span className="text-purple-400 font-semibold">recognitions</span> that mark 
                the journey of <span className="text-cyan-400 font-semibold">excellence</span> and continuous growth.
              </p>
            </div>

            {/* Achievement Stats */}
            {isAuthenticated && stats && (
              <div className="flex flex-wrap gap-4 justify-center">
                <div className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full border border-white/20 backdrop-blur-sm">
                  <span className="text-sm font-medium">Total: <span className="text-cyan-400 font-semibold">{stats.totalAchievements}</span></span>
                </div>
                <div className="flex items-center px-6 py-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-full border border-white/20 backdrop-blur-sm">
                  <span className="text-sm font-medium">Awards: <span className="text-yellow-300 font-semibold">{stats.awardCount}</span></span>
                </div>
                <div className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full border border-white/20 backdrop-blur-sm">
                  <span className="text-sm font-medium">Certifications: <span className="text-blue-300 font-semibold">{stats.certificationCount}</span></span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <TrendingUp className="w-6 h-6 text-white/60" />
        </div>
      </section>

      {/* Controls Section */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-6 items-center justify-between mb-12">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search achievements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-6 py-3 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm w-80"
                />
              </div>
              
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-6 py-3 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm"
              >
                <option value="">All Categories</option>
                <option value="award">Award</option>
                <option value="certification">Certification</option>
                <option value="competition">Competition</option>
                <option value="recognition">Recognition</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>

            {/* Add Achievement Button */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingAchievement(null);
                  resetForm();
                }}
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-semibold text-white hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105 backdrop-blur-sm border border-white/10"
              >
                <Plus className="w-5 h-5" />
                Add Achievement
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-6 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Achievements Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/20 border-t-purple-500"></div>
            </div>
          ) : achievements.length === 0 ? (
            <div className="text-center py-32">
              <Trophy className="w-20 h-20 mx-auto mb-6 text-gray-400" />
              <p className="text-2xl text-gray-400 font-medium">No achievements found</p>
              <p className="text-gray-500 mt-2">Start adding your accomplishments to showcase your journey</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {achievements.map((achievement, index) => (
                <div
                  key={achievement._id}
                  className={`group relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-black/60 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20 hover:border-purple-400/30 ${
                    achievement.featured ? 'ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-400/20' : ''
                  }`}
                >
                  {/* Featured Badge */}
                  {achievement.featured && (
                    <div className="absolute top-6 right-6 z-10">
                      <Star className="w-6 h-6 text-yellow-400 fill-current animate-pulse drop-shadow-lg" />
                    </div>
                  )}

                  {/* Achievement Image */}
                  {achievement.evidenceImage && (
                    <div className="h-52 overflow-hidden">
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/uploads/images/${achievement.evidenceImage}`}
                        alt={achievement.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onLoad={() => {
                          console.log(`✅ Image loaded successfully: ${achievement.evidenceImage}`);
                          console.log(`📸 Full image URL: ${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/uploads/images/${achievement.evidenceImage}`);
                        }}
                        onError={(e) => {
                          console.error(`❌ Image failed to load: ${achievement.evidenceImage}`);
                          console.error(`📸 Failed image URL: ${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/uploads/images/${achievement.evidenceImage}`);
                          console.error('🔍 Image error details:', e);
                          console.error('🔍 Achievement data:', achievement);
                        }}
                        onLoadStart={() => {
                          console.log(`🔄 Image loading started: ${achievement.evidenceImage}`);
                        }}
                      />
                    </div>
                  )}

                  {/* Achievement Content */}
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(achievement.category)}
                        <span className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                          {achievement.category}
                        </span>
                      </div>
                      <span className={`px-4 py-2 text-sm rounded-full border font-medium ${getCategoryColor(achievement.category)}`}>
                        {achievement.category}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-4 leading-tight">
                      {achievement.title}
                    </h3>

                    <p className="text-gray-300 text-base mb-6 line-clamp-3 leading-relaxed">
                      {achievement.description}
                    </p>

                    {/* Organization and Location */}
                    <div className="space-y-3 mb-6">
                      {achievement.organization && (
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <Award className="w-4 h-4 text-purple-400" />
                          <span>{achievement.organization}</span>
                        </div>
                      )}
                      {achievement.location && (
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <Target className="w-4 h-4 text-cyan-400" />
                          <span>{achievement.location}</span>
                        </div>
                      )}
                      {achievement.date && (
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <Calendar className="w-4 h-4 text-yellow-400" />
                          <span>{formatDate(achievement.date)}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {achievement.tags && achievement.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {achievement.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-4 py-2 text-sm bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 backdrop-blur-sm"
                          >
                            {tag}
                          </span>
                        ))}
                        {achievement.tags.length > 3 && (
                          <span className="px-4 py-2 text-sm bg-gray-500/20 text-gray-300 rounded-full border border-gray-500/30 backdrop-blur-sm">
                            +{achievement.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex gap-3">
                        {achievement.url && (
                          <a
                            href={achievement.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-purple-600/20 hover:bg-purple-600/40 rounded-xl transition-all duration-300 border border-purple-500/30 hover:border-purple-400/50 hover:scale-105 backdrop-blur-sm"
                            title="View Details"
                          >
                            <ExternalLink className="w-5 h-5 text-purple-300" />
                          </a>
                        )}
                        {achievement.certificateUrl && (
                          <a
                            href={achievement.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-yellow-600/20 hover:bg-yellow-600/40 rounded-xl transition-all duration-300 border border-yellow-500/30 hover:border-yellow-400/50 hover:scale-105 backdrop-blur-sm"
                            title="View Certificate"
                          >
                            <Medal className="w-5 h-5 text-yellow-300" />
                          </a>
                        )}
                      </div>

                      {/* Admin Actions */}
                      {isAuthenticated && user?.role === 'admin' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(achievement)}
                            className="p-3 bg-blue-600/20 hover:bg-blue-600/40 rounded-xl transition-all duration-300 border border-blue-500/30 hover:border-blue-400/50 hover:scale-105 backdrop-blur-sm"
                            title="Edit Achievement"
                          >
                            <Edit className="w-5 h-5 text-blue-300" />
                          </button>
                          <button
                            onClick={() => handleDelete(achievement._id)}
                            className="p-3 bg-red-600/20 hover:bg-red-600/40 rounded-xl transition-all duration-300 border border-red-500/30 hover:border-red-400/50 hover:scale-105 backdrop-blur-sm"
                            title="Delete Achievement"
                          >
                            <Trash2 className="w-5 h-5 text-red-300" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-16">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-8 py-3 bg-black/40 border border-white/20 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/60 hover:border-purple-400/30 transition-all duration-300 text-white font-medium backdrop-blur-sm"
              >
                Previous
              </button>
              
              <span className="px-8 py-3 text-gray-300 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-xl border border-white/20 font-medium backdrop-blur-sm">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-8 py-3 bg-black/40 border border-white/20 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/60 hover:border-purple-400/30 transition-all duration-300 text-white font-medium backdrop-blur-sm"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Achievement Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
            <h2 className="text-3xl font-bold mb-8 text-white bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              {editingAchievement ? 'Edit Achievement' : 'Add New Achievement'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-base font-medium mb-3 text-gray-300">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-3 text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium mb-3 text-gray-300">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm"
                  >
                    <option value="award">Award</option>
                    <option value="certification">Certification</option>
                    <option value="competition">Competition</option>
                    <option value="recognition">Recognition</option>
                    <option value="milestone">Milestone</option>
                  </select>
                </div>

                <div>
                  <label className="block text-base font-medium mb-3 text-gray-300">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-medium mb-3 text-gray-300">Organization</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                    className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-base font-medium mb-3 text-gray-300">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-3 text-gray-300">URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-base font-medium mb-3 text-gray-300">Achievement Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm"
                />
                {formData.evidenceImage && (
                  <div className="mt-4">
                    {formData.evidenceImage instanceof File ? (
                      <div className="flex items-center gap-3 p-4 bg-purple-600/20 border border-purple-500/30 rounded-xl">
                        <span className="text-purple-300 font-medium">Selected: {formData.evidenceImage.name}</span>
                      </div>
                    ) : (
                      <img
                        src={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/uploads/images/${formData.evidenceImage}`}
                        alt="Preview"
                        className="w-40 h-40 object-cover rounded-xl border border-white/20 shadow-lg"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Certificate Upload */}
              <div>
                <label className="block text-base font-medium mb-3 text-gray-300">Certificate File</label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleCertificateUpload}
                  className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm"
                />
                {formData.certificateUrl && (
                  <div className="mt-4">
                    <a
                      href={formData.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-base font-medium transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View uploaded certificate
                    </a>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div>
                <label className="block text-base font-medium mb-3 text-gray-300">Tags</label>
                <div className="flex flex-wrap gap-3 mb-4">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 rounded-full text-sm border border-purple-400/30 hover:border-purple-400/50 transition-all duration-200 backdrop-blur-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-purple-300 hover:text-white transition-colors duration-200 text-lg leading-none"
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
                  className="w-full px-6 py-4 bg-black/40 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center gap-4 p-6 bg-black/30 border border-white/10 rounded-xl backdrop-blur-sm">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                  className="w-5 h-5 text-purple-600 bg-black/50 border-white/20 rounded focus:ring-purple-500 focus:ring-offset-0 transition-all duration-200"
                />
                <label htmlFor="featured" className="text-base font-medium text-gray-300 cursor-pointer">
                  Featured Achievement
                </label>
              </div>

              <div className="flex gap-6 pt-8">
                <button
                  type="submit"
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 rounded-xl transition-all duration-300 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 border border-purple-500/20 backdrop-blur-sm"
                >
                  {editingAchievement ? 'Update Achievement' : 'Create Achievement'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAchievement(null);
                    resetForm();
                  }}
                  className="px-8 py-4 bg-black/50 hover:bg-black/70 border border-white/20 hover:border-white/30 rounded-xl transition-all duration-300 text-white font-semibold backdrop-blur-sm"
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

export default Achievements;