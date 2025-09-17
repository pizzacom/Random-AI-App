import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
    const { isDarkMode, toggleTheme } = useTheme();

    return (
        <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={isDarkMode ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'}
            aria-label={isDarkMode ? 'Zu hellem Modus wechseln' : 'Zu dunklem Modus wechseln'}
        >
            <span className="theme-toggle-icon">
                {isDarkMode ? '☀️' : '🌙'}
            </span>
        </button>
    );
};

export default ThemeToggle;