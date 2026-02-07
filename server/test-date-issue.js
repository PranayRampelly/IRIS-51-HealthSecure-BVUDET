// Test script to check date initialization
console.log('🔍 Testing date initialization...');

// Test 1: Check current date
const now = new Date();
console.log('Current date:', now.toISOString());
console.log('Current date string:', now.toISOString().split('T')[0]);

// Test 2: Check August dates
const aug17 = new Date(2025, 7, 17); // August 17th
const aug21 = new Date(2025, 7, 21); // August 21st
const aug22 = new Date(2025, 7, 22); // August 22nd
const aug23 = new Date(2025, 7, 23); // August 23rd

console.log('August 17th:', aug17.toISOString().split('T')[0]);
console.log('August 21st:', aug21.toISOString().split('T')[0]);
console.log('August 22nd:', aug22.toISOString().split('T')[0]);
console.log('August 23rd:', aug23.toISOString().split('T')[0]);

// Test 3: Check date comparison
console.log('Aug 17 is today?', aug17.toDateString() === new Date().toDateString());
console.log('Aug 21 is today?', aug21.toDateString() === new Date().toDateString());
console.log('Aug 22 is today?', aug22.toDateString() === new Date().toDateString());
console.log('Aug 23 is today?', aug23.toDateString() === new Date().toDateString());

// Test 4: Check ISO string comparison
console.log('Aug 17 ISO comparison:', aug17.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]);
console.log('Aug 21 ISO comparison:', aug21.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]);
console.log('Aug 22 ISO comparison:', aug22.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]);
console.log('Aug 23 ISO comparison:', aug23.toISOString().split('T')[0] === new Date().toISOString().split('T')[0]);


