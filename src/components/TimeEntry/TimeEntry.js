import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatMinutesToTime, formatDateGerman, isValidTime, isValidTimeRange } from '../../utils/timeCalculations';
import CustomTimePicker from './CustomTimePicker';
import './TimeEntry.css';

const TimeEntry = ({ entry, onUpdate, onDelete, isEditing, onEdit, onCancelEdit }) => {
    const { t } = useLanguage();
    const [editData, setEditData] = useState({
        startTime: entry.startTime || '',
        endTime: entry.endTime || '',
        breakDuration: entry.breakDuration || 0,
        description: entry.description || ''
    });
    const [errors, setErrors] = useState({});

    const validateEntry = () => {
        const newErrors = {};

        if (!isValidTime(editData.startTime)) {
            newErrors.startTime = t('invalidStartTime');
        }

        if (!isValidTime(editData.endTime)) {
            newErrors.endTime = t('invalidEndTime');
        }

        if (editData.startTime && editData.endTime && !isValidTimeRange(editData.startTime, editData.endTime)) {
            newErrors.timeRange = t('endTimeAfterStart');
        }

        if (editData.breakDuration < 0) {
            newErrors.breakDuration = t('negativeBreak');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validateEntry()) {
            onUpdate(entry.id, editData);
            onCancelEdit();
        }
    };

    const handleCancel = () => {
        setEditData({
            startTime: entry.startTime || '',
            endTime: entry.endTime || '',
            breakDuration: entry.breakDuration || 0,
            description: entry.description || ''
        });
        setErrors({});
        onCancelEdit();
    };

    const handleInputChange = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Better break duration change handler
    const handleBreakDurationChange = (e) => {
        const value = e.target.value;
        // Allow empty input for easier editing
        if (value === '') {
            handleInputChange('breakDuration', '');
        } else {
            handleInputChange('breakDuration', parseInt(value) || 0);
        }
    };

    const handleDeleteClick = () => {
        onDelete(entry.id);
    };

    const netTime = (entry.duration || 0) - (entry.breakDuration || 0);

    if (isEditing) {
        return (
            <div className="time-entry editing">
                <div className="time-entry-header">
                    <h4>{formatDateGerman(entry.date, 'EEEE, dd.MM.yyyy')}</h4>
                </div>

                <div className="time-entry-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>{t('startTime')}:</label>
                            <CustomTimePicker
                                value={editData.startTime}
                                onChange={(value) => handleInputChange('startTime', value)}
                                className={errors.startTime ? 'error' : ''}
                            />
                            {errors.startTime && <span className="error-text">{errors.startTime}</span>}
                        </div>

                        <div className="form-group">
                            <label>{t('endTime')}:</label>
                            <CustomTimePicker
                                value={editData.endTime}
                                onChange={(value) => handleInputChange('endTime', value)}
                                className={errors.endTime ? 'error' : ''}
                            />
                            {errors.endTime && <span className="error-text">{errors.endTime}</span>}
                        </div>
                    </div>

                    {errors.timeRange && (
                        <div className="error-text">{errors.timeRange}</div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label>{t('breakDuration')}:</label>
                            <input
                                type="number"
                                value={editData.breakDuration}
                                onChange={handleBreakDurationChange}
                                min="0"
                                className={errors.breakDuration ? 'error' : ''}
                            />
                            {errors.breakDuration && <span className="error-text">{errors.breakDuration}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('description')}:</label>
                        <input
                            type="text"
                            value={editData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder={t('optional')}
                        />
                    </div>

                    <div className="time-entry-actions">
                        <button className="btn btn-save" onClick={handleSave}>
                            ✓ {t('save')}
                        </button>
                        <button className="btn btn-cancel" onClick={handleCancel}>
                            ✗ {t('cancel')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="time-entry">
            <div className="time-entry-header">
                <h4>{formatDateGerman(entry.date, 'EEEE, dd.MM.yyyy')}</h4>
                <div className="time-entry-actions">
                    <button className="btn btn-edit" onClick={() => onEdit(entry.id)}>
                        ✏️ {t('edit')}
                    </button>
                    <button className="btn btn-delete" onClick={handleDeleteClick}>
                        🗑️ {t('delete')}
                    </button>
                </div>
            </div>

            <div className="time-entry-details">
                <div className="time-row">
                    <div className="time-field">
                        <span className="label">{t('from')}:</span>
                        <span className="value">{entry.startTime || '-'}</span>
                    </div>
                    <div className="time-field">
                        <span className="label">{t('to')}:</span>
                        <span className="value">{entry.endTime || '-'}</span>
                    </div>
                </div>

                <div className="time-row">
                    <div className="time-field">
                        <span className="label">{t('pauseLabel')}:</span>
                        <span className="value">{formatMinutesToTime(entry.breakDuration || 0)}</span>
                    </div>
                    <div className="time-field">
                        <span className="label">{t('totalLabel')}:</span>
                        <span className="value">{formatMinutesToTime(entry.duration || 0)}</span>
                    </div>
                    <div className="time-field">
                        <span className="label">{t('workTimeLabel')}:</span>
                        <span className="value highlight">{formatMinutesToTime(netTime)}</span>
                    </div>
                </div>

                {entry.description && (
                    <div className="description">
                        <span className="label">{t('description')}:</span>
                        <span className="value">{entry.description}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimeEntry;