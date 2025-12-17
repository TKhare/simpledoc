export interface Point {
  x: number;
  y: number;
  pressure: number;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  timestamp: number;
}

export interface TextBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
}

export interface DocumentState {
  strokes: Stroke[];
  textBlocks: Map<string, TextBlock>;
}
