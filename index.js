/**
 * DataConsole - Usage Example
 * This file demonstrates basic usage of DataConsole with TinyFrameJS
 */

// Debug message to check if script is running
console.log('DataConsole script started');

import { display, plot, view } from './src/display.js';

// Import tinyframejs with error handling
let DataFrame;
try {
  const TinyFrame = await import('tinyframejs');
  DataFrame = TinyFrame.DataFrame;
  console.log('TinyFrameJS successfully imported:', TinyFrame);
} catch (error) {
  console.error('Error importing TinyFrameJS:', error);
  
  // Create a simple DataFrame stub for demonstration
  class SimpleDataFrame {
    constructor(data) {
      this.data = data;
    }

    toArray() {
      return this.data;
    }

    getColumn(columnName) {
      return this.data.map((row) => row[columnName]);
    }
  }

  DataFrame = SimpleDataFrame;
  console.log('Using SimpleDataFrame stub instead');
}

// Display heading
display('# DataConsole Demo');

// Display description
display(`
## What is this?

DataConsole is a minimalist web console for displaying tabular data, 
charts, and markdown in the browser. It allows analysts and developers 
to quickly visualize data analysis results.

It integrates seamlessly with TinyFrameJS for efficient data manipulation.
`);

// Function to load data from Binance API
async function fetchBinanceData() {
  display('## Loading Bitcoin Data from Binance');
  display('Fetching BTC/USDT price data from Binance API...');

  try {
    // Get historical candle data for BTC/USDT
    const response = await fetch(
      'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=30',
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Transform data into a more convenient format
    // Binance data format: [openTime, open, high, low, close, volume, closeTime, ...]
    const formattedData = data.map((item) => {
      const date = new Date(item[0]);
      return {
        date: date.toISOString().split('T')[0],
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5]),
      };
    });

    display('Data successfully loaded!');

    // Create DataFrame from the loaded data
    const df = new DataFrame(formattedData);

    // Display data table
    display('## Bitcoin Price Data (Last 30 Days)');
    view(df.toArray());

    // Display price chart
    display('## Bitcoin Price Chart');
    const priceData = formattedData.map((item) => ({
      time: item.date,
      value: item.close,
    }));
    plot(priceData);

    // Calculate and display simple statistics
    display('## Bitcoin Price Statistics');

    // Get closing price data
    const closes = df.getColumn('close');

    // Calculate daily price changes (returns)
    const returns = [];
    for (let i = 1; i < closes.length; i++) {
      returns.push(closes[i] / closes[i - 1] - 1);
    }

    // Calculate basic statistics
    const avgReturn =
      returns.reduce((sum, val) => sum + val, 0) / returns.length;
    const volatility = Math.sqrt(
      returns.reduce((sum, val) => sum + Math.pow(val - avgReturn, 2), 0) /
        returns.length,
    );
    const sharpeRatio = (avgReturn / volatility) * Math.sqrt(252); // Annualized

    // Display metrics
    display({
      currentPrice: `$${closes[closes.length - 1].toLocaleString()}`,
      priceChange30d: `${((closes[closes.length - 1] / closes[0] - 1) * 100).toFixed(2)}%`,
      avgDailyReturn: `${(avgReturn * 100).toFixed(2)}%`,
      annualizedVolatility: `${(volatility * Math.sqrt(252) * 100).toFixed(2)}%`,
      sharpeRatio: sharpeRatio.toFixed(2),
    });

    return df;
  } catch (error) {
    console.error('Error fetching data from Binance:', error);
    display(`## Error Loading Data
    
    Failed to load data from Binance API: ${error.message}
    
    Using sample data instead.`);

    // Return null so the calling code can use fallback data
    return null;
  }
}

// Start data loading
(async function(){
  const binanceData = await fetchBinanceData();

  // If failed to load data from Binance, use examples
  if (!binanceData) {
    // Sample data for demonstration
    const data = [
      { time: '2024-01-01', value: 100 },
      { time: '2024-01-02', value: 110 },
      { time: '2024-01-03', value: 105 },
      { time: '2024-01-04', value: 120 },
      { time: '2024-01-05', value: 125 },
    ];

    // Debug: Log data
    console.log('Sample data:', data);

    // Create a DataFrame from the data
    const df = new DataFrame(data);

    // Debug: Log DataFrame
    console.log('DataFrame created:', df);

    // Display chart using DataFrame data
    display('## Sample Data Chart');
    plot(df.toArray());

    // Display table using DataFrame
    display('## Sample Data Table');
    view(df.toArray());

    // Calculate some metrics
    const values = df.getColumn('value');
    const returns = [];
    for (let i = 1; i < values.length; i++) {
      returns.push(values[i] / values[i - 1] - 1);
    }

    const avgReturn =
      returns.reduce((sum, val) => sum + val, 0) / returns.length;
    const volatility = Math.sqrt(
      returns.reduce((sum, val) => sum + Math.pow(val - avgReturn, 2), 0) /
        returns.length,
    );
    const sharpeRatio = (avgReturn / volatility) * Math.sqrt(252); // Annualized

    // Display metrics
    display('## Metrics');
    display({
      sharpe: sharpeRatio.toFixed(2),
      avgDailyReturn: (avgReturn * 100).toFixed(2) + '%',
      volatility: (volatility * 100).toFixed(2) + '%',
      annualizedReturn: (avgReturn * 252 * 100).toFixed(2) + '%',
    });
  }
})();
