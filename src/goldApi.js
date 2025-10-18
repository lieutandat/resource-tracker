const API_BASE = 'https://api.vnappmob.com';

async function getApiKey() {
  const stored = localStorage.getItem('gold-api-data');
  if (stored) {
    const { key, expiry } = JSON.parse(stored);
    if (Date.now() < expiry) return key;
  }
  
  const response = await fetch(`${API_BASE}/api/request_api_key?scope=gold`);
  const data = await response.json();
  const apiKey = data.results;
  const expiry = Date.now() + (15 * 24 * 60 * 60 * 1000);
  localStorage.setItem('gold-api-data', JSON.stringify({ key: apiKey, expiry }));
  return apiKey;
}

export async function getGoldPrice(brand) {
  try {
    const key = await getApiKey();
    const response = await fetch(`${API_BASE}/api/v2/gold/${brand}`, {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const latest = data.results[0];
      if (brand === 'pnj') return latest.buy_nhan_24k || 0;
      return latest.buy_1l || latest.buy_hcm || 0;
    }
    return 0;
  } catch (error) {
    console.error('Gold API error:', error);
    return 0;
  }
}