
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { streamChatResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { SendIcon, BrainIcon } from './icons';
import Spinner from './Spinner';

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [useThinkingMode, setUseThinkingMode] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    const currentHistory = [...messages, userMessage];
    
    // Add a placeholder for the model's response
    setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

    try {
      // FIX: Updated the call to streamChatResponse to match its new signature.
      await streamChatResponse(
        currentHistory,
        useThinkingMode,
        (chunk) => {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === 'model') {
              const updatedText = lastMessage.parts[0].text + chunk;
              return [...prev.slice(0, -1), { role: 'model', parts: [{ text: updatedText }] }];
            }
            return prev;
          });
        }
      );
    } catch (e) {
      const errorMessage = e instanceof Error ? `An error occurred: ${e.message}` : 'An unknown error occurred.';
      setError(errorMessage);
      setMessages(prev => [...prev.slice(0, -1)]); // Remove placeholder on error
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, useThinkingMode]);

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white">Chat with Your Assistant</h2>
        <p className="text-gray-400 mt-2">Ask anything about home design, floor plans, or renovation ideas.</p>
      </div>
      
      <div className="flex-grow overflow-y-auto pr-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg lg:max-w-2xl px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-secondary text-white' : 'bg-neutral text-gray-200'}`}>
              <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length-1]?.role === 'user' && (
             <div className="flex justify-start">
                 <div className="max-w-lg px-4 py-3 rounded-2xl bg-neutral text-gray-200">
                    <Spinner/>
                 </div>
             </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {error && <p className="text-center text-error mt-2">{error}</p>}
      
      <div className="mt-6">
        <div className="flex items-center space-x-2 p-2 bg-neutral border border-gray-600 rounded-full">
          <button 
            onClick={() => setUseThinkingMode(!useThinkingMode)}
            className={`p-2 rounded-full transition-colors duration-200 ${useThinkingMode ? 'bg-accent text-neutral' : 'bg-gray-600 text-gray-200 hover:bg-gray-500'}`}
            title={useThinkingMode ? "Thinking Mode (Slower, Smarter)" : "Standard Mode (Faster)"}
          >
            <BrainIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            className="flex-grow bg-transparent focus:outline-none text-gray-200 px-2"
            placeholder={useThinkingMode ? "Ask a complex question..." : "Type your message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-secondary text-white rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
