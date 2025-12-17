I want to create a webapp called simpledoc.com for real-time, low-friction mixed notes: typed text + handwritten ink, designed to be used simultaneously on a laptop and an iPad.

Problem: People choose between either typed notes or handwritten notes. There is a significant tradeoff between choosing typed notes on a computer (high throughput) vs handwritten notes on an ipad (no forced structure, better for math, diagramming, etc).

So, the core use case is to have a website (simpledoc.com) where users can enter a room code (arbitrary, they can also generate one, e.g. WDQG). No accounts for MVP; anyone with the code can access the doc

Then, they open the same doc/session on both their computer and iPad at simpledoc.com/WDQG. Anything typed or drawn on one device appears on the other device near instantly.
- “Instant sync” should feel realtime. Target <1000ms propagation on good Wi-Fi (and still smooth under mediocre networks). Use websockets / realtime sync; don’t rely on periodic polling.
- Formatting features for low-friction, that allow users to make their notes beautiful:
    - Shift + right -> start typing in text box formatted right of last drawing section
    - Shift + down -> start typing in text box formatted below last drawing section
    - Option for text boxes to automatically wrap all drawn sections
- Editing model is a blank 8.5 x 11 inch page with two object types:
    - ink strokes (Apple pencil/pointer)
    - text blocks
- Planning to use a CRDT-based document model (e.g., Yjs) so concurrent edits converge without manual conflict resolution. Ink strokes should be append-only CRDT elements; text blocks should use CRDT text. If you can think of a better option, let me know.

