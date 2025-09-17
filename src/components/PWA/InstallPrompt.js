import React, { useState, useEffect } from 'react';
import './InstallPrompt.css';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if app is already installed (running in standalone mode)
        const checkStandalone = () => {
            const standalone =
                // Standard PWA standalone detection
                window.matchMedia('(display-mode: standalone)').matches ||
                // iOS Safari
                window.navigator.standalone ||
                // Android app
                document.referrer.includes('android-app://') ||
                // Additional checks for installed state
                window.matchMedia('(display-mode: fullscreen)').matches ||
                window.matchMedia('(display-mode: minimal-ui)').matches;

            setIsStandalone(standalone);

            // Log for debugging
            console.log('PWA Install Status:', {
                standalone,
                displayMode: window.matchMedia('(display-mode: standalone)').matches,
                navigatorStandalone: window.navigator.standalone,
                referrer: document.referrer
            });
        };

        checkStandalone();

        // Listen for display mode changes
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        const handleDisplayModeChange = (e) => {
            setIsStandalone(e.matches);
            if (e.matches) {
                setShowInstallPrompt(false);
            }
        };

        mediaQuery.addListener(handleDisplayModeChange);

        const handler = (e) => {
            // Don't show if already installed
            if (isStandalone) return;

            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setDeferredPrompt(e);
            // Show our custom install prompt
            setShowInstallPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Show install instructions if not standalone and no native prompt after 3 seconds
        const fallbackTimer = setTimeout(() => {
            if (!isStandalone && !deferredPrompt) {
                setShowInstallPrompt(true);
            }
        }, 3000);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            mediaQuery.removeListener(handleDisplayModeChange);
            clearTimeout(fallbackTimer);
        };
    }, [deferredPrompt, isStandalone]); const handleInstallClick = async () => {
        if (deferredPrompt) {
            // Show the native install prompt
            deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;

            console.log(`User response to the install prompt: ${outcome}`);

            // Clear the deferredPrompt so it can only be used once
            setDeferredPrompt(null);
            setShowInstallPrompt(false);

            // If user accepted, mark as installed and hide prompt permanently
            if (outcome === 'accepted') {
                setIsStandalone(true);
                localStorage.setItem('pwa-install-dismissed', 'true');
            }
        } else {
            // Show manual installation instructions
            setShowInstallPrompt(false);
            alert('Manuelle Installation:\n\nChrome/Edge: Klicke auf die drei Punkte (⋮) → "App installieren"\n\nFirefox: Klicke auf die drei Linien (☰) → "Diese Seite als App installieren"\n\nSafari: Teilen-Button → "Zum Home-Bildschirm"');
        }
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
        // Remember that user dismissed the prompt for this session
        sessionStorage.setItem('install-prompt-dismissed', 'true');
    };

    // Don't show if already installed
    if (isStandalone || !showInstallPrompt) {
        return null;
    }

    return (
        <div className="install-prompt">
            <div className="install-prompt-content">
                <div className="install-prompt-icon">📱</div>
                <div className="install-prompt-text">
                    <h3>App installieren</h3>
                    <p>
                        {deferredPrompt
                            ? 'Installiere die Zeit Tracking App für schnellen Zugriff und Offline-Nutzung.'
                            : 'Installiere die App über dein Browser-Menü für bessere Nutzung.'
                        }
                    </p>
                </div>
                <div className="install-prompt-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleInstallClick}
                    >
                        {deferredPrompt ? 'Installieren' : 'Anleitung zeigen'}
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleDismiss}
                    >
                        Später
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;