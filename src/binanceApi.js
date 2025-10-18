export async function getCoinPrice(symbol) {
  try {
    const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol.toUpperCase()}USDT`);
    const data = await response.json();
    return parseFloat(data.price) || 0;
  } catch (error) {
    console.error('Binance API error:', error);
    return 0;
  }
}