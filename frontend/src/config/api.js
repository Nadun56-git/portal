// Central API URL — automatically uses VITE_API_URL in production
// Set VITE_API_URL in your .env or on Vercel/Netlify dashboard
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001'

export default API_URL
