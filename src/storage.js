const STORAGE_KEY = 'resource-tracker-data';

export const storage = {
  get() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { resources: [] };
  },

  save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  addResource(type, quantity, originValue, currentValue, date = new Date(), brand = null) {
    const data = this.get();
    data.resources.push({
      id: Date.now(),
      type,
      quantity: parseFloat(quantity),
      originValue: parseFloat(originValue),
      currentValue: parseFloat(currentValue),
      brand,
      date: date.toISOString(),
      profit: (parseFloat(currentValue) - parseFloat(originValue)) * parseFloat(quantity)
    });
    this.save(data);
  },

  updateCurrentValues(updates) {
    const data = this.get();
    data.resources.forEach(r => {
      if (updates[r.type] && (!r.brand || updates[r.type][r.brand])) {
        r.currentValue = r.brand ? updates[r.type][r.brand] : updates[r.type];
        r.profit = (r.currentValue - r.originValue) * r.quantity;
      }
    });
    this.save(data);
  },

  addSellTransaction(type, quantity, sellPrice, brand, date = new Date()) {
    const data = this.get();
    if (!data.sells) data.sells = [];
    data.sells.push({
      id: Date.now(),
      type,
      quantity: parseFloat(quantity),
      sellPrice: parseFloat(sellPrice),
      brand,
      date: date.toISOString()
    });
    this.save(data);
  },

  getRemainingQuantityByBrand(type) {
    const resources = this.getResourcesByType(type);
    const sells = this.getSellsByType(type);
    const remaining = {};
    
    resources.forEach(r => {
      if (r.brand) {
        remaining[r.brand] = (remaining[r.brand] || 0) + r.quantity;
      }
    });
    
    sells.forEach(s => {
      if (s.brand) {
        remaining[s.brand] = (remaining[s.brand] || 0) - s.quantity;
      }
    });
    
    return remaining;
  },

  getSellsByType(type) {
    const data = this.get();
    return data.sells ? data.sells.filter(s => s.type === type) : [];
  },

  getResourcesByType(type) {
    return this.get().resources.filter(r => r.type === type);
  },

  getTotalsByType() {
    const data = this.get();
    const resources = data.resources;
    const sells = data.sells || [];
    const totals = {};
    
    resources.forEach(r => {
      if (!totals[r.type]) {
        totals[r.type] = { quantity: 0, originValue: 0, currentValue: 0, profit: 0 };
      }
      totals[r.type].quantity += r.quantity;
      totals[r.type].originValue += r.originValue * r.quantity;
      totals[r.type].currentValue += r.currentValue * r.quantity;
      totals[r.type].profit += r.profit;
    });
    
    // Subtract sold quantities
    sells.forEach(s => {
      if (totals[s.type]) {
        totals[s.type].quantity -= s.quantity;
        totals[s.type].currentValue -= s.sellPrice * s.quantity;
      }
    });
    
    return totals;
  },

  exportData() {
    return JSON.stringify(this.get(), null, 2);
  },

  importData(jsonData, combine = false) {
    try {
      const newData = JSON.parse(jsonData);
      if (combine) {
        const currentData = this.get();
        currentData.resources = [...(currentData.resources || []), ...(newData.resources || [])];
        currentData.sells = [...(currentData.sells || []), ...(newData.sells || [])];
        this.save(currentData);
      } else {
        this.save(newData);
      }
      return true;
    } catch (error) {
      return false;
    }
  }
};