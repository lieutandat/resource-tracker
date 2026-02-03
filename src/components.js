import { storage } from './storage.js';

export function createHeader(title, showBack = false) {
  return `
    <header class="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 shadow-2xl">
      <div class="flex items-center gap-4 max-w-4xl mx-auto">
        ${showBack ? '<button id="back-btn" class="text-2xl hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200">←</button>' : ''}
        <h1 class="text-2xl font-bold">${title}</h1>
      </div>
    </header>
  `;
}

export function createResourceCard(type, data, brandBreakdown = null, goldPrices = null) {
  const profit = data.profit || 0;
  const profitClass = profit >= 0 ? 'profit-positive' : 'profit-negative';
  const icons = {
    house: '🏠',
    gold: '🪙',
    coin: '🪙',
    stock: '📈'
  };
  
  return `
    <div class="card p-6 cursor-pointer" data-type="${type}">
      <div class="flex items-center gap-3 mb-4">
        <span class="text-3xl">${icons[type] || '💼'}</span>
        <h3 class="text-xl font-bold capitalize text-gray-800">${type}</h3>
      </div>
      ${type === 'gold' && goldPrices ? `
        <div class="bg-yellow-50 p-3 rounded-lg mb-4">
          <div class="text-xs text-yellow-600 font-semibold uppercase tracking-wide mb-2">Current Prices</div>
          <div class="space-y-1 text-xs">
            <div>SJC Chỉ: <span class="text-green-600">${Number(goldPrices.sjc.chiBuy || 0).toLocaleString()}</span> / <span class="text-red-600">${Number(goldPrices.sjc.chiSell || 0).toLocaleString()}</span></div>
            <div>SJC Lượng: <span class="text-green-600">${Number(goldPrices.sjc.luongBuy || 0).toLocaleString()}</span> / <span class="text-red-600">${Number(goldPrices.sjc.luongSell || 0).toLocaleString()}</span></div>
            <div>DOJI: <span class="text-green-600">${Number(goldPrices.doji.buy || 0).toLocaleString()}</span> / <span class="text-red-600">${Number(goldPrices.doji.sell || 0).toLocaleString()}</span></div>
            <div>PNJ: <span class="text-green-600">${Number(goldPrices.pnj.buy || 0).toLocaleString()}</span> / <span class="text-red-600">${Number(goldPrices.pnj.sell || 0).toLocaleString()}</span></div>
          </div>
        </div>
      ` : ''}
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Quantity</span>
          <span class="font-semibold text-gray-800">${data.quantity}</span>
        </div>
        ${(type === 'gold' || type === 'coin') && brandBreakdown ? `
          <div class="bg-gray-50 p-3 rounded-lg">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-2">${type === 'gold' ? 'Quantity Type' : 'Coin'}</div>
            ${Object.entries(brandBreakdown).map(([brand, qty]) => 
              `<div class="flex justify-between text-sm">
                <span>${brand.toUpperCase()}</span>
                <span class="font-medium">${qty}</span>
              </div>`
            ).join('')}
          </div>
        ` : ''}
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Origin Value</span>
          <span class="font-semibold text-gray-800">${data.originValue.toLocaleString()} VND</span>
        </div>
        ${type !== 'gold' ? `
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Current Value</span>
            <span class="font-semibold text-gray-800">${data.currentValue.toLocaleString()} VND</span>
          </div>
        ` : ''}
        <div class="flex justify-between items-center pt-2 border-t">
          <span class="text-gray-600 font-medium">Profit</span>
          <span class="${profitClass}">${profit >= 0 ? '+' : ''}${profit.toLocaleString()} VND</span>
        </div>
      </div>
    </div>
  `;
}

export function createResourceList(resources) {
  return resources.map(r => `
    <div class="card p-5 mb-4">
      <div class="flex justify-between items-start mb-4">
        <div class="flex items-center gap-2">
          <span class="text-blue-500">📅</span>
          <span class="text-sm text-gray-600 font-medium">${new Date(r.date).toLocaleDateString()}</span>
          ${r.brand ? `<span class="bg-blue-100 px-2 py-1 rounded text-xs font-medium text-blue-800">${r.brand.toUpperCase()}</span>` : ''}
          ${r.quantityType ? `<span class="bg-green-100 px-2 py-1 rounded text-xs font-medium text-green-800">${r.quantityType === 'chi' ? 'Chỉ' : 'Lượng'}</span>` : ''}
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-50 p-3 rounded-lg">
          <div class="text-xs text-gray-500 uppercase tracking-wide">Quantity</div>
          <div class="font-semibold text-gray-800">${r.quantity}</div>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg">
          <div class="text-xs text-gray-500 uppercase tracking-wide">Purchase Price</div>
          <div class="font-semibold text-gray-800">${r.originValue.toLocaleString()} VND</div>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg col-span-2">
          <div class="text-xs text-gray-500 uppercase tracking-wide">Total Cost</div>
          <div class="font-semibold text-gray-800">${(r.originValue * r.quantity).toLocaleString()} VND</div>
        </div>
      </div>
    </div>
  `).join('');
}

