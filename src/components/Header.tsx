import React from 'react';
import { CentreProfile, SupabaseConfig } from '../types';
import { Database, Plus, GraduationCap, ChevronDown } from 'lucide-react';

interface HeaderProps {
  centre: CentreProfile;
  supabaseConfig: SupabaseConfig;
  onOpenSupabaseModal: () => void;
  onOpenAddStudentModal: () => void;
  selectedBatch: string;
  onBatchChange: (batch: string) => void;
  batches: string[];
}

export const Header: React.FC<HeaderProps> = ({
  centre,
  supabaseConfig,
  onOpenSupabaseModal,
  onOpenAddStudentModal,
  selectedBatch,
  onBatchChange,
  batches,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-sm shadow-xs">
            <GraduationCap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight whitespace-nowrap">
              TuitionDesk
            </span>
            <span className="text-[10px] text-slate-500 hidden sm:inline truncate max-w-[140px]">
              {centre.name}
            </span>
          </div>
        </div>

        {/* Batch Filter Dropdown */}
        <div className="relative flex-1 max-w-xs mx-1">
          <select
            value={selectedBatch}
            onChange={(e) => onBatchChange(e.target.value)}
            className="w-full text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200/80 border-0 rounded-lg py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none cursor-pointer truncate"
          >
            <option value="All">All Batches & Classes</option>
            {batches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Action Zone */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Supabase Status Button */}
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            className={`min-h-[38px] px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              supabaseConfig.isConnected
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Configure Supabase Database & Parent Security"
          >
            <Database className={`w-3.5 h-3.5 ${supabaseConfig.isConnected ? 'text-emerald-600' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">
              {supabaseConfig.isConnected ? 'Supabase' : 'Database Setup'}
            </span>
          </button>

          {/* Add Student CTA */}
          <button
            type="button"
            onClick={onOpenAddStudentModal}
            className="min-h-[38px] px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-all whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
        </div>
      </div>
    </header>
  );
};
