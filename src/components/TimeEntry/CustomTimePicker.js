import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import './CustomTimePicker.css';

const CustomTimePicker = ({ value, onChange, className, id, required }) => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedHour, setSelectedHour] = useState('');
    const [selectedMinute, setSelectedMinute] = useState('');
    const dropdownRef = useRef(null);

    // Generate hours (00-23)
    const hours = Array.from({ length: 24 }, (_, i) =>
        i.toString().padStart(2, '0')
    );

    // Generate all 60 minutes (00-59)
    const minutes = Array.from({ length: 60 }, (_, i) =>
        i.toString().padStart(2, '0')
    ); useEffect(() => {
        if (value) {
            const [hour, minute] = value.split(':');
            setSelectedHour(hour);
            setSelectedMinute(minute);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleTimeSelect = (hour, minute) => {
        const timeValue = `${hour}:${minute}`;
        setSelectedHour(hour);
        setSelectedMinute(minute);
        onChange(timeValue);
        setIsOpen(false);
    };

    const displayValue = value || t('selectTime');

    return (
        <div className="custom-time-picker" ref={dropdownRef}>
            <div
                className={`time-picker-input ${className || ''} ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                id={id}
            >
                <span className="time-value">{displayValue}</span>
                <span className="time-picker-icon">🕒</span>
            </div>

            {isOpen && (
                <div className="time-picker-dropdown">
                    <div className="time-picker-content">
                        <div className="time-column">
                            <div className="time-column-header">{t('hour')}</div>
                            <div className="time-options">
                                {hours.map(hour => (
                                    <div
                                        key={hour}
                                        className={`time-option ${selectedHour === hour ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedHour(hour);
                                            if (selectedMinute) {
                                                handleTimeSelect(hour, selectedMinute);
                                            }
                                        }}
                                    >
                                        {hour}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="time-column">
                            <div className="time-column-header">{t('minute')}</div>
                            <div className="time-options">
                                {minutes.map(minute => (
                                    <div
                                        key={minute}
                                        className={`time-option ${selectedMinute === minute ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedMinute(minute);
                                            if (selectedHour) {
                                                handleTimeSelect(selectedHour, minute);
                                            }
                                        }}
                                    >
                                        {minute}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomTimePicker;