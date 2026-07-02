import React, { useState } from 'react';
import { Search, ImageOff, FolderHeart } from 'lucide-react';
import PhotoCard from './PhotoCard';
import { Photo } from '../types';

interface PhotoGridProps {
  photos: Photo[];
  onDeletePhoto: (photoId: string, storagePath?: string) => Promise<void>;
  isLoading: boolean;
}

export default function PhotoGrid({ photos, onDeletePhoto, isLoading }: PhotoGridProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter photos based on the search query (case-insensitive caption search)
  const filteredPhotos = photos.filter(photo => 
    photo.caption.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="photo-grid-container">
      {/* Search and Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm" id="grid-controls-panel">
        <div>
          <h3 className="text-base font-display font-semibold text-slate-800 flex items-center gap-1.5" id="gallery-subtitle">
            <FolderHeart className="w-5 h-5 text-indigo-500" />
            Your Gallery
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {isLoading 
              ? 'Loading memories...' 
              : `Showing ${filteredPhotos.length} of ${photos.length} photos`}
          </p>
        </div>

        {/* Filter Input */}
        {photos.length > 0 && (
          <div className="relative w-full sm:w-64" id="search-input-wrapper">
            <input
              type="text"
              placeholder="Search captions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-slate-700 text-xs outline-none transition-all"
              id="gallery-search-input"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        )}
      </div>

      {/* Grid Content */}
      {isLoading ? (
        /* Loading skeleton state */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="loading-skeletons-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-pulse flex flex-col h-full">
              <div className="aspect-square bg-slate-200 w-full" />
              <div className="p-4 space-y-3 flex-grow">
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 rounded-md w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredPhotos.length > 0 ? (
        /* Grid showing actual photos */
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" 
          id="photos-grid-layout"
        >
          {filteredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onDelete={onDeletePhoto}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div 
          className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-slate-100/80 flex flex-col items-center justify-center space-y-3"
          id="empty-gallery-state"
        >
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ImageOff className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-700">No photos found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {searchQuery 
                ? "We couldn't find any photos matching that search query. Try typing something else!" 
                : "Your gallery is currently empty. Use the form above to upload your very first memory!"}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
              id="clear-search-btn"
            >
              Clear Search
            </button>
          )}
        </div>
      )}
    </div>
  );
}
