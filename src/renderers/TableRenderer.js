/**
 * Module for rendering tabular data
 * @module TableRenderer
 */

/**
 * Renders a table based on an array of objects
 * @param {Array<Object>} rows - Array of objects to display in the table
 * @returns {HTMLTableElement} - HTML table element
 */
export function renderTable(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.textContent = 'No data to display';
    return emptyMessage;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');

  // Get keys from the first object for headers
  const keys = Object.keys(rows[0]);

  // Create table header
  const headRow = document.createElement('tr');
  keys.forEach((key) => {
    const th = document.createElement('th');
    th.textContent = key;

    // Add handler for sorting (basic implementation)
    th.addEventListener('click', () => sortTable(table, key));
    th.style.cursor = 'pointer';
    th.title = `Click to sort by ${key}`;

    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  // Create rows with data
  rows.forEach((row) => {
    const tr = document.createElement('tr');
    keys.forEach((key) => {
      const td = document.createElement('td');
      const value = row[key];

      // Format value depending on type
      if (value === null || value === undefined) {
        td.textContent = '';
      } else if (typeof value === 'object' && value !== null) {
        td.textContent = JSON.stringify(value);
      } else if (typeof value === 'number') {
        // Format numbers for better readability
        td.textContent = formatNumber(value);
        td.style.textAlign = 'right'; // Align numbers to the right
      } else {
        td.textContent = String(value);
      }

      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);

  // Add information about the number of rows
  const caption = document.createElement('caption');
  caption.textContent = `Total rows: ${rows.length}`;
  caption.style.captionSide = 'bottom';
  table.appendChild(caption);

  return table;
}

/**
 * Formats a number for display
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
function formatNumber(num) {
  // If the number is an integer, return as is
  if (Number.isInteger(num)) {
    return num.toString();
  }

  // For decimal numbers, limit the number of decimal places
  return num.toFixed(4).replace(/\.?0+$/, '');
}

/**
 * Sorts the table by the specified column
 * @param {HTMLTableElement} table - HTML table element
 * @param {string} key - Key for sorting
 */
function sortTable(table, key) {
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));

  // Determine the current sort direction
  const currentDirection =
    table.dataset.sortDirection === 'asc' ? 'desc' : 'asc';
  table.dataset.sortDirection = currentDirection;
  table.dataset.sortKey = key;

  // Sort rows
  rows.sort((rowA, rowB) => {
    const cellA = rowA.querySelector(
      `td:nth-child(${getColumnIndex(table, key) + 1})`,
    );
    const cellB = rowB.querySelector(
      `td:nth-child(${getColumnIndex(table, key) + 1})`,
    );

    const valueA = parseValue(cellA.textContent);
    const valueB = parseValue(cellB.textContent);

    if (valueA < valueB) return currentDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return currentDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Clear and refill tbody
  while (tbody.firstChild) {
    tbody.removeChild(tbody.firstChild);
  }

  rows.forEach((row) => tbody.appendChild(row));

  // Update header styles
  updateHeaderStyles(table, key, currentDirection);
}

/**
 * Gets the column index by key
 * @param {HTMLTableElement} table - HTML table element
 * @param {string} key - Column key
 * @returns {number} - Column index
 */
function getColumnIndex(table, key) {
  const headers = Array.from(table.querySelectorAll('th'));
  return headers.findIndex((th) => th.textContent === key);
}

/**
 * Parses a value for sorting
 * @param {string} value - Value to parse
 * @returns {*} - Parsed value
 */
function parseValue(value) {
  // Try to parse as a number
  const num = parseFloat(value);
  if (!isNaN(num)) return num;

  // Try to parse as a date
  const date = new Date(value);
  if (!isNaN(date.getTime())) return date;

  // Return as a string
  return value.toLowerCase();
}

/**
 * Updates table header styles
 * @param {HTMLTableElement} table - HTML table element
 * @param {string} key - Active column key
 * @param {string} direction - Sort direction
 */
function updateHeaderStyles(table, key, direction) {
  const headers = table.querySelectorAll('th');
  headers.forEach((th) => {
    th.classList.remove('sort-asc', 'sort-desc');
    if (th.textContent === key) {
      th.classList.add(`sort-${direction}`);
      th.textContent = `${key} ${direction === 'asc' ? '↑' : '↓'}`;
    }
  });
}
