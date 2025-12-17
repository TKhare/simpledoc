# SimpleDoc - Development Notes

## Completed

### Infrastructure
- [x] Next.js 14 frontend with TypeScript + Tailwind
- [x] WebSocket server with y-websocket
- [x] Yjs CRDT integration for real-time sync
- [x] Project structure (monorepo: frontend + server)

### Features
- [x] Landing page with room code input
- [x] Room code generation (4-char alphanumeric)
- [x] Any string as room code (e.g., "mymathproject")
- [x] Real-time ink drawing with perfect-freehand
- [x] Pressure-sensitive strokes (Apple Pencil support)
- [x] Text blocks (double-click to create)
- [x] Drag to reposition text blocks
- [x] Resize text blocks (native resize handle, size captured on blur)
- [x] Toolbar: color picker (6 colors)
- [x] Toolbar: stroke width (4 sizes)
- [x] Clear button
- [x] Connection status indicator
- [x] 8.5 x 11 inch page canvas

### Text Formatting
- [x] Inline LaTeX rendering ($...$ and $$...$$) via KaTeX
- [x] Bold/italic (**text**, *text*) with Cmd+B/I shortcuts
- [x] Bullet lists (- item) and numbered lists (1. item)

## TODO

### Phase 3 - Persistence
- [ ] Redis/Postgres integration for CRDT snapshots
- [ ] Load document state on reconnect
- [ ] Debounced persistence on updates

### Phase 4 - Polish
- [ ] Undo/redo (Yjs UndoManager)
- [ ] Eraser tool
- [ ] Better mobile/iPad touch handling

### Future
- [ ] Inline code formatting
- [ ] Shift+arrow formatting shortcuts
- [ ] Auto-wrap text around drawings
- [ ] Multiple pages per document
- [ ] Export to PDF
- [ ] Deployment (Vercel + Fly.io/Railway)
