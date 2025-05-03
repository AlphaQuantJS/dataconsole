/**
 * Toolbar module for DataConsole
 * Provides functionality for block controls: collapse, export, copy
 */

/**
 * Add toolbar to a console block
 * @param {HTMLElement} block - Console block element
 * @param {string} type - Block type (table, plot, md, text)
 */
export function addToolbar(block, type) {
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';
  toolbar.style.position = 'absolute';
  toolbar.style.top = '4px';
  toolbar.style.right = '8px';
  toolbar.style.display = 'flex';
  toolbar.style.gap = '6px';
  toolbar.style.zIndex = '10';

  // Collapse button
  const collapseBtn = createButton('▢', 'Collapse/expand block', () => {
    block.classList.toggle('collapsed');
    collapseBtn.textContent = block.classList.contains('collapsed') ? '▣' : '▢';
  });

  // Copy button
  const copyBtn = createButton('📋', 'Copy to clipboard', () => {
    copyToClipboard(block, type);
  });

  // Export button
  const exportBtn = createButton('🗀', 'Export block', () => {
    exportBlock(block, type);
  });

  toolbar.append(collapseBtn, copyBtn, exportBtn);
  block.prepend(toolbar);

  // Add collapsed class handling
  block.addEventListener('collapsed', () => {
    Array.from(block.children).forEach(child => {
      if (!child.classList.contains('toolbar')) {
        child.style.display = 'none';
      }
    });
  });

  block.addEventListener('expanded', () => {
    Array.from(block.children).forEach(child => {
      if (!child.classList.contains('toolbar')) {
        child.style.display = '';
      }
    });
  });
}

/**
 * Create a toolbar button
 * @param {string} label - Button label
 * @param {string} title - Button tooltip
 * @param {Function} onClick - Click handler
 * @returns {HTMLButtonElement} - Button element
 */
function createButton(label, title, onClick) {
  const button = document.createElement('button');
  button.textContent = label;
  button.title = title;
  button.style.fontSize = '12px';
  button.style.padding = '2px 6px';
  button.style.cursor = 'pointer';
  button.style.background = 'var(--block-color, #1e1e1e)';
  button.style.color = 'var(--text-color, #eee)';
  button.style.border = '1px solid var(--border-color, #444)';
  button.style.borderRadius = '4px';
  button.addEventListener('click', onClick);
  return button;
}

/**
 * Copy block content to clipboard
 * @param {HTMLElement} block - Console block
 * @param {string} type - Block type
 */
async function copyToClipboard(block, type) {
  let content = '';

  if (type === 'table') {
    // For tables, create a tab-separated string
    const table = block.querySelector('table');
    if (table) {
      content = tableToText(table);
    }
  } else if (type === 'plot') {
    // For plots, we can only copy a description
    content = 'Chart data cannot be copied as text. Use Export to save as image.';
  } else {
    // For text and markdown, copy the text content
    content = block.textContent.replace(/▢|📋|🗀/g, '').trim();
  }

  try {
    await navigator.clipboard.writeText(content);
    
    // Show success feedback
    const notification = document.createElement('div');
    notification.textContent = 'Copied to clipboard!';
    notification.style.position = 'absolute';
    notification.style.top = '30px';
    notification.style.right = '10px';
    notification.style.background = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '5px 10px';
    notification.style.borderRadius = '4px';
    notification.style.fontSize = '12px';
    notification.style.zIndex = '100';
    
    block.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 2000);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

/**
 * Convert table to text format
 * @param {HTMLTableElement} table - Table element
 * @returns {string} - Formatted text
 */
function tableToText(table) {
  const rows = Array.from(table.rows);
  
  // Get column widths
  const colWidths = [];
  rows.forEach(row => {
    Array.from(row.cells).forEach((cell, i) => {
      const cellLength = cell.textContent.trim().length;
      colWidths[i] = Math.max(colWidths[i] || 0, cellLength);
    });
  });
  
  // Format each row
  return rows.map(row => {
    return Array.from(row.cells)
      .map((cell, i) => {
        const content = cell.textContent.trim();
        return content.padEnd(colWidths[i]);
      })
      .join('\t');
  }).join('\n');
}

/**
 * Export block content
 * @param {HTMLElement} block - Console block
 * @param {string} type - Block type
 */
async function exportBlock(block, type) {
  if (type === 'table') {
    // Export table as CSV
    const table = block.querySelector('table');
    if (table) {
      const csv = tableToCSV(table);
      downloadFile(csv, 'table_export.csv', 'text/csv');
    }
  } else if (type === 'plot') {
    // Export plot as PNG
    try {
      // Check if Plotly is available
      const plotElement = block.querySelector('.js-plotly-plot');
      if (plotElement && window.Plotly) {
        const dataUrl = await window.Plotly.toImage(plotElement, {
          format: 'png',
          width: 800,
          height: 600
        });
        
        // Download the image
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'chart_export.png';
        link.click();
      } else {
        console.error('Plotly not available for export');
      }
    } catch (err) {
      console.error('Failed to export plot: ', err);
    }
  } else {
    // Export text/markdown as text file
    const content = block.textContent.replace(/▢|📋|🗀/g, '').trim();
    const extension = type === 'md' ? 'md' : 'txt';
    downloadFile(content, `export.${extension}`, 'text/plain');
  }
}

/**
 * Convert table to CSV format
 * @param {HTMLTableElement} table - Table element
 * @returns {string} - CSV string
 */
function tableToCSV(table) {
  const rows = Array.from(table.rows);
  
  return rows.map(row => {
    return Array.from(row.cells)
      .map(cell => {
        // Escape quotes and wrap in quotes
        const content = cell.textContent.trim().replace(/"/g, '""');
        return `"${content}"`;
      })
      .join(',');
  }).join('\n');
}

/**
 * Download content as a file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} contentType - Content MIME type
 */
function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}
