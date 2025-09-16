import { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { getCurrentDate } from '../utils/timeCalculations';

/**
 * Custom hook for timer functionality with digital clock
 * @returns {object} Timer state and control functions
 */
export const useTimer = () => {
    const [timerState, setTimerState] = useLocalStorage('timerState', {
        isRunning: false,
        startTimestamp: null, // Store exact timestamp when start was clicked
        endTimestamp: null,   // Store exact timestamp when stop was clicked
        date: null,
        description: ''
    });

    const [currentTime, setCurrentTime] = useState(new Date());
    const intervalRef = useRef(null);

    // Update current time every second for the digital clock
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Restore timer state on page load - handle cases where timer was running
    useEffect(() => {
        if (timerState.isRunning && timerState.startTimestamp) {
            // Timer was running when page was closed - keep it running
            const now = new Date().getTime();
            const elapsedMs = now - timerState.startTimestamp;
            const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60));

            console.log(`Timer wiederherstellen: Timer war ${elapsedMinutes} Minuten aktiv`);

            // Check if timer has been running for more than 24 hours (likely a mistake)
            if (elapsedMs > 24 * 60 * 60 * 1000) {
                console.warn('Timer läuft bereits über 24 Stunden - möglicherweise vergessen zu stoppen?');
            }

            // The timer state is already correct from localStorage
            // The elapsed time calculation will automatically account for the time that passed
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    /**
     * Start the timer
     * @param {string} description - Optional description for the timer session
     */
    const startTimer = (description = '') => {
        const now = new Date();
        const today = getCurrentDate();

        setTimerState({
            isRunning: true,
            startTimestamp: now.getTime(), // Store exact millisecond timestamp
            endTimestamp: null,
            date: today,
            description
        });
    };

    /**
     * Stop the timer and return the session data
     * @returns {object} Timer session data
     */
    const stopTimer = () => {
        if (!timerState.isRunning) return null;

        const now = new Date();
        const endTimestamp = now.getTime();

        // Calculate duration in minutes from exact timestamps
        const durationMs = endTimestamp - timerState.startTimestamp;
        const durationMinutes = Math.round(durationMs / (1000 * 60)); // Round to nearest minute

        // Convert timestamps back to HH:MM format for display
        const startTime = new Date(timerState.startTimestamp).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        const endTime = new Date(endTimestamp).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const sessionData = {
            date: timerState.date,
            startTime: startTime,
            endTime: endTime,
            duration: durationMinutes,
            description: timerState.description
        };

        // Reset timer state
        setTimerState({
            isRunning: false,
            startTimestamp: null,
            endTimestamp: null,
            date: null,
            description: ''
        });

        return sessionData;
    };

    /**
     * Reset the timer completely
     */
    const resetTimer = () => {
        setTimerState({
            isRunning: false,
            startTimestamp: null,
            endTimestamp: null,
            date: null,
            description: ''
        });
    };

    /**
     * Update timer description
     * @param {string} description - New description
     */
    const updateDescription = (description) => {
        setTimerState(prev => ({
            ...prev,
            description
        }));
    };

    /**
     * Get current elapsed time in minutes (based on exact timestamps)
     * @returns {number} Elapsed time in minutes
     */
    const getElapsedTime = () => {
        if (!timerState.startTimestamp) return 0;

        const currentTimestamp = timerState.isRunning ? currentTime.getTime() : timerState.endTimestamp;
        const durationMs = currentTimestamp - timerState.startTimestamp;
        return Math.floor(durationMs / (1000 * 60)); // Floor for real-time display
    };

    /**
     * Get formatted elapsed time as HH:MM
     * @returns {string} Formatted elapsed time
     */
    const getFormattedElapsedTime = () => {
        const minutes = getElapsedTime();
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    /**
     * Get formatted current time for digital clock
     * @returns {string} Current time in HH:MM:SS format
     */
    const getFormattedCurrentTime = () => {
        return currentTime.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    };

    /**
     * Get formatted start time for display
     * @returns {string} Start time in HH:MM format
     */
    const getFormattedStartTime = () => {
        if (!timerState.startTimestamp) return '';
        return new Date(timerState.startTimestamp).toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return {
        isRunning: timerState.isRunning,
        startTime: getFormattedStartTime(),
        digitalClock: getFormattedCurrentTime(),
        date: timerState.date,
        description: timerState.description,
        elapsedTime: getElapsedTime(),
        formattedElapsedTime: getFormattedElapsedTime(),
        startTimer,
        stopTimer,
        resetTimer,
        updateDescription
    };
};