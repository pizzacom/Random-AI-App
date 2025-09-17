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
    const [timerMinutes, setTimerMinutes] = useState(0); // Track timer minutes separately
    const intervalRef = useRef(null);

    // Update current time every second for the digital clock, timer minutes separately
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);

            // Update timer minutes only when timer is running
            if (timerState.isRunning && timerState.startTimestamp) {
                const startTime = new Date(timerState.startTimestamp);

                // Calculate elapsed minutes based on real-time minute boundaries
                const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
                const currentMinutes = now.getHours() * 60 + now.getMinutes();

                // Handle day boundary crossing
                let elapsedMinutes;
                if (currentMinutes >= startMinutes) {
                    elapsedMinutes = currentMinutes - startMinutes;
                } else {
                    // Crossed midnight
                    elapsedMinutes = (24 * 60 - startMinutes) + currentMinutes;
                }

                setTimerMinutes(elapsedMinutes);
            }
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
            const now = new Date();
            const startTime = new Date(timerState.startTimestamp);

            // Calculate elapsed minutes based on real-time minute boundaries
            const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
            const currentMinutes = now.getHours() * 60 + now.getMinutes();

            // Handle day boundary crossing
            let elapsedMinutes;
            if (currentMinutes >= startMinutes) {
                elapsedMinutes = currentMinutes - startMinutes;
            } else {
                // Crossed midnight
                elapsedMinutes = (24 * 60 - startMinutes) + currentMinutes;
            }

            console.log(`Timer wiederherstellen: Timer war ${elapsedMinutes} Minuten aktiv`);

            // Initialize timer minutes for restored timer
            setTimerMinutes(elapsedMinutes);

            // Check if timer has been running for more than 24 hours (likely a mistake)
            if (elapsedMinutes > 24 * 60) {
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

        setTimerMinutes(0); // Reset timer minutes when starting

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
     * Get current elapsed time in minutes (based on real-time minute boundaries)
     * @returns {number} Elapsed time in minutes
     */
    const getElapsedTime = () => {
        if (!timerState.startTimestamp) return 0;

        if (timerState.isRunning) {
            // When running, use the timerMinutes state which updates based on real-time minute boundaries
            return timerMinutes;
        } else {
            // When stopped, calculate from end timestamp using real-time minute boundaries
            const startTime = new Date(timerState.startTimestamp);
            const endTime = new Date(timerState.endTimestamp);

            const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
            const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();

            // Handle day boundary crossing
            let elapsedMinutes;
            if (endMinutes >= startMinutes) {
                elapsedMinutes = endMinutes - startMinutes;
            } else {
                // Crossed midnight
                elapsedMinutes = (24 * 60 - startMinutes) + endMinutes;
            }

            return elapsedMinutes;
        }
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