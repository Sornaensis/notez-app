/**
 * PWA and Service Worker utilities
 */

// Service worker registration and PWA features
function initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
        let swRegistration = null;
        let deferredPrompt = null;

        window.addEventListener('load', function () {
            // Register service worker
            navigator.serviceWorker.register('/sw.js')
                .then(function (registration) {
                    console.log('ServiceWorker registration successful');
                    swRegistration = registration;
                    
                    // Check for updates
                    checkForUpdates(registration);
                })
                .catch(function (err) {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });

        // Handle install prompt
        window.addEventListener('beforeinstallprompt', function (e) {
            console.log('Install prompt triggered');
            e.preventDefault();
            deferredPrompt = e;
            showInstallPrompt();
        });

        // Handle successful installation
        window.addEventListener('appinstalled', function (e) {
            console.log('App installed successfully');
            deferredPrompt = null;
            hideInstallPrompt();
        });

        // Function to show install prompt
        function showInstallPrompt() {
            // Create install notification
            const installNotification = document.createElement('div');
            installNotification.id = 'install-notification';
            installNotification.innerHTML = `
                <div style="
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: #2196F3;
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    z-index: 1000;
                    font-size: 14px;
                    max-width: 300px;
                ">
                    <div style="margin-bottom: 10px;">
                        <strong>Install Notez</strong><br>
                        Get the full app experience with offline access
                    </div>
                    <button id="install-button" style="
                        background: white;
                        color: #2196F3;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-right: 10px;
                        font-weight: bold;
                    ">Install</button>
                    <button id="dismiss-install" style="
                        background: transparent;
                        color: white;
                        border: 1px solid white;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Later</button>
                </div>
            `;
            
            document.body.appendChild(installNotification);
            
            // Handle install button click
            document.getElementById('install-button').addEventListener('click', function() {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then(function(choiceResult) {
                        if (choiceResult.outcome === 'accepted') {
                            console.log('User accepted the install prompt');
                        } else {
                            console.log('User dismissed the install prompt');
                        }
                        deferredPrompt = null;
                        hideInstallPrompt();
                    });
                }
            });
            
            // Handle dismiss button click
            document.getElementById('dismiss-install').addEventListener('click', function() {
                hideInstallPrompt();
            });
        }

        // Function to hide install prompt
        function hideInstallPrompt() {
            const notification = document.getElementById('install-notification');
            if (notification) {
                notification.remove();
            }
        }

        // Check for service worker updates
        function checkForUpdates(registration) {
            registration.addEventListener('updatefound', function() {
                const newWorker = registration.installing;
                
                newWorker.addEventListener('statechange', function() {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker is ready
                        showUpdateAvailable();
                    }
                });
            });
        }

        // Show update available notification
        function showUpdateAvailable() {
            const updateNotification = document.createElement('div');
            updateNotification.id = 'update-notification';
            updateNotification.innerHTML = `
                <div style="
                    position: fixed;
                    bottom: 10px;
                    right: 10px;
                    background: #4CAF50;
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    z-index: 1000;
                    font-size: 14px;
                    max-width: 300px;
                ">
                    <div style="margin-bottom: 10px;">
                        <strong>Update Available</strong><br>
                        A new version of Notez is ready to install
                    </div>
                    <button id="update-button" style="
                        background: white;
                        color: #4CAF50;
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-right: 10px;
                        font-weight: bold;
                    ">Update</button>
                    <button id="dismiss-update" style="
                        background: transparent;
                        color: white;
                        border: 1px solid white;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Later</button>
                </div>
            `;
            
            document.body.appendChild(updateNotification);
            
            // Handle update button click
            document.getElementById('update-button').addEventListener('click', function() {
                if (swRegistration && swRegistration.waiting) {
                    swRegistration.waiting.postMessage({type: 'SKIP_WAITING'});
                    window.location.reload();
                }
            });
            
            // Handle dismiss button click
            document.getElementById('dismiss-update').addEventListener('click', function() {
                const notification = document.getElementById('update-notification');
                if (notification) {
                    notification.remove();
                }
            });
        }
    }

    // Handle network status changes
    window.addEventListener('online', function() {
        console.log('Network: Online');
    });

    window.addEventListener('offline', function() {
        console.log('Network: Offline');
    });
}

// Export PWA utilities
window.PWAUtils = {
    initializeServiceWorker
};