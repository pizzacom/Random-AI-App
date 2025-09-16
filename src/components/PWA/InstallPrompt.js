import React, { useState, useEffect } from 'react';
import './InstallPrompt.css';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if app is already installed (running in standalone mode)
        const checkStandalone = () => {
            const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone ||
                document.referrer.includes('android-app://');
            setIsStandalone(standalone);
        };

        checkStandalone();

        const handler = (e) => {
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
            clearTimeout(fallbackTimer);
        };
    }, [deferredPrompt, isStandalone]);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            // Show the native install prompt
            deferredPrompt.prompt();

            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;

            console.log(`User response to the install prompt: ${outcome}`);

            // Clear the deferredPrompt so it can only be used once
            setDeferredPrompt(null);
            setShowInstallPrompt(false);
        } else {
            // Show manual installation instructions
            setShowInstallPrompt(false);
            alert('Manuelle Installation:\n\nChrome/Edge: Klicke auf die drei Punkte (⋮) → "App installieren"\n\nFirefox: Klicke auf die drei Linien (☰) → "Diese Seite als App installieren"\n\nSafari: Teilen-Button → "Zum Home-Bildschirm"');
        }
    };

    const handleDismiss = () => {
        setShowInstallPrompt(false);
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