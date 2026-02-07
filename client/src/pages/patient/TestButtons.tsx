import React, { useState } from 'react';

const TestButtons: React.FC = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log('Button clicked!');
    setCount(prev => prev + 1);
    alert('Button works! Count: ' + (count + 1));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Button Test</h1>
      
      <div className="space-y-4">
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handleClick}
        >
          Test Button (Count: {count})
        </button>
        
        <button 
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={() => {
            console.log('Green button clicked');
            alert('Green button works!');
          }}
        >
          Green Button
        </button>
        
        <div className="p-4 bg-gray-100 rounded">
          <p>If you can see this and click the buttons, the issue is in the SubmitClaim component.</p>
          <p>Current count: {count}</p>
        </div>
      </div>
    </div>
  );
};

export default TestButtons; 