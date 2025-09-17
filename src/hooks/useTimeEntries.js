import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from './useLocalStorage';
import { calculateDuration, getCurrentDate } from '../utils/timeCalculations';

/**
 * Custom hook for managing time entries
 * @returns {object} Time entries state and management functions
 */
export const useTimeEntries = () => {
    const [timeEntries, setTimeEntries] = useLocalStorage('timeEntries', []);

    /**
     * Add a new time entry
     * @param {object} entry - Time entry object
     * @returns {string} ID of the created entry
     */
    const addTimeEntry = (entry) => {
        const newEntry = {
            id: uuidv4(),
            date: entry.date || getCurrentDate(),
            startTime: entry.startTime || '',
            endTime: entry.endTime || '',
            breakDuration: entry.breakDuration || 0,
            description: entry.description || '',
            duration: 0,
            ...entry
        };

        // Calculate duration if start and end times are provided
        if (newEntry.startTime && newEntry.endTime) {
            newEntry.duration = calculateDuration(newEntry.startTime, newEntry.endTime);
        }

        setTimeEntries(prev => [...prev, newEntry]);
        return newEntry.id;
    };

    /**
     * Update an existing time entry
     * @param {string} id - Entry ID
     * @param {object} updates - Fields to update
     */
    const updateTimeEntry = (id, updates) => {
        setTimeEntries(prev =>
            prev.map(entry => {
                if (entry.id === id) {
                    const updatedEntry = { ...entry, ...updates };

                    // Recalculate duration if start or end time changed
                    if (updatedEntry.startTime && updatedEntry.endTime) {
                        updatedEntry.duration = calculateDuration(updatedEntry.startTime, updatedEntry.endTime);
                    }

                    return updatedEntry;
                }
                return entry;
            })
        );
    };

    /**
     * Delete a time entry
     * @param {string} id - Entry ID
     */
    const deleteTimeEntry = (id) => {
        setTimeEntries(prev => prev.filter(entry => entry.id !== id));
    };

    /**
     * Get time entries for a specific date
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Array} Array of time entries for the date
     */
    const getEntriesForDate = (date) => {
        return timeEntries.filter(entry => entry.date === date);
    };

    /**
     * Get time entries for a specific month
     * @param {string} month - Month in YYYY-MM format
     * @returns {Array} Array of time entries for the month
     */
    const getEntriesForMonth = (month) => {
        return timeEntries.filter(entry => entry.date.startsWith(month));
    };

    /**
     * Clear all time entries
     */
    const clearAllEntries = () => {
        setTimeEntries([]);
    };

    /**
     * Export all time entries as JSON
     * @returns {string} JSON string of all entries
     */
    const exportEntries = () => {
        return JSON.stringify(timeEntries, null, 2);
    };

    /**
     * Import time entries from JSON
     * @param {string} jsonData - JSON string of entries
     * @param {boolean} merge - Whether to merge with existing entries or replace
     */
    const importEntries = (jsonData, merge = true) => {
        try {
            const importedEntries = JSON.parse(jsonData);

            if (!Array.isArray(importedEntries)) {
                throw new Error('Invalid data format');
            }

            // Validate entries and ensure they have required fields
            const validEntries = importedEntries.map(entry => ({
                id: entry.id || uuidv4(),
                date: entry.date || getCurrentDate(),
                startTime: entry.startTime || '',
                endTime: entry.endTime || '',
                breakDuration: entry.breakDuration || 0,
                description: entry.description || '',
                duration: entry.duration || 0
            }));

            if (merge) {
                setTimeEntries(prev => [...prev, ...validEntries]);
            } else {
                setTimeEntries(validEntries);
            }

            return true;
        } catch (error) {
            console.error('Error importing entries:', error);
            return false;
        }
    };

    return {
        timeEntries,
        setTimeEntries,
        addTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        getEntriesForDate,
        getEntriesForMonth,
        clearAllEntries,
        exportEntries,
        importEntries
    };
};