import React, { useState, useEffect } from 'react';
import { useTimer } from '../../hooks/useTimer';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import './Timer.css';

const Timer = () => {
    const { t, currentLanguage } = useLanguage();
    const [defaultBreakLength] = useLocalStorage('defaultBreakLength', 30);
    const {
        isRunning,
        startTime,
        digitalClock,
        date,
        formattedElapsedTime,
        startTimer,
        stopTimer,
        resetTimer,
        updateDescription
    } = useTimer();

    const { addTimeEntry } = useTimeEntries();
    const [timerDescription, setTimerDescription] = useState('');
    const [breakDuration, setBreakDuration] = useState(defaultBreakLength);
    const [showRestoredMessage, setShowRestoredMessage] = useState(false);

    // Update break duration when default changes
    useEffect(() => {
        if (!isRunning) {
            setBreakDuration(defaultBreakLength);
        }
    }, [defaultBreakLength, isRunning]);

    // Check if timer was restored on page load
    useEffect(() => {
        if (isRunning && startTime) {
            setShowRestoredMessage(true);
            // Hide message after 5 seconds
            const timer = setTimeout(() => {
                setShowRestoredMessage(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    const handleStart = () => {
        startTimer(timerDescription);
    };

    const handleStop = () => {
        const sessionData = stopTimer();
        if (sessionData) {
            // Add the completed session to time entries
            addTimeEntry({
                ...sessionData,
                breakDuration: breakDuration,
                description: timerDescription
            });

            // Reset form
            setTimerDescription('');
            setBreakDuration(0);
        }
    };

    const handleReset = () => {
        resetTimer();
        setTimerDescription('');
        setBreakDuration(0);
    };

    const handleDescriptionChange = (e) => {
        const newDescription = e.target.value;
        setTimerDescription(newDescription);
        if (isRunning) {
            updateDescription(newDescription);
        }
    };

    // Prevent scroll wheel from changing number values
    const handleNumberInputWheel = (e) => {
        e.preventDefault();
        e.target.blur();
    };

    // Handle focus to select all text for easier editing
    const handleNumberInputFocus = (e) => {
        setTimeout(() => {
            e.target.select();
        }, 0);
    };

    // Better break duration change handler
    const handleBreakDurationChange = (e) => {
        const value = e.target.value;
        // Allow empty input for easier editing
        if (value === '') {
            setBreakDuration('');
        } else {
            setBreakDuration(parseInt(value) || 0);
        }
    };

    return (
        <div className="timer-container">
            {/* Digital Clock Display */}
            <div className="digital-clock">
                <div className="current-time">
                    <span className="clock-label">{t('currentTimer')}:</span>
                    <span className="clock-time">{digitalClock}</span>
                </div>
            </div>

            <div className="timer-display">
                <div className="timer-time">
                    {formattedElapsedTime}
                </div>
                <div className="timer-status">
                    {isRunning ? t('timerRunning') : t('timerStopped')}
                </div>
            </div>

            <div className="timer-info">
                {isRunning && (
                    <>
                        <div className="timer-start-info">
                            <span>{t('startTime')}: {startTime} ({date})</span>
                        </div>
                    </>
                )}
            </div>

            <div className="timer-form">
                <div className="form-group">
                    <label htmlFor="description">{t('description')}:</label>
                    <input
                        type="text"
                        id="description"
                        value={timerDescription}
                        onChange={handleDescriptionChange}
                        placeholder={t('enterDescription')}
                        disabled={isRunning}
                    />
                </div>

                {!isRunning && (
                    <div className="form-group">
                        <label htmlFor="breakDuration">{t('breakDuration')}:</label>
                        <input
                            type="number"
                            id="breakDuration"
                            value={breakDuration}
                            onChange={handleBreakDurationChange}
                            onWheel={handleNumberInputWheel}
                            onFocus={handleNumberInputFocus}
                            min="0"
                            placeholder={t('enterBreakDuration')}
                        />
                    </div>
                )}
            </div>

            <div className="timer-controls">
                {!isRunning ? (
                    <button
                        className="btn btn-start"
                        onClick={handleStart}
                    >
                        ▶ {t('startTimer')}
                    </button>
                ) : (
                    <button
                        className="btn btn-stop"
                        onClick={handleStop}
                    >
                        ⏹ {t('stopTimer')}
                    </button>
                )}

                <button
                    className="btn btn-reset"
                    onClick={handleReset}
                    disabled={!isRunning && !startTime}
                >
                    🔄 {t('resetTimer')}
                </button>
            </div>

            {/* Timer Restored Notification - Fixed Position */}
            <div className="timer-message-area">
                {showRestoredMessage && (
                    <div className="timer-restored-message">
                        ✅ {t('timerRestored')} {startTime}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Timer;