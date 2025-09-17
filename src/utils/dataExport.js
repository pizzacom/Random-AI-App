/**
 * Data Export/Import utilities for Zeit Tracking App
 * Handles CSV export/import and JSON backup functionality
 */

/**
 * Convert time entries array to CSV format
 * @param {Array} timeEntries - Array of time entry objects
 * @returns {string} CSV formatted string
 */
export const exportToCSV = (timeEntries) => {
    if (!timeEntries || timeEntries.length === 0) {
        return 'No data to export';
    }

    // CSV Headers
    const headers = [
        'ID',
        'Date',
        'Start Time',
        'End Time',
        'Break Duration (minutes)',
        'Description',
        'Total Duration (minutes)'
    ];

    // Convert entries to CSV rows
    const rows = timeEntries.map(entry => [
        entry.id || '',
        entry.date || '',
        entry.startTime || '',
        entry.endTime || '',
        entry.breakDuration || 0,
        `"${(entry.description || '').replace(/"/g, '""')}"`, // Escape quotes
        entry.duration || 0
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');

    return csvContent;
};

/**
 * Parse CSV content and convert to time entries array
 * @param {string} csvContent - CSV formatted string
 * @returns {Array} Array of time entry objects
 */
export const importFromCSV = (csvContent) => {
    if (!csvContent || typeof csvContent !== 'string') {
        throw new Error('Invalid CSV content');
    }

    const lines = csvContent.trim().split('\n');

    if (lines.length < 2) {
        throw new Error('CSV file must contain headers and at least one data row');
    }

    // Skip header row
    const dataLines = lines.slice(1);

    const timeEntries = [];

    for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i].trim();
        if (!line) continue;

        try {
            // Simple CSV parsing (handles quoted descriptions)
            const values = parseCSVLine(line);

            if (values.length < 7) {
                console.warn(`Skipping invalid row ${i + 2}: insufficient columns`);
                continue;
            }

            const entry = {
                id: values[0] || `imported-${Date.now()}-${i}`,
                date: values[1] || '',
                startTime: values[2] || '',
                endTime: values[3] || '',
                breakDuration: parseInt(values[4]) || 0,
                description: values[5].replace(/^"|"$/g, '').replace(/""/g, '"') || '', // Remove outer quotes and unescape
                duration: parseInt(values[6]) || 0
            };

            // Validate required fields
            if (!entry.date) {
                console.warn(`Skipping row ${i + 2}: missing date`);
                continue;
            }

            timeEntries.push(entry);
        } catch (error) {
            console.warn(`Error parsing row ${i + 2}:`, error.message);
        }
    }

    return timeEntries;
};

/**
 * Simple CSV line parser that handles quoted fields
 * @param {string} line - CSV line to parse
 * @returns {Array} Array of field values
 */
const parseCSVLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++; // Skip next quote
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            // Field delimiter
            values.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    // Add the last field
    values.push(current);

    return values;
};

/**
 * Download CSV file to user's device
 * @param {string} csvContent - CSV content to download
 * @param {string} filename - Filename for the download
 */
export const downloadCSV = (csvContent, filename = 'zeit-tracking-export.csv') => {
    // Create blob with CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

/**
 * Export to JSON format (more comprehensive backup)
 * @param {Array} timeEntries - Time entries array
 * @param {object} metadata - Additional metadata to include
 * @returns {string} JSON formatted string
 */
export const exportToJSON = (timeEntries, metadata = {}) => {
    const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        application: 'Zeit Tracking App',
        ...metadata,
        data: timeEntries
    };

    return JSON.stringify(exportData, null, 2);
};

/**
 * Import from JSON format
 * @param {string} jsonContent - JSON formatted string
 * @returns {Array} Array of time entry objects
 */
export const importFromJSON = (jsonContent) => {
    try {
        const importData = JSON.parse(jsonContent);

        // Validate JSON structure
        if (!importData.data || !Array.isArray(importData.data)) {
            throw new Error('Invalid JSON format: missing or invalid data array');
        }

        return importData.data;
    } catch (error) {
        throw new Error(`JSON import failed: ${error.message}`);
    }
};

/**
 * Download JSON file to user's device
 * @param {string} jsonContent - JSON content to download
 * @param {string} filename - Filename for the download
 */
export const downloadJSON = (jsonContent, filename = 'zeit-tracking-backup.json') => {
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

/**
 * Read file content from file input
 * @param {File} file - File object from input
 * @returns {Promise<string>} Promise that resolves to file content
 */
export const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
};