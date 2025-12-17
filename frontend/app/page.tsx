'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateRoomCode } from '@/lib/drawing';

export default function Home() {
  const [roomCode, setRoomCode] = useState('');
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      router.push(`/${roomCode.trim()}`);
    }
  };

  const handleGenerate = () => {
    const code = generateRoomCode();
    router.push(`/${code}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
          SimpleDoc
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Real-time notes. Type + draw. Any device.
        </p>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-1">
              Enter room code
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g., WDQG or mymathproject"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-center uppercase"
              autoComplete="off"
              autoCapitalize="characters"
            />
          </div>

          <button
            type="submit"
            disabled={!roomCode.trim()}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Join Room
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">or</span>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Generate New Room
        </button>

        <p className="text-center text-xs text-gray-500 mt-8">
          Open the same room on your laptop and iPad to sync notes in real-time.
        </p>
      </main>
    </div>
  );
}
