import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authAPI, researchAPI, projectsAPI, achievementsAPI } from '../services/api';
import { 
  User, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  BookOpen, 
  Code2, 
  Award, 
  LogOut,
  LogIn,
  Shield,
  Database,
  Settings
} from 'lucide-react';

const Admin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState('research');
  const [showPassword, setShowPassword] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [error, setError] = useState(''); // Add error state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Sample data states for CRUD operations
  const [research, setResearch] = useState([]);
  const [projects, setProjects] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Form states for adding/editing items
  const [researchForm, setResearchForm] = useState({
    title: '',
    abstract: '',
    authors: '',
    venue: '',
    status: 'draft',
    publishedDate: '',
    doi: '',
    pdfUrl: '',
    tags: ''
  });

  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    tags: '',
    status: 'idea',
    startDate: '',
    endDate: '',
    repoUrl: '',
    liveUrl: '',
    contributors: ''
  });

  const [achievementForm, setAchievementForm] = useState({
    title: '',
    description: '',
    date: '',
    category: '',
    organization: '',
    evidenceImage: null,
    tags: ''
  });

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    // Mouse movement tracking for animated background
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Check for existing admin token
    const checkAdminAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          const response = await authAPI.adminVerify();
          if (response.success) {
            setIsLoggedIn(true);
            loadData();
          } else {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      }
    };

    checkAdminAuth();

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const loadData = async () => {
    try {
      console.log('🔄 Starting loadData function...');
      
      // Load data from API instead of localStorage
      const [researchResponse, projectsResponse, achievementsResponse] = await Promise.all([
        researchAPI.getAll(),
        projectsAPI.getAll(),
        achievementsAPI.getAll()
      ]);
      
      console.log('📊 Raw API Responses:');
      console.log('  - Research response:', researchResponse);
      console.log('  - Projects response:', projectsResponse);
      console.log('  - Achievements response:', achievementsResponse);
      
      console.log('📊 Response data properties:');
      console.log('  - Research data:', researchResponse?.data);
      console.log('  - Projects data:', projectsResponse?.data);
      console.log('  - Achievements data:', achievementsResponse?.data);
      
      console.log('📊 Data array lengths:');
      console.log('  - Research length:', Array.isArray(researchResponse?.data) ? researchResponse.data.length : 'Not an array');
      console.log('  - Projects length:', Array.isArray(projectsResponse?.data) ? projectsResponse.data.length : 'Not an array');
      console.log('  - Achievements length:', Array.isArray(achievementsResponse?.data) ? achievementsResponse.data.length : 'Not an array');
      
      const researchData = researchResponse.data || [];
      const projectsData = projectsResponse.data || [];
      const achievementsData = achievementsResponse.data || [];
      
      console.log('📊 Setting state with data:');
      console.log('  - Research items:', researchData.length);
      console.log('  - Projects items:', projectsData.length);
      console.log('  - Achievements items:', achievementsData.length);
      
      setResearch(researchResponse?.data || researchResponse || []);
      setProjects(projectsResponse?.data || projectsResponse || []);
      setAchievements(achievementsResponse?.data || achievementsResponse || []);
      
      console.log('✅ loadData completed successfully');
    } catch (error) {
      console.error('❌ Error loading data:', error);
      // Fallback to empty arrays if API fails
      setResearch([]);
      setProjects([]);
      setAchievements([]);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    
    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match!');
          return;
        }
        
        // Admin registration
        const response = await authAPI.adminRegister({
          name: formData.username,
          email: formData.email,
          password: formData.password
        });
        
        if (response.success) {
          alert('Admin account created successfully!');
          setIsSignUp(false);
          // Clear form
          setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
        }
      } else {
        // Admin login
        const response = await authAPI.adminLogin({
          email: formData.email,
          password: formData.password
        });
        
        if (response.success) {
          // Store token and user data
          localStorage.setItem('adminToken', response.data.token);
          localStorage.setItem('adminUser', JSON.stringify(response.data.user));
          
          setIsLoggedIn(true);
          loadData();
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert(error.message || 'Authentication failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsLoggedIn(false);
  };

  const handleInputChange = (e, formType) => {
    const { name, value, type, files } = e.target;
    
    // Handle file input for image uploads
    if (type === 'file' && name === 'evidenceImage') {
      if (formType === 'achievement') {
        setAchievementForm(prev => ({ ...prev, [name]: files[0] || null }));
      }
      return;
    }
    
    if (formType === 'auth') {
      setFormData(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'research') {
      setResearchForm(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'project') {
      setProjectForm(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'achievement') {
      setAchievementForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    console.log('🚀 Admin form submission started');
    console.log('📝 Form type:', type);
    
    // Get current auth state from localStorage or state
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
    
    console.log('🔐 Authentication Status:');
    console.log('  - Regular token:', !!token);
    console.log('  - Admin token:', !!adminToken);
    console.log('  - Current user:', currentUser);
    console.log('  - Admin user:', adminUser);
    console.log('  - Is logged in state:', isLoggedIn);
    
    try {
      if (type === 'research') {
        console.log('📚 Processing research form:', researchForm);
        const formData = { 
          ...researchForm,
          // Convert authors string to array
          authors: researchForm.authors.split(',').map(author => author.trim()).filter(author => author),
          // Convert tags string to array
          tags: researchForm.tags ? researchForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          // Ensure publishedDate is properly formatted
          publishedDate: researchForm.publishedDate || undefined
        };
        
        console.log('📊 Processed research data:', formData);
        console.log('🔄 Research operation type:', editingId ? 'UPDATE' : 'CREATE');
        
        if (editingId) {
          console.log('✏️ Updating research with ID:', editingId);
          const response = await researchAPI.update(editingId, formData);
          console.log('✅ Research update response:', response);
        } else {
          console.log('➕ Creating new research');
          const response = await researchAPI.create(formData);
          console.log('✅ Research create response:', response);
        }
        
        setResearchForm({
          title: '',
          abstract: '',
          authors: '',
          venue: '',
          status: 'draft',
          publishedDate: '',
          doi: '',
          pdfUrl: '',
          tags: ''
        });
      } else if (type === 'projects' || type === 'project') {
        console.log('🚧 PROJECT SAVE - Starting validation and processing');
        console.log('📝 Raw project form data:', projectForm);
        
        // Enhanced form validation with detailed logging
        const validationErrors = [];
        
        if (!projectForm.title || projectForm.title.trim() === '') {
          validationErrors.push('Title is required');
        }
        
        if (!projectForm.description || projectForm.description.trim() === '') {
          validationErrors.push('Description is required');
        }
        
        if (!projectForm.status || !['idea', 'in-progress', 'completed'].includes(projectForm.status)) {
          validationErrors.push('Valid status is required (idea, in-progress, or completed)');
        }
        
        console.log('🔍 Form validation results:');
        console.log('  - Title:', projectForm.title ? `"${projectForm.title}"` : 'MISSING');
        console.log('  - Description:', projectForm.description ? `"${projectForm.description.substring(0, 50)}..."` : 'MISSING');
        console.log('  - Status:', projectForm.status ? `"${projectForm.status}"` : 'MISSING');
        console.log('  - Tags:', projectForm.tags ? `"${projectForm.tags}"` : 'EMPTY');
        console.log('  - Contributors:', projectForm.contributors ? `"${projectForm.contributors}"` : 'EMPTY');
        console.log('  - Start Date:', projectForm.startDate || 'EMPTY');
        console.log('  - End Date:', projectForm.endDate || 'EMPTY');
        console.log('  - Repo URL:', projectForm.repoUrl || 'EMPTY');
        console.log('  - Live URL:', projectForm.liveUrl || 'EMPTY');
        console.log('  - Validation errors:', validationErrors);
        
        if (validationErrors.length > 0) {
          const errorMessage = `Form validation failed: ${validationErrors.join(', ')}`;
          console.error('❌ PROJECT SAVE - Validation failed:', errorMessage);
          setError(errorMessage);
          return;
        }
        
        console.log('✅ PROJECT SAVE - Form validation passed');
        
        const formData = {
          ...projectForm,
          tags: projectForm.tags ? projectForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
          contributors: projectForm.contributors ? projectForm.contributors.split(',').map(email => email.trim()).filter(email => email) : [],
          startDate: projectForm.startDate || undefined,
          endDate: projectForm.endDate || undefined
        };
        
        console.log('📊 PROJECT SAVE - Processed project data:', formData);
        console.log('🔄 PROJECT SAVE - Operation type:', editingId ? 'UPDATE' : 'CREATE');
        console.log('🌐 PROJECT SAVE - API endpoint will be called with:', {
          method: editingId ? 'PUT' : 'POST',
          endpoint: editingId ? `/api/projects/${editingId}` : '/api/projects',
          data: formData
        });
        
        let response;
        if (editingId) {
          console.log('✏️ PROJECT SAVE - Updating project with ID:', editingId);
          console.log('📡 PROJECT SAVE - Calling projectsAPI.update...');
          response = await projectsAPI.update(editingId, formData);
          console.log('✅ PROJECT SAVE - Update response received:', response);
        } else {
          console.log('➕ PROJECT SAVE - Creating new project from Admin');
          console.log('📡 PROJECT SAVE - Calling projectsAPI.create...');
          response = await projectsAPI.create(formData);
          console.log('✅ PROJECT SAVE - Create response received:', response);
        }
        
        console.log('🎉 PROJECT SAVE - API call successful, response details:');
        console.log('  - Success:', response?.success);
        console.log('  - Message:', response?.message);
        console.log('  - Data:', response?.data);
        console.log('  - Full response object:', response);
        
        // Check if the response indicates success
        if (response?.success !== false) {
          console.log('✅ PROJECT SAVE - Operation completed successfully');
        } else {
          console.warn('⚠️ PROJECT SAVE - Response indicates failure:', response);
        }
        
        setProjectForm({
          title: '', 
          description: '', 
          tags: '', 
          status: 'idea',
          startDate: '', 
          endDate: '', 
          repoUrl: '', 
          liveUrl: '',
          contributors: ''
        });
        
        console.log('🧹 PROJECT SAVE - Form reset completed');
        
      } else if (type === 'achievements') {
        console.log('🏆 Processing achievement form:', achievementForm);
        let formData = {
          ...achievementForm,
          tags: achievementForm.tags ? 
            (Array.isArray(achievementForm.tags) ? 
              achievementForm.tags : 
              achievementForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            ) : []
        };
        console.log('📊 Processed achievement data:', formData);
        
        // Handle image upload if there's a file
        if (achievementForm.evidenceImage && achievementForm.evidenceImage instanceof File) {
          try {
            console.log('📸 Uploading achievement image...');
            const imageFormData = new FormData();
            imageFormData.append('image', achievementForm.evidenceImage);
            
            const uploadResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/image`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: imageFormData
            });
            
            if (uploadResponse.ok) {
              const uploadResult = await uploadResponse.json();
              formData.evidenceImage = uploadResult.data.filename;
              console.log('✅ Image uploaded successfully:', uploadResult.data.filename);
            } else {
              throw new Error('Image upload failed');
            }
          } catch (uploadError) {
            console.error('❌ Image upload error:', uploadError);
            throw uploadError;
          }
        }
        
        console.log('🔄 Achievement operation type:', editingId ? 'UPDATE' : 'CREATE');
        
        if (editingId) {
          console.log('✏️ Updating achievement with ID:', editingId);
          const response = await achievementsAPI.update(editingId, formData);
          console.log('✅ Achievement update response:', response);
        } else {
          console.log('➕ Creating new achievement');
          const response = await achievementsAPI.create(formData);
          console.log('✅ Achievement create response:', response);
        }
        
        setAchievementForm({
          title: '',
          description: '',
          category: '',
          date: '',
          evidenceUrl: '',
          evidenceImage: null,
          tags: []
        });
      }
      
      console.log('🎉 Form submission successful - cleaning up');
      setEditingId(null);
      setShowForm(false);
      setError(''); // Clear any previous errors
      console.log('🔄 Reloading data...');
      await loadData();
      console.log('✅ Data reload completed');
      
    } catch (err) {
      console.error('❌ CRITICAL ERROR in form submission:', err);
      console.error('📋 Error details breakdown:');
      console.error('  - Error message:', err.message);
      console.error('  - Error name:', err.name);
      console.error('  - Error stack:', err.stack);
      
      if (err.response) {
        console.error('🌐 HTTP Response Error Details:');
        console.error('  - Status:', err.response.status);
        console.error('  - Status text:', err.response.statusText);
        console.error('  - Response data:', err.response.data);
        console.error('  - Response headers:', err.response.headers);
      } else if (err.request) {
        console.error('📡 Network Request Error Details:');
        console.error('  - Request object:', err.request);
        console.error('  - No response received from server');
      } else {
        console.error('⚙️ General Error Details:');
        console.error('  - Error occurred during request setup');
      }
      
      // Log the full error object for debugging
      console.error('🔍 Full error object:', err);
      
      // Enhanced error message for user
      let userErrorMessage = `Failed to ${editingId ? 'update' : 'create'} ${type}`;
      
      if (err.response?.status === 401) {
        userErrorMessage += ': Authentication failed. Please check your login status.';
      } else if (err.response?.status === 400) {
        userErrorMessage += ': Invalid data provided. Please check your form inputs.';
      } else if (err.response?.status === 500) {
        userErrorMessage += ': Server error occurred. Please try again later.';
      } else if (err.message) {
        userErrorMessage += `: ${err.message}`;
      }
      
      console.error('👤 User error message:', userErrorMessage);
      setError(userErrorMessage);
    }
  };

  const handleEdit = (item, type) => {
    setEditingId(item._id || item.id); // Fixed: use _id for MongoDB documents
    setShowForm(true);
    
    if (type === 'research') {
      setResearchForm(item);
    } else if (type === 'project') {
      setProjectForm(item);
    } else if (type === 'achievements') {
      setAchievementForm({
        ...item,
        evidenceImage: item.evidenceImage || null
      });
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }
    
    try {
      if (type === 'research') {
        await researchAPI.delete(id);
      } else if (type === 'projects' || type === 'project') {
        await projectsAPI.delete(id);
      } else if (type === 'achievements') {
        await achievementsAPI.delete(id);
      }
      
      // Reload data after successful deletion
      await loadData();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Failed to delete ${type}. Please try again.`);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        {/* Animated Background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(147, 51, 234, 0.15), transparent 40%)`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-900 to-cyan-900/20" />
        
        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            {/* Glass morphism container */}
            <div className="bg-gradient-to-br from-purple-600/10 to-cyan-600/10 backdrop-blur-sm rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2">
                  Admin Panel
                </h1>
                <p className="text-gray-400 text-lg">
                  {isSignUp ? 'Create your admin account' : 'Sign in to manage content'}
                </p>
              </div>
              
              <form className="space-y-6" onSubmit={handleAuth}>
                <div className="space-y-4">
                  {isSignUp && (
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                        Username
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          id="username"
                          name="username"
                          type="text"
                          required
                          value={formData.username}
                          onChange={(e) => handleInputChange(e, 'auth')}
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          placeholder="Enter your username"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange(e, 'auth')}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange(e, 'auth')}
                        className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  {isSignUp && (
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange(e, 'auth')}
                          className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          placeholder="Confirm your password"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-semibold text-white hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:shadow-2xl transform hover:scale-105"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </button>
                </div>

                <div className="text-center pt-4">
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {isSignUp ? 'Already have an account? Sign in' : 'Need to create an account? Sign up'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case 'research': return research;
      case 'projects': return projects;
      case 'achievements': return achievements;
      default: return [];
    }
  };

  const getCurrentForm = () => {
    switch (activeTab) {
      case 'research': return researchForm;
      case 'projects': return projectForm;
      case 'achievements': return achievementForm;
      default: return {};
    }
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

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600/10 to-cyan-600/10 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full flex items-center justify-center border border-white/10">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-gray-400 text-sm">Manage your content and data</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-red-600/20 border border-red-400/30 rounded-xl text-red-300 hover:bg-red-600/30 hover:text-red-200 transition-all duration-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex space-x-1 bg-white/5 backdrop-blur-sm rounded-2xl p-2 border border-white/10 mb-8">
            {[
              { id: 'research', label: 'Research', icon: BookOpen },
              { id: 'projects', label: 'Projects', icon: Code2 },
              { id: 'achievements', label: 'Achievements', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-gradient-to-br from-purple-600/5 to-cyan-600/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
              </h2>
              <button
                onClick={() => {
                  setShowForm(true);
                  setEditingId(null);
                }}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-semibold text-white hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:shadow-2xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New
              </button>
            </div>

            {/* Data Display */}
            <div className="space-y-4">
              {getCurrentData().length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                    {activeTab === 'research' && <BookOpen className="w-12 h-12 text-gray-400" />}
                    {activeTab === 'projects' && <Code2 className="w-12 h-12 text-gray-400" />}
                    {activeTab === 'achievements' && <Award className="w-12 h-12 text-gray-400" />}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-2">No {activeTab} found</h3>
                  <p className="text-gray-500">Get started by adding your first {activeTab.slice(0, -1)}</p>
                </div>
              ) : (
                getCurrentData().map((item) => (
                  <div key={item._id || item.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-400/30 transition-all duration-300 group">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                          {item.title}
                        </h3>
                        <p className="text-gray-400 mb-4 leading-relaxed">
                          {activeTab === 'research' ? item.abstract : 
                           activeTab === 'projects' ? item.description : 
                           item.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.technologies && item.technologies.split(',').map((tech, i) => (
                            <span key={i} className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm border border-purple-400/30">
                              {tech.trim()}
                            </span>
                          ))}
                          {item.journal && (
                            <span className="px-3 py-1 bg-cyan-600/20 text-cyan-300 rounded-full text-sm border border-cyan-400/30">
                              {item.journal}
                            </span>
                          )}
                          {item.status && (
                            <span className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-sm border border-green-400/30">
                              {item.status}
                            </span>
                          )}
                          {item.category && (
                            <span className="px-3 py-1 bg-yellow-600/20 text-yellow-300 rounded-full text-sm border border-yellow-400/30">
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(item, activeTab)}
                          className="p-2 bg-blue-600/20 border border-blue-400/30 rounded-xl text-blue-300 hover:bg-blue-600/30 hover:text-blue-200 transition-all duration-300"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id || item.id, activeTab)}
                          className="p-2 bg-red-600/20 border border-red-400/30 rounded-xl text-red-300 hover:bg-red-600/30 hover:text-red-200 transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-purple-600/10 to-cyan-600/10 backdrop-blur-sm rounded-3xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                    {editingId ? 'Edit' : 'Add New'} {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                    className="p-2 bg-red-600/20 border border-red-400/30 rounded-xl text-red-300 hover:bg-red-600/30 hover:text-red-200 transition-all duration-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={(e) => handleSubmit(e, activeTab)} className="space-y-6">
                  {activeTab === 'research' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                        <input
                          type="text"
                          name="title"
                          value={researchForm.title}
                          onChange={(e) => handleInputChange(e, 'research')}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Abstract</label>
                        <textarea
                          name="abstract"
                          value={researchForm.abstract}
                          onChange={(e) => handleInputChange(e, 'research')}
                          rows="4"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300 resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Authors (comma-separated)</label>
                        <input
                          type="text"
                          name="authors"
                          value={researchForm.authors}
                          onChange={(e) => handleInputChange(e, 'research')}
                          placeholder="John Doe, Jane Smith, Bob Johnson"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Venue</label>
                          <input
                            type="text"
                            name="venue"
                            value={researchForm.venue}
                            onChange={(e) => handleInputChange(e, 'research')}
                            placeholder="Journal or Conference name"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                          <select
                            name="status"
                            value={researchForm.status}
                            onChange={(e) => handleInputChange(e, 'research')}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          >
                            <option value="draft">Draft</option>
                            <option value="submitted">Submitted</option>
                            <option value="published">Published</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Published Date</label>
                          <input
                            type="date"
                            name="publishedDate"
                            value={researchForm.publishedDate}
                            onChange={(e) => handleInputChange(e, 'research')}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">DOI</label>
                          <input
                            type="text"
                            name="doi"
                            value={researchForm.doi}
                            onChange={(e) => handleInputChange(e, 'research')}
                            placeholder="10.1000/182"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">PDF URL</label>
                          <input
                            type="url"
                            name="pdfUrl"
                            value={researchForm.pdfUrl}
                            onChange={(e) => handleInputChange(e, 'research')}
                            placeholder="https://example.com/paper.pdf"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                          <input
                            type="text"
                            name="tags"
                            value={researchForm.tags}
                            onChange={(e) => handleInputChange(e, 'research')}
                            placeholder="machine learning, blockchain, AI"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'projects' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                        <input
                          type="text"
                          name="title"
                          value={projectForm.title}
                          onChange={(e) => handleInputChange(e, 'project')}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                          name="description"
                          value={projectForm.description}
                          onChange={(e) => handleInputChange(e, 'project')}
                          rows="4"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                          <input
                            type="text"
                            name="tags"
                            value={projectForm.tags}
                            onChange={(e) => handleInputChange(e, 'project')}
                            placeholder="React, Node.js, MongoDB"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                          <select
                            name="status"
                            value={projectForm.status}
                            onChange={(e) => handleInputChange(e, 'project')}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          >
                            <option value="idea">Idea</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
                          <input
                            type="date"
                            name="startDate"
                            value={projectForm.startDate}
                            onChange={(e) => handleInputChange(e, 'project')}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
                          <input
                            type="date"
                            name="endDate"
                            value={projectForm.endDate}
                            onChange={(e) => handleInputChange(e, 'project')}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Repository URL</label>
                          <input
                            type="url"
                            name="repoUrl"
                            value={projectForm.repoUrl}
                            onChange={(e) => handleInputChange(e, 'project')}
                            placeholder="https://github.com/username/repo"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Live URL</label>
                          <input
                            type="url"
                            name="liveUrl"
                            value={projectForm.liveUrl}
                            onChange={(e) => handleInputChange(e, 'project')}
                            placeholder="https://example.com"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Contributors (comma-separated emails)</label>
                        <input
                          type="text"
                          name="contributors"
                          value={projectForm.contributors}
                          onChange={(e) => handleInputChange(e, 'project')}
                          placeholder="john@example.com, jane@example.com"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                        />
                      </div>
                    </>
                  )}

                  {activeTab === 'achievements' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                        <input
                          type="text"
                          name="title"
                          value={achievementForm.title}
                          onChange={(e) => handleInputChange(e, 'achievement')}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                          name="description"
                          value={achievementForm.description}
                          onChange={(e) => handleInputChange(e, 'achievement')}
                          rows="4"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                          <input
                            type="date"
                            name="date"
                            value={achievementForm.date}
                            onChange={(e) => handleInputChange(e, 'achievement')}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                          <input
                            type="text"
                            name="category"
                            value={achievementForm.category}
                            onChange={(e) => handleInputChange(e, 'achievement')}
                            placeholder="Award, Certification, Competition"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Organization</label>
                          <input
                            type="text"
                            name="organization"
                            value={achievementForm.organization}
                            onChange={(e) => handleInputChange(e, 'achievement')}
                            placeholder="University, Company, Institution"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Evidence Image</label>
                          <input
                            type="file"
                            name="evidenceImage"
                            accept="image/*"
                            onChange={(e) => handleInputChange(e, 'achievement')}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                          />
                          {achievementForm.evidenceImage && (
                            <p className="mt-2 text-sm text-gray-400">
                              Selected: {achievementForm.evidenceImage instanceof File ? achievementForm.evidenceImage.name : achievementForm.evidenceImage}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Tags (comma-separated)</label>
                        <input
                          type="text"
                          name="tags"
                          value={achievementForm.tags}
                          onChange={(e) => handleInputChange(e, 'achievement')}
                          placeholder="programming, leadership, research"
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400/50 focus:bg-white/10 transition-all duration-300"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex space-x-4 pt-6">
                    <button
                      type="submit"
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-xl font-semibold text-white hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:shadow-2xl transform hover:scale-105"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {editingId ? 'Update' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                      }}
                      className="flex items-center px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-semibold text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-300"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

export default Admin;