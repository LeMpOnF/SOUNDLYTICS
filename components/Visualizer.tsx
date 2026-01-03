
import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  audioUrl: string | null;
  isPlaying: boolean;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Fix: Added initial value null to useRef to satisfy the requirement of 1 argument.
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bars = 40;
    const barStates = Array.from({ length: bars }, () => Math.random());

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const barWidth = width / bars;
      const time = Date.now() / 200;

      for (let i = 0; i < bars; i++) {
        const targetHeight = isPlaying 
          ? (Math.sin(i * 0.4 + time) * 0.4 + 0.6) * height * 0.8
          : 4;

        // Smoothly interpolate current state to target
        barStates[i] += (targetHeight - barStates[i]) * 0.15;
        
        const x = i * barWidth;
        const y = (height - barStates[i]) / 2;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#6366f1'); // Indigo 500
        gradient.addColorStop(1, '#d946ef'); // Fuchsia 500

        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Modern rounded bars
        const cornerRadius = 2;
        ctx.roundRect(x + 2, y, barWidth - 4, barStates[i], cornerRadius);
        ctx.fill();
        
        // Glow effect
        if (isPlaying) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(99, 102, 241, 0.4)';
        } else {
          ctx.shadowBlur = 0;
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying]);

  return (
    <canvas 
      ref={canvasRef} 
      width={500} 
      height={80} 
      className="w-full h-16 opacity-80"
    />
  );
};

export default Visualizer;
