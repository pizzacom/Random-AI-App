import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';

/**
 * Calculate duration in minutes between start and end time
 * @param {string} startTime - HH:MM format
 * @param {string} endTime - HH:MM format
 * @returns {number} Duration in minutes
 */
export const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;

    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    let startTotalMinutes = startHours * 60 + startMinutes;
    let endTotalMinutes = endHours * 60 + endMinutes;

    // Handle overnight sessions (crossing midnight)
    if (endTotalMinutes < startTotalMinutes) {
        endTotalMinutes += 24 * 60; // Add 24 hours
    }

    return endTotalMinutes - startTotalMinutes;
};

/**
 * Calculate net working time (duration minus break)
 * @param {number} duration - Total duration in minutes
 * @param {number} breakDuration - Break duration in minutes
 * @returns {number} Net working time in minutes
 */
export const calculateNetTime = (duration, breakDuration = 0) => {
    return Math.max(0, duration - breakDuration);
};

/**
 * Format minutes to HH:MM format
 * @param {number} minutes - Minutes to format
 * @returns {string} Formatted time as HH:MM
 */
export const formatMinutesToTime = (minutes) => {
    if (minutes < 0) return '00:00';

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Format minutes to hours with decimal places
 * @param {number} minutes - Minutes to format
 * @returns {string} Formatted hours with 2 decimal places
 */
export const formatMinutesToHours = (minutes) => {
    const hours = minutes / 60;
    return hours.toFixed(2);
};

/**
 * Get current time in HH:MM format
 * @returns {string} Current time as HH:MM
 */
export const getCurrentTime = () => {
    const now = new Date();
    return format(now, 'HH:mm');
};

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} Current date as YYYY-MM-DD
 */
export const getCurrentDate = () => {
    const now = new Date();
    return format(now, 'yyyy-MM-dd');
};

/**
 * Validate time format (HH:MM)
 * @param {string} time - Time string to validate
 * @returns {boolean} True if valid time format
 */
export const isValidTime = (time) => {
    if (!time) return false;

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
};

/**
 * Validate that end time is after start time
 * @param {string} startTime - Start time in HH:MM format
 * @param {string} endTime - End time in HH:MM format
 * @returns {boolean} True if end time is after start time
 */
export const isValidTimeRange = (startTime, endTime) => {
    if (!isValidTime(startTime) || !isValidTime(endTime)) return false;

    const duration = calculateDuration(startTime, endTime);
    return duration > 0;
};

/**
 * Get all days in a month
 * @param {string} date - Date string in YYYY-MM-DD format
 * @returns {Date[]} Array of Date objects for each day in the month
 */
export const getDaysInMonth = (date) => {
    const targetDate = parseISO(date);
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);

    return eachDayOfInterval({ start, end });
};

/**
 * Format date for display in German locale
 * @param {Date|string} date - Date to format
 * @param {string} formatString - Format string for date-fns
 * @returns {string} Formatted date string
 */
export const formatDateGerman = (date, formatString = 'dd.MM.yyyy') => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString, { locale: de });
};

/**
 * Calculate total working hours for multiple time entries
 * @param {Array} timeEntries - Array of time entry objects
 * @returns {object} Object with total duration and net time in minutes
 */
export const calculateTotalHours = (timeEntries) => {
    const totalDuration = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const totalBreaks = timeEntries.reduce((sum, entry) => sum + (entry.breakDuration || 0), 0);
    const netTime = totalDuration - totalBreaks;

    return {
        totalDuration,
        totalBreaks,
        netTime
    };
};