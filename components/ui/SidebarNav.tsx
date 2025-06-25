
import React from 'react';
import { TabId, TabItem, AuthenticatedUser } from '../../types'; // Ensure AuthenticatedUser is imported

interface SidebarNavProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: TabItem[];
  activeTabId: TabId;
  onNavItemClick: (tabId: TabId) => void;
  appName: string;
  user: AuthenticatedUser | null;
}

const SidebarNav: React.FC<SidebarNavProps> = ({
  isOpen,
  onClose,
  navItems,
  activeTabId,
  onNavItemClick,
  appName,
  user
}) => {
  return (
    <>
      {/* Overlay for smaller screens */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-slate-800 text-white shadow-xl transition-transform duration-300 ease-in-out
                   w-64 sm:w-72 md:sticky md:top-auto md:h-auto md:z-auto md:translate-x-0 md:shadow-none md:bg-slate-100 md:text-slate-700 md:border-r md:border-slate-200
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header (visible on mobile-style sidebar) */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700 md:hidden">
            <h2 className="text-lg font-semibold text-sky-300 truncate">
              <i className="fas fa-tractor mr-2"></i> {appName.split(' - ')[1] || appName}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
              aria-label="Close sidebar"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          {/* User Info (visible on mobile-style sidebar) */}
          {user && (
            <div className="p-4 border-b border-slate-700 md:hidden">
              <p className="text-sm font-medium">{user.username}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          )}
          
          {/* Desktop Sidebar Header (simplified or could be branding) */}
          <div className="hidden md:block p-4 border-b border-slate-200">
             <h2 className="text-lg font-semibold text-sky-600 truncate">
              Menu Principal
            </h2>
          </div>


          <nav className="flex-1 overflow-y-auto py-4 space-y-1">
            <ul>
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavItemClick(item.id)}
                    className={`w-full flex items-center px-4 py-2.5 text-sm font-medium transition-colors duration-150 ease-in-out group
                               md:hover:bg-slate-200 md:text-slate-600 md:hover:text-sky-600
                               hover:bg-slate-700 text-slate-200 hover:text-white
                              ${activeTabId === item.id 
                                ? 'bg-sky-500 text-white md:bg-sky-100 md:text-sky-700 md:border-r-4 md:border-sky-500 font-semibold' 
                                : 'md:border-r-4 md:border-transparent'
                              }`}
                    role="menuitem"
                  >
                    {item.icon && <i className={`${item.icon} w-6 h-6 mr-3 text-base ${activeTabId === item.id ? 'text-white md:text-sky-600' : 'text-slate-400 group-hover:text-slate-300 md:group-hover:text-sky-500'}`}></i>}
                    <span>{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Optional Footer for Sidebar */}
          <div className="p-4 border-t border-slate-700 md:border-slate-200 mt-auto md:hidden">
             <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} {appName.split(" - ")[0]}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SidebarNav;
