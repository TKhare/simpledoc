# SimpleDoc.com - Specification

Real-time collaborative notes: typed text + handwritten ink. Room-based access, no accounts.

## Tech Stack
- **Frontend:** Next.js 14 (App Router)
- **Sync:** Yjs + y-websocket
- **Drawing:** HTML5 Canvas + perfect-freehand
- **Styling:** Tailwind CSS
- **Persistence:** Redis (CRDT snapshots by docId)

## Architecture

```
┌─────────────────┐     WebSocket      ┌──────────────────┐
│  Browser (iPad) │◄──────────────────►│                  │
└─────────────────┘                    │  y-websocket     │
                                       │  server + Redis  │
┌─────────────────┐     WebSocket      │  (Node.js)       │
│ Browser (Laptop)│◄──────────────────►│                  │
└─────────────────┘                    └──────────────────┘
```

## Data Model (Yjs)

```typescript
// Y.Doc structure per room
{
  strokes: Y.Array<Stroke>,
  textBlocks: Y.Map<string, TextBlock>,
  meta: Y.Map
}

interface Stroke {
  id: string;
  points: Array<{ x: number; y: number; pressure: number }>;
  color: string;
  width: number;
  timestamp: number;
}

interface TextBlock {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
}
```

## Project Structure

```
simpledoc/
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   └── [roomCode]/page.tsx   # Document editor
│   ├── components/
│   │   ├── Canvas.tsx
│   │   ├── TextBlock.tsx
│   │   └── Toolbar.tsx
│   └── lib/
│       ├── yjs.ts
│       └── drawing.ts
└── server/
    └── index.ts
```

## MVP Features
- Room code entry (any string) + 4-char generator
- Real-time ink drawing with pressure
- Text blocks (double-click to create, drag to move)
- Color/stroke width toolbar
- Persistent storage via Redis

## Room Codes
- URL format: `simpledoc.com/[roomCode]`
- Any string is valid (e.g., "WDQG" or "mymathproject")
- Generated codes: 4 alphanumeric chars

## Deferred
- LaTeX rendering ($...$)
- Bold/italic shortcuts
- Bullets/lists
- Multi-page documents
- PDF export
- Eraser tool
