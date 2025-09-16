import React, { useState } from 'react';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { generateAndDownloadReport } from '../../utils/pdfGenerator';
import { formatDateGerman, calculateTotalHours, formatMinutesToHours, formatMinutesToTime } from '../../utils/timeCalculations';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import './Reports.css';

const Reports = () => {
    const { getEntriesForMonth } = useTimeEntries();
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [userInfo, setUserInfo] = useState({
        name: '',
        company: ''
    });
    const [showUserForm, setShowUserForm] = useState(false);

    const monthEntries = getEntriesForMonth(selectedMonth);
    const totals = calculateTotalHours(monthEntries);

    const handleGenerateReport = () => {
        if (monthEntries.length === 0) {
            alert('Keine Zeiteinträge für den ausgewählten Monat gefunden.');
            return;
        }

        generateAndDownloadReport(monthEntries, selectedMonth, userInfo);
    };

    const handleUserInfoSave = () => {
        setShowUserForm(false);
    };

    // Group entries by date for display
    const entriesByDate = monthEntries.reduce((acc, entry) => {
        if (!acc[entry.date]) {
            acc[entry.date] = [];
        }
        acc[entry.date].push(entry);
        return acc;
    }, {});

    const sortedDates = Object.keys(entriesByDate).sort();

    return (
        <div className="reports-container">
            <div className="reports-header">
                <h2>Berichte & PDF Export</h2>

                <div className="month-selector">
                    <label htmlFor="month-picker">Monat auswählen:</label>
                    <input
                        type="month"
                        id="month-picker"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                </div>

                <div className="user-info-section">
                    <button
                        className="btn btn-secondary"
                        onClick={() => setShowUserForm(!showUserForm)}
                    >
                        👤 Benutzerinformationen {showUserForm ? 'ausblenden' : 'bearbeiten'}
                    </button>

                    {showUserForm && (
                        <div className="user-info-form">
                            <div className="form-group">
                                <label htmlFor="userName">Name:</label>
                                <input
                                    type="text"
                                    id="userName"
                                    value={userInfo.name}
                                    onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Ihr Name"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="userCompany">Firma:</label>
                                <input
                                    type="text"
                                    id="userCompany"
                                    value={userInfo.company}
                                    onChange={(e) => setUserInfo(prev => ({ ...prev, company: e.target.value }))}
                                    placeholder="Firmenname"
                                />
                            </div>
                            <button className="btn btn-primary" onClick={handleUserInfoSave}>
                                ✓ Speichern
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="reports-content">
                <div className="month-summary">
                    <h3>
                        Zusammenfassung für {format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy', { locale: de })}
                    </h3>

                    <div className="summary-stats">
                        <div className="stat-card">
                            <div className="stat-label">Arbeitstage</div>
                            <div className="stat-value">{monthEntries.filter(entry => entry.duration > 0).length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Gesamtzeit</div>
                            <div className="stat-value">{formatMinutesToTime(totals.totalDuration)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Pausen</div>
                            <div className="stat-value">{formatMinutesToTime(totals.totalBreaks)}</div>
                        </div>
                        <div className="stat-card highlight">
                            <div className="stat-label">Arbeitszeit</div>
                            <div className="stat-value">{formatMinutesToHours(totals.netTime)} h</div>
                        </div>
                    </div>
                </div>

                <div className="export-section">
                    <button
                        className="btn btn-export"
                        onClick={handleGenerateReport}
                        disabled={monthEntries.length === 0}
                    >
                        📄 PDF Export
                    </button>
                    <p className="export-info">
                        Erstellt eine professionelle PDF-Datei mit allen Zeiteinträgen des Monats.
                    </p>
                </div>

                <div className="entries-preview">
                    <h4>Vorschau der Einträge</h4>

                    {monthEntries.length === 0 ? (
                        <div className="no-entries">
                            <p>Keine Zeiteinträge für den ausgewählten Monat.</p>
                        </div>
                    ) : (
                        <div className="entries-list">
                            {sortedDates.map(date => {
                                const dayEntries = entriesByDate[date];
                                const dayTotals = calculateTotalHours(dayEntries);

                                return (
                                    <div key={date} className="day-group">
                                        <div className="day-header">
                                            <h5>{formatDateGerman(date, 'EEEE, dd.MM.yyyy')}</h5>
                                            <div className="day-totals">
                                                <span>Arbeitszeit: {formatMinutesToTime(dayTotals.netTime)}</span>
                                                {dayTotals.totalBreaks > 0 && (
                                                    <span>Pause: {formatMinutesToTime(dayTotals.totalBreaks)}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="day-entries">
                                            {dayEntries
                                                .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                                                .map(entry => (
                                                    <div key={entry.id} className="entry-row">
                                                        <div className="entry-time">
                                                            {entry.startTime || '-'} - {entry.endTime || '-'}
                                                        </div>
                                                        <div className="entry-duration">
                                                            {formatMinutesToTime(entry.duration || 0)}
                                                        </div>
                                                        <div className="entry-description">
                                                            {entry.description || 'Kein Beschreibung'}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;