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
  installBtn.onclick = installApp;
  document.body.appendChild(installBtn);
}

async function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    document.querySelector('button[onclick="installApp()"]')?.remove();
  }
}

// iOS Safari detection and prompt
if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
  window.addEventListener('load', () => {
    if (!window.navigator.standalone) {
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
}