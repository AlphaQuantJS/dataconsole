/**
 * Module for rendering Markdown
 * @module MarkdownRenderer
 */

import { marked } from 'marked';

// Configure options for marked
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Line breaks are converted to <br>
  headerIds: true, // Generate IDs for headers
  mangle: false, // Don't escape characters in header IDs
  sanitize: false, // Don't escape HTML
  smartLists: true, // Smart lists
  smartypants: true, // Smart quotes, dashes, etc.
  xhtml: false, // Don't use XHTML
});

/**
 * Renders Markdown to HTML
 * @param {string} text - Markdown text
 * @returns {string} - HTML markup
 */
export function renderMarkdown(text) {
  if (!text || typeof text !== 'string') {
    return '';
  }

  try {
    return marked.parse(text);
  } catch (error) {
    console.error('Error rendering Markdown:', error);
    return `<div class="error">Error rendering Markdown: ${error.message}</div>`;
  }
}

/**
 * Renders code with syntax highlighting
 * @param {string} code - Code to render
 * @param {string} language - Programming language
 * @returns {string} - HTML markup with syntax highlighting
 */
export function renderCode(code, language = '') {
  // In the future, syntax highlighting can be added here
  // using a library like highlight.js or prism.js
  return `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`;
}

/**
 * Escapes HTML characters
 * @param {string} html - String to escape
 * @returns {string} - Escaped string
 */
function escapeHtml(html) {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
