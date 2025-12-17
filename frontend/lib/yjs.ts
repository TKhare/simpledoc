'use client';

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import type { Stroke, TextBlock } from './types';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:1234';

export function createYjsProvider(roomCode: string) {
  const doc = new Y.Doc();
  const provider = new WebsocketProvider(WS_URL, roomCode, doc);

  // Get shared types
  const strokes = doc.getArray<Stroke>('strokes');
  const textBlocks = doc.getMap<TextBlock>('textBlocks');
  const meta = doc.getMap('meta');

  return {
    doc,
    provider,
    strokes,
    textBlocks,
    meta,
    destroy: () => {
      provider.destroy();
      doc.destroy();
    },
  };
}

export type YjsProvider = ReturnType<typeof createYjsProvider>;
