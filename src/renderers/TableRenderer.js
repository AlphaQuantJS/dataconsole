/**
 * Enhanced TableRenderer module
 * Provides a lightweight, customizable table rendering with sorting, filtering and virtualization
 */

/**
 * Render a table from array data
 * @param {Array} rows - Array of objects to display
 * @param {Object} options - Table options
 * @param {number} options.height - Table height in pixels
 * @param {boolean} options.sortable - Enable sorting
 * @param {boolean} options.filterable - Enable filtering
 * @param {Array} options.columns - Column definitions
 * @returns {HTMLElement} - Table container element
 */
export function renderTable(rows, options = {}) {
  // Default options
  const config = {
    height: options.height || 400,
    sortable: options.sortable !== false,
    filterable: options.filterable || false,
    columns: options.columns || null,
    virtualScroll: options.virtualScroll !== false && rows.length > 100,
  };

  // Create wrapper for the table
  const wrapper = document.createElement('div');
  wrapper.className = 'table-wrapper';
  wrapper.style.position = 'relative';
  wrapper.style.height = `${config.height}px`;
  wrapper.style.overflow = 'auto';

  // Create table element
  const table = document.createElement('table');
  table.className = 'data-table';
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';

  // Store the original data and current state
  const tableState = {
    data: [...rows],
    visibleData: [...rows],
    sortColumn: null,
    sortDirection: 'asc',
    filters: {},
    columns: getColumns(rows, config.columns),
  };

  // Generate table structure
  const { thead, tbody } = generateTableDOM(table, tableState);

  // Attach event handlers for sorting
  if (config.sortable) {
    attachSortEvents(thead, tbody, tableState);
  }

  // Attach event handlers for filtering
  if (config.filterable) {
    attachFilterEvents(thead, tbody, tableState);
  }

  // Add virtualization if needed
  if (config.virtualScroll) {
    setupVirtualScroll(wrapper, table, tbody, tableState);
  } else {
    renderRows(tbody, tableState.visibleData, tableState.columns);
  }

  wrapper.appendChild(table);

  // Add export button
  addExportButton(wrapper, tableState);

  return wrapper;
}

/**
 * Generate columns configuration from data
 * @param {Array} rows - Data rows
 * @param {Array} columnsDef - User-defined columns
 * @returns {Array} - Processed columns configuration
 */
function getColumns(rows, columnsDef) {
  if (!rows || !rows.length) return [];

  // If no columns defined, auto-generate from the first row
  if (!columnsDef) {
    return Object.keys(rows[0]).map(key => ({
      field: key,
      label: key,
      render: null,
      align: 'left',
    }));
  }

  // Process user-defined columns
  return columnsDef.map(col => ({
    field: col.field,
    label: col.label || col.field,
    render: col.render || null,
    align: col.align || 'left',
  }));
}

/**
 * Generate the DOM structure for the table
 * @param {HTMLTableElement} table - Table element
 * @param {Object} state - Table state
 * @returns {Object} - References to thead and tbody
 */
function generateTableDOM(table, state) {
  // Create table header
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');

  // Create header cells
  state.columns.forEach(column => {
    const th = document.createElement('th');
    th.textContent = column.label;
    th.dataset.field = column.field;
    th.style.position = 'sticky';
    th.style.top = '0';
    th.style.backgroundColor = 'var(--bg-color, #222)';
    th.style.zIndex = '1';
    th.style.textAlign = column.align;
    th.style.cursor = 'pointer';
    
    // Add sort indicators
    const sortIndicator = document.createElement('span');
    sortIndicator.className = 'sort-indicator';
    sortIndicator.style.marginLeft = '5px';
    sortIndicator.textContent = '';
    th.appendChild(sortIndicator);
    
    headerRow.appendChild(th);
  });

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create filter row if needed
  if (state.filterable) {
    const filterRow = document.createElement('tr');
    filterRow.className = 'filter-row';
    
    state.columns.forEach(column => {
      const th = document.createElement('th');
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = `Filter ${column.label}...`;
      input.dataset.field = column.field;
      input.className = 'column-filter';
      input.style.width = '100%';
      input.style.boxSizing = 'border-box';
      input.style.padding = '4px';
      th.appendChild(input);
      filterRow.appendChild(th);
    });
    
    thead.appendChild(filterRow);
  }

  // Create table body
  const tbody = document.createElement('tbody');
  table.appendChild(tbody);

  return { thead, tbody };
}

