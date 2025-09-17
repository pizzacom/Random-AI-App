import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './Settings.css';

const Settings = () => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    // Settings state with localStorage persistence
    const [userInfo, setUserInfo] = useLocalStorage('userInfo', {
        name: '',
        company: ''
    });
    const [defaultBreakLength, setDefaultBreakLength] = useLocalStorage('defaultBreakLength', 30);

    // Local form state
    const [formData, setFormData] = useState({
        name: userInfo.name || '',
        company: userInfo.company || '',
        breakLength: defaultBreakLength || 30
    });

    const handleOpen = () => {
        setIsOpen(true);
        // Reset form data to current saved values when opening
        setFormData({
            name: userInfo.name || '',
            company: userInfo.company || '',
            breakLength: defaultBreakLength || 30
        });
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleSave = () => {
        // Save user info
        setUserInfo({
            name: formData.name,
            company: formData.company
        });

        // Save default break length
        setDefaultBreakLength(parseInt(formData.breakLength) || 30);

        setIsOpen(false);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <>
            {/* Settings Icon Button */}
            <button
                className="settings-button"
                onClick={handleOpen}
                title={t('settings')}
                aria-label={t('settings')}
            >
                ⚙️
            </button>

            {/* Settings Overlay */}
            {isOpen && (
                <div className="settings-overlay" onClick={handleOverlayClick}>
                    <div className="settings-modal">
                        <div className="settings-header">
                            <h3>⚙️ {t('settings')}</h3>
                            <button
                                className="close-button"
                                onClick={handleClose}
                                aria-label={t('close')}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="settings-content">
                            {/* User Information Section */}
                            <div className="settings-section">
                                <h4>👤 {t('userInfo')}</h4>
                                <div className="form-group">
                                    <label htmlFor="userName">{t('name')}:</label>
                                    <input
                                        type="text"
                                        id="userName"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                        placeholder={t('enterName')}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="userCompany">{t('company')}:</label>
                                    <input
                                        type="text"
                                        id="userCompany"
                                        value={formData.company}
                                        onChange={(e) => handleInputChange('company', e.target.value)}
                                        placeholder={t('enterCompany')}
                                    />
                                </div>
                            </div>

                            {/* Default Settings Section */}
                            <div className="settings-section">
                                <h4>⏱️ {t('defaultSettings')}</h4>
                                <div className="form-group">
                                    <label htmlFor="defaultBreak">{t('defaultBreakLength')}:</label>
                                    <div className="input-with-unit">
                                        <input
                                            type="number"
                                            id="defaultBreak"
                                            min="0"
                                            max="480"
                                            value={formData.breakLength}
                                            onChange={(e) => handleInputChange('breakLength', e.target.value)}
                                        />
                                        <span className="unit">{t('minutes')}</span>
                                    </div>
                                    <small className="help-text">
                                        {t('defaultBreakHelp')}
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div className="settings-footer">
                            <button className="btn btn-secondary" onClick={handleClose}>
                                {t('cancel')}
                            </button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {t('save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Settings;