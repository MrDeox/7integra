
import React from 'react';
import { AuthenticatedUser } from '../types';
import Button from './ui/Button';

interface HeaderProps {
  title: string;
  user: AuthenticatedUser | null;
  onLogout: () => void;
  onToggleSidebar: () => void; // New prop to toggle sidebar
}

const Header: React.FC<HeaderProps> = ({ title, user, onLogout, onToggleSidebar }) => {
  return (
    <header className="bg-sky-600 text-white py-3 shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          {user && ( // Only show sidebar toggle if user is logged in
            <Button 
              onClick={onToggleSidebar} 
              variant="light" // Use a light variant or a custom one for icon buttons
              size="sm" 
              className="!p-2 mr-3 text-sky-600 bg-white hover:bg-sky-100" // Adjusted for visibility
              aria-label="Abrir menu"
            >
              <i className="fas fa-bars text-base"></i>
            </Button>
          )}
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate" title={title}>
              <i className="fas fa-tractor mr-2 text-sky-300 hidden sm:inline-block"></i>
              {title}
          </h1>
        </div>
        {user && (
          <div className="flex items-center space-x-3">
             {/* Username can be displayed here or in sidebar user profile section later */}
            {/* <p className="text-sm font-medium leading-tight hidden md:block">{user.username}</p> */}
            <Button onClick={onLogout} variant="light" size="sm" className="!px-3 !py-1.5 text-sky-600 bg-white hover:bg-sky-100">
              <i className="fas fa-sign-out-alt mr-1 sm:mr-2"></i>
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;