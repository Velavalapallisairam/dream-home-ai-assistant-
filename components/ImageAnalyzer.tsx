
import React, { useState, useCallback } from 'react';
import { analyzeImage } from '../services/geminiService';
import Spinner from './Spinner';
import { UploadIcon } from './icons';

const ImageAnalyzer: React.FC = () => {
  const initialPrompt = "Using the provided floor plan, please perform the following modifications: 1. Convert all metric measurements (e.g., 4.00m) into feet and inches. 2. Redesign the entire plot to fit a new total dimension of 56 feet by 42 feet. 3. The main entrance, currently marked as 4.15m, should be removed. 4. Relocate the road access to the south side of the property. Please provide a detailed textual description of the new layout, explaining the changes and the new room dimensions.";
  
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [image, setImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if(file.size > 4 * 1024 * 1024) {
        setError('File size should not exceed 4MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setImageMimeType(file.type);
        setError(null);
      };
      reader.onerror = () => {
        setError('Failed to read file.');
      };
      reader.readAsDataURL(file);
    }
  };

  const getBase64FromDataUrl = (dataUrl: string) => dataUrl.split(',')[1];

  const handleSubmit = useCallback(async () => {
    if (!prompt || !image) {
      setError('Please provide a floor plan image and a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis('');

    try {
      const imageBase64 = getBase64FromDataUrl(image);
      const result = await analyzeImage(prompt, imageBase64, imageMimeType);
      setAnalysis(result);
    } catch (e) {
      setError(e instanceof Error ? `Analysis failed: ${e.message}` : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, image, imageMimeType]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Analyze Your Floor Plan</h2>
        <p className="text-gray-400 mt-2">Upload a floor plan to get an AI-powered analysis and redesign based on your criteria.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300">Floor Plan Image</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-600 rounded-md hover:border-secondary transition">
            <div className="space-y-1 text-center">
              {image ? (
                <img src={image} alt="Uploaded floor plan" className="mx-auto h-48 w-auto rounded-md object-contain" />
              ) : (
                <>
                  <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                  <div className="flex text-sm text-gray-400">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-neutral rounded-md font-medium text-secondary hover:text-accent focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-neutral focus-within:ring-secondary">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 4MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
           <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">Analysis Prompt</label>
           <textarea
            id="prompt"
            rows={8}
            className="w-full p-3 bg-neutral border border-gray-600 rounded-md shadow-sm focus:ring-secondary focus:border-secondary text-gray-200 resize-none"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={isLoading || !image}
          className="px-8 py-3 bg-secondary text-white font-bold rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors duration-300 transform hover:scale-105 shadow-lg"
        >
          {isLoading ? <Spinner /> : 'Analyze Plan'}
        </button>
      </div>

      {error && <p className="text-center text-error mt-4">{error}</p>}

      {analysis && (
        <div className="mt-6 bg-neutral p-6 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold mb-4 text-white">Analysis Result:</h3>
          <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">{analysis}</div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;
