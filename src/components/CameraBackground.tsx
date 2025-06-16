import React, { useRef, useEffect } from 'react';

interface CameraBackgroundProps {
  videoElement: HTMLVideoElement | null;
  opacity?: number;
}

export const CameraBackground: React.FC<CameraBackgroundProps> = ({ 
  videoElement, 
  opacity = 0.3 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!videoElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawVideo = () => {
      if (videoElement.readyState >= 2) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate aspect ratio and positioning
        const videoAspect = videoElement.videoWidth / videoElement.videoHeight;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (videoAspect > canvasAspect) {
          // Video is wider than canvas
          drawHeight = canvas.height;
          drawWidth = drawHeight * videoAspect;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          // Video is taller than canvas
          drawWidth = canvas.width;
          drawHeight = drawWidth / videoAspect;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        }
        
        // Save context for transformations
        ctx.save();
        
        // Flip horizontally to mirror the video (like a mirror)
        ctx.scale(-1, 1);
        ctx.translate(-canvas.width, 0);
        
        // Set opacity
        ctx.globalAlpha = opacity;
        
        // Draw the video frame
        ctx.drawImage(
          videoElement,
          canvas.width - offsetX - drawWidth, // Adjust for flip
          offsetY,
          drawWidth,
          drawHeight
        );
        
        // Restore context
        ctx.restore();
      }
      
      animationFrameRef.current = requestAnimationFrame(drawVideo);
    };

    drawVideo();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [videoElement, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
};