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

**Dimensions:** Stored in page coordinates (816x1056), scaled to viewport on render. This keeps data resolution-independent.

**Text updates:** Direct onChange → Yjs, no debouncing. Yjs batches updates internally, so typing feels instant.

**Textarea auto-sizing:** When editing, textarea expands to fit content via `scrollHeight`. Uses `minHeight` (not `height`) so it can grow beyond stored block dimensions.

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

**Lists:** `- item` for bullets, `1. item` for numbered. Uses `-` not `*` to avoid conflict with italic syntax. Block LaTeX processed first (via placeholders) since it can span lines, then line-by-line for lists.

---

## Text Block Sync

**Problem:** When Tab A creates a text block and types content, Tab B needs to show rendered formatting (LaTeX, etc.)—not a raw textarea.

**Root cause:** `isEditing` state initializes to `true` for empty blocks. When content syncs, React doesn't automatically exit edit mode.

**Solution:**
- `autoFocus` prop from Canvas distinguishes locally-created blocks (should focus) from synced blocks (should not focus)
- `userInitiatedEdit` ref tracks when user explicitly clicks to edit
- Effect exits edit mode when content syncs and textarea isn't focused
- Spread block objects (`{ ...block }`) in `updateTextBlocks` to ensure React detects prop changes

---

## Responsive Canvas

**Container styling:** `width: PAGE_WIDTH`, `maxWidth: 100%`, `aspectRatio: PAGE_WIDTH/PAGE_HEIGHT`

**Why no explicit height?** When both `width` and `height` are set, CSS ignores `aspectRatio`. If window shrinks horizontally, width constrains but height stays fixed, breaking the aspect ratio. The SVG letterboxes, and `getBoundingClientRect()` returns wrong dimensions for cursor position calculation.

**Fix:** Let `aspectRatio` derive height from width. Container always maintains correct aspect ratio, SVG fills exactly, cursor detection works at any window size.
