/**
 * DIAGNOSTIC OVERLAY COMPONENT
 * Role: Provides real-time health telemetry visualization.
 * Integration: Used by SiphonCoreVisualizer to display operational status.
 */
import React from 'react';

interface OverlayProps {
  status: 'OPERATIONAL' | 'STANDBY';
  health: number;
}

export const SiphonDiagnosticOverlay: React.FC<OverlayProps> = ({ status, health }) => (
  <div className="absolute bottom-4 right-4 bg-black/80 border border-orange-500/30 p-3 rounded-md backdrop-blur-sm">
    <div className="text-[10px] font-mono text-orange-500 uppercase tracking-widest">
      Status: {status}
    </div>
    <div className="text-[10px] font-mono text-gray-400">
      Health: {(health * 100).toFixed(1)}%
    </div>
    <div className="w-24 h-1 bg-gray-800 mt-2 rounded-full overflow-hidden">
      <div 
        className="h-full bg-orange-500 transition-all duration-500"
        style={{ width: `${health * 100}%` }}
      />
    </div>
  </div>
);