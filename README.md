# SimpleDoc

Real-time collaborative notes combining typed text and handwritten ink. Open the same room on your laptop and iPad—everything syncs instantly.

## Quick Start

```bash
# Terminal 1 - WebSocket server
cd server && npm install && npm run dev

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev
```

Open http://localhost:3000

## Status

**Working:** Room codes, real-time drawing, text blocks, color/width picker, multi-device sync, LaTeX (`$...$`, `$$...$$`), text formatting (bold, italic, lists).

**Not yet:** Persistence (docs lost on server restart).

See [NOTES.md](./NOTES.md) for roadmap, [DESIGN.md](./DESIGN.md) for technical decisions.
