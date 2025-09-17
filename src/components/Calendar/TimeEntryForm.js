import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getCurrentTime, isValidTime, isValidTimeRange } from '../../utils/timeCalculations';
import CustomTimePicker from '../TimeEntry/CustomTimePicker';
import './TimeEntryForm.css';

const TimeEntryForm = ({ onSave, onCancel, initialData = {} }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        breakDuration: initialData.breakDuration || 0,
        description: initialData.description || ''
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.startTime) {
            newErrors.startTime = t('startTimeRequired');
        } else if (!isValidTime(formData.startTime)) {
            newErrors.startTime = t('invalidStartTime');
        }

        if (!formData.endTime) {
            newErrors.endTime = t('endTimeRequired');
        } else if (!isValidTime(formData.endTime)) {
            newErrors.endTime = t('invalidEndTime');
        }

        if (formData.startTime && formData.endTime && !isValidTimeRange(formData.startTime, formData.endTime)) {
            newErrors.timeRange = t('endTimeAfterStart');
        }

        if (formData.breakDuration < 0) {
            newErrors.breakDuration = 'Pause kann nicht negativ sein';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSave(formData);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleSetCurrentTime = (field) => {
        const currentTime = getCurrentTime();
        handleInputChange(field, currentTime);
    };

    return (
        <div className="time-entry-form-container">
            <div className="form-header">
                <h3>Neuer Zeiteintrag</h3>
            </div>

            <form onSubmit={handleSubmit} className="time-entry-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="startTime">Startzeit *:</label>
                        <div className="input-with-button">
                            <CustomTimePicker
                                id="startTime"
                                value={formData.startTime}
                                onChange={(value) => handleInputChange('startTime', value)}
                                className={errors.startTime ? 'error' : ''}
                                required
                            />
                            <button
                                type="button"
                                className="btn btn-small"
                                onClick={() => handleSetCurrentTime('startTime')}
                                title="Aktuelle Zeit setzen"
                            >
                                🕐
                            </button>
                        </div>
                        {errors.startTime && <span className="error-text">{errors.startTime}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="endTime">Endzeit *:</label>
                        <div className="input-with-button">
                            <CustomTimePicker
                                id="endTime"
                                value={formData.endTime}
                                onChange={(value) => handleInputChange('endTime', value)}
                                className={errors.endTime ? 'error' : ''}
                                required
                            />
                            <button
                                type="button"
                                className="btn btn-small"
                                onClick={() => handleSetCurrentTime('endTime')}
                                title="Aktuelle Zeit setzen"
                            >
                                🕐
                            </button>
                        </div>
                        {errors.endTime && <span className="error-text">{errors.endTime}</span>}
                    </div>
                </div>

                {errors.timeRange && (
                    <div className="error-text">{errors.timeRange}</div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="breakDuration">Pause (Minuten):</label>
                        <input
                            type="number"
                            id="breakDuration"
                            value={formData.breakDuration}
                            onChange={(e) => handleInputChange('breakDuration', parseInt(e.target.value) || 0)}
                            min="0"
                            className={errors.breakDuration ? 'error' : ''}
                        />
                        {errors.breakDuration && <span className="error-text">{errors.breakDuration}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="description">Beschreibung:</label>
                    <input
                        type="text"
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Optional: Was hast du gemacht?"
                    />
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                        ✓ Speichern
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        ✗ Abbrechen
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TimeEntryForm;