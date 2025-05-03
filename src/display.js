/**
 * DataConsole display module
 * Core functionality for displaying data in the console
 */

import { renderTable } from './renderers/TableRenderer.js';
import { renderPlot } from './renderers/PlotRenderer.js';
import { renderMarkdown } from './renderers/MarkdownRenderer.js';
import { addToolbar } from './toolbar.js';

// Get or create console element
const consoleElement = document.getElementById('console') || (() => {
  const el = document.createElement('div');
  el.id = 'console';
  document.body.appendChild(el);
  return el;
})();

/**
 * Display content in the console
 * @param {*} content - Content to display (string, object, array)
 * @param {Object} options - Display options
 * @returns {Promise<HTMLElement>} - The created console block
 */
export async function display(content, options = {}) {
  // Create console block
  const block = document.createElement('div');
  block.className = 'console-block';
  
  let blockType = 'text';
  let rendered = null;

  try {
    // Handle different content types
    if (typeof content === 'string') {
      // Markdown (starts with # or ## or contains markdown syntax)
      if (content.trim().startsWith('#') || 
          content.includes('**') || 
          content.includes('__') ||
          content.includes('```')) {
        const markdownHtml = renderMarkdown(content);
        const mdContainer = document.createElement('div');
        mdContainer.innerHTML = markdownHtml;
        rendered = mdContainer;
        blockType = 'md';
      } else {
        // Plain text
        const textElement = document.createElement('div');
        textElement.textContent = content;
        rendered = textElement;
        blockType = 'text';
      }
    } 
    // Array of objects (table data)
    else if (Array.isArray(content) && content.length > 0 && typeof content[0] === 'object') {
      // Check if it's time series data for plotting
      if (content[0].time !== undefined && content[0].value !== undefined) {
        rendered = await renderPlot(content, options);
        blockType = 'plot';
      } else {
        // Regular table data
        rendered = await renderTable(content, {
          sortable: true,
          filterable: options.filterable || content.length > 10,
          height: options.height || (content.length > 20 ? 400 : null),
          virtualScroll: content.length > 100,
          columns: options.columns
        });
        blockType = 'table';
      }
    }
    // Object (display as JSON)
    else if (content !== null && typeof content === 'object') {
      const pre = document.createElement('pre');
      pre.className = 'json';
      pre.textContent = JSON.stringify(content, null, 2);
      rendered = pre;
      blockType = 'json';
    }
    // Other types (display as string)
    else {
      const textElement = document.createElement('div');
      textElement.textContent = String(content);
      rendered = textElement;
      blockType = 'text';
    }

    // Add the rendered content to the block if it's a valid DOM node
    if (rendered && rendered.nodeType) {
      block.appendChild(rendered);
    } else if (rendered) {
      // If not a DOM node, create a container and add as text
      console.error('Rendered content is not a DOM node:', rendered);
      const errorContainer = document.createElement('div');
      errorContainer.className = 'error-message';
      errorContainer.textContent = 'Error: Rendered content is not a valid DOM element';
      block.appendChild(errorContainer);
    } else {
      // If nothing was rendered
      const errorContainer = document.createElement('div');
      errorContainer.className = 'error-message';
      errorContainer.textContent = 'Error: Failed to render content';
      block.appendChild(errorContainer);
    }

    // Add toolbar with controls
    addToolbar(block, blockType);

    // Add to console
    consoleElement.appendChild(block);
    
    // Scroll to the new block
    block.scrollIntoView({ behavior: 'smooth', block: 'end' });

    return block;
  } catch (error) {
    console.error('Error displaying content:', error);
    
    // Display error message
    const errorBlock = document.createElement('div');
    errorBlock.className = 'console-block error';
    
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.textContent = `Error displaying content: ${error.message}`;
    
    errorBlock.appendChild(errorMessage);
    consoleElement.appendChild(errorBlock);
    
    return errorBlock;
  }
}

/**
 * Display a DataFrame as a table
 * @param {Array|Object} df - DataFrame or array to display
 * @param {Object} options - Display options
 * @returns {Promise<HTMLElement>} - The created console block
 */
export async function view(df, options = {}) {
  // Handle DataFrame objects by converting to array
  const data = df && typeof df.toArray === 'function' ? df.toArray() : df;
  return display(data, options);
}

/**
 * Display a plot
 * @param {Array} data - Data to plot
 * @param {Object} options - Plot options
 * @returns {Promise<HTMLElement>} - The created console block
 */
export async function plot(data, options = {}) {
  return display(data, { ...options, type: 'plot' });
}

/**
 * Clear the console
 */
export function clear() {
  consoleElement.innerHTML = '';
}

/**
 * Save the current console state as HTML
 * @returns {string} - HTML content
 */
export function saveAsHTML() {
  const html = document.documentElement.outerHTML;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'dataconsole_report.html';
  link.click();
  
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
  
  return html;
}
