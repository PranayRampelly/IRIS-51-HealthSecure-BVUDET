import React, { useState } from 'react';

const SubmitClaimMinimal: React.FC = () => {
  const [count, setCount] = useState(0);

  const handleSaveDraft = () => {
    console.log('Save Draft clicked!');
    setCount(prev => prev + 1);
    alert('Save Draft clicked! Count: ' + (count + 1));
  };

  const handleSubmitClaim = () => {
    console.log('Submit Claim clicked!');
    alert('Submit Claim clicked!');
  };

  return (
    <div className="p-8 bg-white">
      <h1 className="text-2xl mb-4">Submit Claim - Minimal Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <p>This is a minimal test version to isolate the button click issue.</p>
          <p>Count: {count}</p>
        </div>
        
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSaveDraft}
        >
          Save Draft (Count: {count})
        </button>
        
        <button 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={handleSubmitClaim}
        >
          Submit Claim
        </button>
        
        <button 
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => {
            console.log('Test button clicked');
            alert('Test button works!');
          }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default SubmitClaimMinimal; 