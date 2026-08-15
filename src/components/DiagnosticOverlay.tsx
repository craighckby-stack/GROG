import React from 'react';

export const DiagnosticOverlay = ({ status }: { status: string }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-white font-mono">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <p className="text-sm tracking-widest uppercase">System Integrity: {status}</p>
    </div>
  </div>
);