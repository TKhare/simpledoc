import katex from 'katex';

/**
 * Render text content with formatting.
 * Supports:
 * - $$...$$ for block LaTeX
 * - $...$ for inline LaTeX
 * - **...** for bold
 * - *...* for italic
 * - - item for bullet lists
 * - 1. item for numbered lists
 */
export function renderContent(text: string): string {
  if (!text) return '';

  // Step 1: Process block LaTeX first (can span multiple lines)
  // Replace with placeholder to protect from line processing
  const blockLatexPlaceholders: string[] = [];
  let processed = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => {
    const placeholder = `__BLOCK_LATEX_${blockLatexPlaceholders.length}__`;
    try {
      blockLatexPlaceholders.push(
        `<div class="my-2 text-center">${katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false })}</div>`
      );
    } catch {
      blockLatexPlaceholders.push(`<span class="text-red-500">$$${tex}$$</span>`);
    }
    return placeholder;
  });

  // Step 2: Process line-by-line for lists
  const lines = processed.split('\n');
  const outputLines: string[] = [];
  let inList: 'ul' | 'ol' | null = null;

  for (const line of lines) {
    // Check for block LaTeX placeholder (standalone line)
    if (line.match(/^__BLOCK_LATEX_\d+__$/)) {
      if (inList) {
        outputLines.push(`</${inList}>`);
        inList = null;
      }
      outputLines.push(line);
      continue;
    }

    const bulletMatch = line.match(/^- (.+)$/);
    const numberMatch = line.match(/^\d+\. (.+)$/);

    if (bulletMatch) {
      if (inList !== 'ul') {
        if (inList) outputLines.push(`</${inList}>`);
        outputLines.push('<ul class="list-disc ml-4">');
        inList = 'ul';
      }
      outputLines.push(`<li>${formatInline(bulletMatch[1])}</li>`);
    } else if (numberMatch) {
      if (inList !== 'ol') {
        if (inList) outputLines.push(`</${inList}>`);
        outputLines.push('<ol class="list-decimal ml-4">');
        inList = 'ol';
      }
      outputLines.push(`<li>${formatInline(numberMatch[1])}</li>`);
    } else {
      if (inList) {
        outputLines.push(`</${inList}>`);
        inList = null;
      }
      // Regular line - format and add line break
      const formatted = formatInline(line);
      outputLines.push(formatted + (formatted ? '<br>' : ''));
    }
  }

  // Close any open list
  if (inList) {
    outputLines.push(`</${inList}>`);
  }

  // Step 3: Join and restore block LaTeX placeholders
  let html = outputLines.join('');
  blockLatexPlaceholders.forEach((latex, i) => {
    html = html.replace(`__BLOCK_LATEX_${i}__`, latex);
  });

  // Remove trailing <br>
  html = html.replace(/<br>$/, '');

  return html;
}

/**
 * Apply inline formatting: LaTeX, bold, italic
 */
function formatInline(text: string): string {
  if (!text) return '';

  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

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

  return html;
}
