# SimpleDoc - Design Decisions

## Real-time Sync

**Choice:** Yjs CRDT + y-websocket

**Why:** CRDTs handle concurrent edits without manual conflict resolution. Yjs is mature, has good TypeScript support, and y-websocket is plug-and-play.

**Data model:**
- `strokes: Y.Array<Stroke>` - append-only, no character-level merging needed
- `textBlocks: Y.Map<string, TextBlock>` - keyed by UUID, whole-block updates

---

## Text Blocks

**Resize approach:** Native browser resize handle + capture on blur

**Why not ResizeObserver during resize?** Caused feedback loops—Yjs update triggers re-render, which triggers observer, which updates Yjs. Capturing only on blur avoids this.

**Click vs drag:** Use `hasMoved` ref to distinguish click (enter edit mode) from drag (move block). Checking `isDragging` state doesn't work because React's onClick fires before window mouseup handler resets the state.

**Rendered content pointer-events:** The div with `dangerouslySetInnerHTML` (rendered markdown/LaTeX) uses `pointerEvents: 'none'` so clicks pass through to the parent container. Without this, `<ul>/<li>` elements intercept clicks and prevent entering edit mode.

**Dimensions:** Stored in page coordinates (816x1056), scaled to viewport on render. This keeps data resolution-independent.

**Text updates:** Direct onChange → Yjs, no debouncing. Yjs batches updates internally, so typing feels instant.

---

## Drawing

**Choice:** SVG + perfect-freehand

**Why SVG over Canvas?** Easier to render individual strokes from Yjs array. Each stroke is a `<path>` element.

**Why perfect-freehand?** Smooth, pressure-sensitive strokes with minimal config. Converts point arrays to filled SVG paths.

---

## Page Model

**Dimensions:** 816 x 1056 px (8.5" x 11" at 96 DPI)

**Coordinate system:** All positions/sizes stored in page coordinates. Percentages used for positioning (responsive), pixels calculated at render time for sizing.

---

## Text Formatting

**Approach:** Render on blur (plain textarea for editing, formatted HTML for display)

**Why not live preview?** Adds complexity (rich text editor library). Render-on-blur keeps it simple—just regex parsing.

**Data model unchanged:** Content is plain string with markdown-like markers (`**bold**`, `*italic*`, `$latex$`). No rich text data structure.

**LaTeX:** KaTeX (~100KB, faster than MathJax). `$...$` for inline, `$$...$$` for block.

**Shortcuts:** Cmd+B wraps selection in `**`, Cmd+I wraps in `*`.

**Lists:** `- item` for bullets, `1. item` for numbered. Uses `-` not `*` to avoid conflict with italic syntax.

**Parsing order in formatting.ts:**
1. Block LaTeX (`$$...$$`) → replaced with placeholders (can span multiple lines)
2. Split into lines, process lists (`- ` and `1. `)
3. Apply inline formatting per line: escape HTML → inline LaTeX → bold → italic
4. Restore block LaTeX placeholders
