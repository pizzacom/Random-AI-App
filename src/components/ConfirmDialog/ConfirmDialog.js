import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './ConfirmDialog.css';

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    type = 'danger' // 'danger', 'warning', 'info'
}) => {
    const { t } = useLanguage();

    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return '🗑️';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '❓';
        }
    };

    return (
        <div className="confirm-dialog-overlay" onClick={handleOverlayClick}>
            <div className={`confirm-dialog ${type}`}>
                <div className="confirm-dialog-header">
                    <div className="confirm-dialog-icon">
                        {getIcon()}
                    </div>
                    <h3 className="confirm-dialog-title">
                        {title || t('confirmDelete')}
                    </h3>
                </div>

                <div className="confirm-dialog-content">
                    <p className="confirm-dialog-message">
                        {message || t('confirmDeleteMessage')}
                    </p>
                </div>

                <div className="confirm-dialog-actions">
                    <button
                        className="btn btn-cancel"
                        onClick={onClose}
                        autoFocus
                    >
                        {cancelText || t('cancel')}
                    </button>
                    <button
                        className={`btn btn-confirm btn-${type}`}
                        onClick={onConfirm}
                    >
                        {confirmText || t('delete')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;