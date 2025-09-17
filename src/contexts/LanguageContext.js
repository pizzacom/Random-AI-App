import React, { createContext, useContext, useState, useEffect } from 'react';

// Language Context
const LanguageContext = createContext();

// German translations
const translations = {
    de: {
        // Navigation
        timer: 'Timer',
        calendar: 'Kalender',
        reports: 'Berichte',
        data: 'Daten',

        // Timer Component
        timerTitle: 'Zeiterfassung',
        startTime: 'Startzeit',
        endTime: 'Endzeit',
        breakDuration: 'Pausendauer (Minuten)',
        description: 'Beschreibung (optional)',
        startTimer: 'Starten',
        stopTimer: 'Gestoppt',
        manualEntry: 'Manueller Eintrag',
        saveEntry: 'Eintrag speichern',
        cancel: 'Abbrechen',
        currentTimer: 'Aktuelle Zeit',
        elapsedTime: 'Verstrichene Zeit',
        timerRunning: 'Timer läuft',
        timerStopped: 'Timer gestoppt',
        enterDescription: 'Was machst du gerade?',
        enterBreakDuration: '0',
        resetTimer: 'Zurücksetzen',
        timerWarning: 'Der Timer läuft. Schließe nicht das Browser-Fenster.',
        timerRestored: 'Timer wurde wiederhergestellt - läuft seit',

        // Calendar Component
        calendarTitle: 'Kalender - Zeiteinträge',
        newEntry: 'Neuer Eintrag',
        previousMonth: 'Vorheriger Monat',
        nextMonth: 'Nächster Monat',
        today: 'Heute',
        selectedDate: 'Ausgewähltes Datum',
        noEntries: 'Keine Zeiteinträge für dieses Datum.',
        clickNewEntry: 'Klicke auf "Neuer Eintrag" um einen hinzuzufügen.',
        totalHours: 'Stunden gesamt',
        confirmDelete: 'Eintrag löschen?',
        confirmDeleteMessage: 'Dieser Eintrag wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.',

        // Reports Component
        reportsTitle: 'Berichte & PDF Export',
        userInfo: 'Benutzerinformationen',
        editUserInfo: 'bearbeiten',
        hideUserInfo: 'ausblenden',
        name: 'Name',
        company: 'Firma',
        yourName: 'Ihr Name',
        companyName: 'Firmenname',
        save: 'Speichern',
        summary: 'Zusammenfassung für',
        workDays: 'Arbeitstage',
        totalTime: 'Gesamtzeit',
        breaks: 'Pausen',
        workTime: 'Arbeitszeit',
        pdfExport: 'PDF Export',
        exportInfo: 'Erstellt eine professionelle PDF-Datei mit allen Zeiteinträgen des Monats.',
        noEntriesMonth: 'Keine Zeiteinträge für den ausgewählten Monat gefunden.',
        noDescription: 'Keine Beschreibung',
        total: 'Gesamt',

        // Data Export Component
        dataExportTitle: 'Datenexport & Import',
        exportData: 'Daten exportieren',
        exportCsv: 'CSV exportieren',
        exportJson: 'JSON exportieren',
        csvDescription: 'Tabellenformat',
        jsonDescription: 'Komplettes Backup mit Metadaten',
        entries: 'Einträge',
        noDataToExport: 'Keine Zeiteinträge zum Exportieren. Beginne mit der Zeiterfassung, um exportierbare Daten zu erstellen.',
        importData: 'Daten importieren',
        mergeData: 'Mit vorhandenen Daten zusammenführen',
        replaceData: 'Alle Daten ersetzen',
        mergeDescription: 'Neue Einträge hinzufügen ohne aktuelle Daten zu löschen',
        replaceDescription: '⚠️ Dies wird alle aktuellen Einträge löschen',
        chooseFile: 'CSV- oder JSON-Datei auswählen',
        importing: 'Importiere...',
        supportedFormats: 'Unterstützte Formate:',
        csvFormat: 'CSV: Tabellenformat, gut für Datenanalyse',
        jsonFormat: 'JSON: Komplettes Backup mit allen Metadaten',

        // Common
        edit: 'Bearbeiten',
        delete: 'Löschen',
        close: 'Schließen',
        monday: 'Mo',
        tuesday: 'Di',
        wednesday: 'Mi',
        thursday: 'Do',
        friday: 'Fr',
        saturday: 'Sa',
        sunday: 'So',

        // Messages
        csvExported: '✅ CSV erfolgreich exportiert!',
        jsonExported: '✅ JSON-Backup erfolgreich exportiert!',
        exportFailed: '❌ Export fehlgeschlagen:',
        importingData: '📤 Importiere Daten...',
        dataReplaced: '✅ Daten erfolgreich ersetzt! {count} Einträge importiert.',
        dataMerged: '✅ Erfolgreich zusammengeführt! {count} neue Einträge hinzugefügt.',
        noNewEntries: 'ℹ️ Keine neuen Einträge gefunden. Alle Einträge existieren bereits.',
        importFailed: '❌ Import fehlgeschlagen:',
        unsupportedFile: 'Nicht unterstützter Dateityp. Bitte verwende .csv oder .json Dateien.',
        noValidEntries: '⚠️ Keine gültigen Einträge in der Datei gefunden.',

        // Time formats
        hours: 'h',
        minutes: 'Min',

        // Days of week (full)
        mondayFull: 'Montag',
        tuesdayFull: 'Dienstag',
        wednesdayFull: 'Mittwoch',
        thursdayFull: 'Donnerstag',
        fridayFull: 'Freitag',
        saturdayFull: 'Samstag',
        sundayFull: 'Sonntag',

        // Validation errors
        invalidStartTime: 'Ungültige Startzeit',
        invalidEndTime: 'Ungültige Endzeit',
        endTimeAfterStart: 'Endzeit muss nach Startzeit liegen',
        negativeBreak: 'Pause kann nicht negativ sein',
        startTimeRequired: 'Startzeit ist erforderlich',
        endTimeRequired: 'Endzeit ist erforderlich',

        // Time entry labels
        from: 'Von',
        to: 'Bis',
        pauseLabel: 'Pause',
        totalLabel: 'Gesamt',
        workTimeLabel: 'Arbeitszeit',
        optional: 'Optional...',

        // Time picker
        selectTime: 'Zeit auswählen',
        hour: 'Stunde',
        minute: 'Minute'
    },
    en: {
        // Navigation
        timer: 'Timer',
        calendar: 'Calendar',
        reports: 'Reports',
        data: 'Data',

        // Timer Component
        timerTitle: 'Time Tracking',
        startTime: 'Start Time',
        endTime: 'End Time',
        breakDuration: 'Break Duration (Minutes)',
        description: 'Description (optional)',
        startTimer: 'Start',
        stopTimer: 'Stopped',
        manualEntry: 'Manual Entry',
        saveEntry: 'Save Entry',
        cancel: 'Cancel',
        currentTimer: 'Current Time',
        elapsedTime: 'Elapsed Time',
        timerRunning: 'Timer running',
        timerStopped: 'Timer stopped',
        enterDescription: 'What are you working on?',
        enterBreakDuration: '0',
        resetTimer: 'Reset',
        timerWarning: 'Timer is running. Do not close the browser window.',
        timerRestored: 'Timer was restored - running since',

        // Calendar Component
        calendarTitle: 'Calendar - Time Entries',
        newEntry: 'New Entry',
        previousMonth: 'Previous Month',
        nextMonth: 'Next Month',
        today: 'Today',
        selectedDate: 'Selected Date',
        noEntries: 'No time entries for this date.',
        clickNewEntry: 'Click "New Entry" to add one.',
        totalHours: 'hours total',
        confirmDelete: 'Delete Entry?',
        confirmDeleteMessage: 'This entry will be permanently deleted. This action cannot be undone.',

        // Reports Component
        reportsTitle: 'Reports & PDF Export',
        userInfo: 'User Information',
        editUserInfo: 'edit',
        hideUserInfo: 'hide',
        name: 'Name',
        company: 'Company',
        yourName: 'Your Name',
        companyName: 'Company Name',
        save: 'Save',
        summary: 'Summary for',
        workDays: 'Work Days',
        totalTime: 'Total Time',
        breaks: 'Breaks',
        workTime: 'Work Time',
        pdfExport: 'PDF Export',
        exportInfo: 'Creates a professional PDF file with all time entries for the month.',
        noEntriesMonth: 'No time entries found for the selected month.',
        noDescription: 'No Description',
        total: 'Total',

        // Data Export Component
        dataExportTitle: 'Data Export & Import',
        exportData: 'Export Data',
        exportCsv: 'Export CSV',
        exportJson: 'Export JSON',
        csvDescription: 'Spreadsheet format',
        jsonDescription: 'Complete backup with metadata',
        entries: 'entries',
        noDataToExport: 'No time entries to export. Start tracking time to create exportable data.',
        importData: 'Import Data',
        mergeData: 'Merge with existing data',
        replaceData: 'Replace all data',
        mergeDescription: 'Add new entries without deleting current data',
        replaceDescription: '⚠️ This will delete all current entries',
        chooseFile: 'Choose CSV or JSON file',
        importing: 'Importing...',
        supportedFormats: 'Supported formats:',
        csvFormat: 'CSV: Spreadsheet format, good for data analysis',
        jsonFormat: 'JSON: Complete backup with all metadata',

        // Common
        edit: 'Edit',
        delete: 'Delete',
        close: 'Close',
        monday: 'Mo',
        tuesday: 'Tu',
        wednesday: 'We',
        thursday: 'Th',
        friday: 'Fr',
        saturday: 'Sa',
        sunday: 'Su',

        // Messages
        csvExported: '✅ CSV exported successfully!',
        jsonExported: '✅ JSON backup exported successfully!',
        exportFailed: '❌ Export failed:',
        importingData: '📤 Importing data...',
        dataReplaced: '✅ Data replaced successfully! Imported {count} entries.',
        dataMerged: '✅ Merged successfully! Added {count} new entries.',
        noNewEntries: 'ℹ️ No new entries found. All entries already exist.',
        importFailed: '❌ Import failed:',
        unsupportedFile: 'Unsupported file type. Please use .csv or .json files.',
        noValidEntries: '⚠️ No valid entries found in the file.',

        // Time formats
        hours: 'h',
        minutes: 'min',

        // Days of week (full)
        mondayFull: 'Monday',
        tuesdayFull: 'Tuesday',
        wednesdayFull: 'Wednesday',
        thursdayFull: 'Thursday',
        fridayFull: 'Friday',
        saturdayFull: 'Saturday',
        sundayFull: 'Sunday',

        // Validation errors
        invalidStartTime: 'Invalid start time',
        invalidEndTime: 'Invalid end time',
        endTimeAfterStart: 'End time must be after start time',
        negativeBreak: 'Break cannot be negative',
        startTimeRequired: 'Start time is required',
        endTimeRequired: 'End time is required',

        // Time entry labels
        from: 'From',
        to: 'To',
        pauseLabel: 'Break',
        totalLabel: 'Total',
        workTimeLabel: 'Work Time',
        optional: 'Optional...',

        // Time picker
        selectTime: 'Select time',
        hour: 'Hour',
        minute: 'Minute'
    }
};

// Custom hook to use language context
export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

// Language Provider Component
export const LanguageProvider = ({ children }) => {
    // Initialize language from localStorage or default to German
    const getInitialLanguage = () => {
        try {
            const savedLanguage = localStorage.getItem('language');
            if (savedLanguage && translations[savedLanguage]) {
                return savedLanguage;
            }
            return 'de'; // Default to German
        } catch (error) {
            console.warn('Could not access localStorage:', error);
            return 'de';
        }
    };

    const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage);

    useEffect(() => {
        // Save language to localStorage
        try {
            localStorage.setItem('language', currentLanguage);
        } catch (error) {
            console.warn('Could not save language to localStorage:', error);
        }
    }, [currentLanguage]);

    const toggleLanguage = () => {
        setCurrentLanguage(prev => prev === 'de' ? 'en' : 'de');
    };

    const t = (key, replacements = {}) => {
        let text = translations[currentLanguage]?.[key] || translations['de'][key] || key;

        // Replace placeholders like {count}
        Object.keys(replacements).forEach(placeholder => {
            text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), replacements[placeholder]);
        });

        return text;
    };

    return (
        <LanguageContext.Provider value={{
            currentLanguage,
            setCurrentLanguage,
            toggleLanguage,
            t,
            isGerman: currentLanguage === 'de',
            isEnglish: currentLanguage === 'en'
        }}>
            {children}
        </LanguageContext.Provider>
    );
};