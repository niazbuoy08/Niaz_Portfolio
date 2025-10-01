import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Github, Linkedin, Code2, Brain, Rocket, Users, ChevronDown, Star, Zap } from 'lucide-react';
import { achievementsAPI, researchAPI, projectsAPI } from '../services/api';

const Home = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [highlights, setHighlights] = useState([
    { number: '0', label: 'Projects Completed', icon: Rocket },
    { number: '0', label: 'Research Papers', icon: Brain },
    { number: '5+', label: 'Years Experience', icon: Star },
    { number: '0', label: 'Team Collaborations', icon: Users },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    fetchDynamicData();
  }, []);

  const fetchDynamicData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from all APIs
      const [achievementsResponse, researchResponse, projectsResponse] = await Promise.all([
        achievementsAPI.getStats().catch(() => ({ data: { total: 0 } })),
        researchAPI.getStats().catch(() => ({ data: { total: 0 } })),
        projectsAPI.getStats().catch(() => ({ data: { total: 0 } }))
      ]);

      // Calculate dynamic highlights
      const projectsCount = projectsResponse.data?.total || 0;
      const researchCount = researchResponse.data?.total || 0;
      const achievementsCount = achievementsResponse.data?.total || 0;
      
      // Calculate team collaborations (could be based on projects with multiple contributors)
      const teamCollaborations = Math.max(achievementsCount, Math.floor(projectsCount * 0.8));

      setHighlights([
        { 
          number: projectsCount > 0 ? `${projectsCount}+` : '0', 
          label: 'Projects Completed', 
          icon: Rocket 
        },
        { 
          number: researchCount > 0 ? `${researchCount}+` : '0', 
          label: 'Research Papers', 
          icon: Brain 
        },
        { 
          number: '5+', 
          label: 'Years Experience', 
          icon: Star 
        },
        { 
          number: teamCollaborations > 0 ? `${teamCollaborations}+` : '0', 
          label: 'Team Collaborations', 
          icon: Users 
        },
      ]);
    } catch (error) {
      console.error('Error fetching dynamic data:', error);
      // Keep default values if API calls fail
    } finally {
      setLoading(false);
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 z-10 text-left lg:text-left">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-purple-600/20 rounded-full border border-purple-400/30 backdrop-blur-sm">
                <Star className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-sm font-medium">Software Engineer & Researcher</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  Niaz Rahman
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed">
                Passionate about creating <span className="text-purple-400 font-semibold">innovative solutions</span> and 
                conducting <span className="text-cyan-400 font-semibold">meaningful research</span> that bridges 
                technology and real-world impact.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-start">
              <Link
                to="/projects"
                className="group flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full font-semibold text-white hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:shadow-2xl transform hover:scale-105"
              >
                <Rocket className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                View My Work
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              
              <Link
                to="/about"
                className="flex items-center px-8 py-4 border-2 border-white/20 rounded-full font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                <Mail className="w-5 h-5 mr-2" />
                Get In Touch
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex justify-start space-x-4">
              {[
                { icon: Mail, href: 'mailto:your.email@example.com', color: 'hover:bg-red-500/20' },
                { icon: Linkedin, href: 'https://linkedin.com/in/yourprofile', color: 'hover:bg-blue-500/20' },
                { icon: Github, href: 'https://github.com/yourusername', color: 'hover:bg-gray-500/20' }
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className={`p-4 border border-white/20 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-110 ${social.color}`}
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
          </div>

          {/* Right Content - Profile Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="w-80 h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-gradient-to-r from-purple-600/50 to-cyan-600/50 shadow-2xl">
                <img 
                  src="/Niaz pic.jpg" 
                  alt="Niaz Rahman" 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-purple-600 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-cyan-600 rounded-full animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-white/60" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              Impact & Achievements
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full mx-auto"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((highlight, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full flex items-center justify-center mx-auto border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <highlight.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {highlight.number}
                </div>
                <div className="text-gray-400 font-medium">{highlight.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              Explore My Work
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'Projects', description: 'Innovative solutions and applications', icon: Code2, link: '/projects', color: 'from-purple-600/20 to-purple-800/20' },
              { title: 'Research', description: 'Academic publications and studies', icon: Brain, link: '/research', color: 'from-cyan-600/20 to-cyan-800/20' },
              { title: 'Achievements', description: 'Awards and recognitions', icon: Star, link: '/achievements', color: 'from-green-600/20 to-green-800/20' }
            ].map((item, index) => (
              <Link
                key={index}
                to={item.link}
                className="group relative"
              >
                <div className={`bg-gradient-to-br ${item.color} backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:transform hover:scale-105`}>
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">{item.description}</p>
                  <div className="flex items-center text-purple-400 font-medium">
                    <span>Explore</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600/10 to-cyan-600/10 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Let's Build Something Amazing Together
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Ready to collaborate on your next innovative project?
            </p>
            <Link
              to="/about"
              className="group flex items-center mx-auto px-12 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full font-semibold text-white hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:shadow-2xl transform hover:scale-105 w-fit"
            >
              <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;