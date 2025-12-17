import katex from 'katex';

/**
 * Render text content with LaTeX and basic formatting.
 * Supports:
 * - $$...$$ for block LaTeX
 * - $...$ for inline LaTeX
 * - **...** for bold
 * - *...* for italic
 */
export function renderContent(text: string): string {
  if (!text) return '';

  let html = text
    // Escape HTML first
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Block LaTeX: $$...$$ (must come before inline)
  // Use [\s\S] instead of . with s flag for cross-line matching
  html = html.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
    try {
      return `<div class="my-2 text-center">${katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false })}</div>`;
    } catch {
      return `<span class="text-red-500">$$${tex}$$</span>`;
    }
  });

  // Inline LaTeX: $...$
  html = html.replace(/\$(.+?)\$/g, (_, tex) => {
    try {
      return katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `<span class="text-red-500">$${tex}$</span>`;
    }
  });

  // Bold: **...**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic: *...* (but not inside **)
  html = html.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');

  // Preserve newlines
  html = html.replace(/\n/g, '<br>');

  return html;
}
