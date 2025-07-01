// Simple script to reset localStorage and sessionStorage
console.log('🧹 SYSTEM CLEAR INITIATED');
console.log('Cleaning localStorage and sessionStorage...');

// List all keys in localStorage
console.log('Current localStorage keys:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`- ${key}`);
}

// Clear localStorage
localStorage.clear();
console.log('localStorage cleared');

// Clear sessionStorage
sessionStorage.clear();
console.log('sessionStorage cleared');

console.log('✅ Storage cleared successfully');
console.log('You can now refresh the page to start with a clean state');