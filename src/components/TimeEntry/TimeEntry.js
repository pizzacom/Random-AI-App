import React, { useState } from 'react';
import { formatMinutesToTime, formatDateGerman, isValidTime, isValidTimeRange } from '../../utils/timeCalculations';
import './TimeEntry.css';

const TimeEntry = ({ entry, onUpdate, onDelete, isEditing, onEdit, onCancelEdit }) => {
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
            newErrors.startTime = 'Ungültige Startzeit';
        }

        if (!isValidTime(editData.endTime)) {
            newErrors.endTime = 'Ungültige Endzeit';
        }

        if (editData.startTime && editData.endTime && !isValidTimeRange(editData.startTime, editData.endTime)) {
            newErrors.timeRange = 'Endzeit muss nach Startzeit liegen';
        }

        if (editData.breakDuration < 0) {
            newErrors.breakDuration = 'Pause kann nicht negativ sein';
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
                            <label>Startzeit:</label>
                            <input
                                type="time"
                                value={editData.startTime}
                                onChange={(e) => handleInputChange('startTime', e.target.value)}
                                className={errors.startTime ? 'error' : ''}
                            />
                            {errors.startTime && <span className="error-text">{errors.startTime}</span>}
                        </div>

                        <div className="form-group">
                            <label>Endzeit:</label>
                            <input
                                type="time"
                                value={editData.endTime}
                                onChange={(e) => handleInputChange('endTime', e.target.value)}
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
                            <label>Pause (Minuten):</label>
                            <input
                                type="number"
                                value={editData.breakDuration}
                                onChange={(e) => handleInputChange('breakDuration', parseInt(e.target.value) || 0)}
                                min="0"
                                className={errors.breakDuration ? 'error' : ''}
                            />
                            {errors.breakDuration && <span className="error-text">{errors.breakDuration}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Beschreibung:</label>
                        <input
                            type="text"
                            value={editData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Optional..."
                        />
                    </div>

                    <div className="time-entry-actions">
                        <button className="btn btn-save" onClick={handleSave}>
                            ✓ Speichern
                        </button>
                        <button className="btn btn-cancel" onClick={handleCancel}>
                            ✗ Abbrechen
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
                        ✏️ Bearbeiten
                    </button>
                    <button className="btn btn-delete" onClick={() => onDelete(entry.id)}>
                        🗑️ Löschen
                    </button>
                </div>
            </div>

            <div className="time-entry-details">
                <div className="time-row">
                    <div className="time-field">
                        <span className="label">Von:</span>
                        <span className="value">{entry.startTime || '-'}</span>
                    </div>
                    <div className="time-field">
                        <span className="label">Bis:</span>
                        <span className="value">{entry.endTime || '-'}</span>
                    </div>
                </div>

                <div className="time-row">
                    <div className="time-field">
                        <span className="label">Pause:</span>
                        <span className="value">{formatMinutesToTime(entry.breakDuration || 0)}</span>
                    </div>
                    <div className="time-field">
                        <span className="label">Gesamt:</span>
                        <span className="value">{formatMinutesToTime(entry.duration || 0)}</span>
                    </div>
                    <div className="time-field">
                        <span className="label">Arbeitszeit:</span>
                        <span className="value highlight">{formatMinutesToTime(netTime)}</span>
                    </div>
                </div>

                {entry.description && (
                    <div className="description">
                        <span className="label">Beschreibung:</span>
                        <span className="value">{entry.description}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimeEntry;