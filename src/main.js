import './style.css';
import './install-prompt.js';
import { Router } from './router.js';
import { storage } from './storage.js';
import { createHeader, createResourceCard, createResourceList, createAddForm, createSellForm, createSellList } from './components.js';
import { getGoldPrice } from './goldApi.js';
import { getCoinPrice } from './binanceApi.js';
import { formatCurrency } from './utils.js';
import { createGoldPriceDisplay } from './goldPriceDisplay.js';

const app = document.getElementById('app');
const router = new Router();

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(registration => {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          if (confirm('New version available! Reload to update?')) {
            window.location.reload();
          }
        }
      });
    });
  });
}

async function renderHome() {
  // Update gold prices
  const goldResources = storage.getResourcesByType('gold');
  if (goldResources.length > 0) {
    const updates = { gold: {} };
    for (const resource of goldResources) {
      if (resource.brand && resource.quantityType) {
        const key = `${resource.brand}_${resource.quantityType}`;
        updates.gold[key] = await getGoldPrice(resource.brand, resource.quantityType, 'sell');
      }
    }
    storage.updateCurrentValues(updates);
  }
  
  // Update coin prices
  const coinResources = storage.getResourcesByType('coin');
  if (coinResources.length > 0) {
    const updates = { coin: {} };
    const coins = [...new Set(coinResources.map(r => r.brand).filter(Boolean))];
    for (const coin of coins) {
      updates.coin[coin] = await getCoinPrice(coin);
    }
    storage.updateCurrentValues(updates);
  }
  
  const totals = storage.getTotalsByType();
  const types = Object.keys(totals);
  const totalPortfolioValue = Object.values(totals).reduce((sum, t) => sum + t.currentValue, 0);
  const totalProfit = Object.values(totals).reduce((sum, t) => sum + t.profit, 0);
  
  app.innerHTML = `
    ${createHeader('💼 Resource Tracker')}
    <main class="max-w-4xl mx-auto p-6 space-y-6">
      ${types.length === 0 ? `
        <div class="card p-8 text-center">
          <div class="text-6xl mb-4">🚀</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Welcome to Resource Tracker!</h2>
          <p class="text-gray-600 mb-6">Start building your investment portfolio by adding your first resource.</p>
          <div class="grid grid-cols-2 gap-3 max-w-md mx-auto">
            ${['house', 'gold', 'coin', 'stock'].map(type => {
              const icons = { house: '🏠', gold: '🪙', coin: '🪙', stock: '📈' };
              return `<button class="btn-primary flex items-center justify-center gap-2 p-4" data-type="${type}">
                <span class="text-xl">${icons[type]}</span>
                <span>${type.charAt(0).toUpperCase() + type.slice(1)}</span>
              </button>`;
            }).join('')}
          </div>
        </div>
      ` : `
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${await Promise.all(types.map(async type => {
            const brandBreakdown = (type === 'gold' || type === 'coin') ? storage.getRemainingQuantityByBrand(type) : null;
            let goldPrices = null;
            if (type === 'gold') {
              goldPrices = {
                sjc: {
                  chiBuy: await getGoldPrice('sjc', 'chi', 'buy'),
                  chiSell: await getGoldPrice('sjc', 'chi', 'sell'),
                  luongBuy: await getGoldPrice('sjc', 'luong', 'buy'),
                  luongSell: await getGoldPrice('sjc', 'luong', 'sell')
                },
                doji: {
                  buy: await getGoldPrice('doji', null, 'buy'),
                  sell: await getGoldPrice('doji', null, 'sell')
                },
                pnj: {
                  buy: await getGoldPrice('pnj', null, 'buy'),
                  sell: await getGoldPrice('pnj', null, 'sell')
                }
              };
            }
            return createResourceCard(type, totals[type], brandBreakdown, goldPrices);
          })).then(cards => cards.join(''))}
        </div>
        <div class="fixed bottom-6 right-6">
          <button id="add-menu-btn" class="btn-primary rounded-full w-14 h-14 flex items-center justify-center text-2xl shadow-2xl">
            ➕
          </button>
          <div id="add-menu" class="hidden absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-4 min-w-48">
            <h4 class="font-semibold text-gray-800 mb-3">Add Resource</h4>
            <div class="space-y-2">
              ${['house', 'gold', 'coin', 'stock'].filter(t => !types.includes(t)).map(type => {
                const icons = { house: '🏠', gold: '🪙', coin: '🪙', stock: '📈' };
                return `<button class="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center gap-2" data-type="${type}">
                  <span>${icons[type]}</span>
                  <span class="capitalize">${type}</span>
                </button>`;
              }).join('')}
            </div>
          </div>
        </div>
      `}
      <div class="card p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">📁 Data Management</h3>
        <div class="flex gap-3 mb-3">
          <button id="export-btn" class="btn-secondary flex-1">📤 Export Data</button>
          <button id="import-file-btn" class="btn-secondary flex-1">📁 Import File</button>
          <button id="import-text-btn" class="btn-secondary flex-1">📝 Import Text</button>
        </div>
        <input type="file" id="import-file" accept=".json" class="hidden">
        <div id="export-container" class="hidden mt-3">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700">Export Data (copied to clipboard)</span>
            <button id="close-export" class="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <textarea id="export-data" class="w-full p-3 border rounded-lg" rows="10" readonly></textarea>
        </div>
        <div id="import-container" class="hidden mt-3">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700">Paste JSON Data</span>
            <button id="close-import" class="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <textarea id="import-text" class="w-full p-3 border rounded-lg" rows="10" placeholder="Paste JSON data here..."></textarea>
        </div>
        <div id="import-options" class="hidden mt-3 p-3 bg-gray-50 rounded-lg">
          <p class="text-sm text-gray-600 mb-3">Choose import method:</p>
          <div class="flex gap-2">
            <button id="import-replace" class="btn-primary flex-1">🔄 Replace All Data</button>
            <button id="import-combine" class="btn-secondary flex-1">➕ Combine with Current</button>
          </div>
        </div>
      </div>
    </main>
  `;

  // Add event listeners
  app.querySelectorAll('[data-type]').forEach(el => {
    el.addEventListener('click', () => {
      router.navigate(`/${el.dataset.type}`);
    });
  });
  
  // Add menu toggle
  const addMenuBtn = document.getElementById('add-menu-btn');
  const addMenu = document.getElementById('add-menu');
  if (addMenuBtn && addMenu) {
    addMenuBtn.addEventListener('click', () => {
      addMenu.classList.toggle('hidden');
    });
    
    document.addEventListener('click', (e) => {
      if (!addMenuBtn.contains(e.target) && !addMenu.contains(e.target)) {
        addMenu.classList.add('hidden');
      }
    });
  }
  
  // Export/Import handlers
  document.getElementById('export-btn')?.addEventListener('click', () => {
    const exportContainer = document.getElementById('export-container');
    const exportData = document.getElementById('export-data');
    exportData.value = storage.exportData();
    exportContainer.classList.remove('hidden');
    exportData.select();
    navigator.clipboard.writeText(exportData.value);
  });
  
  document.getElementById('close-export')?.addEventListener('click', () => {
    document.getElementById('export-container').classList.add('hidden');
  });
  
  document.getElementById('import-file-btn')?.addEventListener('click', () => {
    document.getElementById('import-file').click();
  });
  
  document.getElementById('import-text-btn')?.addEventListener('click', () => {
    const importContainer = document.getElementById('import-container');
    const textArea = document.getElementById('import-text');
    importContainer.classList.remove('hidden');
    textArea.focus();
  });
  
  document.getElementById('close-import')?.addEventListener('click', () => {
    const importContainer = document.getElementById('import-container');
    const importText = document.getElementById('import-text');
    importContainer.classList.add('hidden');
    importText.value = '';
    document.getElementById('import-options').classList.add('hidden');
  });
  
  let importData = null;
  
  document.getElementById('import-file')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        importData = e.target.result;
        document.getElementById('import-options').classList.remove('hidden');
      };
      reader.readAsText(file);
    }
  });
  
  document.getElementById('import-text')?.addEventListener('input', (e) => {
    if (e.target.value.trim()) {
      importData = e.target.value;
      document.getElementById('import-options').classList.remove('hidden');
    }
  });
  
  document.getElementById('import-replace')?.addEventListener('click', () => {
    if (importData && storage.importData(importData, false)) {
      renderHome();
    } else {
      alert('Invalid JSON data');
    }
  });
  
  document.getElementById('import-combine')?.addEventListener('click', () => {
    if (importData && storage.importData(importData, true)) {
      renderHome();
    } else {
      alert('Invalid JSON data');
    }
  });
}

