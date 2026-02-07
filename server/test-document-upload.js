import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function testDocumentUpload() {
  try {
    console.log('🔍 Testing hospital document upload endpoint...');
    
    // Create a test file
    const testFilePath = path.join(process.cwd(), 'test-document.txt');
    fs.writeFileSync(testFilePath, 'This is a test document for hospital upload.');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('type', 'license');
    
    const response = await fetch('http://localhost:5000/api/hospital/upload-document', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        ...formData.getHeaders()
      },
      body: formData
    });

    console.log('📡 Upload response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Upload successful:', data);
    } else {
      const errorData = await response.text();
      console.log('❌ Upload error:', errorData);
    }
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
  } catch (error) {
    console.error('❌ Error testing upload:', error);
  }
}

testDocumentUpload(); 