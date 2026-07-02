/**
 * Types representing the Photo structure and configurations.
 */

export interface Photo {
  id: string;          // Unique identifier (UUID in Supabase, timestamp in local mode)
  url: string;         // The URL of the image file (Supabase public URL or base64 data URL)
  caption: string;     // The photo caption text
  created_at: string;  // ISO string representation of when the photo was added
  storage_path?: string; // The path of the file in the Supabase Storage Bucket (needed for deletion)
}

export interface ServiceConfig {
  isSupabaseConfigured: boolean;
  supabaseUrl?: string;
}
