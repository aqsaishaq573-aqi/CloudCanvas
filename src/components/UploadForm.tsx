import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Sparkles, X, AlertCircle } from 'lucide-react';

interface UploadFormProps {
  onUploadSuccess: (file: File, caption: string) => Promise<void>;
  isSupabaseMode: boolean;
}

export default function UploadForm({ onUploadSuccess, isSupabaseMode }: UploadFormProps) {
  // State for form inputs
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // UI States
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Reference to the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Helper to handle file selection and generate a preview
   */
  const handleFileChange = (file: File) => {
    setErrorMessage(null);

    // Validate file type (must be an image)
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    // Warn if file is huge in local demo mode (since localStorage has a 5MB limit)
    if (!isSupabaseMode && file.size > 1.5 * 1024 * 1024) {
      setErrorMessage(
        'Warning: This image is quite large (>1.5MB). Storing large images in "Local Demo Mode" may fill the browser storage quota quickly. Connect your Supabase account to upload files without restrictions!'
      );
    }

    setSelectedFile(file);
    
    // Create a local temporary URL for image preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  /**
   * Triggered when file input changes (manual click selection)
   */
  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  /**
   * File Drag & Drop Handlers
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  /**
   * Trigger file input click when the upload card is clicked
   */
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  /**
   * Clear current file selection
   */
  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening file chooser
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setErrorMessage(null);
  };

  /**
   * Submit Form handler
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select an image to upload first!');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      // Call the parent component's upload handler
      await onUploadSuccess(selectedFile, caption);
      
      // Reset form upon successful upload
      setCaption('');
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xl max-w-xl mx-auto"
      id="upload-form-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-display font-semibold text-slate-800" id="upload-form-title">
            Share a New Memory
          </h2>
          <p className="text-xs text-slate-400">
            {isSupabaseMode ? 'Uploading to Supabase Cloud Storage' : 'Using browser local state'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" id="photo-upload-form">
        {/* Drag & Drop File Upload Area */}
        <div
          onClick={triggerFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[180px] group overflow-hidden ${
            isDragging 
              ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]' 
              : previewUrl 
                ? 'border-slate-200 bg-slate-50' 
                : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50'
          }`}
          id="drag-drop-container"
        >
          {/* Hidden input to hold file data */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileInputChange}
            accept="image/*"
            className="hidden"
            id="photo-file-input"
          />

          {previewUrl ? (
            /* Selected Image Preview Mode */
            <div className="relative w-full h-40 flex items-center justify-center" id="preview-wrapper">
              <img
                src={previewUrl}
                alt="Selected preview"
                className="max-h-full rounded-lg object-contain shadow-sm border border-slate-200/50"
                id="selected-image-preview"
              />
              <button
                type="button"
                onClick={handleClearSelection}
                className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white p-1 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
                id="clear-selection-btn"
                title="Remove Selected Image"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-900/85 text-white text-[10px] py-1 px-2.5 rounded-full font-sans tracking-wide">
                Click preview to change image
              </div>
            </div>
          ) : (
            /* Empty State / Prompt Mode */
            <div className="space-y-3" id="empty-upload-prompt">
              <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-indigo-100/50 flex items-center justify-center mx-auto text-slate-400 group-hover:text-indigo-500 transition-colors duration-300">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  <span className="text-indigo-600 group-hover:underline">Click to browse</span> or drag & drop image
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports JPG, PNG, GIF, WEBP up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Caption Input */}
        <div className="space-y-1.5" id="caption-field-group">
          <label 
            htmlFor="photo-caption" 
            className="text-xs font-semibold text-slate-500 tracking-wider uppercase block"
          >
            Caption / Description
          </label>
          <input
            type="text"
            id="photo-caption"
            placeholder="E.g., A spectacular sunset hike with the family..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={isUploading}
            maxLength={180}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:bg-white rounded-xl text-slate-800 text-sm outline-none transition-all"
          />
        </div>

        {/* Error Notification Banner */}
        {errorMessage && (
          <div 
            className="flex gap-2 items-start p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-xs leading-relaxed"
            id="upload-error-alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={isUploading || !selectedFile}
          className={`w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
            isUploading
              ? 'bg-indigo-100 text-indigo-400 cursor-not-allowed'
              : !selectedFile
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.98] hover:shadow-md'
          }`}
          id="photo-upload-submit-btn"
        >
          {isUploading ? (
            <>
              {/* Spinner icon */}
              <svg className="animate-spin h-4 w-4 text-indigo-500 animate-infinite" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Uploading image...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Publish to Gallery</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
