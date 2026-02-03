import { getGoldPrice } from './goldApi.js';

export async function createGoldPriceDisplay() {
  try {
    const chiBuy = await getGoldPrice('sjc', 'chi', 'buy');
    const chiSell = await getGoldPrice('sjc', 'chi', 'sell');
    const luongBuy = await getGoldPrice('sjc', 'luong', 'buy');
    const luongSell = await getGoldPrice('sjc', 'luong', 'sell');
    const dojiBuy = await getGoldPrice('doji', 'luong', 'buy');
    const dojiSell = await getGoldPrice('doji', 'luong', 'sell');
    const pnjBuy = await getGoldPrice('pnj', 'luong', 'buy');
    const pnjSell = await getGoldPrice('pnj', 'luong', 'sell');
    
    return `
      <div class="card p-4 mb-6">
        <h3 class="text-lg font-bold text-gray-800 mb-3">📈 Current Gold Prices</h3>
        <div class="space-y-3">
          <div class="bg-yellow-50 p-3 rounded-lg">
            <div class="text-sm font-semibold text-yellow-800 mb-2">SJC</div>
            <div class="grid grid-cols-2 gap-2 text-xs">
              <div>Chỉ: <span class="text-green-600">${(chiBuy || 0).toLocaleString()}</span> / <span class="text-red-600">${(chiSell || 0).toLocaleString()}</span></div>
              <div>Lượng: <span class="text-green-600">${(luongBuy || 0).toLocaleString()}</span> / <span class="text-red-600">${(luongSell || 0).toLocaleString()}</span></div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-blue-50 p-3 rounded-lg">
              <div class="text-sm font-semibold text-blue-800 mb-1">DOJI</div>
              <div class="text-xs">Lượng: <span class="text-green-600">${(dojiBuy || 0).toLocaleString()}</span> / <span class="text-red-600">${(dojiSell || 0).toLocaleString()}</span></div>
            </div>
            <div class="bg-purple-50 p-3 rounded-lg">
              <div class="text-sm font-semibold text-purple-800 mb-1">PNJ</div>
              <div class="text-xs">Lượng: <span class="text-green-600">${(pnjBuy || 0).toLocaleString()}</span> / <span class="text-red-600">${(pnjSell || 0).toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    return '';
  }
}