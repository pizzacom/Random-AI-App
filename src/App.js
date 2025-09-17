import React, { useState, useEffect } from 'react';
import Timer from './components/Timer/Timer';
import Calendar from './components/Calendar/Calendar';
import Reports from './components/Reports/Reports';
import DataExport from './components/DataExport/DataExport';
import InstallPrompt from './components/PWA/InstallPrompt';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import LanguageToggle from './components/LanguageToggle/LanguageToggle';
import Settings from './components/Settings/Settings';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import './App.css';

function AppContent() {
    const { t, currentLanguage } = useLanguage();

    // Initialize currentView from localStorage or default to 'timer'
    const [currentView, setCurrentView] = useState(() => {
        try {
            return localStorage.getItem('currentTab') || 'timer';
        } catch (error) {
            return 'timer';
        }
    });

    // Animation state for tab switching
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationDirection, setAnimationDirection] = useState('');

    // Save current tab to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('currentTab', currentView);
        } catch (error) {
            console.warn('Could not save current tab to localStorage:', error);
        }
    }, [currentView]);

    const navigationItems = [
        { id: 'timer', label: `⏱️ ${t('timer')}`, component: Timer },
        { id: 'calendar', label: `📅 ${t('calendar')}`, component: Calendar },
        { id: 'reports', label: `📊 ${t('reports')}`, component: Reports },
        { id: 'data', label: `💾 ${t('data')}`, component: DataExport }
    ];

    const handleTabSwitch = (newTab) => {
        if (newTab === currentView || isAnimating) return;

        // Determine animation direction
        const currentIndex = navigationItems.findIndex(item => item.id === currentView);
        const newIndex = navigationItems.findIndex(item => item.id === newTab);
        const direction = newIndex > currentIndex ? 'next' : 'prev';

        setIsAnimating(true);
        setAnimationDirection(direction);

        setTimeout(() => {
            setCurrentView(newTab);
            setTimeout(() => {
                setIsAnimating(false);
                setAnimationDirection('');
            }, 300);
        }, 150);
    };

    return (
        <div className="app">
            <nav className="app-navigation">
                <div className="nav-content">
                    <div className="nav-left">
                        {navigationItems.map(item => (
                            <button
                                key={item.id}
                                className={`nav-button ${currentView === item.id ? 'active' : ''}`}
                                onClick={() => handleTabSwitch(item.id)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <div className="nav-right">
                        <Settings />
                        <ThemeToggle />
                        <LanguageToggle />
                    </div>
                </div>
            </nav>

            <main className="app-main">
                <div className="main-content">
                    <div className={`tab-container ${isAnimating ? `sliding-${animationDirection}` : ''}`}>
                        {(() => {
                            const CurrentComponent = navigationItems.find(item => item.id === currentView)?.component || Timer;
                            return <CurrentComponent />;
                        })()}
                    </div>
                </div>
            </main>

            <footer className="app-footer">
                <div className="footer-content">
                    <p>&copy; 2024 Zeit Tracking App - {currentLanguage === 'de' ? 'Alle Daten werden lokal gespeichert' : 'All data is stored locally'}</p>
                </div>
            </footer>

            {/* PWA Install Prompt */}
            <InstallPrompt />
        </div>
    );
}

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AppContent />
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;