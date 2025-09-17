import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './LanguageToggle.css';

const LanguageToggle = () => {
    const { currentLanguage, setCurrentLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const languages = [
        { code: 'de', name: 'Deutsch', display: 'DE', color: '#000000' },
        { code: 'en', name: 'English', display: 'EN', color: '#1f2937' }
    ];

    const currentLang = languages.find(lang => lang.code === currentLanguage);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLanguageSelect = (langCode) => {
        setCurrentLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div className="language-dropdown" ref={dropdownRef}>
            <button
                className="language-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={currentLanguage === 'de' ? 'Sprache auswählen' : 'Select language'}
                aria-expanded={isOpen}
            >
                <span className="language-display">
                    {currentLang?.display}
                </span>
                <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="language-dropdown-menu">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            className={`language-option ${lang.code === currentLanguage ? 'active' : ''}`}
                            onClick={() => handleLanguageSelect(lang.code)}
                        >
                            <span className="option-display">{lang.display}</span>
                            <span className="option-name">{lang.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageToggle;