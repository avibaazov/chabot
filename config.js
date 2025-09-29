// Auto-detect API base URL
const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:5000'     // Local development
    : window.location.origin;     // Production (same domain)

// Make it available globally
window.API_BASE_URL = API_BASE_URL;