import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import axios from 'axios';

const SalesDashboard = () => {
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [inventoryMap, setInventoryMap] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showTakeSalesModal, setShowTakeSalesModal] = useState(false);
  const [salesItems, setSalesItems] = useState([{ productName: '', quantity: '', price: 0 }]);
  const [customerName, setCustomerName] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch inventory products
      const inventoryRes = await axios.get('/inventory/');
      const invData = inventoryRes.data.map(item => ({
        productName: item.productName,
        price: Number(item.Cost) || 0,
        id: item._id
      }));
      setInventoryProducts(invData);

      // Create a quick lookup map for inventory prices
      const invMap = {};
      invData.forEach(p => {
        invMap[p.productName] = p.price;
      });
      setInventoryMap(invMap);

      // Fetch sales data
      const salesRes = await axios.get('/sales/');
      const salesData = salesRes.data;

      const aggregatedProducts = aggregateProductsFromSales(salesData, invMap);
      const newOrders = createOrdersFromSales(salesData, invMap);

      setProducts(aggregatedProducts);
      setOrders(newOrders);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const aggregateProductsFromSales = (salesData, invMap) => {
    // Aggregate by productName using inventoryMap for price
    const productMap = {};
    for (const sale of salesData) {
      const { productName, quantity } = sale;
      const price = invMap[productName] ? invMap[productName] : 0; 
      const qty = Number(quantity) || 0;

      if (!productMap[productName]) {
        productMap[productName] = {
          productName,
          price,
          quantitySold: 0,
          totalAmount: 0
        };
      }
      productMap[productName].quantitySold += qty;
      productMap[productName].totalAmount += price * qty;
    }

    return Object.values(productMap);
  };

  const createOrdersFromSales = (salesData, invMap) => {
    // Group sales by customerName and use inventory price
    const grouped = {};
    for (const sale of salesData) {
      const { customerName, productName, quantity } = sale;
      const price = invMap[productName] ? invMap[productName] : 0;
      const qty = Number(quantity) || 0;

      if (!grouped[customerName]) {
        grouped[customerName] = [];
      }
      grouped[customerName].push({ productName, quantity: qty, price });
    }

    // Convert each group into an order
    const ordersArray = Object.keys(grouped).map(customer => {
      const orderId = generateRandomOrderId();
      const items = grouped[customer].map(item => {
        const itemPrice = Number(item.price) || 0;
        const itemQty = Number(item.quantity) || 0;
        return {
          productName: item.productName,
          quantity: itemQty,
          price: itemPrice,
          total: itemPrice * itemQty
        };
      });
      return {
        orderId,
        customer,
        items,
      };
    });

    return ordersArray;
  };

  const generateRandomOrderId = () => {
    return 'O-' + Math.random().toString(36).substring(2, 7).toUpperCase();
  };

  const handleShowOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseOrderModal = () => {
    setSelectedOrder(null);
  };

  const handleGenerateInvoice = (order) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Invoice', 14, 22);

    doc.setFontSize(12);
    doc.text(`Order ID: ${order.orderId}`, 14, 32);
    doc.text(`Customer: ${order.customer}`, 14, 40);

    doc.text('Items:', 14, 50);

    let startY = 60;
    order.items.forEach((item, index) => {
      const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 0);
      doc.text(
        `${index + 1}. ${item.productName} (x${item.quantity}) - $${lineTotal.toFixed(2)}`,
        14,
        startY
      );
      startY += 10;
    });

    const total = order.items.reduce((acc, i) => acc + ((Number(i.price) || 0) * (Number(i.quantity) || 0)), 0);
    doc.text(`Total Amount: $${total.toFixed(2)}`, 14, startY + 10);

    doc.save(`Invoice_${order.orderId}.pdf`);
  };

  const handleTakeSales = () => {
    setShowTakeSalesModal(true);
    setSalesItems([{ productName: '', quantity: '', price: 0 }]);
    setCustomerName('');
  };

  const handleSalesItemChange = (index, field, value) => {
    const updatedItems = [...salesItems];

    if (field === 'productName') {
      // When productName changes, find the product in inventoryMap and set its price
      const selectedPrice = inventoryMap[value] || 0;
      updatedItems[index].productName = value;
      updatedItems[index].price = selectedPrice;
    } else {
      updatedItems[index][field] = value;
    }

    setSalesItems(updatedItems);
  };

  const handleAddSalesItemRow = () => {
    setSalesItems([...salesItems, { productName: '', quantity: '', price: 0 }]);
  };

  const handleSaveSales = async () => {
    if (!customerName) {
      alert('Please enter customer name');
      return;
    }
    for (let item of salesItems) {
      if (!item.productName || !item.quantity) {
        alert('Please fill all product and quantity details');
        return;
      }
    }

    // Build sales_array for POST with inventory-based pricing
    const sales_array = salesItems.map(si => {
      const qty = Number(si.quantity) || 0;
      const amount = si.price * qty;
      return {
        customerName: customerName,
        productName: si.productName,
        quantity: qty,
        charge: {
          amount: amount,
          card: {
            token: "tok_visa"
          }
        }
      };
    });

    if (sales_array.length === 0) return;

    const postBody = {
      sales_array,
      reset: false
    };

    try {
      const response = await axios.post('/sales/', postBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status === 200 || response.status === 201) {
        // After saving sales, refetch sales and re-aggregate
        const salesRes = await axios.get('/sales/');
        const salesData = salesRes.data;

        // Rebuild products and orders using the inventoryMap
        const aggregatedProducts = aggregateProductsFromSales(salesData, inventoryMap);
        const newOrders = createOrdersFromSales(salesData, inventoryMap);

        setProducts(aggregatedProducts);
        setOrders(newOrders);

        alert('Sales saved successfully!');
        setShowTakeSalesModal(false);
      }
    } catch (error) {
      console.error('Error saving sales:', error);
      alert('Failed to save sales.');
    }
  };

  const handleCancelSales = () => {
    setShowTakeSalesModal(false);
    setSalesItems([{ productName: '', quantity: '', price: 0 }]);
    setCustomerName('');
  };

  // Styles (Blue theme)
  const containerStyle = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#fff',
    color: '#1565C0',
    minHeight: '100vh',
    boxSizing: 'border-box'
  };

  const headingStyle = {
    marginBottom: '20px',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#1565C0'
  };

  const sectionHeadingStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: '10px'
  };

  const inputStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #2196F3',
    fontSize: '16px',
    width: '300px',
    transition: 'border-color 0.3s ease, background-color 0.3s ease',
    backgroundColor: '#ffffff',
    color: '#1565C0',
  };

  const handleInputFocus = (e) => {
    e.target.style.borderColor = '#1565C0';
    e.target.style.backgroundColor = '#E3F2FD';
  };

  const handleInputBlur = (e) => {
    e.target.style.borderColor = '#2196F3';
    e.target.style.backgroundColor = '#ffffff';
  };

  const primaryButtonStyle = {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  };

  const negativeButtonStyle = {
    backgroundColor: '#e53935',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  };

  const tableContainerStyle = {
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px',
    maxHeight: '250px',
    overflowY: 'auto',
    backgroundColor: '#E3F2FD'
  };

  const tableHeaderRowStyle = {
    background: '#BBDEFB'
  };

  const tableCellStyle = {
    padding: '8px',
    borderBottom: '1px solid #eee'
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Sales Dashboard</h2>

      {/* Products Section (from /sales/) */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={sectionHeadingStyle}>Products</h3>
        <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
          <button onClick={handleTakeSales} style={primaryButtonStyle}>Take Sales</button>
        </div>
        <div style={tableContainerStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={tableCellStyle}>Product Name</th>
                <th style={tableCellStyle}>Price</th>
                <th style={tableCellStyle}>Quantities Sold</th>
                <th style={tableCellStyle}>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => {
                const price = Number(p.price) || 0;
                const totalAmount = Number(p.totalAmount) || 0;
                return (
                  <tr key={p.productName}>
                    <td style={tableCellStyle}>{p.productName}</td>
                    <td style={tableCellStyle}>${price.toFixed(2)}</td>
                    <td style={tableCellStyle}>{p.quantitySold}</td>
                    <td style={tableCellStyle}>${totalAmount.toFixed(2)}</td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '8px', textAlign: 'center', backgroundColor:'#E3F2FD' }}>
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales Orders Section */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={sectionHeadingStyle}>Sales Orders</h3>
        <p style={{ marginBottom: '10px', color: '#1565C0' }}>
          Below are the orders grouped by customers.
        </p>

        <div style={tableContainerStyle}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={tableCellStyle}>Order ID</th>
                <th style={tableCellStyle}>Customer</th>
                <th style={tableCellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.orderId}>
                  <td style={tableCellStyle}>{order.orderId}</td>
                  <td style={tableCellStyle}>{order.customer}</td>
                  <td style={tableCellStyle}>
                    <button
                      onClick={() => handleShowOrder(order)}
                      style={{ ...primaryButtonStyle, marginRight: '5px' }}
                    >
                      Show Order
                    </button>
                    <button
                      onClick={() => handleGenerateInvoice(order)}
                      style={primaryButtonStyle}
                    >
                      Generate Invoice
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ padding: '8px', textAlign: 'center', backgroundColor:'#E3F2FD' }}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Show Order Modal */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '9999'
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              width: '400px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <h3 style={{ color: '#1565C0', fontWeight: 'bold' }}>Order Details</h3>
            <p><strong>Order ID:</strong> {selectedOrder.orderId}</p>
            <p><strong>Customer:</strong> {selectedOrder.customer}</p>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={tableCellStyle}>Product</th>
                  <th style={tableCellStyle}>Qty</th>
                  <th style={tableCellStyle}>Price</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map((item, idx) => {
                  const itemPrice = Number(item.price) || 0;
                  return (
                    <tr key={idx}>
                      <td style={tableCellStyle}>{item.productName}</td>
                      <td style={tableCellStyle}>{item.quantity}</td>
                      <td style={tableCellStyle}>${itemPrice.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={handleCloseOrderModal} style={negativeButtonStyle}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Take Sales Modal */}
      {showTakeSalesModal && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '9999'
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              padding: '20px',
              borderRadius: '8px',
              width: '500px',
              maxHeight: '80%',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <h3 style={{ color: '#1565C0', fontWeight: 'bold' }}>Take Sales</h3>
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={inputStyle}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
            {salesItems.map((si, index) => {
              const price = Number(si.price) || 0;
              return (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select
                      value={si.productName}
                      onChange={(e) => handleSalesItemChange(index, 'productName', e.target.value)}
                      style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #2196F3', backgroundColor: '#ffffff', color: '#1565C0' }}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    >
                      <option value="">Select Product</option>
                      {inventoryProducts.map(prod => (
                        <option key={prod.productName} value={prod.productName}>{prod.productName}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={si.quantity}
                      onChange={(e) => handleSalesItemChange(index, 'quantity', e.target.value)}
                      style={{ width: '80px', padding: '10px', borderRadius: '4px', border: '1px solid #2196F3', backgroundColor: '#ffffff', color: '#1565C0' }}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                    />
                  </div>
                  {si.productName && (
                    <div style={{ color: '#1565C0', fontSize: '14px' }}>
                      Price: ${price.toFixed(2)}
                    </div>
                  )}
                </div>
              );
            })}
            <button
              onClick={handleAddSalesItemRow}
              style={{
                backgroundColor: '#2196F3',
                color: '#fff',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '4px',
                marginBottom: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Add Another Product
            </button>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={handleSaveSales} style={primaryButtonStyle}>
                Save
              </button>
              <button onClick={handleCancelSales} style={negativeButtonStyle}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SalesDashboard;
