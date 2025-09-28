import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Zap, 
  Code, 
  Smartphone, 
  Users, 
  Star,
  CheckCircle,
  ArrowRight,
  Moon,
  Sun,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Play,
  Globe,
  Plus,
  Palette,
  Wand2
} from 'lucide-react';
import { DEMO_MODE } from '../services/demoAPI';
import ResponsivePreview from '../components/ResponsivePreview';
import VisualEditorToolbar from '../components/VisualEditorToolbar';

const LandingPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [animatedText, setAnimatedText] = useState('');
  
  const fullText = "Build apps at the speed of thought";
  
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setAnimatedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    
    return () => clearInterval(timer);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Generate full-stack applications in seconds, not weeks"
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: "Production Ready",
      description: "Get clean, scalable code with modern frameworks and best practices"
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "Responsive Design",
      description: "Every app works perfectly on mobile, tablet, and desktop"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Collaboration",
      description: "Work together seamlessly with built-in sharing and version control"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Startup Founder",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&h=64&fit=crop&crop=face",
      content: "VibeCoding helped me launch my MVP in just 2 days. Incredible!"
    },
    {
      name: "Marcus Johnson",
      role: "Product Manager",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
      content: "The code quality is amazing. It's like having a senior developer on demand."
    },
    {
      name: "Emily Rodriguez",
      role: "Designer",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
      content: "Finally, a tool that bridges the gap between design and development."
    }
  ];

  const faqs = [
    {
      question: "How does VibeCoding work?",
      answer: "Simply describe your app idea in plain English, and our AI generates a complete, production-ready application with frontend, backend, and database."
    },
    {
      question: "What technologies does it use?",
      answer: "We generate modern applications using React, TypeScript, Node.js, and other industry-standard technologies."
    },
    {
      question: "Can I modify the generated code?",
      answer: "Absolutely! You get full access to clean, well-documented source code that you can customize and extend."
    },
    {
      question: "Is there a free tier?",
      answer: "Yes! You can generate your first few apps completely free to try out the platform."
    }
  ];

  return (
    <ResponsivePreview>
      <VisualEditorToolbar />
      <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
        {/* Navigation - Base44 Style */}
        <nav className="fixed top-0 w-full bg-white backdrop-blur-md z-50 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 sm:py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold text-gray-900">VibeCoding</span>
                {DEMO_MODE && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium ml-2">
                    Demo
                  </span>
                )}
              </div>
              
              <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                <a href="#product" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Product</a>
                <a href="#resources" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Resources</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</a>
                <a href="#enterprise" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Enterprise</a>
                <div className="flex items-center space-x-4">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <Link
                    to="/register"
                    className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-lg font-semibold transition-colors"
                  >
                    Start Building
                  </Link>
                </div>
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Link
                  to="/register"
                  className="bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                >
                  Start
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section - Base44 Style */}
        <section className="pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
              Let's make your dream a{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                reality.
              </span>
              <br />
              <span className="text-gray-900">Right now.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4">
              VibeCoding lets you build fully-functional apps in minutes with just your words.
              <br className="hidden sm:block" />
              No coding necessary.
            </p>
            
            {/* Main Input Field */}
            <div className="max-w-3xl mx-auto mb-8 sm:mb-12 px-4">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-4 sm:p-6 lg:p-8">
                <div className="relative">
                  <textarea
                    placeholder="What do you want to build?"
                    className="w-full h-24 sm:h-32 text-base sm:text-lg text-gray-700 placeholder-gray-400 border-0 resize-none focus:outline-none focus:ring-0"
                  />
                  <button 
                    className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-lg touch-target"
                    title="Generate app"
                  >
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
                
                <div className="mt-4 sm:mt-6">
                  <p className="text-sm text-gray-500 mb-3 sm:mb-4">Not sure where to start? Try one of these:</p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                    {[
                      'Subscription tracking app',
                      'Gaming platform',
                      'Employee onboarding portal',
                      'Social networking app',
                      'Room visualization tool'
                    ].map((suggestion, index) => (
                      <button
                        key={index}
                        className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs sm:text-sm font-medium transition-colors touch-target"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Consider Yourself Limitless Section - Base44 Style */}
        <section className="py-20 px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Consider yourself limitless.
              </h2>
              <p className="text-xl text-gray-600">
                If you can describe it, you can build it.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Create at the speed of thought
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Tell VibeCoding your idea, and watch it transform into a working app—complete with all the 
                    necessary components, pages, flows and features.
                  </p>
                </div>
                
                <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold transition-colors">
                  Start building
                </button>
              </div>
              
              {/* Right Mockup */}
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 rounded-3xl p-8 shadow-2xl">
                  {/* App Mockup */}
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* App Header */}
                    <div className="bg-blue-500 text-white p-4 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <span className="font-semibold">TaskTracker</span>
                    </div>
                    
                    {/* App Content */}
                    <div className="p-6">
                      <div className="mb-6">
                        <p className="text-gray-600 text-sm mb-4">
                          Create an app that helps people keep track of their tasks and alerts them to upcoming deadlines
                        </p>
                        
                        <div className="flex space-x-2">
                          <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                            <Plus className="w-4 h-4" />
                            <span>Add task</span>
                          </button>
                          <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                            <Palette className="w-4 h-4" />
                            <span>Add styling</span>
                          </button>
                          <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                            <Wand2 className="w-4 h-4" />
                            <span>Improve prompt</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-400">0.36</div>
                          <div className="text-xs text-gray-500">This Month</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-500">$1324.27</div>
                          <div className="text-xs text-gray-500">Spend Last 12 Months</div>
                          <div className="text-xs text-green-500">+3% vs. prev 12 months</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Submit Button */}
                  <div className="absolute -bottom-4 -right-4">
                    <button 
                      className="w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg transition-colors"
                      title="Submit"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Building Progress Section - Base44 Style */}
        <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-pink-50 via-red-50 to-orange-50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Mockup */}
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-100 via-blue-50 to-purple-100 rounded-3xl p-8 shadow-2xl">
                  {/* Building Progress Card */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Building your Subscription Tracker app</h3>
                    
                    <div className="space-y-4 mb-6">
                      {[
                        'Setting up user authentication',
                        'Building subscription database', 
                        'Configuring email notifications',
                        'Configuring SMS notifications',
                        'Designing subscription cards'
                      ].map((step, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-gray-700">{step}</span>
                        </div>
                      ))}
                    </div>
                    
                    {/* What would you change input */}
                    <div className="border-t pt-6">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="What would you change?"
                          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <div className="absolute right-2 top-2 flex space-x-2">
                          <button className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-lg text-sm">
                            <Plus className="w-3 h-3" />
                            <span>Add styling</span>
                          </button>
                          <button className="flex items-center space-x-1 px-3 py-1 bg-gray-100 rounded-lg text-sm">
                            <Wand2 className="w-3 h-3" />
                            <span>Improve prompt</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Submit Button */}
                  <div className="absolute -bottom-4 -right-4">
                    <button 
                      className="w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center shadow-lg transition-colors"
                      title="Continue building"
                    >
                      <ArrowRight className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Right Content */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-6">
                    The backend's built-in automatically
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Everything your idea needs to function, like letting users sign in, saving their data, 
                    or creating role-based permissions is taken care of behind the scenes.
                  </p>
                </div>
                
                <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold transition-colors">
                  Start building
                </button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Ready to Use Section - Base44 Style */}
        <section className="py-20 px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-4xl font-bold text-gray-900 mb-6">
                    Ready to use, instantly.
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Our platform comes with built-in hosting, so when your app is ready the only thing left to do is publish, 
                    put it to use, and share it with your community.
                  </p>
                </div>
                
                <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold transition-colors">
                  Start building
                </button>
              </div>
              
              {/* Right App Dashboard Mockup */}
              <div className="relative">
                <div className="bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 rounded-3xl p-8 shadow-2xl">
                  {/* Complete App Dashboard */}
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Dashboard Header */}
                    <div className="bg-blue-500 text-white p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                          <Zap className="w-5 h-5" />
                        </div>
                        <span className="font-semibold">SubTracker</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Globe className="w-5 h-5" />
                        <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                          + Add Subscription
                        </button>
                      </div>
                    </div>
                    
                    {/* Dashboard Content */}
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6">My Subscriptions</h2>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">10</div>
                          <div className="text-xs text-gray-500">Active Subscriptions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">$110.36</div>
                          <div className="text-xs text-gray-500">Spent This Month</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">$1324.27</div>
                          <div className="text-xs text-gray-500">Spent Last 12 Months</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">1</div>
                          <div className="text-xs text-gray-500">Notifications</div>
                        </div>
                      </div>
                      
                      {/* Recent Activity & Overview */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                          <div className="space-y-3">
                            {[
                              { name: 'Daily Plate', date: 'Added May 17, 2025', price: '$19.99', status: 'nutrition' },
                              { name: 'The Reel', date: 'Added January 4, 2025', price: '$15.99', status: 'streaming' },
                              { name: 'SecurWare', date: 'Added October 1, 2024', price: '$49.99', status: 'security' }
                            ].map((item, index) => (
                              <div key={index} className="flex items-center justify-between py-2">
                                <div>
                                  <div className="font-medium text-sm">{item.name}</div>
                                  <div className="text-xs text-gray-500">{item.date}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-sm">{item.price}</div>
                                  <div className="text-xs">
                                    <span className={`px-2 py-1 rounded-full ${
                                      item.status === 'nutrition' ? 'bg-blue-100 text-blue-700' :
                                      item.status === 'streaming' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-orange-100 text-orange-700'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-4">Overview</h3>
                          {/* Pie Chart Placeholder */}
                          <div className="w-32 h-32 mx-auto relative">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 via-yellow-400 to-orange-400 opacity-80"></div>
                            <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                              <div className="text-center">
                                <div className="text-sm font-semibold">86%</div>
                                <div className="text-xs text-gray-500">Active</div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center"><div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>Streaming 86%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center"><div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>Security 17%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center"><div className="w-2 h-2 bg-orange-400 rounded-full mr-2"></div>Nutrition 10.2%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center"><div className="w-2 h-2 bg-gray-300 rounded-full mr-2"></div>Other 6.8%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Loved by thousands of creators
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                See what our community is saying
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="card dark:bg-gray-700 dark:border-gray-600"
                >
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {testimonial.role}
                      </p>
                    </div>
                    <div className="ml-auto flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{testimonial.content}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Everything you need to know about VibeCoding
              </p>
            </div>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="card dark:bg-gray-700 dark:border-gray-600"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <Sparkles className="w-8 h-8 text-orange-500" />
                  <span className="text-2xl font-bold">VibeCoding</span>
                </div>
                <p className="text-gray-400 mb-6 max-w-md">
                  The fastest way to turn your ideas into production-ready applications. 
                  Join thousands of creators building the future.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Github className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Linkedin className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <Mail className="w-6 h-6" />
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Product</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 VibeCoding. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
      </div>
    </ResponsivePreview>
  );
};

export default LandingPage;