import React from 'react';
import { Compass, ArrowLeft, Home, BookOpen, Briefcase, HelpCircle } from 'lucide-react';
import { Link } from '../router';

interface NotFoundViewProps {
  onGoHome?: () => void;
}

export default function NotFoundView({ onGoHome }: NotFoundViewProps) {
  return (
    <div id="not-found-view" className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-surface border border-border-subtle rounded-2xl p-8 shadow-sm space-y-6">
        <div className="w-16 h-16 bg-accent-primary/10 text-accent-primary rounded-2xl flex items-center justify-center mx-auto">
          <Compass size={32} className="animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-accent-primary bg-accent-muted/20 px-2.5 py-1 rounded-full">
            Error 404 • Page Not Found
          </span>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Off Campus Territory
          </h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            The page you requested does not exist or may have been relocated. Use the navigation links below to return to the active campus utilities.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Link
            to="/homepage"
            onClick={onGoHome}
            className="w-full py-2.5 px-4 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Home size={15} />
            <span>Return to Homepage</span>
          </Link>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <Link
              to="/notes"
              className="p-2.5 bg-app hover:bg-bg-hover border border-border-subtle rounded-lg text-text-primary text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <BookOpen size={14} className="text-accent-primary" />
              <span>Notes</span>
            </Link>

            <Link
              to="/tasks"
              className="p-2.5 bg-app hover:bg-bg-hover border border-border-subtle rounded-lg text-text-primary text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <Briefcase size={14} className="text-color-success" />
              <span>Tasks</span>
            </Link>

            <Link
              to="/doubts"
              className="p-2.5 bg-app hover:bg-bg-hover border border-border-subtle rounded-lg text-text-primary text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <HelpCircle size={14} className="text-yellow-500" />
              <span>Doubts</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
