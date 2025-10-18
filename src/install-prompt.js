let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

function showInstallButton() {
  const installBtn = document.createElement('button');
  installBtn.textContent = '📱 Install App';
  installBtn.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
  installBtn.id = 'install-btn';
  installBtn.addEventListener('click', installApp);
  document.body.appendChild(installBtn);
}

async function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    document.getElementById('install-btn')?.remove();
  } else {
    // Fallback for browsers that don't support beforeinstallprompt
    alert('To install: Open browser menu → "Install app" or "Add to Home Screen"');
  }
}

// Show install prompt for all devices
window.addEventListener('load', () => {
  // Always show install button after 2 seconds if not already installed
  setTimeout(() => {
    if (!document.getElementById('install-btn') && !window.navigator.standalone) {
      showInstallButton();
    }
  }, 2000);
  
  // iOS specific prompt
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream && !window.navigator.standalone) {
    setTimeout(() => {
      const iosPrompt = document.createElement('div');
      iosPrompt.innerHTML = `
        <div class="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
          <p class="text-sm mb-2">📱 Install this app on your iPhone:</p>
          <p class="text-xs">Tap <strong>Share</strong> → <strong>Add to Home Screen</strong></p>
          <button onclick="this.parentElement.remove()" class="absolute top-2 right-2 text-white">✕</button>
        </div>
      `;
      document.body.appendChild(iosPrompt);
    }, 3000);
  }
});