/**
 * Render rows into the table body
 * @param {HTMLTableSectionElement} tbody - Table body element
 * @param {Array} data - Data to render
 * @param {Array} columns - Column definitions
 */
function renderRows(tbody, data, columns) {
  // Clear existing rows
  tbody.innerHTML = '';

  // Create rows
  data.forEach(row => {
    const tr = document.createElement('tr');
    
    columns.forEach(column => {
      const td = document.createElement('td');
      const value = row[column.field];
      
      // Use custom renderer if provided
      if (column.render) {
        td.innerHTML = column.render(value, row);
      } else {
        // Format based on value type
        td.textContent = formatValue(value);
      }
      
      td.style.textAlign = column.align;
      tr.appendChild(td);
    });
    
    tbody.appendChild(tr);
  });

  // Add empty row message if no data
  if (data.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = columns.length;
    td.textContent = 'No data to display';
    td.style.textAlign = 'center';
    td.style.padding = '20px';
    tr.appendChild(td);
    tbody.appendChild(tr);
  }
}

/**
 * Format a value for display
 * @param {*} value - Value to format
 * @returns {string} - Formatted value
 */
function formatValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'number') {
    return formatNumber(value);
  }
  
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  
  return String(value);
}

/**
 * Format a number for display
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
  if (Number.isInteger(num)) {
    return num.toString();
  }

  // For decimal numbers, limit the number of decimal places
  return num.toFixed(4).replace(/\.?0+$/, '');
}

/**
 * Attach sorting event handlers
 * @param {HTMLTableSectionElement} thead - Table header
 * @param {HTMLTableSectionElement} tbody - Table body
 * @param {Object} state - Table state
 */
function attachSortEvents(thead, tbody, state) {
  const headerCells = thead.querySelectorAll('tr:first-child th');
  
  headerCells.forEach(th => {
    th.addEventListener('click', () => {
      const field = th.dataset.field;
      
      // Update sort direction
      if (state.sortColumn === field) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortColumn = field;
        state.sortDirection = 'asc';
      }
      
      // Update sort indicators
      headerCells.forEach(cell => {
        const indicator = cell.querySelector('.sort-indicator');
        if (cell.dataset.field === state.sortColumn) {
          indicator.textContent = state.sortDirection === 'asc' ? ' ↑' : ' ↓';
        } else {
          indicator.textContent = '';
        }
      });
      
      // Sort data
      sortData(state);
      
      // Re-render table
      renderRows(tbody, state.visibleData, state.columns);
    });
  });
}

/**
 * Sort the table data
 * @param {Object} state - Table state
 */
function sortData(state) {
  if (!state.sortColumn) return;
  
  state.visibleData.sort((a, b) => {
    const valueA = a[state.sortColumn];
    const valueB = b[state.sortColumn];
    
    // Handle different types
    let comparison;
    
    if (valueA === null || valueA === undefined) return 1;
    if (valueB === null || valueB === undefined) return -1;
    
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      comparison = valueA - valueB;
    } else if (valueA instanceof Date && valueB instanceof Date) {
      comparison = valueA.getTime() - valueB.getTime();
    } else {
      comparison = String(valueA).localeCompare(String(valueB));
    }
    
    return state.sortDirection === 'asc' ? comparison : -comparison;
  });
}

/**
 * Attach filtering event handlers
 * @param {HTMLTableSectionElement} thead - Table header
 * @param {HTMLTableSectionElement} tbody - Table body
 * @param {Object} state - Table state
 */
