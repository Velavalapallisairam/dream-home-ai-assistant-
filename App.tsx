
import React, { useState } from 'react';
import { AppMode } from './types';
import Header from './components/Header';
import ImageAnalyzer from './components/ImageAnalyzer';
import ImageGenerator from './components/ImageGenerator';
import ImageEditor from './components/ImageEditor';
import Chatbot from './components/Chatbot';
import { HouseIcon } from './components/icons';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.Analyze);

  const renderContent = () => {
    switch (mode) {
      case AppMode.Analyze:
        return <ImageAnalyzer />;
      case AppMode.Generate:
        return <ImageGenerator />;
      case AppMode.Edit:
        return <ImageEditor />;
      case AppMode.Chat:
        return <Chatbot />;
      default:
        return <ImageAnalyzer />;
    }
  };

  return (
    <div className="min-h-screen bg-base-100 font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-center gap-4 mb-8 text-3xl md:text-4xl font-bold text-white">
          <HouseIcon className="w-10 h-10 text-secondary" />
          <h1>Dream Home AI Assistant</h1>
        </div>
        <Header activeMode={mode} setMode={setMode} />
        <main className="mt-8 bg-neutral/50 p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl border border-neutral/70">
          {renderContent()}
        </main>
      </div>
       <footer className="text-center p-4 mt-8 text-sm text-gray-500">
          {/* FIX: Corrected invalid text causing a render error. */}
          <p>Powered by Gemini. Built for you.</p>
       </footer>
    </div>
  );
};

export default App;
