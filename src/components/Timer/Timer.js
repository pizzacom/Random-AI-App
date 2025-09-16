import React, { useState, useEffect } from 'react';
import { useTimer } from '../../hooks/useTimer';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import './Timer.css';

const Timer = () => {
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
    const [breakDuration, setBreakDuration] = useState(0);
    const [showRestoredMessage, setShowRestoredMessage] = useState(false);

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

    return (
        <div className="timer-container">
            {/* Timer Restored Notification */}
            {showRestoredMessage && (
                <div className="timer-restored-message">
                    ✅ Timer wurde wiederhergestellt - läuft seit {startTime}
                </div>
            )}

            {/* Digital Clock Display */}
            <div className="digital-clock">
                <div className="current-time">
                    <span className="clock-label">Aktuelle Zeit:</span>
                    <span className="clock-time">{digitalClock}</span>
                </div>
            </div>

            <div className="timer-display">
                <div className="timer-time">
                    {formattedElapsedTime}
                </div>
                <div className="timer-status">
                    {isRunning ? 'Läuft...' : 'Gestoppt'}
                </div>
            </div>

            <div className="timer-info">
                {isRunning && (
                    <>
                        <div className="timer-start-info">
                            <span>Gestartet: {startTime} ({date})</span>
                        </div>
                    </>
                )}
            </div>

            <div className="timer-form">
                <div className="form-group">
                    <label htmlFor="description">Beschreibung (optional):</label>
                    <input
                        type="text"
                        id="description"
                        value={timerDescription}
                        onChange={handleDescriptionChange}
                        placeholder="Was machst du gerade?"
                        disabled={isRunning}
                    />
                </div>

                {!isRunning && (
                    <div className="form-group">
                        <label htmlFor="breakDuration">Pause (Minuten):</label>
                        <input
                            type="number"
                            id="breakDuration"
                            value={breakDuration}
                            onChange={(e) => setBreakDuration(parseInt(e.target.value) || 0)}
                            min="0"
                            placeholder="0"
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
                        ▶ Starten
                    </button>
                ) : (
                    <button
                        className="btn btn-stop"
                        onClick={handleStop}
                    >
                        ⏹ Stoppen
                    </button>
                )}

                <button
                    className="btn btn-reset"
                    onClick={handleReset}
                    disabled={!isRunning && !startTime}
                >
                    🔄 Zurücksetzen
                </button>
            </div>

            {isRunning && (
                <div className="timer-warning">
                    <p>⚠️ Der Timer läuft. Schließe nicht das Browser-Fenster.</p>
                </div>
            )}
        </div>
    );
};

export default Timer;