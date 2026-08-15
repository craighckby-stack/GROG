/**
 * DIAGNOSTIC OVERLAY COMPONENT
 * Role: Displays real-time system health telemetry and operational status.
 * Integration: Used by SiphonCoreVisualizer to provide visual feedback on system state.
 */
import React from 'react';

interface SiphonDiagnosticOverlayProps {
  status: 'OPERATIONAL' | 'STANDBY' | 'CRITICAL';
  health: number;
}

export const SiphonDiagnosticOverlay: React.FC<SiphonDiagnosticOverlayProps> = ({ status, health }) => {
  return (
    <div className="absolute bottom-4 right-4 bg-black/80 border border-[#F27D26]/30 p-3 rounded-md backdrop-blur-sm text-[10px] font-mono text-[#F27D26]">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <span>STATUS:</span>
          <span className={status === 'CRITICAL' ? 'text-red-500' : 'text-green-500'}>{status}</span>
        </div>
        <div className="flex justify-between">
          <span>HEALTH:</span>
          <span>{(health * 100).toFixed(1)}%</span>
        </div>
        <div className="w-24 h-1 bg-gray-800 mt-1">
          <div 
            className="h-full bg-[#F27D26] transition-all duration-500"
            style={{ width: `${health * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};