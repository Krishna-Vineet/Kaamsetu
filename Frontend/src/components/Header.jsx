import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ChevronDown, User, Briefcase, LogOut, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { logo } from '@/assets/assets';

function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src={logo} 
            alt="KaamSetu Logo" 
            className="h-8 w-auto"
          />
          <span className="text-xl font-bold text-primary">KaamSetu</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <ProfileDropdown user={user} onLogout={handleLogout} />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        <button 
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden py-4 px-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {isAuthenticated ? (
            <div className="flex flex-col space-y-3">
              <Link 
                to={`/${user.role}/account`}
                className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="mr-2 h-4 w-4" />
                Account
              </Link>
              <Link 
                to={`/${user.role}/works`}
                className="flex items-center px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Works
              </Link>
              <Button 
                variant="ghost" 
                className="justify-start px-3 text-sm hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              <Link 
                to="/login" 
                className="px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function ProfileDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigateTo = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const userRole = user.role?.charAt(0).toUpperCase() + user.role?.slice(1);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="flex items-center space-x-2 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar className="h-9 w-9 ring-2 ring-white shadow-md">
          <AvatarImage src={user.profilePicture} alt={user.name} />
          <AvatarFallback style={{ backgroundColor: '#4660A3', color: 'white' }} className="font-semibold text-sm flex items-center justify-center">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <ChevronDown size={16} className={cn("transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute bg-white/75 right-0 mt-2 w-56 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 z-50">
          <div className="p-2">
            <div className="px-2 py-1.5 border-b mb-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{userRole}</p>
            </div>
            
            <div className="py-1">
              <button 
                onClick={() => navigateTo(`/${user.role}/account`)}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Account</span>
              </button>
              <button 
                onClick={() => navigateTo(`/${user.role}/works`)}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                <span>Works</span>
              </button>
            </div>
            
            <div className="px-2 py-1.5 border-t mt-1">
              <button 
                onClick={onLogout}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;