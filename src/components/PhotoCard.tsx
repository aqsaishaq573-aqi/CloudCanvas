import React, { useState } from 'react';
import { Trash2, Calendar, AlertTriangle } from 'lucide-react';
import { Photo } from '../types';

interface PhotoCardProps {
  key?: string;
  photo: Photo;
  onDelete: (photoId: string, storagePath?: string) => Promise<void>;
}

export default function PhotoCard({ photo, onDelete }: PhotoCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Helper function to convert ISO timestamps into friendly dates
   */
  const formatFriendlyDate = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Recently';

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;

      // Full date formatted gracefully
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Recently';
    }
  };

  /**
   * Triggers the deletion callback
   */
  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    setError(null);
    try {
      await onDelete(photo.id, photo.storage_path);
    } catch (err: any) {
      setError(err.message || 'Failed to delete');
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
      id={`photo-card-${photo.id}`}
    >
      {/* Photo Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-900" id={`photo-image-container-${photo.id}`}>
        <img
          src={photo.url}
          alt={photo.caption || 'Gallery photo'}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          id={`photo-img-${photo.id}`}
        />
        
        {/* Hover overlay containing delete button */}
        <div 
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-start justify-end p-3"
          id={`photo-hover-overlay-${photo.id}`}
        >
          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={isDeleting}
              className="bg-white/90 hover:bg-rose-500 text-slate-700 hover:text-white p-2 rounded-xl backdrop-blur-sm shadow-sm transition-all hover:scale-110 cursor-pointer active:scale-95"
              title="Delete Photo"
              id={`delete-btn-${photo.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            /* Popover confirmation inside card for clean deletion workflow */
            <div 
              className="bg-white p-2.5 rounded-xl shadow-lg border border-slate-100 flex flex-col items-end gap-1.5 max-w-[180px] text-xs"
              id={`delete-confirm-${photo.id}`}
              onClick={(e) => e.stopPropagation()} // Prevent clicking through to image
            >
              <span className="text-slate-700 font-medium text-center leading-tight">
                Delete this photo?
              </span>
              <div className="flex gap-1.5 w-full justify-stretch">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-lg transition-colors cursor-pointer text-center"
                  id={`cancel-delete-${photo.id}`}
                >
                  No
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="flex-1 px-2 py-1 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition-colors cursor-pointer text-center"
                  id={`confirm-delete-${photo.id}`}
                >
                  {isDeleting ? '...' : 'Yes'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading overlay during deletion */}
        {isDeleting && (
          <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center backdrop-blur-xs">
            <div className="text-center space-y-2">
              <svg className="animate-spin h-6 w-6 text-indigo-400 mx-auto" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs text-indigo-200 font-medium">Removing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Caption & Metadata Section */}
      <div className="p-4 flex flex-col flex-grow justify-between space-y-2" id={`photo-info-${photo.id}`}>
        <p className="text-slate-700 text-sm font-sans leading-relaxed line-clamp-3">
          {photo.caption || <span className="text-slate-400 italic">No caption provided</span>}
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatFriendlyDate(photo.created_at)}</span>
          </div>
          {photo.storage_path && (
            <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold text-[10px]">
              Cloud
            </span>
          )}
        </div>

        {error && (
          <div className="text-rose-600 text-[10px] bg-rose-50 p-1.5 rounded-lg flex items-center gap-1 mt-1 border border-rose-100">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <span className="truncate">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
