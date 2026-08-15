/**
 * DIAGNOSTIC OVERLAY COMPONENT
 * Role: Renders real-time telemetry and health status over the core visualizer.
 * Integration: Consumes diagnostic health metrics for visual feedback.
 */

import React from 'react';

interface SiphonDiagnosticOverlayProps {
  status: 'OPERATIONAL' | 'STANDBY' | 'CRITICAL';
  health: number;
}

export const SiphonDiagnosticOverlay: React.FC<SiphonDiagnosticOverlayProps> = ({ status, health }) => {
  const healthColor = health > 0.8 ? 'text-green-500' : health > 0.5 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="absolute bottom-4 left-4 p-3 bg-black/80 border border-white/10 rounded-lg backdrop-blur-sm">
      <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">System Status</div>
      <div className={`text-sm font-bold ${status === 'OPERATIONAL' ? 'text-orange-500' : 'text-gray-500'}`}>
        {status}
      </div>
      <div className="mt-2 text-[10px] font-mono text-gray-400">
        Integrity: <span className={healthColor}>{(health * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
};