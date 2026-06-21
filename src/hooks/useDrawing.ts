import { useRef, useCallback, useEffect } from 'react';
import { PathPoint } from '@/types';

interface UseDrawingOptions {
  onStrokeStart?: (point: PathPoint) => void;
  onStrokeMove?: (point: PathPoint) => void;
  onStrokeEnd?: (path: PathPoint[]) => void;
  enabled?: boolean;
}

export function useDrawing(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  options: UseDrawingOptions = {}
) {
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef<PathPoint[]>([]);

  const getCanvasPoint = useCallback(
    (e: MouseEvent | TouchEvent): PathPoint | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      let clientX: number;
      let clientY: number;

      if ('touches' in e) {
        if (e.touches.length === 0) return null;
        const touch = e.touches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
        timestamp: Date.now(),
      };
    },
    [canvasRef]
  );

  const handleStart = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (options.enabled === false) return;
      const point = getCanvasPoint(e);
      if (!point) return;
      isDrawingRef.current = true;
      currentPathRef.current = [point];
      options.onStrokeStart?.(point);
      e.preventDefault();
    },
    [getCanvasPoint, options]
  );

  const handleMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDrawingRef.current) return;
      if (options.enabled === false) return;
      const point = getCanvasPoint(e);
      if (!point) return;
      currentPathRef.current.push(point);
      options.onStrokeMove?.(point);
      e.preventDefault();
    },
    [getCanvasPoint, options]
  );

  const handleEnd = useCallback(() => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const path = [...currentPathRef.current];
    currentPathRef.current = [];
    if (path.length > 0) {
      options.onStrokeEnd?.(path);
    }
  }, [options]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [canvasRef, handleStart, handleMove, handleEnd]);

  return {
    isDrawingRef,
  };
}
