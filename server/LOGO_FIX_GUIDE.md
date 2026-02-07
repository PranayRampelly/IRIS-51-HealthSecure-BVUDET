# 🔧 Logo Functionality Fix Guide

## Problem Identified
The logo placeholder icon in your supplier directory indicates that the logo upload/display functionality isn't working properly.

## ✅ Solutions Implemented

### 1. **Dedicated Logo Controller** (`src/controllers/logoController.js`)
Created specialized endpoints for logo management:
- `uploadSupplierLogo` - Upload new logo
- `updateSupplierLogo` - Replace existing logo
- `getSupplierLogo` - Get logo information
- `deleteSupplierLogo` - Remove logo

### 2. **New API Endpoints**
```
POST   /pharmacy/suppliers/:id/logo    # Upload logo
PUT    /pharmacy/suppliers/:id/logo    # Update logo
GET    /pharmacy/suppliers/:id/logo    # Get logo info
DELETE /pharmacy/suppliers/:id/logo    # Delete logo
```

### 3. **Enhanced Error Handling**
- Proper validation for file uploads
- Cloudinary error handling
- Automatic cleanup of old logos

## 🚀 Frontend Integration

### 1. **Upload Logo Function**
```javascript
const uploadSupplierLogo = async (supplierId, logoFile) => {
  try {
    const formData = new FormData();
    formData.append('logo', logoFile);

    const response = await fetch(`/pharmacy/suppliers/${supplierId}/logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Logo uploaded successfully:', data.data.logo.cloudinaryUrl);
      return data.data.logo;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Logo upload failed:', error);
    throw error;
  }
};
```

### 2. **Update Logo Function**
```javascript
const updateSupplierLogo = async (supplierId, logoFile) => {
  try {
    const formData = new FormData();
    formData.append('logo', logoFile);

    const response = await fetch(`/pharmacy/suppliers/${supplierId}/logo`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Logo updated successfully:', data.data.logo.cloudinaryUrl);
      return data.data.logo;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Logo update failed:', error);
    throw error;
  }
};
```

### 3. **Get Logo Function**
```javascript
const getSupplierLogo = async (supplierId) => {
  try {
    const response = await fetch(`/pharmacy/suppliers/${supplierId}/logo`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      return data.data.logo;
    } else {
      return null; // No logo found
    }
  } catch (error) {
    console.error('Failed to get logo:', error);
    return null;
  }
};
```

### 4. **Delete Logo Function**
```javascript
const deleteSupplierLogo = async (supplierId) => {
  try {
    const response = await fetch(`/pharmacy/suppliers/${supplierId}/logo`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Logo deleted successfully');
      return true;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Logo deletion failed:', error);
    throw error;
  }
};
```

## 🎨 React Component Example

### Logo Upload Component
```jsx
import React, { useState } from 'react';

const LogoUpload = ({ supplierId, currentLogo, onLogoUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentLogo?.cloudinaryUrl || null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    const file = event.target.logo.files[0];
    
    if (!file) {
      alert('Please select a logo file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch(`/pharmacy/suppliers/${supplierId}/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setPreview(data.data.logo.cloudinaryUrl);
        onLogoUpdate(data.data.logo);
        alert('Logo uploaded successfully!');
      } else {
        alert(`Upload failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="logo-upload">
      <div className="logo-preview">
        {preview ? (
          <img 
            src={preview} 
            alt="Supplier Logo" 
            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
          />
        ) : (
          <div className="logo-placeholder">
            <span>No Logo</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleUpload}>
        <input
          type="file"
          name="logo"
          accept="image/*"
          onChange={handleFileChange}
          required
        />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Logo'}
        </button>
      </form>
    </div>
  );
};

export default LogoUpload;
```

### Supplier List Component with Logo Display
```jsx
import React, { useState, useEffect } from 'react';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/pharmacy/suppliers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpdate = (supplierId, newLogo) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier._id === supplierId 
        ? { ...supplier, logo: newLogo }
        : supplier
    ));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="supplier-list">
      <table>
        <thead>
          <tr>
            <th>Supplier</th>
            <th>Contact</th>
            <th>MOQ</th>
            <th>Lead Time</th>
            <th>Rating</th>
            <th>Preferred</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(supplier => (
            <tr key={supplier._id}>
              <td>
                <div className="supplier-info">
                  {supplier.logo?.cloudinaryUrl ? (
                    <img 
                      src={supplier.logo.cloudinaryUrl} 
                      alt={`${supplier.name} logo`}
                      className="supplier-logo"
                    />
                  ) : (
                    <div className="logo-placeholder">
                      <span>No Logo</span>
                    </div>
                  )}
                  <span>{supplier.name}</span>
                  <span>{supplier.city}</span>
                </div>
              </td>
              <td>{supplier.contactName}</td>
              <td>{supplier.minOrderQuantity}</td>
              <td>{supplier.leadTimeDays} days</td>
              <td>{supplier.rating}</td>
              <td>{supplier.isPreferred ? 'Yes' : 'No'}</td>
              <td>
                <button onClick={() => {/* Edit logic */}}>Edit</button>
                <LogoUpload 
                  supplierId={supplier._id}
                  currentLogo={supplier.logo}
                  onLogoUpdate={(newLogo) => handleLogoUpdate(supplier._id, newLogo)}
                />
                <button onClick={() => {/* Delete logic */}}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierList;
```

## 🧪 Testing

### Run Logo Test
```bash
cd HealthSecure/server
node test-logo-functionality.js
```

### Manual API Testing
```bash
# Upload logo
curl -X POST http://localhost:8080/pharmacy/suppliers/SUPPLIER_ID/logo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "logo=@/path/to/logo.jpg"

# Get logo
curl -X GET http://localhost:8080/pharmacy/suppliers/SUPPLIER_ID/logo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Delete logo
curl -X DELETE http://localhost:8080/pharmacy/suppliers/SUPPLIER_ID/logo \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔍 Troubleshooting

### Common Issues and Solutions

1. **Logo not displaying**
   - Check if `supplier.logo.cloudinaryUrl` exists
   - Verify Cloudinary URL is accessible
   - Check browser console for CORS errors

2. **Upload failing**
   - Verify file size is under 10MB
   - Check file type is image (jpg, png, gif, webp)
   - Ensure JWT token is valid

3. **CORS issues**
   - Add Cloudinary domain to CORS settings
   - Check if Cloudinary URL is HTTPS

4. **Authentication errors**
   - Verify JWT token is included in headers
   - Check if token is expired
   - Ensure user has pharmacy role

## 📝 CSS for Logo Display

```css
.supplier-logo {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.logo-placeholder {
  width: 50px;
  height: 50px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #999;
}

.logo-upload {
  display: inline-block;
}

.logo-upload input[type="file"] {
  margin-right: 10px;
}

.logo-upload button {
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logo-upload button:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}
```

## ✅ Implementation Complete

The logo functionality is now fully implemented with:
- ✅ Dedicated logo endpoints
- ✅ Proper error handling
- ✅ Cloudinary integration
- ✅ Frontend examples
- ✅ Test scripts
- ✅ Troubleshooting guide

Your logo upload and display should now work perfectly! 🎉