async function renderResourceDetail(type) {
  const resources = storage.getResourcesByType(type);
  const sells = storage.getSellsByType(type);
  const remaining = type === 'gold' ? storage.getRemainingQuantityByBrand(type) : {};
  const icons = { house: '🏠', gold: '🪙', coin: '🪙', stock: '📈' };
  
  app.innerHTML = `
    ${createHeader(`${icons[type] || '💼'} ${type.charAt(0).toUpperCase() + type.slice(1)}`, true)}
    <main class="max-w-4xl mx-auto p-6 space-y-6">
      <div class="grid md:grid-cols-2 gap-6">
        ${createAddForm(type)}
        ${type === 'gold' ? createSellForm(type, remaining) : ''}
      </div>
      ${type === 'gold' ? `
        <div class="card p-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-2xl">🧮</span>
            <h3 class="text-xl font-bold text-gray-800">Price Calculator</h3>
          </div>
          <div class="grid md:grid-cols-2 gap-4 mb-4">
            ${(remaining.chi > 0) ? `
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Chỉ Price (VND)</label>
                <input type="number" id="calc-chi-price" class="input-field" placeholder="Enter Chỉ price">
                <div class="text-xs text-gray-500 mt-1">Your quantity: ${remaining.chi}</div>
              </div>
            ` : ''}
            ${(remaining.luong > 0) ? `
              <div class="bg-gray-50 p-4 rounded-lg">
                <label class="block text-sm font-semibold text-gray-700 mb-2">Lượng Price (VND)</label>
                <input type="number" id="calc-luong-price" class="input-field" placeholder="Enter Lượng price">
                <div class="text-xs text-gray-500 mt-1">Your quantity: ${remaining.luong}</div>
              </div>
            ` : ''}
          </div>
          <div class="grid md:grid-cols-3 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-sm text-blue-600 font-semibold uppercase tracking-wide mb-1">Current Value</div>
              <div id="calc-current-value" class="text-xl font-bold text-blue-800">0 VND</div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600 font-semibold uppercase tracking-wide mb-1">Origin Value</div>
              <div id="calc-origin-value" class="text-xl font-bold text-gray-800">0 VND</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-sm text-green-600 font-semibold uppercase tracking-wide mb-1">Profit</div>
              <div id="calc-profit" class="text-xl font-bold text-green-800">0 VND</div>
            </div>
          </div>
        </div>
      ` : ''}
      <div class="card p-6">
        <button class="flex items-center justify-between w-full mb-4" id="toggle-purchases">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📅</span>
            <h3 class="text-xl font-bold text-gray-800">Purchase History</h3>
          </div>
          <span class="text-gray-500">▼</span>
        </button>
        <div id="purchases-content">
          ${resources.length === 0 ? 
            '<div class="text-center py-8"><div class="text-4xl mb-2">📊</div><p class="text-gray-500">No purchases yet. Add your first investment above!</p></div>' : 
            createResourceList(resources)
          }
        </div>
      </div>
      ${(type === 'gold' || type === 'coin') && sells.length > 0 ? `
        <div class="card p-6">
          <button class="flex items-center justify-between w-full mb-4" id="toggle-sales">
            <div class="flex items-center gap-3">
              <span class="text-2xl">💸</span>
              <h3 class="text-xl font-bold text-gray-800">Sales History</h3>
            </div>
            <span class="text-gray-500">▼</span>
          </button>
          <div id="sales-content">
            ${createSellList(sells)}
          </div>
        </div>
      ` : ''}
    </main>
  `;

  // Add event listeners
  document.getElementById('back-btn')?.addEventListener('click', () => {
    router.navigate('/');
  });

  document.getElementById('add-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const quantityType = formData.get('quantityType');
    const brand = formData.get('brand');
    const date = formData.get('date') ? new Date(formData.get('date')) : new Date();
    
    let currentValue = formData.get('originValue'); // Default to origin value
    
    if (type === 'gold' && quantityType) {
      currentValue = await getGoldPrice('sjc', quantityType, 'sell') || formData.get('originValue');
    } else if (type === 'coin' && brand) {
      currentValue = await getCoinPrice(brand) || formData.get('originValue');
    }
    
    storage.addResource(
      type,
      formData.get('quantity'),
      formData.get('originValue'),
      currentValue,
      date,
      brand,
      quantityType
    );
    renderResourceDetail(type);
  });
  
  // Auto-fill gold price when brand is selected
  if (type === 'gold') {
    document.querySelector('select[name="brand"]')?.addEventListener('change', async (e) => {
      if (e.target.value) {
        const price = await getGoldPrice(e.target.value);
        document.querySelector('input[name="currentValue"]').value = price;
      }
    });
  }
  
  // Sell form handler
  document.getElementById('sell-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const date = formData.get('date') ? new Date(formData.get('date')) : new Date();
    const quantityType = formData.get('quantityType');
    
    storage.addSellTransaction(
      type,
      formData.get('quantity'),
      formData.get('sellPrice'),
      quantityType,
      date
    );
    renderResourceDetail(type);
  });
  
  // Collapse handlers
  document.getElementById('toggle-purchases')?.addEventListener('click', () => {
    const content = document.getElementById('purchases-content');
    const arrow = document.querySelector('#toggle-purchases span:last-child');
    content.classList.toggle('hidden');
    arrow.textContent = content.classList.contains('hidden') ? '▶' : '▼';
  });
  
  document.getElementById('toggle-sales')?.addEventListener('click', () => {
    const content = document.getElementById('sales-content');
    const arrow = document.querySelector('#toggle-sales span:last-child');
    content.classList.toggle('hidden');
    arrow.textContent = content.classList.contains('hidden') ? '▶' : '▼';
  });
  
  // Price calculator for gold
  if (type === 'gold') {
    const chiPriceInput = document.getElementById('calc-chi-price');
    const luongPriceInput = document.getElementById('calc-luong-price');
    const currentValueEl = document.getElementById('calc-current-value');
    const originValueEl = document.getElementById('calc-origin-value');
    const profitEl = document.getElementById('calc-profit');
    
    // Calculate total origin value for remaining quantities
    function calculateOriginValue() {
      const goldResources = resources.filter(r => r.quantityType);
      
      let totalOriginValue = 0;
      
      // Calculate origin value for remaining quantities only
      goldResources.forEach(r => {
        const remainingQty = remaining[r.quantityType] || 0;
        if (remainingQty > 0) {
          // Use weighted average if multiple purchases of same type
          const sameTypePurchases = goldResources.filter(res => res.quantityType === r.quantityType);
          const totalCost = sameTypePurchases.reduce((sum, res) => sum + (res.originValue * res.quantity), 0);
          const totalQty = sameTypePurchases.reduce((sum, res) => sum + res.quantity, 0);
          const avgPrice = totalQty > 0 ? totalCost / totalQty : 0;
          
          totalOriginValue += avgPrice * remainingQty;
        }
      });
      
      // Remove duplicates by using Set
      const processedTypes = new Set();
      let finalOriginValue = 0;
      
      Object.keys(remaining).forEach(quantityType => {
        if (!processedTypes.has(quantityType) && remaining[quantityType] > 0) {
          processedTypes.add(quantityType);
          const sameTypePurchases = goldResources.filter(r => r.quantityType === quantityType);
          if (sameTypePurchases.length > 0) {
            const totalCost = sameTypePurchases.reduce((sum, r) => sum + (r.originValue * r.quantity), 0);
            const totalQty = sameTypePurchases.reduce((sum, r) => sum + r.quantity, 0);
            const avgPrice = totalQty > 0 ? totalCost / totalQty : 0;
            finalOriginValue += avgPrice * remaining[quantityType];
          }
        }
      });
      
      return finalOriginValue;
    }
    
    function updateCalculation() {
      const chiPrice = parseFloat(chiPriceInput?.value) || 0;
      const luongPrice = parseFloat(luongPriceInput?.value) || 0;
      
      const chiValue = chiPrice * (remaining.chi || 0);
      const luongValue = luongPrice * (remaining.luong || 0);
      const totalCurrentValue = chiValue + luongValue;
      const totalOriginValue = calculateOriginValue();
      const profit = totalCurrentValue - totalOriginValue;
      
      currentValueEl.textContent = `${totalCurrentValue.toLocaleString()} VND`;
      originValueEl.textContent = `${totalOriginValue.toLocaleString()} VND`;
      profitEl.textContent = `${profit >= 0 ? '+' : ''}${profit.toLocaleString()} VND`;
      profitEl.className = `text-xl font-bold ${profit >= 0 ? 'text-green-800' : 'text-red-800'}`;
    }
    
    chiPriceInput?.addEventListener('input', updateCalculation);
    luongPriceInput?.addEventListener('input', updateCalculation);
    
    // Initialize display
    updateCalculation();
  }
}

// Setup routes
router.addRoute('/', () => renderHome());
router.addRoute('/house', () => renderResourceDetail('house'));
router.addRoute('/gold', () => renderResourceDetail('gold'));
router.addRoute('/coin', () => renderResourceDetail('coin'));
router.addRoute('/stock', () => renderResourceDetail('stock'));

// Start the app
router.start();