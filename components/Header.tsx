
import React from 'react';
import { AppMode } from '../types';
import { AnalyzeIcon, ChatIcon, EditIcon, GenerateIcon } from './icons';

interface HeaderProps {
  activeMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Header: React.FC<HeaderProps> = ({ activeMode, setMode }) => {
  const navItems = [
    { mode: AppMode.Analyze, icon: <AnalyzeIcon className="w-5 h-5" /> },
    { mode: AppMode.Generate, icon: <GenerateIcon className="w-5 h-5" /> },
    { mode: AppMode.Edit, icon: <EditIcon className="w-5 h-5" /> },
    { mode: AppMode.Chat, icon: <ChatIcon className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-neutral/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-neutral/60">
      <ul className="flex items-center justify-around">
        {navItems.map((item) => (
          <li key={item.mode} className="flex-1">
            <button
              onClick={() => setMode(item.mode)}
              className={`w-full flex flex-col sm:flex-row items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-full transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-opacity-50 ${
                activeMode === item.mode
                  ? 'bg-secondary text-white shadow-md'
                  : 'text-gray-300 hover:bg-neutral/60 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.mode}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Header;
