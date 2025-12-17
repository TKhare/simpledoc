'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createYjsProvider, type YjsProvider } from '@/lib/yjs';
import Canvas from '@/components/Canvas';
import Toolbar from '@/components/Toolbar';

export default function RoomPage() {
  const params = useParams();
  const roomCode = params.roomCode as string;

  const [provider, setProvider] = useState<YjsProvider | null>(null);
  const [connected, setConnected] = useState(false);
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);

  useEffect(() => {
    const yjs = createYjsProvider(roomCode);
    setProvider(yjs);

    yjs.provider.on('status', ({ status }: { status: string }) => {
      setConnected(status === 'connected');
    });

    return () => {
      yjs.destroy();
    };
  }, [roomCode]);

  const handleClear = useCallback(() => {
    if (provider) {
      provider.doc.transact(() => {
        provider.strokes.delete(0, provider.strokes.length);
        provider.textBlocks.forEach((_, key) => {
          provider.textBlocks.delete(key);
        });
      });
    }
  }, [provider]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-lg font-semibold text-gray-900 hover:text-gray-600">
            SimpleDoc
          </a>
          <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
            {roomCode}
          </span>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
        </div>

        <Toolbar
          color={color}
          strokeWidth={strokeWidth}
          onColorChange={setColor}
          onStrokeWidthChange={setStrokeWidth}
          onClear={handleClear}
        />
      </header>

      {/* Canvas area */}
      <main className="flex-1 overflow-auto p-4 flex items-start justify-center">
        {provider ? (
          <Canvas
            provider={provider}
            color={color}
            strokeWidth={strokeWidth}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Connecting...</p>
          </div>
        )}
      </main>
    </div>
  );
}
