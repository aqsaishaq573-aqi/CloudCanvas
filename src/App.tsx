import React, { useState, useEffect } from 'react';
import { Camera, Database, CheckCircle2, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { Photo, ServiceConfig } from './types';
import { fetchPhotos, uploadPhoto, deletePhoto, getServiceConfig } from './services/photoService';
import UploadForm from './components/UploadForm';
import PhotoGrid from './components/PhotoGrid';
import SupabaseGuide from './components/SupabaseGuide';

export default function App() {
  // --- APPLICATION STATE ---
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [config, setConfig] = useState<ServiceConfig>({ isSupabaseConfigured: false });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // --- COMPONENT MOUNT EFFECT ---
  // This runs once when the app is first loaded on the user's screen.
  useEffect(() => {
    // 1. Fetch the service configuration to see if Supabase keys are active.
    const serviceConfig = getServiceConfig();
    setConfig(serviceConfig);

    // 2. Fetch photos from the database (or localStorage).
    const loadPhotos = async () => {
      try {
        setIsLoading(true);
        const data = await fetchPhotos();
        setPhotos(data);
      } catch (err: any) {
        showToast('error', err.message || 'Failed to load photo gallery.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPhotos();
  }, []);

  // --- TOAST NOTIFICATION HELPER ---
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    // Automatically dismiss the notification toast after 4 seconds
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // --- PHOTO UPLOAD CALLBACK ---
  // Triggered when the UploadForm succeeds in publishing an image.
  const handleUploadSuccess = async (file: File, caption: string) => {
    try {
      const newPhoto = await uploadPhoto(file, caption);
      // Prepend the newly created photo so it instantly appears at the top of the grid!
      setPhotos((prevPhotos) => [newPhoto, ...prevPhotos]);
      showToast('success', 'Your photo has been uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      // Propagate the error so the form can render its own detailed warning
      throw err;
    }
  };

  // --- PHOTO DELETION CALLBACK ---
  // Triggered when a photo's delete button is clicked and confirmed.
  const handleDeletePhoto = async (photoId: string, storagePath?: string) => {
    try {
      await deletePhoto(photoId, storagePath);
      // Remove the photo from React state to instantly update the UI grid!
      setPhotos((prevPhotos) => prevPhotos.filter((p) => p.id !== photoId));
      showToast('success', 'Photo successfully removed.');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete photo.');
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800" id="app-root-container">
      {/* Toast Notifications */}
      {toast && (
        <div 
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm max-w-sm animate-slideIn ${
            toast.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
              : 'bg-rose-50 text-rose-800 border-rose-100'
          }`}
          id="global-toast-notification"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          )}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* --- APPLICATION HEADER --- */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20 backdrop-blur-md bg-white/90" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight text-slate-800" id="app-title">
                MemoryBox
              </h1>
              <p className="text-xs text-slate-400">Share & curate your best snapshots</p>
            </div>
          </div>

          {/* Connection Badge & Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {config.isSupabaseConfigured ? (
              /* Supabase Connected Indicator */
              <div 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold"
                id="supabase-status-badge"
              >
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>Supabase Connected</span>
              </div>
            ) : (
              /* Local Demo Mode Indicator */
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer animate-pulse"
                id="demo-status-badge"
                title="Click to learn how to connect Supabase"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Demo Mode (Local State)</span>
                <HelpCircle className="w-3.5 h-3.5 text-amber-600 ml-0.5" />
              </button>
            )}

            {/* Quick configuration toggle button */}
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="text-xs font-medium px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1"
              id="view-guide-btn"
            >
              <span>Setup Supabase</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* --- CORE CONTENT --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10" id="app-main-content">
        
        {/* Connection Notice banner for beginners */}
        {!config.isSupabaseConfigured && (
          <div 
            className="bg-indigo-900 text-indigo-100 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
            id="supabase-intro-banner"
          >
            {/* Subtle background decoration */}
            <div className="absolute right-0 bottom-0 translate-y-1/3 translate-x-1/6 opacity-10">
              <Database className="w-80 h-80" />
            </div>

            <div className="space-y-2 relative z-10 text-center md:text-left">
              <span className="bg-indigo-500 text-indigo-100 text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
                Beginner Friendly Fallback
              </span>
              <h2 className="text-xl font-display font-semibold text-white">
                Ready to plug in your own Supabase cloud database?
              </h2>
              <p className="text-indigo-200 text-sm max-w-2xl leading-relaxed">
                We've built this photo gallery with a dual storage driver. It is fully ready for cloud storage but is running in 
                <strong> Local Storage mode</strong> so you can play with it right now. To enable permanent storage for heavy files, click the guide.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="bg-white hover:bg-slate-50 text-indigo-950 font-semibold px-5 py-3 rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 text-sm"
              id="get-started-guide-btn"
            >
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Connect Supabase Now</span>
            </button>
          </div>
        )}

        {/* Upload form container */}
        <section id="upload-section">
          <UploadForm 
            onUploadSuccess={handleUploadSuccess} 
            isSupabaseMode={config.isSupabaseConfigured}
          />
        </section>

        {/* Gallery / Grid container */}
        <section className="space-y-4" id="gallery-section">
          <PhotoGrid 
            photos={photos} 
            onDeletePhoto={handleDeletePhoto}
            isLoading={isLoading}
          />
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-100 mt-20" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-xs text-slate-400 space-y-2">
          <p>© 2026 MemoryBox. All images belong to their respective creators on Unsplash.</p>
          <p className="flex items-center justify-center gap-1 font-mono">
            Powered by <span className="text-indigo-500 font-semibold">Supabase</span> + <span className="text-indigo-500 font-semibold">React</span>
          </p>
        </div>
      </footer>

      {/* --- CONFIGURATION GUIDE MODAL --- */}
      <SupabaseGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
}
