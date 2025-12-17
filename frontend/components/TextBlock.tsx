'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import type { TextBlock } from '@/lib/types';
import { renderContent } from '@/lib/formatting';
import 'katex/dist/katex.min.css';

interface TextBlockProps {
  block: TextBlock;
  pageWidth: number;
  pageHeight: number;
  onChange: (content: string) => void;
  onMove: (x: number, y: number) => void;
  onResize: (width: number, height: number) => void;
  onDelete: () => void;
}

export default function TextBlockComponent({
  block,
  pageWidth,
  pageHeight,
  onChange,
  onMove,
  onResize,
  onDelete,
}: TextBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(block.content === '');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const hasMoved = useRef(false); // Track if actual movement happened

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Capture size when editing ends
  const captureSize = useCallback(() => {
    const textarea = textareaRef.current;
    const parent = containerRef.current?.parentElement;
    if (!textarea || !parent) return;

    const parentRect = parent.getBoundingClientRect();
    const scaleX = pageWidth / parentRect.width;
    const scaleY = pageHeight / parentRect.height;

    const newWidth = textarea.offsetWidth * scaleX;
    const newHeight = textarea.offsetHeight * scaleY;

    // Only update if changed
    if (Math.abs(newWidth - block.width) > 5 || Math.abs(newHeight - block.height) > 5) {
      onResize(newWidth, newHeight);
    }
  }, [pageWidth, pageHeight, block.width, block.height, onResize]);

  // Wrap selected text with formatting markers (for Cmd+B/I)
  const wrapSelection = useCallback((marker: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.slice(0, start) + marker + text.slice(start, end) + marker + text.slice(end);
    onChange(newText);

    // Restore cursor position after the wrapped text
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = end + marker.length * 2;
    }, 0);
  }, [onChange]);

  // Calculate position and size as percentage for responsive layout
  const leftPercent = (block.x / pageWidth) * 100;
  const topPercent = (block.y / pageHeight) * 100;
  const widthPercent = (block.width / pageWidth) * 100;
  const heightPercent = (block.height / pageHeight) * 100;

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) return;

    e.preventDefault();
    e.stopPropagation();

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    hasMoved.current = false; // Reset movement tracking
    setIsDragging(true);
  }, [isEditing]);

  // Handle drag
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      hasMoved.current = true; // Mark that actual movement happened

      const parent = containerRef.current?.parentElement;
      if (!parent) return;

      const parentRect = parent.getBoundingClientRect();
      const scaleX = pageWidth / parentRect.width;
      const scaleY = pageHeight / parentRect.height;

      const newX = (e.clientX - parentRect.left - dragOffset.x) * scaleX;
      const newY = (e.clientY - parentRect.top - dragOffset.y) * scaleY;

      // Clamp to page bounds
      const clampedX = Math.max(0, Math.min(pageWidth - 50, newX));
      const clampedY = Math.max(0, Math.min(pageHeight - 20, newY));

      onMove(clampedX, clampedY);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, pageWidth, pageHeight, onMove]);

  // Handle click to edit
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Only enter edit mode if no actual movement happened (it was a click, not a drag)
    if (!hasMoved.current) {
      setIsEditing(true);
    }
  }, []);

  // Handle blur to stop editing
  const handleBlur = useCallback(() => {
    captureSize(); // Save size before exiting edit mode
    setIsEditing(false);
    // Delete empty blocks
    if (!block.content.trim()) {
      onDelete();
    }
  }, [block.content, onDelete, captureSize]);

  // Handle key down
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Cmd/Ctrl + B for bold
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      wrapSelection('**');
      return;
    }
    // Cmd/Ctrl + I for italic
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      wrapSelection('*');
      return;
    }
    // Escape to exit editing
    if (e.key === 'Escape') {
      captureSize();
      setIsEditing(false);
      if (!block.content.trim()) {
        onDelete();
      }
    }
  }, [block.content, onDelete, captureSize, wrapSelection]);

  // Calculate pixel dimensions based on parent scale
  const getScaledDimensions = useCallback(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return { width: block.width, height: block.height };

    const parentRect = parent.getBoundingClientRect();
    const scaleX = parentRect.width / pageWidth;
    const scaleY = parentRect.height / pageHeight;

    return {
      width: block.width * scaleX,
      height: block.height * scaleY,
    };
  }, [block.width, block.height, pageWidth, pageHeight]);

  const scaledDimensions = getScaledDimensions();

  return (
    <div
      ref={containerRef}
      className={`absolute group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="p-1 text-sm bg-blue-50 border border-blue-300 rounded outline-none resize"
          style={{
            cursor: 'text',
            width: Math.max(100, scaledDimensions.width),
            height: Math.max(40, scaledDimensions.height),
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      ) : (
        <div
          className="p-1 text-sm rounded hover:bg-gray-100 group-hover:ring-1 group-hover:ring-gray-300"
          style={{
            width: Math.max(50, scaledDimensions.width),
            minHeight: '24px',
          }}
        >
          {block.content ? (
            <div
              dangerouslySetInnerHTML={{ __html: renderContent(block.content) }}
              style={{ pointerEvents: 'none' }}
            />
          ) : (
            <span className="text-gray-400">Type here...</span>
          )}
        </div>
      )}
    </div>
  );
}
