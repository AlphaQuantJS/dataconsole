/**
 * Main module for displaying data in the console
 * @module display
 */

import { renderTable } from './renderers/TableRenderer.js';
import { renderPlot } from './renderers/PlotRenderer.js';
import { renderMarkdown } from './renderers/MarkdownRenderer.js';

// Get a reference to the console DOM element
let consoleEl = null;

// Initialize console element when DOM is ready
function initConsole() {
  if (consoleEl) return consoleEl;

  consoleEl = document.getElementById('console');

  // If console element doesn't exist, create it
  if (!consoleEl) {
    console.warn('Console element not found, creating one');
    consoleEl = document.createElement('div');
    consoleEl.id = 'console';
    document.body.appendChild(consoleEl);
  }

  return consoleEl;
}

/**
 * Displays various data types in the console
 * @param {*} obj - Object to display (string, array, object, etc.)
 * @returns {void}
 */
export function display(obj) {
  // Make sure console is initialized
  const container = initConsole();

  const block = document.createElement('div');
  block.className = 'console-block';

  // Determine the data type and choose the appropriate renderer
  if (typeof obj === 'string' && (obj.startsWith('#') || obj.includes('\n'))) {
    // Markdown
    block.innerHTML = renderMarkdown(obj);
  } else if (
    Array.isArray(obj) &&
    obj.length > 0 &&
    obj[0]?.time &&
    obj[0]?.value
  ) {
    // Time series for chart
    block.appendChild(renderPlot(obj));
  } else if (
    Array.isArray(obj) &&
    obj.length > 0 &&
    typeof obj[0] === 'object'
  ) {
    // Tabular data
    block.appendChild(renderTable(obj));
  } else if (
    obj &&
    typeof obj === 'object' &&
    obj.constructor?.name === 'DataFrame'
  ) {
    // TinyFrameJS DataFrame
    try {
      const data = obj.toArray ? obj.toArray() : obj.data;
      if (Array.isArray(data) && data.length > 0) {
        block.appendChild(renderTable(data));
      } else {
        block.textContent = 'Empty DataFrame';
      }
    } catch (error) {
      console.error('Error displaying DataFrame:', error);
      block.textContent = `Error displaying DataFrame: ${error.message}`;
    }
  } else if (typeof obj === 'object') {
    // JSON objects
    const pre = document.createElement('pre');
    pre.textContent = JSON.stringify(obj, null, 2);
    block.appendChild(pre);
  } else {
    // Simple data types
    block.textContent = String(obj);
  }

  // Add the block to the console
  container.appendChild(block);

  // Scroll to the new block
  block.scrollIntoView({ behavior: 'smooth', block: 'end' });

  return obj; // Return the original object for chaining
}

/**
 * Displays a chart based on data
 * @param {Array|Object} data - Data for building the chart (Array or DataFrame)
 * @returns {*} - Original data
 */
export function plot(data) {
  // Handle DataFrame objects
  if (
    data &&
    typeof data === 'object' &&
    data.constructor?.name === 'DataFrame'
  ) {
    try {
      return display(data.toArray ? data.toArray() : data.data);
    } catch (error) {
      console.error('Error plotting DataFrame:', error);
      return display(`Error plotting DataFrame: ${error.message}`);
    }
  }
  return display(data);
}

/**
 * Displays tabular data
 * @param {Array|Object} df - DataFrame or array of objects
 * @returns {*} - Original data
 */
export function view(df) {
  return display(df);
}

/**
 * Clears the console
 * @returns {void}
 */
export function clear() {
  initConsole().innerHTML = '';
}
