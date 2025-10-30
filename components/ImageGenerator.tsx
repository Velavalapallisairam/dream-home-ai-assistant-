
import React, { useState, useCallback } from 'react';
import { generateImage } from '../services/geminiService';
import Spinner from './Spinner';
import { GenerateIcon } from './icons';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('A photorealistic image of a modern, minimalist living room with a large window overlooking a forest. The color palette should be neutral with pops of green from indoor plants.');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt to generate an image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const imageB64 = await generateImage(prompt);
      setGeneratedImage(`data:image/png;base64,${imageB64}`);
    } catch (e) {
      setError(e instanceof Error ? `Image generation failed: ${e.message}` : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Generate Interior Designs</h2>
        <p className="text-gray-400 mt-2">Describe the room you envision, and let AI bring it to life.</p>
      </div>

      <div className="space-y-4">
        <label htmlFor="generate-prompt" className="block text-sm font-medium text-gray-300">Design Prompt</label>
        <textarea
          id="generate-prompt"
          rows={4}
          className="w-full p-3 bg-neutral border border-gray-600 rounded-md shadow-sm focus:ring-secondary focus:border-secondary text-gray-200"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A cozy Scandinavian bedroom with a plush rug and warm lighting..."
        />
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !prompt}
          className="px-8 py-3 bg-secondary text-white font-bold rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
        >
          {isLoading ? <Spinner /> : <GenerateIcon className="w-5 h-5"/>}
          {isLoading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {error && <p className="text-center text-error mt-4">{error}</p>}
      
      <div className="mt-6 flex justify-center">
        {isLoading && (
            <div className="w-full aspect-video bg-neutral rounded-lg flex items-center justify-center">
                 <Spinner />
            </div>
        )}
        {generatedImage && (
          <div className="w-full max-w-3xl">
            <h3 className="text-xl font-semibold mb-4 text-center text-white">Generated Image:</h3>
            <img src={generatedImage} alt="Generated interior design" className="rounded-lg shadow-2xl w-full h-auto object-contain" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
