import getStroke from 'perfect-freehand';
import type { Point } from './types';

export const strokeOptions = {
  size: 8,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  easing: (t: number) => t,
  start: {
    taper: 0,
    cap: true,
  },
  end: {
    taper: 0,
    cap: true,
  },
};

// Convert points to SVG path data using perfect-freehand
export function getSvgPathFromStroke(points: Point[], options = strokeOptions): string {
  const stroke = getStroke(
    points.map(p => [p.x, p.y, p.pressure]),
    options
  );

  if (!stroke.length) return '';

  const d: string[] = [];
  const [first, ...rest] = stroke;

  d.push(`M ${first[0].toFixed(2)} ${first[1].toFixed(2)}`);

  for (const point of rest) {
    d.push(`L ${point[0].toFixed(2)} ${point[1].toFixed(2)}`);
  }

  d.push('Z');

  return d.join(' ');
}

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Generate a 4-character room code
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
