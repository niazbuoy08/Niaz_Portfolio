import React from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMenu, FiX, FiMail, FiLinkedin, FiGithub } from 'react-icons/fi';

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Projects', href: '/projects' },
    { name: 'Research', href: '/research' },
    { name: 'Achievements', href: '/achievements' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-black backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
             <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent hover:from-purple-400 hover:to-cyan-400 transition-all duration-300">
               Niaz Rahman
             </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-all duration-300 relative ${
                    isActive(item.href)
                      ? 'text-white'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.name}
                  {isActive(item.href) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full"></div>
                  )}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-white/10 py-4 bg-black/30 backdrop-blur-md">
              <nav className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-2 mx-2 text-sm font-medium transition-all duration-300 rounded-md ${
                      isActive(item.href)
                        ? 'text-white bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-white/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            {/* About Section */}
             <div>
               <h3 className="text-xl font-bold mb-4">Niaz Rahman</h3>
               <p className="text-blue-100 leading-relaxed">
                 Software Engineer & Researcher passionate about creating 
                 innovative solutions that bridge technology and real-world impact.
               </p>
             </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <nav className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-blue-100 hover:text-white transition-colors duration-300"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact & Social */}
            <div>
              <h3 className="text-xl font-bold mb-4">Connect</h3>
              <div className="flex space-x-4 mb-4">
                <a
                  href="mailto:your.email@example.com"
                  className="p-3 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors duration-300"
                >
                  <FiMail size={20} />
                </a>
                <a
                  href="https://linkedin.com/in/yourprofile"
                  className="p-3 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors duration-300"
                >
                  <FiLinkedin size={20} />
                </a>
                <a
                  href="https://github.com/yourusername"
                  className="p-3 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors duration-300"
                >
                  <FiGithub size={20} />
                </a>
              </div>
              <p className="text-blue-100 text-sm">
                your.email@example.com
              </p>
            </div>
          </div>

          <div className="border-t border-blue-600 mt-8 pt-8 text-center">
             <p className="text-blue-100">
               © {new Date().getFullYear()} Niaz Rahman. All rights reserved.
             </p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;