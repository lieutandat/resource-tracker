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

export async function getGoldPrice(brand, quantityType, transactionType) {
  try {
    const key = await getApiKey();
    const response = await fetch(`${API_BASE}/api/v2/gold/${brand}`, {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const latest = data.results[0];
      
      if (brand === 'sjc') {
        if (quantityType === 'chi') {
          return transactionType === 'buy' ? latest.sell_nhan1c : latest.buy_nhan1c;
        } else {
          return transactionType === 'buy' ? latest.sell_1l : latest.buy_1l;
        }
      } else if (brand === 'doji' || brand === 'pnj') {
        return transactionType === 'buy' ? latest.sell_hcm : latest.buy_hcm;
      }
    }
    return 0;
  } catch (error) {
    console.error('Gold API error:', error);
    return 0;
  }
}