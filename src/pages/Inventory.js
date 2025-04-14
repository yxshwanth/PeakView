import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProducts, setNewProducts] = useState([{ productName: '', Stock: '', Threshold: '', Cost: '' }]);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const positiveButtonStyle = {
    backgroundColor: '#4caf50', 
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px'
  };

  const negativeButtonStyle = {
    backgroundColor: '#e53935', 
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '5px'
  };

  const searchInputStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #4caf50',  
    fontSize: '16px',
    width: '300px',               
    transition: 'border-color 0.3s ease, background-color 0.3s ease',
    backgroundColor: '#ffffff',   
    color: '#2e7d32',             
  };

  const handleSearchFocus = (e) => {
    e.target.style.borderColor = '#2e7d32'; 
    e.target.style.backgroundColor = '#e8f5e9'; 
  };

  const handleSearchBlur = (e) => {
    e.target.style.borderColor = '#4caf50';
    e.target.style.backgroundColor = '#ffffff';
  };

  // Fetch inventory data from server using axios
  const fetchInventory = async () => {
    try {
      const response = await axios.get('/inventory/');
      setProducts(response.data);
    } catch (error) {
      if (error.response) {
        console.error('Server error:', error.response);
        alert(`Server error: ${error.response.data.message || 'Failed to fetch inventory.'}`);
      } else if (error.request) {
        console.error('Network error:', error.request);
        alert('Network error: Unable to reach the server.');
      } else {
        console.error('Error:', error.message);
        alert('Unexpected error occurred.');
      }
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddProductRow = () => {
    setNewProducts([...newProducts, { productName: '', Stock: '', Threshold: '', Cost: '' }]);
  };

  const handleNewProductChange = (index, field, value) => {
    const updatedProducts = [...newProducts];
    updatedProducts[index][field] = value;
    setNewProducts(updatedProducts);
  };

  const handleDeleteNewProductRow = (indexToDelete) => {
    const updatedProducts = newProducts.filter((_, index) => index !== indexToDelete);
    setNewProducts(updatedProducts);
  };

  const saveNewProducts = async () => {
    const inventories = newProducts.map(prod => ({
      productName: prod.productName,
      Stock: Number(prod.Stock),
      Threshold: Number(prod.Threshold),
      Cost: Number(prod.Cost),
      charge: {
        amount: 19,
        card: {
          token: "tok_visa"
        }
      }
    }));

    const postBody = {
      inventories,
      reset: false
    };

    try {
      const response = await axios.post('/inventory/', postBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 201) {
        // After successfully saving, re-fetch the inventory
        await fetchInventory();
        setNewProducts([{ productName: '', Stock: '', Threshold: '', Cost: '' }]);
        setShowModal(false);
      }
    } catch (error) {
      if (error.response) {
        console.error('Server error:', error.response);
        alert(`Error saving new products: ${error.response.data.message || 'Failed to save.'}`);
      } else if (error.request) {
        console.error('Network error:', error.request);
        alert('Network error: Unable to reach the server.');
      } else {
        console.error('Error:', error.message);
        alert('Unexpected error occurred.');
      }
    }
  };

  const handleEditChange = (index, field, value) => {
    const updatedProducts = [...products];
    updatedProducts[index][field] = value;
    setProducts(updatedProducts);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleDeleteRow = (id) => {
    setProducts(products.filter((product) => product._id !== id));
    // If needed, implement a DELETE request to the server here.
  };

  const saveChanges = async () => {
    // Prepare the POST body with "reset": true and current products
    const inventories = products.map(prod => ({
      productName: prod.productName,
      Stock: Number(prod.Stock),
      Threshold: Number(prod.Threshold),
      Cost: Number(prod.Cost),
      charge: {
        amount: 19,
        card: {
          token: "tok_visa"
        }
      }
    }));

    const postBody = {
      inventories,
      reset: true
    };

    try {
      const response = await axios.post('/inventory/', postBody, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200 || response.status === 201) {
        // After successful POST, fetch inventory again
        await fetchInventory();
        // Exit edit mode
        setEditMode(false);
      }
    } catch (error) {
      if (error.response) {
        console.error('Server error:', error.response);
        alert(`Error saving changes: ${error.response.data.message || 'Failed to save.'}`);
      } else if (error.request) {
        console.error('Network error:', error.request);
        alert('Network error: Unable to reach the server.');
      } else {
        console.error('Error:', error.message);
        alert('Unexpected error occurred.');
      }
    }
  };

  const filteredProducts = products.filter((product) =>
    product.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      style={{
        minHeight: '1vh',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        padding: '0px 20px 20px', 
        boxSizing: 'border-box',
      }}
    >
      <h2 style={{ 
        fontSize: '2rem', 
        fontWeight: 'bold', 
        color: '#2e7d32', 
        marginBottom: '20px' 
      }}>
        Inventory
      </h2>

      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowModal(true)} style={positiveButtonStyle}>
            Add Products
          </button>
          <button onClick={toggleEditMode} style={negativeButtonStyle}>
            {editMode ? 'Exit Edit Mode' : 'Edit Inventory'}
          </button>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={searchInputStyle}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />
        </div>
      </div>

      <div 
        style={{ 
          maxHeight: '50vh', 
          overflowY: 'auto', 
          border: '1px solid #ccc', 
          borderRadius: '4px',
          padding: '10px',
          backgroundColor: '#f1f8e9' 
        }}
      >
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#a5d6a7' }}>
              <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>Product</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>Stock</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>Threshold</th>
              <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>Cost</th>
              {editMode && <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, index) => (
              <tr key={product._id} style={{ backgroundColor: '#c8e6c9' }}>
                {editMode ? (
                  <>
                    <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                      <input
                        type="text"
                        value={product.productName}
                        onChange={(e) => handleEditChange(index, 'productName', e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </td>
                    <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                      <input
                        type="number"
                        value={product.Stock}
                        onChange={(e) => handleEditChange(index, 'Stock', e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </td>
                    <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                      <input
                        type="number"
                        value={product.Threshold}
                        onChange={(e) => handleEditChange(index, 'Threshold', e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </td>
                    <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                      <input
                        type="number"
                        value={product.Cost}
                        onChange={(e) => handleEditChange(index, 'Cost', e.target.value)}
                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </td>
                    <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                      <button onClick={() => handleDeleteRow(product._id)} style={negativeButtonStyle}>
                        Delete
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{product.productName}</td>
                    <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{product.Stock}</td>
                    <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>{product.Threshold}</td>
                    <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>${product.Cost}</td>
                  </>
                )}
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr style={{ backgroundColor: '#c8e6c9' }}>
                <td colSpan={editMode ? 5 : 4} style={{ padding: '8px', textAlign: 'center' }}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editMode && (
        <div style={{ marginTop: '20px' }}>
          <button onClick={saveChanges} style={positiveButtonStyle}>
            Save Changes
          </button>
        </div>
      )}

      {showModal && (
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
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              width: '900px',
              maxHeight: '80%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e7d32', marginBottom: '10px' }}>
              Add Products
            </h3>
            <div
              style={{
                flex: '1',
                overflowY: 'auto',
                marginBottom: '10px',
                border: '1px solid #ccc',
                padding: '10px',
                borderRadius: '4px',
                backgroundColor: '#f1f8e9'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#a5d6a7' }}>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>Product Name</th>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>Stock</th>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>Threshold</th>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>Cost</th>
                    <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {newProducts.map((product, index) => (
                    <tr key={index} style={{ backgroundColor: '#c8e6c9' }}>
                      <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                        <input
                          type="text"
                          placeholder="Product Name"
                          value={product.productName}
                          onChange={(e) => handleNewProductChange(index, 'productName', e.target.value)}
                          style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                        />
                      </td>
                      <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                        <input
                          type="number"
                          placeholder="Stock"
                          value={product.Stock}
                          onChange={(e) => handleNewProductChange(index, 'Stock', e.target.value)}
                          style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                        />
                      </td>
                      <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                        <input
                          type="number"
                          placeholder="Threshold"
                          value={product.Threshold}
                          onChange={(e) => handleNewProductChange(index, 'Threshold', e.target.value)}
                          style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                        />
                      </td>
                      <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                        <input
                          type="number"
                          placeholder="Cost"
                          value={product.Cost}
                          onChange={(e) => handleNewProductChange(index, 'Cost', e.target.value)}
                          style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                        />
                      </td>
                      <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                        {newProducts.length > 1 && (
                          <button 
                            onClick={() => handleDeleteNewProductRow(index)}
                            style={negativeButtonStyle}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={handleAddProductRow} style={positiveButtonStyle}>
                Add Another
              </button>
              <button onClick={saveNewProducts} style={positiveButtonStyle}>
                Save
              </button>
              <button onClick={() => setShowModal(false)} style={negativeButtonStyle}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
