import React, { useState } from 'react';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { getCurrentDate, formatDateGerman } from '../../utils/timeCalculations';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { de } from 'date-fns/locale';
import TimeEntry from '../TimeEntry/TimeEntry';
import TimeEntryForm from './TimeEntryForm';
import './Calendar.css';

const Calendar = () => {
    const { addTimeEntry, updateTimeEntry, deleteTimeEntry, getEntriesForDate } = useTimeEntries();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(getCurrentDate());
    const [editingEntryId, setEditingEntryId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const selectedEntries = getEntriesForDate(selectedDate);

    // Generate calendar grid
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add padding days for proper grid alignment
    const startPadding = getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1; // Monday = 0
    const paddingDays = Array(startPadding).fill(null);

    const allCalendarDays = [...paddingDays, ...daysInMonth];

    // Get work intensity for a day based on total hours
    const getWorkIntensity = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const entries = getEntriesForDate(dateStr);
        const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        const totalHours = totalMinutes / 60;

        if (totalHours === 0) return 'none';
        if (totalHours < 2) return 'light';
        if (totalHours < 6) return 'normal';
        return 'heavy';
    };

    const handleDateClick = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        setSelectedDate(dateStr);
        setEditingEntryId(null);
        setShowForm(false);
    };

    const handlePrevMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const handleTodayClick = () => {
        const today = new Date();
        setCurrentMonth(today);
        setSelectedDate(getCurrentDate());
    };

    const handleAddEntry = (entryData) => {
        addTimeEntry({
            ...entryData,
            date: selectedDate
        });
        setShowForm(false);
    };

    const handleUpdateEntry = (id, updates) => {
        updateTimeEntry(id, updates);
        setEditingEntryId(null);
    };

    const handleDeleteEntry = (id) => {
        if (window.confirm('Eintrag wirklich löschen?')) {
            deleteTimeEntry(id);
        }
    };

    const handleEditEntry = (id) => {
        setEditingEntryId(id);
        setShowForm(false);
    };

    const handleCancelEdit = () => {
        setEditingEntryId(null);
    };

    const handleShowForm = () => {
        setShowForm(true);
        setEditingEntryId(null);
    };

    const handleCancelForm = () => {
        setShowForm(false);
    };

    const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

    return (
        <div className="calendar-container">
            {/* Calendar Grid Section */}
            <div className="calendar-grid-section">
                <div className="calendar-header">
                    <h2>Arbeitskalender</h2>

                    <div className="calendar-navigation">
                        <button className="nav-btn" onClick={handlePrevMonth}>
                            ← Vorheriger Monat
                        </button>
                        <h3 className="current-month">
                            {format(currentMonth, 'MMMM yyyy', { locale: de })}
                        </h3>
                        <button className="nav-btn" onClick={handleNextMonth}>
                            Nächster Monat →
                        </button>
                    </div>

                    <button className="btn btn-secondary today-btn" onClick={handleTodayClick}>
                        📅 Heute
                    </button>
                </div>

                {/* Work Intensity Legend */}
                <div className="work-legend">
                    <span className="legend-item">
                        <div className="legend-color none"></div>
                        Keine Arbeit
                    </span>
                    <span className="legend-item">
                        <div className="legend-color light"></div>
                        Wenig (&lt;2h)
                    </span>
                    <span className="legend-item">
                        <div className="legend-color normal"></div>
                        Normal (2-6h)
                    </span>
                    <span className="legend-item">
                        <div className="legend-color heavy"></div>
                        Viel (&gt;6h)
                    </span>
                </div>

                {/* Calendar Grid */}
                <div className="calendar-grid">
                    {/* Week day headers */}
                    {weekDays.map(day => (
                        <div key={day} className="calendar-weekday">
                            {day}
                        </div>
                    ))}

                    {/* Calendar days */}
                    {allCalendarDays.map((date, index) => {
                        if (!date) {
                            return <div key={`empty-${index}`} className="calendar-day empty"></div>;
                        }

                        const dateStr = format(date, 'yyyy-MM-dd');
                        const isSelected = dateStr === selectedDate;
                        const isToday = isSameDay(date, new Date());
                        const workIntensity = getWorkIntensity(date);
                        const entriesCount = getEntriesForDate(dateStr).length;

                        return (
                            <div
                                key={dateStr}
                                className={`calendar-day ${workIntensity} ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                                onClick={() => handleDateClick(date)}
                                title={`${format(date, 'dd.MM.yyyy', { locale: de })} - ${entriesCount} Einträge`}
                            >
                                <div className="day-number">{format(date, 'd')}</div>
                                {entriesCount > 0 && (
                                    <div className="entries-indicator">{entriesCount}</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Details Section */}
            <div className="selected-day-section">
                <div className="selected-date-header">
                    <h3>{formatDateGerman(selectedDate, 'EEEE, dd. MMMM yyyy')}</h3>
                    <div className="day-summary">
                        <span className="entries-count">{selectedEntries.length} Einträge</span>
                        {selectedEntries.length > 0 && (
                            <span className="total-time">
                                {Math.round(selectedEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) / 60 * 10) / 10}h gesamt
                            </span>
                        )}
                    </div>
                </div>

                <div className="calendar-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleShowForm}
                        disabled={showForm || editingEntryId}
                    >
                        ➕ Neuer Eintrag
                    </button>
                </div>

                {showForm && (
                    <TimeEntryForm
                        onSave={handleAddEntry}
                        onCancel={handleCancelForm}
                    />
                )}

                <div className="time-entries-list">
                    {selectedEntries.length === 0 ? (
                        <div className="no-entries">
                            <p>Keine Zeiteinträge für dieses Datum.</p>
                            <p>Klicke auf "Neuer Eintrag" um einen hinzuzufügen.</p>
                        </div>
                    ) : (
                        selectedEntries
                            .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
                            .map(entry => (
                                <TimeEntry
                                    key={entry.id}
                                    entry={entry}
                                    onUpdate={handleUpdateEntry}
                                    onDelete={handleDeleteEntry}
                                    isEditing={editingEntryId === entry.id}
                                    onEdit={handleEditEntry}
                                    onCancelEdit={handleCancelEdit}
                                />
                            ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Calendar;