'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import type { YjsProvider } from '@/lib/yjs';
import type { Stroke, Point, TextBlock } from '@/lib/types';
import { getSvgPathFromStroke, generateId, strokeOptions } from '@/lib/drawing';
import TextBlockComponent from './TextBlock';

// Page dimensions (8.5 x 11 inches at 96 DPI)
const PAGE_WIDTH = 816;
const PAGE_HEIGHT = 1056;

interface CanvasProps {
  provider: YjsProvider;
  color: string;
  strokeWidth: number;
}

export default function Canvas({ provider, color, strokeWidth }: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [textBlocks, setTextBlocks] = useState<TextBlock[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [newlyCreatedBlockId, setNewlyCreatedBlockId] = useState<string | null>(null);

  // Sync strokes from Yjs
  useEffect(() => {
    const updateStrokes = () => {
      setStrokes(provider.strokes.toArray());
    };

    const updateTextBlocks = () => {
      const blocks: TextBlock[] = [];
      provider.textBlocks.forEach((block) => {
        blocks.push({ ...block });
      });
      setTextBlocks(blocks);
    };

    // Initial load
    updateStrokes();
    updateTextBlocks();

    // Subscribe to changes
    provider.strokes.observe(updateStrokes);
    provider.textBlocks.observe(updateTextBlocks);

    return () => {
      provider.strokes.unobserve(updateStrokes);
      provider.textBlocks.unobserve(updateTextBlocks);
    };
  }, [provider]);

  // Get pointer position relative to SVG
  const getPointerPosition = useCallback((e: React.PointerEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0, pressure: 0.5 };

    const rect = svg.getBoundingClientRect();
    const scaleX = PAGE_WIDTH / rect.width;
    const scaleY = PAGE_HEIGHT / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      pressure: e.pressure || 0.5,
    };
  }, []);

  // Start drawing
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    // Only draw with pen or primary mouse button
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);

    setIsDrawing(true);
    setCurrentStroke([getPointerPosition(e)]);
  }, [getPointerPosition]);

  // Continue drawing
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    setCurrentStroke((prev) => [...prev, getPointerPosition(e)]);
  }, [isDrawing, getPointerPosition]);

  // End drawing
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDrawing) return;
    e.preventDefault();

    setIsDrawing(false);

    if (currentStroke.length > 1) {
      const newStroke: Stroke = {
        id: generateId(),
        points: currentStroke,
        color,
        width: strokeWidth,
        timestamp: Date.now(),
      };

      // Add to Yjs
      provider.strokes.push([newStroke]);
    }

    setCurrentStroke([]);
  }, [isDrawing, currentStroke, color, strokeWidth, provider.strokes]);

  // Double-click to create text block
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const scaleX = PAGE_WIDTH / rect.width;
    const scaleY = PAGE_HEIGHT / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const blockId = generateId();
    const newBlock: TextBlock = {
      id: blockId,
      x,
      y,
      width: 200,
      height: 40,
      content: '',
    };

    setNewlyCreatedBlockId(blockId);
    provider.textBlocks.set(newBlock.id, newBlock);

    // Clear after a short delay so synced blocks don't get auto-focus
    setTimeout(() => setNewlyCreatedBlockId(null), 100);
  }, [provider.textBlocks]);

  // Update text block content
  const handleTextBlockChange = useCallback((id: string, content: string) => {
    const block = provider.textBlocks.get(id);
    if (block) {
      provider.textBlocks.set(id, { ...block, content });
    }
  }, [provider.textBlocks]);

  // Update text block position
  const handleTextBlockMove = useCallback((id: string, x: number, y: number) => {
    const block = provider.textBlocks.get(id);
    if (block) {
      provider.textBlocks.set(id, { ...block, x, y });
    }
  }, [provider.textBlocks]);

  // Update text block size
  const handleTextBlockResize = useCallback((id: string, width: number, height: number) => {
    const block = provider.textBlocks.get(id);
    if (block) {
      provider.textBlocks.set(id, { ...block, width, height });
    }
  }, [provider.textBlocks]);

  // Delete text block
  const handleTextBlockDelete = useCallback((id: string) => {
    provider.textBlocks.delete(id);
  }, [provider.textBlocks]);

  return (
    <div
      className="relative bg-white shadow-lg"
      style={{
        width: PAGE_WIDTH,
        maxWidth: '100%',
        aspectRatio: `${PAGE_WIDTH} / ${PAGE_HEIGHT}`,
      }}
    >
      {/* SVG for strokes */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}`}
        className="absolute inset-0 w-full h-full touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        style={{ touchAction: 'none' }}
      >
        {/* Rendered strokes */}
        {strokes.map((stroke) => (
          <path
            key={stroke.id}
            d={getSvgPathFromStroke(stroke.points, {
              ...strokeOptions,
              size: stroke.width * 2,
            })}
            fill={stroke.color}
          />
        ))}

        {/* Current stroke being drawn */}
        {currentStroke.length > 1 && (
          <path
            d={getSvgPathFromStroke(currentStroke, {
              ...strokeOptions,
              size: strokeWidth * 2,
            })}
            fill={color}
          />
        )}
      </svg>

      {/* Text blocks overlay */}
      {textBlocks.map((block) => (
        <TextBlockComponent
          key={block.id}
          block={block}
          pageWidth={PAGE_WIDTH}
          pageHeight={PAGE_HEIGHT}
          autoFocus={block.id === newlyCreatedBlockId}
          onChange={(content) => handleTextBlockChange(block.id, content)}
          onMove={(x, y) => handleTextBlockMove(block.id, x, y)}
          onResize={(w, h) => handleTextBlockResize(block.id, w, h)}
          onDelete={() => handleTextBlockDelete(block.id)}
        />
      ))}
    </div>
  );
}
