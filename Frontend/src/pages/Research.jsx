import React, { useState, useEffect } from 'react';
import { BookOpen, ExternalLink, FileText, Calendar, Users, Search, Plus, Edit, Trash2, Eye, Award, TrendingUp } from 'lucide-react';
import { researchAPI, uploadAPI, apiUtils } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Research = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [research, setResearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingResearch, setEditingResearch] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState(null);
  
  const { user, isAuthenticated } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    authors: [],
    type: 'paper',
    status: 'draft',
    journal: '',
    conference: '',
    publicationDate: '',
    doi: '',
    url: '',
    pdfUrl: '',
    tags: [],
    citations: 0,
    impactFactor: 0
  });

  // Animated background highlights
  const highlights = [
    { x: 20, y: 20, size: 300, color: 'purple' },
    { x: 80, y: 60, size: 200, color: 'cyan' },
    { x: 60, y: 30, size: 250, color: 'purple' },
    { x: 30, y: 70, size: 180, color: 'cyan' }
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    fetchResearch();
    if (isAuthenticated) {
      fetchStats();
    }
  }, [currentPage, searchQuery, statusFilter, typeFilter, isAuthenticated]);

  const fetchResearch = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 9,
        ...(searchQuery && { q: searchQuery }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
        sort: '-publicationDate'
      };

      const response = await researchAPI.getAll(params);
      setResearch(response.data);
      setTotalPages(response.meta.totalPages);
      setError(null);
    } catch (err) {
      setError(apiUtils.handleError(err, 'Failed to fetch research'));
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await researchAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const researchData = {
        ...formData,
        authors: formData.authors.filter(author => author.trim()),
        tags: formData.tags.filter(tag => tag.trim()),
        publicationDate: formData.publicationDate || undefined,
        citations: parseInt(formData.citations) || 0,
        impactFactor: parseFloat(formData.impactFactor) || 0
      };

      if (editingResearch) {
        await researchAPI.update(editingResearch._id, researchData);
      } else {
        await researchAPI.create(researchData);
      }

      setShowForm(false);
      setEditingResearch(null);
      resetForm();
      fetchResearch();
      if (isAuthenticated) fetchStats();
    } catch (err) {
      setError(apiUtils.handleError(err, 'Failed to save research'));
    }
  };

  const handleEdit = (researchItem) => {
    setEditingResearch(researchItem);
    setFormData({
      title: researchItem.title,
      abstract: researchItem.abstract || '',
      authors: researchItem.authors || [],
      type: researchItem.type,
      status: researchItem.status,
      journal: researchItem.journal || '',
      conference: researchItem.conference || '',
      publicationDate: researchItem.publicationDate ? researchItem.publicationDate.split('T')[0] : '',
      doi: researchItem.doi || '',
      url: researchItem.url || '',
      pdfUrl: researchItem.pdfUrl || '',
      tags: researchItem.tags || [],
      citations: researchItem.citations || 0,
      impactFactor: researchItem.impactFactor || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (researchId) => {
    if (!window.confirm('Are you sure you want to delete this research?')) return;
    
    try {
      await researchAPI.delete(researchId);
      fetchResearch();
      if (isAuthenticated) fetchStats();
    } catch (err) {
      setError(apiUtils.handleError(err, 'Failed to delete research'));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      abstract: '',
      authors: [],
      type: 'paper',
      status: 'draft',
      journal: '',
      conference: '',
      publicationDate: '',
      doi: '',
      url: '',
      pdfUrl: '',
      tags: [],
      citations: 0,
      impactFactor: 0
    });
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const response = await uploadAPI.uploadFile(file);
      setFormData(prev => ({
        ...prev,
        pdfUrl: response.data.url
      }));
    } catch (err) {
      setError(apiUtils.handleError(err, 'Failed to upload PDF'));
    }
  };

  const addAuthor = (author) => {
    if (author && !formData.authors.includes(author)) {
      setFormData(prev => ({
        ...prev,
        authors: [...prev.authors, author]
      }));
    }
  };

  const removeAuthor = (index) => {
    setFormData(prev => ({
      ...prev,
      authors: prev.authors.filter((_, i) => i !== index)
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'under-review': return 'bg-yellow-500';
      case 'draft': return 'bg-blue-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'paper': return <FileText className="w-4 h-4" />;
      case 'thesis': return <BookOpen className="w-4 h-4" />;
      case 'conference': return <Users className="w-4 h-4" />;
      case 'journal': return <Award className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
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
              <BookOpen className="w-20 h-20 mx-auto text-purple-400 animate-pulse" />
              
              <h1 className="text-6xl lg:text-8xl font-bold">
                <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  Research Work
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
                Exploring the frontiers of <span className="text-purple-400 font-semibold">knowledge</span> through 
                rigorous research, <span className="text-cyan-400 font-semibold">innovation</span>, and 
                scholarly contributions.
              </p>
            </div>

            {/* Stats Section */}
            {isAuthenticated && stats && (
              <div className="flex flex-wrap gap-6 justify-center text-sm">
                <div className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full border border-white/20 backdrop-blur-sm">
                  <span className="text-white font-medium">Total: {stats.totalResearch}</span>
                </div>
                <div className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-full border border-white/20 backdrop-blur-sm">
                  <span className="text-white font-medium">Published: {stats.publishedResearch}</span>
                </div>
                <div className="flex items-center px-6 py-3 bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-full border border-white/20 backdrop-blur-sm">
                  <span className="text-white font-medium">Under Review: {stats.underReviewResearch}</span>
                </div>
                <div className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full border border-white/20 backdrop-blur-sm">
                  <span className="text-white font-medium">Citations: {stats.totalCitations}</span>
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
      <section className="py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-6 items-center justify-between mb-12">
            {/* Search and Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search research..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-6 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 min-w-[280px]"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-6 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="under-review">Under Review</option>
                <option value="published">Published</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-6 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
              >
                <option value="">All Types</option>
                <option value="paper">Paper</option>
                <option value="thesis">Thesis</option>
                <option value="conference">Conference</option>
                <option value="journal">Journal</option>
              </select>
            </div>

            {/* Add Research Button */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingResearch(null);
                  resetForm();
                }}
                className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-semibold text-white hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Add Research
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-6 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Research Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
            </div>
          ) : research.length === 0 ? (
            <div className="text-center py-24">
              <BookOpen className="w-20 h-20 mx-auto mb-6 text-gray-400" />
              <p className="text-2xl text-gray-400">No research found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {research.map((item, index) => (
                <div
                  key={item._id}
                  className="group relative bg-gradient-to-br from-purple-900/20 to-cyan-900/20 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/25"
                >
                  {/* Research Header */}
                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(item.type)}
                        <span className="text-sm text-gray-400 uppercase tracking-wide font-medium">
                          {item.type}
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(item.status)} flex-shrink-0`}></div>
                    </div>

                    <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-4">
                      {item.title}
                    </h3>

                    <p className="text-gray-300 text-base mb-6 line-clamp-3 leading-relaxed">
                      {item.abstract}
                    </p>

                    {/* Authors */}
                    {item.authors && item.authors.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400 font-medium">Authors</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.authors.slice(0, 3).map((author, authorIndex) => (
                            <span
                              key={authorIndex}
                              className="px-3 py-1 text-sm bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 font-medium"
                            >
                              {author}
                            </span>
                          ))}
                          {item.authors.length > 3 && (
                            <span className="px-3 py-1 text-sm bg-gray-500/20 text-gray-300 rounded-full border border-gray-500/30 font-medium">
                              +{item.authors.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Publication Info */}
                    <div className="space-y-3 mb-6">
                      {item.journal && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Award className="w-4 h-4" />
                          <span>Journal: {item.journal}</span>
                        </div>
                      )}
                      {item.conference && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          <span>Conference: {item.conference}</span>
                        </div>
                      )}
                      {item.publicationDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.publicationDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* Metrics */}
                    {(item.citations > 0 || item.impactFactor > 0) && (
                      <div className="flex gap-3 mb-6 text-sm">
                        {item.citations > 0 && (
                          <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full font-medium">
                            {item.citations} citations
                          </span>
                        )}
                        {item.impactFactor > 0 && (
                          <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-medium">
                            IF: {item.impactFactor}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {item.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-3 py-1 text-sm bg-purple-500/20 text-purple-300 rounded-full font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="px-3 py-1 text-sm bg-gray-500/20 text-gray-300 rounded-full font-medium">
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3">
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-indigo-600/20 hover:bg-indigo-600/40 rounded-xl transition-all duration-300 hover:scale-110 border border-indigo-500/30"
                            title="View Publication"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                        {item.pdfUrl && (
                          <a
                            href={item.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-red-600/20 hover:bg-red-600/40 rounded-xl transition-all duration-300 hover:scale-110 border border-red-500/30"
                            title="View PDF"
                          >
                            <FileText className="w-5 h-5" />
                          </a>
                        )}
                        {item.doi && (
                          <a
                            href={`https://doi.org/${item.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-green-600/20 hover:bg-green-600/40 rounded-xl transition-all duration-300 hover:scale-110 border border-green-500/30"
                            title="View DOI"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                        )}
                      </div>

                      {/* Admin Actions */}
                      {isAuthenticated && user?.role === 'admin' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-3 bg-blue-600/20 hover:bg-blue-600/40 rounded-xl transition-all duration-300 hover:scale-110 border border-blue-500/30"
                            title="Edit Research"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="p-3 bg-red-600/20 hover:bg-red-600/40 rounded-xl transition-all duration-300 hover:scale-110 border border-red-500/30"
                            title="Delete Research"
                          >
                            <Trash2 className="w-5 h-5" />
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
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300 font-medium"
              >
                Previous
              </button>
              
              <span className="px-6 py-3 text-gray-300 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300 font-medium"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Research Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-sm border border-white/10 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
              {editingResearch ? 'Edit Research' : 'Add New Research'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-medium mb-3 text-white">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-6 py-4 bg-black/50 border border-white/20 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-medium mb-3 text-white">Abstract</label>
                <textarea
                  value={formData.abstract}
                  onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
                  rows={4}
                  className="w-full px-6 py-4 bg-black/50 border border-white/20 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400 transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-medium mb-3 text-white">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="paper">Paper</option>
                    <option value="thesis">Thesis</option>
                    <option value="conference">Conference</option>
                    <option value="journal">Journal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="under-review">Under Review</option>
                    <option value="published">Published</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Journal</label>
                  <input
                    type="text"
                    value={formData.journal}
                    onChange={(e) => setFormData(prev => ({ ...prev, journal: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Conference</label>
                  <input
                    type="text"
                    value={formData.conference}
                    onChange={(e) => setFormData(prev => ({ ...prev, conference: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Publication Date</label>
                  <input
                    type="date"
                    value={formData.publicationDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, publicationDate: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Citations</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.citations}
                    onChange={(e) => setFormData(prev => ({ ...prev, citations: e.target.value }))}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Impact Factor</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.impactFactor}
                    onChange={(e) => setFormData(prev => ({ ...prev, impactFactor: e.target.value }))}
                    className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">DOI</label>
                  <input
                    type="text"
                    value={formData.doi}
                    onChange={(e) => setFormData(prev => ({ ...prev, doi: e.target.value }))}
                    className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors duration-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">Publication URL</label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors duration-300"
                  />
                </div>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">PDF File</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400 transition-colors duration-300"
                />
                {formData.pdfUrl && (
                  <div className="mt-2">
                    <a
                      href={formData.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 text-sm transition-colors duration-300"
                    >
                      View uploaded PDF
                    </a>
                  </div>
                )}
              </div>

              {/* Authors */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Authors</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.authors.map((author, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                    >
                      {author}
                      <button
                        type="button"
                        onClick={() => removeAuthor(index)}
                        className="text-purple-300 hover:text-white transition-colors duration-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add author and press Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAuthor(e.target.value.trim());
                      e.target.value = '';
                    }
                  }}
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors duration-300"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm border border-cyan-500/30"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="text-cyan-300 hover:text-white transition-colors duration-300"
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

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg font-semibold text-white hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                >
                  {editingResearch ? 'Update Research' : 'Create Research'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingResearch(null);
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

export default Research;