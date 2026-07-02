/**
 * photoService.ts
 * 
 * This service manages photo fetching, uploading, and deleting.
 * It features a DUAL MODE setup:
 * 1. REAL MODE: Connects to your live Supabase database and storage if keys are configured.
 * 2. LOCAL DEMO MODE: If keys are missing, it seamlessly falls back to localStorage,
 *    seeding the gallery with beautiful Unsplash pictures so the app is immediately usable.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Photo } from '../types';

// Retrieve environment variables from Vite env config.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Lazy initialization of Supabase client to prevent startup crashes when keys are missing.
let supabase: SupabaseClient | null = null;
const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_ANON_KEY && 
  SUPABASE_URL !== 'https://your-supabase-project.supabase.co' && 
  SUPABASE_URL.trim() !== ''
);

if (isSupabaseConfigured) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
}

// Key for storage persistence in local demo mode
const LOCAL_STORAGE_KEY = 'photo-gallery-items';

// Initial starter photos so the application looks gorgeous on first load.
const STARTER_PHOTOS: Photo[] = [
  {
    id: 'starter-1',
    url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80',
    caption: 'Serene mountain peaks touching the sky at dusk',
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
  },
  {
    id: 'starter-2',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    caption: 'Mist drifting through an ancient pine forest',
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // 2 days ago
  },
  {
    id: 'starter-3',
    url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80',
    caption: 'A hidden rustic bridge nestled in vibrant foliage',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(), // 12 hours ago
  },
  {
    id: 'starter-4',
    url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    caption: 'Warm golden sunlight filtering through giant redwoods',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
  }
];

/**
 * Checks if Supabase is properly configured
 */
export function getServiceConfig() {
  return {
    isSupabaseConfigured,
    supabaseUrl: SUPABASE_URL,
  };
}

/**
 * Fetch all photos.
 * In Supabase Mode: retrieves records from 'photos' table sorted by created_at desc.
 * In Local Mode: fetches from localStorage (initialized with starter photos).
 */
export async function fetchPhotos(): Promise<Photo[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error while fetching photos:', error);
      throw new Error(`Supabase Fetch Error: ${error.message}`);
    }

    return data || [];
  } else {
    // Local fallback: read from localStorage
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) {
      // Seed with beautiful images if empty
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(STARTER_PHOTOS));
      return STARTER_PHOTOS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return STARTER_PHOTOS;
    }
  }
}

/**
 * Upload a new photo.
 * 
 * In Supabase Mode:
 * 1. Uploads the image file to the 'photos' storage bucket.
 * 2. Obtains the public URL of the uploaded image.
 * 3. Inserts a database record in the 'photos' table containing the URL and caption.
 */
export async function uploadPhoto(file: File, caption: string): Promise<Photo> {
  const fileExtension = file.name.split('.').pop() || 'png';
  const cleanFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExtension}`;

  if (isSupabaseConfigured && supabase) {
    // 1. Upload file to Supabase Storage Bucket ('photos')
    // Make sure you have created a public bucket called 'photos' in your Supabase project!
    const { data: storageData, error: storageError } = await supabase.storage
      .from('photos')
      .upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (storageError) {
      console.error('Supabase Storage upload error:', storageError);
      throw new Error(`Storage Error: ${storageError.message}`);
    }

    // 2. Get the public URL of the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(cleanFileName);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Could not retrieve public URL for uploaded photo.');
    }

    const publicUrl = publicUrlData.publicUrl;

    // 3. Insert record into the 'photos' table
    const { data, error: dbError } = await supabase
      .from('photos')
      .insert([
        {
          url: publicUrl,
          caption: caption,
          storage_path: cleanFileName,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (dbError) {
      // Cleanup the uploaded file in case database insert fails
      await supabase.storage.from('photos').remove([cleanFileName]);
      console.error('Supabase Database insertion error:', dbError);
      throw new Error(`Database Error: ${dbError.message}`);
    }

    return data;
  } else {
    // Local Demo mode: convert file to Base64 and store in localStorage
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const base64Url = reader.result as string;
          
          const newPhoto: Photo = {
            id: `local-${Date.now()}`,
            url: base64Url,
            caption: caption || 'Untitled Photo',
            created_at: new Date().toISOString(),
          };

          // Update localStorage
          const photos = await fetchPhotos();
          const updatedPhotos = [newPhoto, ...photos];
          
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPhotos));
            resolve(newPhoto);
          } catch (storageError) {
            console.error('LocalStorage quota exceeded:', storageError);
            reject(
              new Error(
                'Local storage quota exceeded! Standard web browsers limit local storage to ~5MB. ' +
                'To upload large photos without limits, configure your own Supabase project following the Setup Guide!'
              )
            );
          }
        } catch (err) {
          reject(new Error('Failed to read file. Please try another image.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Error reading the selected image.'));
      };

      reader.readAsDataURL(file);
    });
  }
}

/**
 * Delete a photo.
 * 
 * In Supabase Mode:
 * 1. Deletes the file from the storage bucket if storage_path is present.
 * 2. Deletes the database entry matching the id.
 */
export async function deletePhoto(photoId: string, storagePath?: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    // 1. If we have a file path, delete the file from Supabase storage first
    if (storagePath) {
      const { error: storageError } = await supabase.storage
        .from('photos')
        .remove([storagePath]);
      
      if (storageError) {
        // Log error but continue with DB deletion just in case file was already deleted manually
        console.warn('Could not delete file from Supabase storage:', storageError);
      }
    }

    // 2. Delete database entry
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (dbError) {
      console.error('Supabase DB delete error:', dbError);
      throw new Error(`Database Delete Error: ${dbError.message}`);
    }
  } else {
    // Local demo mode deletion
    const photos = await fetchPhotos();
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPhotos));
  }
}
