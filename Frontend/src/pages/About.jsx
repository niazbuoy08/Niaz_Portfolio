import React, { useState, useEffect } from 'react';
import { Download, Mail, Linkedin, Github, Code2, Brain, Rocket, Users, ChevronDown, Star, Zap, Target } from 'lucide-react';

const About = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const skills = [
    { name: 'JavaScript', level: 95, icon: '⚡' },
    { name: 'React', level: 92, icon: '⚛️' },
    { name: 'Node.js', level: 88, icon: '🟢' },
    { name: 'Python', level: 90, icon: '🐍' },
    { name: 'Machine Learning', level: 85, icon: '🤖' },
    { name: 'Data Analysis', level: 87, icon: '📊' },
    { name: 'Research', level: 93, icon: '🔬' },
    { name: 'Technical Writing', level: 89, icon: '✍️' },
  ];

  const achievements = [
    { number: '50+', label: 'Projects Completed', icon: Rocket },
    { number: '15+', label: 'Research Papers', icon: Brain },
    { number: '5+', label: 'Years Experience', icon: Target },
    { number: '20+', label: 'Team Collaborations', icon: Users },
  ];

  const values = [
    {
      icon: Code2,
      title: 'Innovation First',
      description: 'Pushing boundaries with cutting-edge technology and creative problem-solving approaches.'
    },
    {
      icon: Brain,
      title: 'Research-Driven',
      description: 'Every solution backed by rigorous analysis and evidence-based methodologies.'
    },
    {
      icon: Users,
      title: 'Collaborative Spirit',
      description: 'Building bridges between disciplines to create impactful, sustainable solutions.'
    }
  ];

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
          <div className="space-y-8 z-10">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-purple-600/20 rounded-full border border-purple-400/30 backdrop-blur-sm">
                <Star className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-sm font-medium">Senior Software Engineer & Researcher</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold">
                <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  Niaz Rahman
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-2xl">
                Transforming complex problems into elegant solutions through the fusion of 
                <span className="text-purple-400 font-semibold"> cutting-edge research</span> and 
                <span className="text-cyan-400 font-semibold"> innovative engineering</span>.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button className="group flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full font-semibold text-white hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:shadow-2xl transform hover:scale-105">
                <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Download Resume
              </button>
              
              <button className="flex items-center px-8 py-4 border-2 border-white/20 rounded-full font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
                <Mail className="w-5 h-5 mr-2" />
                Let's Connect
              </button>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
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
          <div className="relative">
            <div className="relative w-full max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-purple-900/50 to-cyan-900/50 rounded-full p-2 backdrop-blur-sm border border-white/10">
                <img
                  src="/api/placeholder/400/400"
                  alt="Niaz Rahman"
                  className="w-full rounded-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-full"></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center animate-bounce delay-100">
                <Code2 className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center animate-bounce delay-300">
                <Brain className="w-6 h-6" />
              </div>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full flex items-center justify-center mx-auto border border-white/10 group-hover:scale-110 transition-transform duration-300">
                    <achievement.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {achievement.number}
                </div>
                <div className="text-gray-400 font-medium">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Story */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              My Journey
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full mx-auto"></div>
          </div>

          <div className="space-y-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <p className="text-lg leading-relaxed text-gray-300 mb-6">
                My journey began with a simple fascination: <strong className="text-white">how can technology 
                fundamentally transform the way we solve complex problems?</strong> With over 5 years of experience 
                spanning software engineering and academic research, I've discovered that the most impactful 
                solutions emerge at the intersection of rigorous methodology and creative innovation.
              </p>
              
              <p className="text-lg leading-relaxed text-gray-300">
                Holding a Master's degree in Computer Science and having published numerous papers in 
                top-tier conferences, I specialize in <strong className="text-purple-400">machine learning</strong>, 
                <strong className="text-cyan-400"> data science</strong>, and 
                <strong className="text-green-400"> software architecture</strong> — always with an unwavering 
                focus on practical applications that create measurable, positive impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              Technical Expertise
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {skills.map((skill, index) => (
              <div key={index} className="group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{skill.icon}</span>
                    <span className="font-semibold text-white">{skill.name}</span>
                  </div>
                  <span className="text-cyan-400 font-bold">{skill.level}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">
              Core Values
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="group relative">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <value.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600/10 to-cyan-600/10 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Create Something Amazing?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Let's collaborate and turn your innovative ideas into reality.
            </p>
            <button className="group flex items-center mx-auto px-12 py-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full font-semibold text-white hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 hover:shadow-2xl transform hover:scale-105">
              <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Start a Conversation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;