function attachFilterEvents(thead, tbody, state) {
  const filterInputs = thead.querySelectorAll('.column-filter');
  
  filterInputs.forEach(input => {
    input.addEventListener('input', () => {
      const field = input.dataset.field;
      const value = input.value.toLowerCase();
      
      // Update filter state
      if (value) {
        state.filters[field] = value;
      } else {
        delete state.filters[field];
      }
      
      // Apply filters
      applyFilters(state);
      
      // Re-render table
      renderRows(tbody, state.visibleData, state.columns);
    });
  });
}

/**
 * Apply filters to the data
 * @param {Object} state - Table state
 */
function applyFilters(state) {
  // Reset visible data
  state.visibleData = [...state.data];
  
  // Apply each filter
  Object.entries(state.filters).forEach(([field, filterValue]) => {
    state.visibleData = state.visibleData.filter(row => {
      const value = row[field];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(filterValue);
    });
  });
  
  // Re-apply sorting if needed
  if (state.sortColumn) {
    sortData(state);
  }
}

/**
 * Set up virtual scrolling
 * @param {HTMLElement} wrapper - Table wrapper
 * @param {HTMLTableElement} table - Table element
 * @param {HTMLTableSectionElement} tbody - Table body
 * @param {Object} state - Table state
 */
function setupVirtualScroll(wrapper, table, tbody, state) {
  // Constants for virtualization
  const rowHeight = 30; // Estimated row height
  const buffer = 10; // Number of buffer rows above and below viewport
  
  // Create spacer elements
  const topSpacer = document.createElement('div');
  const bottomSpacer = document.createElement('div');
  
  // Insert spacers
  table.parentNode.insertBefore(topSpacer, table);
  table.parentNode.appendChild(bottomSpacer);
  
  // Function to update visible rows
  function updateVisibleRows() {
    const scrollTop = wrapper.scrollTop;
    const viewportHeight = wrapper.clientHeight;
    
    // Calculate visible range
    const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
    const endIndex = Math.min(
      state.visibleData.length,
      Math.ceil((scrollTop + viewportHeight) / rowHeight) + buffer
    );
    
    // Update spacer heights
    topSpacer.style.height = `${startIndex * rowHeight}px`;
    bottomSpacer.style.height = `${(state.visibleData.length - endIndex) * rowHeight}px`;
    
    // Render only the visible rows
    const visibleRows = state.visibleData.slice(startIndex, endIndex);
    renderRows(tbody, visibleRows, state.columns);
  }
  
  // Initial render
  updateVisibleRows();
  
  // Attach scroll event
  wrapper.addEventListener('scroll', updateVisibleRows);
  
  // Store the update function for later use
  state.updateVisibleRows = updateVisibleRows;
}

/**
 * Add export button to the table
 * @param {HTMLElement} wrapper - Table wrapper
 * @param {Object} state - Table state
 */
function addExportButton(wrapper, state) {
  const exportButton = document.createElement('button');
  exportButton.textContent = 'Export CSV';
  exportButton.className = 'export-csv-button';
  exportButton.style.position = 'absolute';
  exportButton.style.top = '5px';
  exportButton.style.right = '5px';
  exportButton.style.zIndex = '2';
  
  exportButton.addEventListener('click', () => {
    // Generate CSV
    const csv = generateCSV(state.visibleData, state.columns);
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'table_export.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
  
  wrapper.appendChild(exportButton);
}

/**
 * Generate CSV from data
 * @param {Array} data - Data to export
 * @param {Array} columns - Column definitions
 * @returns {string} - CSV string
 */
function generateCSV(data, columns) {
  // Header row
  const header = columns.map(col => `"${col.label}"`).join(',');
  
  // Data rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.field];
      // Escape quotes and format value
      const formatted = formatValue(value).replace(/"/g, '""');
      return `"${formatted}"`;
    }).join(',');
  });
  
  // Combine header and rows
  return [header, ...rows].join('\n');
}
