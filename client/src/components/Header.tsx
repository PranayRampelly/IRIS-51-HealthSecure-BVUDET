import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Menu, X, ChevronDown, Globe, Bell } from 'lucide-react';
import Logo from '@/components/ui/logo';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface NavLink {
  label: string;
  section: string;
  scroll: boolean;
  hasDropdown?: boolean;
  dropdownItems?: { label: string; path: string }[];
}

const navLinks: NavLink[] = [
  { label: 'Home', section: '/', scroll: false },
  { label: 'How It Works', section: 'how-it-works', scroll: true },
  { label: 'Use Cases', section: 'use-cases', scroll: true },
  { 
    label: 'Services', 
    section: 'services', 
    scroll: true, 
    hasDropdown: true,
    dropdownItems: [
      { label: 'Patient Portal', path: '/patient/dashboard' },
      { label: 'Doctor Portal', path: '/doctor/dashboard' },
      { label: 'Hospital Portal', path: '/hospital/dashboard' },
      { label: 'Pharmacy Portal', path: '/pharmacy/dashboard' },
      { label: 'Insurance Portal', path: '/insurance/dashboard' }
    ]
  },
  { label: 'Security', section: 'security', scroll: true },
  { label: 'Resources', section: '/resources', scroll: false },
  { label: 'Contact', section: '/contact', scroll: false },
];

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Home');
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  // Handle scroll effect for header styling
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update active nav based on current location
  useEffect(() => {
    const currentPath = location.pathname;
    const currentLink = navLinks.find(link => 
      link.section === currentPath || 
      (currentPath.startsWith('/') && link.section === currentPath)
    );
    if (currentLink) {
      setActiveNav(currentLink.label);
    }
  }, [location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Memoized scroll function for performance
  const scrollToSection = useCallback((sectionId: string, label: string) => {
    setActiveNav(label);
    setIsLoading(true);
    
    if (window.location.pathname === '/' || window.location.pathname === '/home') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 100);
    }
    
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    
    // Reset loading state
    setTimeout(() => setIsLoading(false), 500);
  }, [navigate]);

  // Memoized navigation function
  const handleNavigation = useCallback((path: string, label: string) => {
    setActiveNav(label);
    setIsLoading(true);
    navigate(path);
    setIsMobileMenuOpen(false);
    setOpenDropdown(null);
    
    // Reset loading state
    setTimeout(() => setIsLoading(false), 300);
  }, [navigate]);

  // Handle dropdown toggle
  const toggleDropdown = useCallback((label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  }, [openDropdown]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate]);

  // Memoized header classes for performance
  const headerClasses = useMemo(() => cn(
    "backdrop-blur-xl sticky top-0 z-50 transition-all duration-300 ease-in-out",
    isScrolled 
      ? "bg-white/90 shadow-2xl border-b border-health-blue-gray/20 rounded-b-2xl" 
      : "bg-white/70 shadow-xl border-b border-health-blue-gray/10 rounded-b-2xl"
  ), [isScrolled]);

  // Memoized logo classes
  const logoClasses = useMemo(() => cn(
    "transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-lg",
    isScrolled && "scale-95"
  ), [isScrolled]);

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with enhanced hover effects */}
          <div
            className="flex items-center cursor-pointer group transition-all duration-300"
            onClick={() => handleNavigation('/', 'Home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleNavigation('/', 'Home')}
            aria-label="Navigate to Home"
          >
            <Logo size="md" showText={true} className={logoClasses} />
            <div className="hidden lg:block h-8 w-px bg-gradient-to-b from-health-aqua/60 to-health-teal/60 mx-6 rounded-full shadow-md" />
          </div>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 relative" role="navigation" aria-label="Main navigation">
            {navLinks.map((link) => (
              <div key={link.label} className="relative dropdown-container">
                <button
                  onClick={() =>
                    link.hasDropdown 
                      ? toggleDropdown(link.label)
                      : link.scroll
                        ? scrollToSection(link.section, link.label)
                        : handleNavigation(link.section, link.label)
                  }
                  onMouseEnter={() => link.hasDropdown && setOpenDropdown(link.label)}
                  onMouseLeave={() => link.hasDropdown && setOpenDropdown(null)}
                  className={cn(
                    "relative px-4 py-2 font-open-sans text-base rounded-xl transition-all duration-200 group",
                    activeNav === link.label
                      ? 'text-health-aqua font-bold'
                      : 'text-health-charcoal hover:text-health-aqua',
                    link.hasDropdown && 'flex items-center gap-1'
                  )}
                  aria-expanded={link.hasDropdown ? openDropdown === link.label : undefined}
                  aria-haspopup={link.hasDropdown ? 'true' : undefined}
                >
                  {link.label}
                  {link.hasDropdown && (
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      openDropdown === link.label && "rotate-180"
                    )} />
                  )}
                  
                  {/* Enhanced animated underline */}
                  <span
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 -bottom-1 h-1 w-6 rounded-full bg-gradient-to-r from-health-aqua to-health-teal transition-all duration-300",
                      activeNav === link.label ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                    )}
                  />
                </button>

                {/* Enhanced Dropdown Menu */}
                {link.hasDropdown && openDropdown === link.label && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-health-blue-gray/10 py-2 z-50 animate-in slide-in-from-top-2 duration-200"
                    onMouseEnter={() => setOpenDropdown(link.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {link.dropdownItems?.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path, item.label)}
                        className="w-full text-left px-4 py-3 text-health-charcoal hover:bg-health-aqua/10 hover:text-health-aqua transition-all duration-200 flex items-center gap-3 group"
                      >
                        <div className="w-2 h-2 bg-health-aqua rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Enhanced Desktop Action Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative p-2 text-health-charcoal hover:text-health-aqua hover:bg-health-aqua/10 transition-all duration-200"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                </Button>
                
                <div className="relative dropdown-container">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 text-health-charcoal hover:text-health-aqua hover:bg-health-aqua/10 transition-all duration-200"
                    onClick={() => toggleDropdown('user')}
                    aria-expanded={openDropdown === 'user'}
                    aria-haspopup="true"
                  >
                                         <User className="h-5 w-5" />
                     <span className="font-medium">{user ? `${user.firstName} ${user.lastName}` : 'User'}</span>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      openDropdown === 'user' && "rotate-180"
                    )} />
                  </Button>
                  
                  {openDropdown === 'user' && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-health-blue-gray/10 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                      <button
                        onClick={() => handleNavigation(`/${user?.role || 'patient'}/dashboard`, 'Dashboard')}
                        className="w-full text-left px-4 py-2 text-health-charcoal hover:bg-health-aqua/10 hover:text-health-aqua transition-all duration-200"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => handleNavigation(`/${user?.role || 'patient'}/profile`, 'Profile')}
                        className="w-full text-left px-4 py-2 text-health-charcoal hover:bg-health-aqua/10 hover:text-health-aqua transition-all duration-200"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => handleNavigation(`/${user?.role || 'patient'}/settings`, 'Settings')}
                        className="w-full text-left px-4 py-2 text-health-charcoal hover:bg-health-aqua/10 hover:text-health-aqua transition-all duration-200"
                      >
                        Settings
                      </button>
                      <div className="border-t border-health-blue-gray/10 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-all duration-200"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button
                  className="bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white px-8 py-3 rounded-full shadow-lg font-bold text-base transition-all duration-200 border-2 border-transparent hover:border-health-aqua hover:scale-105 transform"
                  style={{ boxShadow: '0 4px 24px 0 rgba(0, 121, 107, 0.15)' }}
                  onClick={() => handleNavigation('/signup', 'Sign Up')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Sign Up'
                  )}
                </Button>
                <Button
                  className="bg-white text-health-teal border-2 border-health-aqua px-8 py-3 rounded-full shadow-lg font-bold text-base transition-all duration-200 hover:bg-health-aqua hover:text-white hover:border-health-teal hover:scale-105 transform"
                  onClick={() => handleNavigation('/login', 'Log In')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-health-aqua/30 border-t-health-aqua rounded-full animate-spin" />
                  ) : (
                    'Log In'
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Enhanced Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-full bg-white/80 shadow-md border border-health-blue-gray/10 hover:bg-health-aqua/10 transition-all duration-200 hover:scale-105"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-7 w-7 text-health-teal" />
            ) : (
              <Menu className="h-7 w-7 text-health-teal" />
            )}
          </button>
        </div>

        {/* Enhanced Mobile Menu */}
        <div
          className={cn(
            "lg:hidden fixed top-0 left-0 w-full h-full bg-black/40 z-40 transition-all duration-300",
            isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          )}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
        
        <div
          className={cn(
            "lg:hidden fixed top-0 right-0 w-4/5 max-w-xs h-full bg-white/95 backdrop-blur-xl shadow-2xl z-50 transform transition-all duration-300 ease-out",
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-health-blue-gray/10">
            <Logo size="md" showText={true} />
            <button
              className="p-2 rounded-full bg-health-light-gray hover:bg-health-aqua/10 transition-all duration-200 hover:scale-105"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-6 w-6 text-health-teal" />
            </button>
          </div>
          
          <nav className="flex flex-col space-y-2 px-6 py-8 overflow-y-auto max-h-[calc(100vh-120px)]">
            {navLinks.map((link) => (
              <div key={link.label}>
                <button
                  onClick={() => {
                    if (link.hasDropdown) {
                      toggleDropdown(link.label);
                    } else if (link.scroll) {
                      scrollToSection(link.section, link.label);
                    } else {
                      handleNavigation(link.section, link.label);
                    }
                  }}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl font-open-sans text-lg transition-all duration-200",
                    activeNav === link.label
                      ? 'bg-gradient-to-r from-health-aqua to-health-teal text-white font-bold shadow-md'
                      : 'text-health-charcoal hover:bg-health-light-gray hover:text-health-aqua'
                  )}
                >
                  <div className="flex items-center justify-between">
                    {link.label}
                    {link.hasDropdown && (
                      <ChevronDown className={cn(
                        "h-5 w-5 transition-transform duration-200",
                        openDropdown === link.label && "rotate-180"
                      )} />
                    )}
                  </div>
                </button>
                
                {/* Mobile Dropdown Items */}
                {link.hasDropdown && openDropdown === link.label && (
                  <div className="ml-4 mt-2 space-y-1 animate-in slide-in-from-left-2 duration-200">
                    {link.dropdownItems?.map((item) => (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path, item.label)}
                        className="w-full text-left px-4 py-2 text-health-charcoal hover:bg-health-aqua/10 hover:text-health-aqua transition-all duration-200 rounded-lg"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {!isAuthenticated ? (
              <>
                <Button
                  className="mt-6 bg-gradient-to-r from-health-aqua to-health-teal hover:from-health-teal hover:to-health-aqua text-white px-8 py-3 rounded-full shadow-lg font-bold text-lg transition-all duration-200 border-2 border-transparent hover:border-health-aqua hover:scale-105 transform"
                  onClick={() => handleNavigation('/signup', 'Sign Up')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Sign Up'
                  )}
                </Button>
                <Button
                  className="mt-3 bg-white text-health-teal border-2 border-health-aqua px-8 py-3 rounded-full shadow-lg font-bold text-lg transition-all duration-200 hover:bg-health-aqua hover:text-white hover:border-health-teal hover:scale-105 transform"
                  onClick={() => handleNavigation('/login', 'Log In')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-health-aqua/30 border-t-health-aqua rounded-full animate-spin" />
                  ) : (
                    'Log In'
                  )}
                </Button>
              </>
            ) : (
              <div className="mt-6 pt-4 border-t border-health-blue-gray/10">
                                 <div className="flex items-center gap-3 px-4 py-2">
                   <User className="h-5 w-5 text-health-aqua" />
                   <span className="font-medium text-health-charcoal">{user ? `${user.firstName} ${user.lastName}` : 'User'}</span>
                 </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
