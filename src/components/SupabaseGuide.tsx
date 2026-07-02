import React, { useState } from 'react';
import { Database, Check, Copy, ShieldAlert } from 'lucide-react';

interface SupabaseGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupabaseGuide({ isOpen, onClose }: SupabaseGuideProps) {
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  if (!isOpen) return null;

  const sqlSchema = `-- 1. Create a table for your photos
CREATE TABLE photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  url TEXT NOT NULL,
  caption TEXT,
  storage_path TEXT
);

-- 2. Set up Row Level Security (RLS) to allow public read & write access
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read photo entries
CREATE POLICY "Allow public read access" 
ON photos FOR SELECT 
USING (true);

-- Allow anyone to insert photo entries
CREATE POLICY "Allow public insert access" 
ON photos FOR INSERT 
WITH CHECK (true);

-- Allow anyone to delete photo entries
CREATE POLICY "Allow public delete access" 
ON photos FOR DELETE 
USING (true);`;

  const envSample = `# Add these to your environment secrets in AI Studio Settings (or local .env file)
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-100 flex flex-col"
        id="supabase-guide-modal"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-display font-semibold text-slate-800 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              Supabase Configuration Guide
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Follow these simple steps to power this gallery with your own cloud database and file storage.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            id="close-guide-btn"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-slate-600 text-sm leading-relaxed">
          {/* Step 1 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">1</span>
              Create a Supabase Account & Project
            </h4>
            <p className="pl-7">
              Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-medium">supabase.com</a>, sign up or log in, and create a <strong>New Project</strong>. Wait a minute for the project to provision.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">2</span>
              Set Up the Database Table
            </h4>
            <p className="pl-7">
              In the Supabase Sidebar, go to the <strong>SQL Editor</strong>, click <strong>New Query</strong>, paste the script below, and click <strong>Run</strong>:
            </p>
            <div className="pl-7 relative">
              <pre className="bg-slate-900 text-slate-200 text-xs p-4 rounded-xl overflow-x-auto font-mono max-h-48 leading-relaxed">
                {sqlSchema}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(sqlSchema, setCopiedSQL)}
                className="absolute top-3 right-3 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                id="copy-sql-btn"
              >
                {copiedSQL ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy SQL
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">3</span>
              Set Up the Storage Bucket
            </h4>
            <p className="pl-7">
              To store your images, go to the <strong>Storage</strong> tab in Supabase:
            </p>
            <ul className="pl-12 list-disc space-y-1">
              <li>Click <strong>New Bucket</strong>.</li>
              <li>Name the bucket exactly <code className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded font-mono text-xs">photos</code>.</li>
              <li>Toggle on the <strong>Public bucket</strong> option (this allows the app to fetch and display the images directly).</li>
              <li>Save the bucket!</li>
            </ul>
            <div className="pl-7 mt-2 flex items-start gap-2 bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-800 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <strong>Storage Security Tip:</strong> For simple public apps, public buckets are perfect. For production apps, you can write Storage Policies to restrict upload/delete operations to authenticated users.
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold">4</span>
              Configure Environment Variables
            </h4>
            <p className="pl-7">
              Go to your project <strong>Settings &gt; API</strong> in Supabase to find your URL and Anon Key. In AI Studio, open the <strong>Settings</strong> panel (or edit your local <code className="font-mono">.env</code> file) and enter these keys:
            </p>
            <div className="pl-7 relative">
              <pre className="bg-slate-900 text-slate-200 text-xs p-4 rounded-xl overflow-x-auto font-mono leading-relaxed">
                {envSample}
              </pre>
              <button
                type="button"
                onClick={() => copyToClipboard(envSample, setCopiedEnv)}
                className="absolute top-3 right-3 bg-slate-800 hover:bg-slate-700 text-white p-2 rounded-lg transition-colors border border-slate-700 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                id="copy-env-btn"
              >
                {copiedEnv ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Env
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-all shadow-sm hover:shadow active:scale-95 cursor-pointer text-sm"
            id="close-guide-footer-btn"
          >
            I've set it up! Reload App
          </button>
        </div>
      </div>
    </div>
  );
}
