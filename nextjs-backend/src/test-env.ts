import dotenv from 'dotenv';
dotenv.config();

console.log('🔍 Environment Variables Check:');
console.log('JWT_ACCESS_SECRET:', process.env.JWT_ACCESS_SECRET ? '✅ Set' : '❌ Not set');
console.log('JWT_REFRESH_SECRET:', process.env.JWT_REFRESH_SECRET ? '✅ Set' : '❌ Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Check if secrets meet minimum length
if (process.env.JWT_ACCESS_SECRET) {
  console.log('ACCESS_SECRET length:', process.env.JWT_ACCESS_SECRET.length);
}
if (process.env.JWT_REFRESH_SECRET) {
  console.log('REFRESH_SECRET length:', process.env.JWT_REFRESH_SECRET.length);
}