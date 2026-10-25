import React, { useState } from 'react';
import { SupabaseConfig } from '../../types';
import {
  saveSupabaseConfig,
  testSupabaseConnection,
  pushAllToSupabase,
} from '../../services/storage';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Server,
  KeyRound,
} from 'lucide-react';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onConfigUpdated: (cfg: SupabaseConfig) => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
  config,
  onConfigUpdated,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'connection' | 'sql' | 'guide'>('connection');
  const [url, setUrl] = useState(config.url || '');
  const [anonKey, setAnonKey] = useState(config.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );
  const [sqlCopied, setSqlCopied] = useState(false);

  const sampleSqlSnippet = `-- Run this in Supabase SQL Editor:
-- Creates tables: students, fee_records, attendance_records, test_records, test_marks, homework, referrals
-- Includes Row Level Security (RLS) & get_parent_portal_data() stored procedure

CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    roll_no TEXT NOT NULL UNIQUE,
    class_grade TEXT NOT NULL,
    batch TEXT NOT NULL,
    student_phone TEXT,
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 3500.00,
    fee_due_day INT DEFAULT 5,
    joined_date DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'active',
    parent_pin TEXT DEFAULT '1234',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);
-- ... (full SQL schema is in src/services/schema.sql)`;

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      setFeedback({ type: 'error', message: 'Please provide both Supabase URL and Anon Key.' });
      return;
    }

    setIsTesting(true);
    setFeedback(null);

    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setIsTesting(false);

    if (res.success) {
      const updated: SupabaseConfig = {
        url: url.trim(),
        anonKey: anonKey.trim(),
        isConnected: true,
        lastSyncedAt: new Date().toISOString(),
      };
      saveSupabaseConfig(updated);
      onConfigUpdated(updated);
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    setFeedback(null);
    const res = await pushAllToSupabase();
    setIsSeeding(false);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      onConfigUpdated({ ...config, isConnected: true, lastSyncedAt: new Date().toISOString() });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handleCopySql = () => {
    fetch('/src/services/schema.sql')
      .then((r) => r.text())
      .then((sql) => {
        navigator.clipboard.writeText(sql);
        setSqlCopied(true);
        setTimeout(() => setSqlCopied(false), 2500);
      })
      .catch(() => {
        navigator.clipboard.writeText(sampleSqlSnippet);
        setSqlCopied(true);
        setTimeout(() => setSqlCopied(false), 2500);
      });
  };

  const handleDownloadFile = (path: string, filename: string) => {
    const link = document.createElement('a');
    link.href = path;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Supabase Database & Parent Portal Setup
                </h2>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    config.isConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {config.isConnected ? 'Connected' : 'Offline / Local Storage'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Permanent cloud storage with secure parent authentication & RLS
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200 bg-white shrink-0 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('connection')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'connection'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Database Connection
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. SQL Schema & RLS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'guide'
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. Parent Portal Guide
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {feedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <div className="leading-relaxed">{feedback.message}</div>
            </div>
          )}

          {activeTab === 'connection' && (
            <form onSubmit={handleTestAndSave} className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Secure Direct Connection (Not Exposed in HTML)</span>
                </p>
                <p>
                  Credentials entered here are stored in your private local session / state.
                  Parent queries operate through the secure Supabase Row Level Security (RLS)
                  stored procedure so parents can never inspect other students.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Supabase Project URL *
                </label>
                <div className="relative">
                  <Server className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    required
                    placeholder="https://xyzabcdefghijklm.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-slate-800"
                  />
                </div>
                <span className="text-[11px] text-slate-400">
                  Find in Supabase Dashboard → Project Settings → Data API
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Supabase Anon / Public Key *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono text-slate-800"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isTesting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 disabled:opacity-50 rounded-lg transition-all flex items-center gap-2 shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Verifying...' : 'Save & Test Connection'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSeedData}
                  disabled={isSeeding || !url}
                  className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 active:scale-95 disabled:opacity-50 rounded-lg transition-all flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{isSeeding ? 'Pushing Data...' : 'Seed Sample Data to Supabase'}</span>
                </button>
              </div>

              {config.lastSyncedAt && (
                <p className="text-[11px] text-slate-400 pt-1">
                  Last database sync: {new Date(config.lastSyncedAt).toLocaleString('en-IN')}
                </p>
              )}
            </form>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">PostgreSQL Schema & Security</h3>
                  <p className="text-xs text-slate-500">
                    Run in Supabase SQL Editor to initialize all 8 tables and RPC security
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    {sqlCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadFile('/src/services/schema.sql', 'tuitiondesk_schema.sql')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .sql</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-60 border border-slate-800 leading-relaxed">
                <pre>{sampleSqlSnippet}</pre>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-900 block mb-1">Tables Created</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                    <li><code>students</code> & <code>centre_profile</code></li>
                    <li><code>fee_records</code> (tracking & invoices)</li>
                    <li><code>attendance_records</code> (daily logs)</li>
                    <li><code>test_records</code> & <code>test_marks</code></li>
                    <li><code>homework</code> & <code>referrals</code></li>
                  </ul>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-semibold text-slate-900 block mb-1">Security & RLS</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                    <li>Row Level Security (RLS) enabled</li>
                    <li><code>get_parent_portal_data()</code> RPC</li>
                    <li>Parents query ONLY their child's records</li>
                    <li>Zero student roster leaks</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-700" />
                  <span>Separate Parent App File: <code>/parent.html</code></span>
                </p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  We have included a dedicated <code>parent.html</code> file. Parents access it directly
                  from their smartphone, enter their registered mobile number and PIN, and view only
                  their child's updates.
                </p>
              </div>

              <ol className="space-y-3 list-decimal list-inside text-xs leading-relaxed">
                <li className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-slate-900">Step 1: Create Supabase Project:</strong> Go to{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 underline inline-flex items-center gap-0.5"
                  >
                    supabase.com <ExternalLink className="w-3 h-3" />
                  </a>{' '}
                  and create a free project.
                </li>
                <li className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-slate-900">Step 2: Run SQL Schema:</strong> Copy the SQL
                  schema from Tab 2 and paste it into Supabase SQL Editor. Click <strong>Run</strong>.
                </li>
                <li className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-slate-900">Step 3: Connect Both Apps:</strong> Paste your
                  Supabase URL and Anon key in Tab 1. Click <em>"Save & Test"</em> and{' '}
                  <em>"Seed Sample Data"</em>.
                </li>
                <li className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <strong className="text-slate-900">Step 4: Parent Login Credentials:</strong> In
                  your Student roster, set each student's Parent WhatsApp Phone and 4-digit PIN.
                  Parents log in at <code>/parent.html</code> using those credentials.
                </li>
              </ol>

              <div className="flex items-center justify-between pt-2">
                <a
                  href="/parent.html"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 text-xs inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Standalone Parent App (parent.html)</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleDownloadFile('/SUPABASE_SETUP_GUIDE.md', 'SUPABASE_SETUP_GUIDE.md')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium text-xs inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Setup Guide</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
