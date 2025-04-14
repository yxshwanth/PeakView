import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

function Analytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  // References to chart instances
  const salesChartRef = useRef(null);
  const profitChartRef = useRef(null);
  const inventoryChartRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!isLoading && chartData) {
      // Create charts after the data is loaded and DOM is updated
      const { profitData, totalSalesByProduct, inventoryMetrics } = chartData;

      createSalesVolumeChart(totalSalesByProduct);
      createProfitChart(profitData);
      createInventoryChart(inventoryMetrics);
    }
  }, [isLoading, chartData]);

  async function fetchData() {
    try {
      setIsLoading(true);

      // Fetch data using axios
      const [salesResponse, inventoryResponse] = await Promise.all([
        axios.get('/sales/'),     // Returns an array of sales
        axios.get('/inventory/')  // Returns an array of inventory
      ]);

      console.log('Sales Data from API:', salesResponse);
      console.log('Inventory Data from API:', inventoryResponse);

      // Process data for charts
      const processedData = processAnalytics(salesResponse, inventoryResponse);
      setChartData(processedData);

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching or processing data:", error);
      setIsLoading(false);
    }
  }

  function processAnalytics(salesData, inventoryData) {
    // salesData.data is an array of sales objects:
    // [
    //   {
    //     "_id": "...",
    //     "timestamp": "...",
    //     "customerName": "...",
    //     "productName": "Apple iPhone 14 Pro",
    //     "quantity": 2,
    //     ...
    //   }, ...
    // ]

    // inventoryData.data is an array of inventory objects:
    // [
    //   {
    //     "_id": "...",
    //     "timestamp": "...",
    //     "productName": "Apple iPhone 14 Pro",
    //     "Stock": 146,
    //     "Threshold": 20,
    //     "Cost": 999,
    //     ...
    //   }, ...
    // ]

    const salesArray = Array.isArray(salesData.data) ? salesData.data : [];
    const inventories = Array.isArray(inventoryData.data) ? inventoryData.data : [];

    console.log('Processed Sales Array:', salesArray);
    console.log('Processed Inventories:', inventories);

    // Create a map for inventory lookups
    const inventoryMap = {};
    inventories.forEach(inv => {
      inventoryMap[inv.productName] = {
        stock: inv.Stock,
        threshold: inv.Threshold,
        cost: inv.Cost
      };
    });

    const totalSalesByProduct = {};
    const profitData = {};

    // Since we have no selling price from the API, let's assume a fixed margin.
    // For demonstration, let's say sellingPrice = cost + 100.
    salesArray.forEach(sale => {
      const { productName, quantity } = sale;
      const invInfo = inventoryMap[productName] || {};
      const cost = invInfo.cost || 0;

      // Accumulate sales volume
      if (!totalSalesByProduct[productName]) {
        totalSalesByProduct[productName] = 0;
      }
      totalSalesByProduct[productName] += quantity;

      // Calculate a hypothetical profit (you should replace this logic with real data)
      const sellingPrice = cost + 100; // Arbitrary margin for demonstration
      const profit = (sellingPrice - cost) * quantity;

      if (!profitData[productName]) {
        profitData[productName] = 0;
      }
      profitData[productName] += profit;
    });

    // Prepare inventory metrics for charting
    const inventoryMetrics = inventories.map(inv => ({
      productName: inv.productName,
      stock: inv.Stock,
      threshold: inv.Threshold
    }));

    return { profitData, totalSalesByProduct, inventoryMetrics };
  }

  function createSalesVolumeChart(totalSalesByProduct) {
    const labels = Object.keys(totalSalesByProduct);
    const data = Object.values(totalSalesByProduct);
    const canvas = document.getElementById('salesChart').getContext('2d');

    // Destroy existing chart instance
    if (salesChartRef.current) {
      salesChartRef.current.destroy();
    }

    // Create new chart instance
    salesChartRef.current = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sales Volume (Units Sold)',
          data: data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Sales Volume by Product'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  function createProfitChart(profitData) {
    const labels = Object.keys(profitData);
    const data = Object.values(profitData);
    const canvas = document.getElementById('profitChart').getContext('2d');

    // Destroy existing chart instance
    if (profitChartRef.current) {
      profitChartRef.current.destroy();
    }

    // Create new chart instance
    profitChartRef.current = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Profit ($)',
          data: data,
          backgroundColor: 'rgba(75, 192, 75, 0.6)',
          borderColor: 'rgba(75, 192, 75, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Profit by Product (Hypothetical)'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  function createInventoryChart(inventoryMetrics) {
    const labels = inventoryMetrics.map(m => m.productName);
    const stockData = inventoryMetrics.map(m => m.stock);
    const thresholdData = inventoryMetrics.map(m => m.threshold);
    const canvas = document.getElementById('inventoryChart').getContext('2d');

    // Destroy existing chart instance
    if (inventoryChartRef.current) {
      inventoryChartRef.current.destroy();
    }

    // Create new chart instance
    inventoryChartRef.current = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Stock Level',
            data: stockData,
            backgroundColor: 'rgba(255, 205, 86, 0.6)',
            borderColor: 'rgba(255, 205, 86, 1)',
            fill: false,
            tension: 0.1
          },
          {
            label: 'Threshold',
            data: thresholdData,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            fill: false,
            borderDash: [5, 5],
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Inventory Levels vs Thresholds'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  return (
    <div>
      <h1>Analytics Dashboard</h1>
      {isLoading ? (
        <p>Loading data...</p>
      ) : (
        <>
          <canvas id="salesChart" width="400" height="200"></canvas>
          <canvas id="profitChart" width="400" height="200"></canvas>
          <canvas id="inventoryChart" width="400" height="200"></canvas>
        </>
      )}
    </div>
  );
}

export default Analytics;
