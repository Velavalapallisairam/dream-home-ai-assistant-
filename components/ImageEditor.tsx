
import React, { useState, useCallback } from 'react';
import { editImage } from '../services/geminiService';
import Spinner from './Spinner';
import { UploadIcon, EditIcon } from './icons';

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('Add a retro, vintage filter to this image.');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('');
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if(file.size > 4 * 1024 * 1024) {
        setError('File size should not exceed 4MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setImageMimeType(file.type);
        setEditedImage(null); // Clear previous edit on new image upload
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
    if (!prompt || !originalImage) {
      setError('Please upload an image and provide an editing prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const imageBase64 = getBase64FromDataUrl(originalImage);
      const resultB64 = await editImage(prompt, imageBase64, imageMimeType);
      setEditedImage(`data:image/png;base64,${resultB64}`);
    } catch (e) {
      setError(e instanceof Error ? `Image editing failed: ${e.message}` : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, originalImage, imageMimeType]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">Edit Your Interior Photos</h2>
        <p className="text-gray-400 mt-2">Upload a photo and tell the AI how you want to change it.</p>
      </div>

      {!originalImage && (
        <div className="max-w-md mx-auto">
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300 mb-2">Upload Image</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-600 rounded-md hover:border-secondary transition">
            <div className="space-y-1 text-center">
              <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
              <div className="flex text-sm text-gray-400">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-neutral rounded-md font-medium text-secondary hover:text-accent focus-within:outline-none">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG up to 4MB</p>
            </div>
          </div>
        </div>
      )}

      {originalImage && (
        <>
          <div className="space-y-4">
            <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300">Editing Instructions</label>
            <textarea
              id="edit-prompt"
              rows={3}
              className="w-full p-3 bg-neutral border border-gray-600 rounded-md shadow-sm focus:ring-secondary focus:border-secondary text-gray-200"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Make the walls a light blue color, add a large plant in the corner..."
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !prompt || !originalImage}
              className="px-8 py-3 bg-secondary text-white font-bold rounded-full disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors duration-300 transform hover:scale-105 shadow-lg flex items-center gap-2"
            >
              {isLoading ? <Spinner /> : <EditIcon className="w-5 h-5"/>}
              {isLoading ? 'Editing...' : 'Edit Image'}
            </button>
          </div>
        </>
      )}
      
      {error && <p className="text-center text-error mt-4">{error}</p>}
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {originalImage && (
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-white">Original</h3>
            <img src={originalImage} alt="Original" className="rounded-lg shadow-xl w-full h-auto object-contain" />
          </div>
        )}
        {isLoading ? (
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-white">Edited</h3>
             <div className="w-full aspect-square bg-neutral rounded-lg flex items-center justify-center">
                 <Spinner />
            </div>
          </div>
        ) : editedImage && (
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-white">Edited</h3>
            <img src={editedImage} alt="Edited" className="rounded-lg shadow-xl w-full h-auto object-contain" />
          </div>
        )}
      </div>
       {originalImage && (
          <div className="text-center mt-4">
            <button onClick={() => setOriginalImage(null)} className="text-sm text-accent hover:underline">Upload another image</button>
          </div>
        )}
    </div>
  );
};

export default ImageEditor;
