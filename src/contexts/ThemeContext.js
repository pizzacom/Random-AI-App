import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    // Initialize theme from localStorage or system preference
    const getInitialTheme = () => {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                return savedTheme === 'dark';
            }
            // Check system preference as fallback
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        } catch (error) {
            console.warn('Could not access localStorage:', error);
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
    };

    const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

    useEffect(() => {
        // Apply theme to document immediately
        const theme = isDarkMode ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);

        // Save to localStorage with error handling
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            console.warn('Could not save theme to localStorage:', error);
        }
    }, [isDarkMode]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            // Only update if no saved preference exists
            try {
                const savedTheme = localStorage.getItem('theme');
                if (!savedTheme) {
                    setIsDarkMode(e.matches);
                }
            } catch (error) {
                // If localStorage is not available, follow system preference
                setIsDarkMode(e.matches);
            }
        };

        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
    }, []);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};