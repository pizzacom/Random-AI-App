import React, { useState, useRef } from 'react';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
    exportToCSV,
    exportToJSON,
    importFromCSV,
    importFromJSON,
    downloadCSV,
    downloadJSON,
    readFileContent
} from '../../utils/dataExport';
import './DataExport.css';

const DataExport = () => {
    const { t } = useLanguage();
    const { timeEntries, addTimeEntry, setTimeEntries } = useTimeEntries();
    const [vacationDays, setVacationDays] = useLocalStorage('vacationDays', []);
    const [sickDays, setSickDays] = useLocalStorage('sickDays', []);
    const [importing, setImporting] = useState(false);
    const [importMessage, setImportMessage] = useState('');
    const [importType, setImportType] = useState('merge'); // 'merge' or 'replace'
    const fileInputRef = useRef(null);

    /**
     * Handle CSV export
     */
    const handleExportCSV = () => {
        try {
            const csvContent = exportToCSV(timeEntries, vacationDays, sickDays);
            const filename = `zeit-tracking-export-${new Date().toISOString().split('T')[0]}.csv`;
            downloadCSV(csvContent, filename);
            setImportMessage(t('csvExported'));
            setTimeout(() => setImportMessage(''), 3000);
        } catch (error) {
            setImportMessage(`${t('exportFailed')} ${error.message}`);
            setTimeout(() => setImportMessage(''), 5000);
        }
    };

    /**
     * Handle JSON export (full backup)
     */
    const handleExportJSON = () => {
        try {
            const metadata = {
                totalEntries: timeEntries.length,
                totalVacationDays: vacationDays.length,
                totalSickDays: sickDays.length,
                dateRange: getDateRange(timeEntries)
            };
            const jsonContent = exportToJSON(timeEntries, metadata, vacationDays, sickDays);
            const filename = `zeit-tracking-backup-${new Date().toISOString().split('T')[0]}.json`;
            downloadJSON(jsonContent, filename);
            setImportMessage(t('jsonExported'));
            setTimeout(() => setImportMessage(''), 3000);
        } catch (error) {
            setImportMessage(`${t('exportFailed')} ${error.message}`);
            setTimeout(() => setImportMessage(''), 5000);
        }
    };

    /**
     * Handle file import
     */
    const handleFileImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setImporting(true);
        setImportMessage(t('importingData'));

        try {
            const content = await readFileContent(file);
            let importData = {};

            // Determine file type and parse accordingly
            if (file.name.toLowerCase().endsWith('.csv')) {
                importData = importFromCSV(content);
            } else if (file.name.toLowerCase().endsWith('.json')) {
                importData = importFromJSON(content);
            } else {
                throw new Error(t('unsupportedFile'));
            }

            const { timeEntries: importedEntries, vacationDays: importedVacationDays, sickDays: importedSickDays } = importData;

            if (importedEntries.length === 0 && importedVacationDays.length === 0 && importedSickDays.length === 0) {
                setImportMessage(t('noValidEntries'));
                return;
            }

            // Apply import based on type
            if (importType === 'replace') {
                setTimeEntries(importedEntries);
                setVacationDays(importedVacationDays);
                setSickDays(importedSickDays);
                const totalImported = importedEntries.length + importedVacationDays.length + importedSickDays.length;
                setImportMessage(t('dataReplaced', { count: totalImported }));
            } else {
                // Merge mode: avoid duplicates
                const existingEntries = timeEntries;
                const newEntries = importedEntries.filter(importedEntry => {
                    return !existingEntries.some(existing =>
                        existing.date === importedEntry.date &&
                        existing.startTime === importedEntry.startTime &&
                        existing.endTime === importedEntry.endTime
                    );
                });

                // Merge vacation days (avoid duplicates)
                const newVacationDays = importedVacationDays.filter(date => !vacationDays.includes(date));
                const newSickDays = importedSickDays.filter(date => !sickDays.includes(date));

                const totalNew = newEntries.length + newVacationDays.length + newSickDays.length;

                if (totalNew === 0) {
                    setImportMessage(t('noNewEntries'));
                } else {
                    newEntries.forEach(entry => {
                        // Generate new ID for merged entries
                        addTimeEntry({ ...entry, id: undefined });
                    });

                    // Add new vacation and sick days
                    if (newVacationDays.length > 0) {
                        setVacationDays([...vacationDays, ...newVacationDays]);
                    }
                    if (newSickDays.length > 0) {
                        setSickDays([...sickDays, ...newSickDays]);
                    }

                    setImportMessage(t('dataMerged', { count: totalNew }));
                }
            }

        } catch (error) {
            setImportMessage(`${t('importFailed')} ${error.message}`);
        } finally {
            setImporting(false);
            // Clear file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setTimeout(() => setImportMessage(''), 5000);
        }
    };

    /**
     * Get date range from time entries for metadata
     */
    const getDateRange = (entries) => {
        if (entries.length === 0) return null;

        const dates = entries.map(entry => entry.date).filter(Boolean).sort();
        return {
            from: dates[0],
            to: dates[dates.length - 1]
        };
    };

    return (
        <div className="data-export">
            <h3>📊 {t('dataExportTitle')}</h3>

            {/* Export Section */}
            <div className="export-section">
                <h4>{t('exportData')}</h4>
                <div className="export-buttons">
                    <button
                        onClick={handleExportCSV}
                        className="export-btn csv-btn"
                        disabled={timeEntries.length === 0 && vacationDays.length === 0 && sickDays.length === 0}
                    >
                        📄 {t('exportCsv')}
                        <span className="btn-description">
                            {t('csvDescription')}
                        </span>
                    </button>

                    <button
                        onClick={handleExportJSON}
                        className="export-btn json-btn"
                        disabled={timeEntries.length === 0 && vacationDays.length === 0 && sickDays.length === 0}
                    >
                        🗃️ {t('exportJson')}
                        <span className="btn-description">
                            {t('jsonDescription')}
                        </span>
                    </button>
                </div>

                {timeEntries.length === 0 && vacationDays.length === 0 && sickDays.length === 0 && (
                    <p className="no-data-message">
                        ℹ️ {t('noDataToExport')}
                    </p>
                )}
            </div>

            {/* Import Section */}
            <div className="import-section">
                <h4>{t('importData')}</h4>

                <div className="import-options">
                    <label className="import-type-label">
                        <input
                            type="radio"
                            name="importType"
                            value="merge"
                            checked={importType === 'merge'}
                            onChange={(e) => setImportType(e.target.value)}
                        />
                        <span>{t('mergeData')}</span>
                        <small>{t('mergeDescription')}</small>
                    </label>

                    <label className="import-type-label">
                        <input
                            type="radio"
                            name="importType"
                            value="replace"
                            checked={importType === 'replace'}
                            onChange={(e) => setImportType(e.target.value)}
                        />
                        <span>{t('replaceData')}</span>
                        <small>{t('replaceDescription')}</small>
                    </label>
                </div>

                <div className="file-input-container">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv,.json"
                        onChange={handleFileImport}
                        disabled={importing}
                        className="file-input"
                        id="data-import-file"
                    />
                    <label htmlFor="data-import-file" className="file-input-label">
                        {importing ? t('importing') : `📁 ${t('chooseFile')}`}
                    </label>
                </div>

                <div className="import-info">
                    <p><strong>{t('supportedFormats')}</strong></p>
                    <ul>
                        <li><strong>CSV:</strong> {t('csvFormat')}</li>
                        <li><strong>JSON:</strong> {t('jsonFormat')}</li>
                    </ul>
                </div>
            </div>

            {/* Status Messages */}
            {importMessage && (
                <div className={`import-message ${importMessage.startsWith('❌') ? 'error' :
                    importMessage.startsWith('⚠️') ? 'warning' : 'success'}`}>
                    {importMessage}
                </div>
            )}
        </div>
    );
};

export default DataExport;