export function createSellList(sells) {
  return sells.map(s => `
    <div class="card p-5 mb-4 border-l-4 border-red-400">
      <div class="flex justify-between items-start mb-4">
        <div class="flex items-center gap-2">
          <span class="text-red-500">💸</span>
          <span class="text-sm text-gray-600 font-medium">${new Date(s.date).toLocaleDateString()}</span>
          ${s.brand ? `<span class="bg-gray-200 px-2 py-1 rounded text-xs font-medium">${s.brand.toUpperCase()}</span>` : ''}
          ${s.quantityType ? `<span class="bg-green-100 px-2 py-1 rounded text-xs font-medium text-green-800">${s.quantityType === 'chi' ? 'Chỉ' : 'Lượng'}</span>` : ''}
        </div>
        <div class="text-red-600 bg-red-50 px-2 py-1 rounded-full text-sm font-semibold">
          -${s.quantity} sold
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-50 p-3 rounded-lg">
          <div class="text-xs text-gray-500 uppercase tracking-wide">Quantity Sold</div>
          <div class="font-semibold text-gray-800">${s.quantity}</div>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg">
          <div class="text-xs text-gray-500 uppercase tracking-wide">Sell Price</div>
          <div class="font-semibold text-gray-800">${s.sellPrice.toLocaleString()} VND</div>
        </div>
        <div class="bg-gray-50 p-3 rounded-lg col-span-2">
          <div class="text-xs text-gray-500 uppercase tracking-wide">Total Revenue</div>
          <div class="font-semibold text-gray-800">${(s.sellPrice * s.quantity).toLocaleString()} VND</div>
        </div>
      </div>
    </div>
  `).join('');
}

export function createSellForm(type, remaining = {}) {
  return `
    <form id="sell-form" class="card p-6 space-y-6">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-2xl">💰</span>
        <h3 class="text-xl font-bold text-gray-800 capitalize">Sell ${type}</h3>
      </div>
      <div class="space-y-4">
        ${type === 'gold' ? `
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">⚖️ Quantity Type</label>
            <select name="quantityType" required class="input-field">
              <option value="">Select type</option>
              <option value="chi">Chỉ</option>
              <option value="luong">Lượng</option>
            </select>
          </div>
        ` : ''}
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">🔢 Quantity to Sell</label>
          <input type="number" step="0.01" name="quantity" required class="input-field" placeholder="Enter quantity">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">💵 Sell Price (VND)</label>
          <input type="number" step="1" name="sellPrice" required class="input-field" placeholder="Sell price">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">📅 Date</label>
          <input type="date" name="date" class="input-field" value="${new Date().toISOString().split('T')[0]}">
        </div>
      </div>
      <button type="submit" class="btn-primary w-full">
        💸 Record Sale
      </button>
    </form>
  `;
}

export function createAddForm(type) {
  const icons = {
    house: '🏠',
    gold: '🪙',
    coin: '🪙',
    stock: '📈'
  };
  
  return `
    <form id="add-form" class="card p-6 space-y-6">
      <div class="flex items-center gap-3 mb-2">
        <span class="text-2xl">${icons[type] || '💼'}</span>
        <h3 class="text-xl font-bold text-gray-800 capitalize">Add New ${type}</h3>
      </div>
      <div class="space-y-4">
        ${type === 'gold' ? `
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">⚖️ Quantity Type</label>
            <select name="quantityType" required class="input-field">
              <option value="">Select type</option>
              <option value="chi">Chỉ</option>
              <option value="luong">Lượng</option>
            </select>
          </div>
        ` : ''}
        ${type === 'coin' ? `
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">🪙 Coin Symbol</label>
            <input type="text" name="brand" required class="input-field" placeholder="BTC, ETH, BNB..." style="text-transform: uppercase;">
          </div>
        ` : ''}
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">🔢 Quantity</label>
          <input type="number" step="0.01" name="quantity" required class="input-field" placeholder="Enter quantity">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">💰 Origin Value (VND)</label>
          <input type="number" step="1" name="originValue" required class="input-field" placeholder="Purchase price">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">📅 Date</label>
          <input type="date" name="date" class="input-field" value="${new Date().toISOString().split('T')[0]}">
        </div>
      </div>
      <button type="submit" class="btn-primary w-full">
        ➕ Add ${type.charAt(0).toUpperCase() + type.slice(1)}
      </button>
    </form>
  `;
}