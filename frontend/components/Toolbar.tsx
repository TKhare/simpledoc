'use client';

interface ToolbarProps {
  color: string;
  strokeWidth: number;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onClear: () => void;
}

const COLORS = [
  '#000000', // Black
  '#374151', // Gray
  '#1D4ED8', // Blue
  '#DC2626', // Red
  '#059669', // Green
  '#7C3AED', // Purple
];

const STROKE_WIDTHS = [2, 4, 8, 12];

export default function Toolbar({
  color,
  strokeWidth,
  onColorChange,
  onStrokeWidthChange,
  onClear,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-4">
      {/* Colors */}
      <div className="flex items-center gap-1">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onColorChange(c)}
            className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
              color === c ? 'border-blue-500 scale-110' : 'border-transparent'
            }`}
            style={{ backgroundColor: c }}
            title={c}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Stroke widths */}
      <div className="flex items-center gap-1">
        {STROKE_WIDTHS.map((w) => (
          <button
            key={w}
            onClick={() => onStrokeWidthChange(w)}
            className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${
              strokeWidth === w ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
            title={`${w}px`}
          >
            <div
              className="rounded-full bg-current"
              style={{ width: w + 2, height: w + 2, color: color }}
            />
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Clear */}
      <button
        onClick={onClear}
        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
      >
        Clear
      </button>
    </div>
  );
}
