import React, { useState } from 'react';
import Timer from './components/Timer/Timer';
import Calendar from './components/Calendar/Calendar';
import Reports from './components/Reports/Reports';
import InstallPrompt from './components/PWA/InstallPrompt';
import './App.css';

function App() {
    const [currentView, setCurrentView] = useState('timer');

    const navigationItems = [
        { id: 'timer', label: '⏱️ Timer', component: Timer },
        { id: 'calendar', label: '📅 Kalender', component: Calendar },
        { id: 'reports', label: '📊 Berichte', component: Reports }
    ];

    const currentComponent = navigationItems.find(item => item.id === currentView)?.component || Timer;
    const CurrentComponent = currentComponent;

    return (
        <div className="app">
            <header className="app-header">
                <div className="header-content">
                    <h1>Zeit Tracking App</h1>
                    <p>Einfache Zeiterfassung für den Alltag</p>
                </div>
            </header>

            <nav className="app-navigation">
                <div className="nav-content">
                    {navigationItems.map(item => (
                        <button
                            key={item.id}
                            className={`nav-button ${currentView === item.id ? 'active' : ''}`}
                            onClick={() => setCurrentView(item.id)}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="app-main">
                <div className="main-content">
                    <CurrentComponent />
                </div>
            </main>

            <footer className="app-footer">
                <div className="footer-content">
                    <p>&copy; 2024 Zeit Tracking App - Alle Daten werden lokal gespeichert</p>
                </div>
            </footer>

            {/* PWA Install Prompt */}
            <InstallPrompt />
        </div>
    );
}

export default App;