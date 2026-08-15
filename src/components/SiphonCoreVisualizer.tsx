import React, { useEffect, useRef } from 'react';

interface SiphonCoreVisualizerProps {
  entropy: number;
  active: boolean;
}

export const SiphonCoreVisualizer: React.FC<SiphonCoreVisualizerProps> = ({ entropy, active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    window.addEventListener('resize', resize);
    resize();

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = Math.min(centerX, centerY) * 0.6;
      
      // Background glow
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, baseRadius * 1.5);
      gradient.addColorStop(0, active ? `rgba(242, 125, 38, ${0.1 + entropy * 0.2})` : 'rgba(30, 30, 30, 0.1)');
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Core pulses
      if (active) {
        for (let i = 0; i < 3; i++) {
          const pulse = (frame / (60 + i * 20)) % 1;
          const r = baseRadius * (1 + pulse * 0.5 * entropy);
          ctx.beginPath();
          ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(242, 125, 38, ${0.2 * (1 - pulse)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Orbital particles (Siphoned DNA)
      const particleCount = 20 + Math.floor(entropy * 30);
      for (let i = 0; i < particleCount; i++) {
        const angle = (frame / 100) + (i * (Math.PI * 2 / particleCount));
        const distance = baseRadius * 0.8 + Math.sin(frame / 50 + i) * 10;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;

        ctx.fillStyle = active ? '#F27D26' : '#333';
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();

        // Connect tiny lines if high entropy
        if (entropy > 0.5 && active) {
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(x, y);
          ctx.strokeStyle = `rgba(242, 125, 38, ${0.05 * entropy})`;
          ctx.stroke();
        }
      }

      // Inner Core
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = active ? '#151619' : '#0a0a0a';
      ctx.fill();
      ctx.strokeStyle = active ? '#F27D26' : '#222';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Core glyph rotation
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(frame / 200);
      ctx.font = '10px monospace';
      ctx.fillStyle = active ? '#F27D26' : '#333';
      ctx.textAlign = 'center';
      ctx.fillText('DC_DNA', 0, 4);
      ctx.restore();

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [entropy, active]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};
