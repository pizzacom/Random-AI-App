import React, { useState } from 'react';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { getCurrentDate, formatDateGerman } from '../../utils/timeCalculations';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import TimeEntry from '../TimeEntry/TimeEntry';
import TimeEntryForm from './TimeEntryForm';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import './Calendar.css';

const Calendar = () => {
    const { t, currentLanguage } = useLanguage();
    const { addTimeEntry, updateTimeEntry, deleteTimeEntry, getEntriesForDate } = useTimeEntries();
    const [vacationDays, setVacationDays] = useLocalStorage('vacationDays', []);
    const [sickDays, setSickDays] = useLocalStorage('sickDays', []);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(getCurrentDate());
    const [editingEntryId, setEditingEntryId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, entryId: null });

    // Get all entries for selected date (including dummy entries for vacation/sick days)
    const getAllEntriesForDate = (dateStr) => {
        const workEntries = getEntriesForDate(dateStr);
        const allEntries = [...workEntries];

        // Add vacation dummy entry if applicable
        if (vacationDays.includes(dateStr)) {
            allEntries.push({
                id: `vacation-${dateStr}`,
                date: dateStr,
                startTime: '',
                endTime: '',
                duration: 0,
                breakDuration: 0,
                description: t('vacationDay'),
                isVacation: true,
                isDummy: true
            });
        }

        // Add sick day dummy entry if applicable
        if (sickDays.includes(dateStr)) {
            allEntries.push({
                id: `sick-${dateStr}`,
                date: dateStr,
                startTime: '',
                endTime: '',
                duration: 0,
                breakDuration: 0,
                description: t('sickDay'),
                isSick: true,
                isDummy: true
            });
        }

        return allEntries;
    };

    const selectedEntries = getAllEntriesForDate(selectedDate);

    // Generate calendar grid
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add padding days for proper grid alignment
    const startPadding = getDay(monthStart) === 0 ? 6 : getDay(monthStart) - 1; // Monday = 0
    const paddingDays = Array(startPadding).fill(null);

    // Add trailing days to complete the grid (minimum 5 weeks = 35 days, maximum 6 weeks = 42 days)
    const totalDaysWithPadding = paddingDays.length + daysInMonth.length;
    const weeksNeeded = Math.ceil(totalDaysWithPadding / 7);
    const totalDaysNeeded = weeksNeeded * 7;
    const trailingPadding = totalDaysWithPadding < totalDaysNeeded ? Array(totalDaysNeeded - totalDaysWithPadding).fill(null) : [];

    const allCalendarDays = [...paddingDays, ...daysInMonth, ...trailingPadding];

    // Get work intensity for a day based on net working hours (excluding breaks)
    const getWorkIntensity = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');

        // Check if it's a vacation day
        if (vacationDays.includes(dateStr)) {
            return 'vacation';
        }

        // Check if it's a sick day
        if (sickDays.includes(dateStr)) {
            return 'sick';
        }

        const entries = getEntriesForDate(dateStr);
        const totalMinutes = entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        const totalBreakMinutes = entries.reduce((sum, entry) => sum + (entry.breakDuration || 0), 0);
        const netWorkingMinutes = totalMinutes - totalBreakMinutes;
        const netWorkingHours = netWorkingMinutes / 60;

        if (netWorkingHours === 0) return 'none';

        // Check for overtime (net working time > 8 hours)
        if (netWorkingHours > 8) {
            return 'overtime'; // Orange for overtime
        }

        // Normal working day (1-8 net hours)
        if (netWorkingHours >= 1 && netWorkingHours <= 8) {
            return 'normal'; // Green for normal work
        }

        // Less than 1 hour of net work
        if (netWorkingHours < 1) return 'overtime';

        return 'normal';
    };

    // Check if a day has any work entries
    const hasWorkEntries = (dateStr) => {
        const entries = getEntriesForDate(dateStr);
        return entries.length > 0;
    };

    // Toggle vacation day
    const toggleVacationDay = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');

        if (vacationDays.includes(dateStr)) {
            // Remove vacation day
            setVacationDays(vacationDays.filter(day => day !== dateStr));
        } else {
            // Check for conflicts before adding
            if (sickDays.includes(dateStr)) {
                alert(t('cannotSetVacationOnSickDay'));
                return;
            }
            if (hasWorkEntries(dateStr)) {
                alert(t('cannotSetVacationOnWorkDay'));
                return;
            }
            // Add vacation day
            setVacationDays([...vacationDays, dateStr]);
        }
    };

    // Toggle sick day
    const toggleSickDay = (date) => {
        const dateStr = format(date, 'yyyy-MM-dd');

        if (sickDays.includes(dateStr)) {
            // Remove sick day
            setSickDays(sickDays.filter(day => day !== dateStr));
        } else {
            // Check for conflicts before adding
            if (vacationDays.includes(dateStr)) {
                alert(t('cannotSetSickOnVacationDay'));
                return;
            }
            if (hasWorkEntries(dateStr)) {
                alert(t('cannotSetSickOnWorkDay'));
                return;
            }
            // Add sick day
            setSickDays([...sickDays, dateStr]);
        }
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
        if (!id) {
            console.warn('Cannot delete entry: No ID provided. This might be an old entry without proper ID.');
            alert('Cannot delete this entry. It appears to be an old entry without proper identification.');
            return;
        }
        setConfirmDialog({ isOpen: true, entryId: id });
    };

    const handleConfirmDelete = () => {
        if (confirmDialog.entryId) {
            deleteTimeEntry(confirmDialog.entryId);
        }
        setConfirmDialog({ isOpen: false, entryId: null });
    };

    const handleCancelDelete = () => {
        setConfirmDialog({ isOpen: false, entryId: null });
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

    const weekDays = [
        t('monday'), t('tuesday'), t('wednesday'),
        t('thursday'), t('friday'), t('saturday'), t('sunday')
    ];

    return (
        <div className="calendar-container">
            {/* Calendar Grid Section */}
            <div className="calendar-grid-section">
                <div className="calendar-header">
                    <h2>{t('calendarTitle')}</h2>

                    <div className="calendar-navigation">
                        <button className="nav-btn" onClick={handlePrevMonth}>
                            ← {t('previousMonth')}
                        </button>
                        <h3 className="current-month">
                            {format(currentMonth, 'MMMM yyyy', { locale: currentLanguage === 'de' ? de : enUS })}
                        </h3>
                        <button className="nav-btn" onClick={handleNextMonth}>
                            {t('nextMonth')} →
                        </button>
                    </div>

                    <button className="btn btn-secondary today-btn" onClick={handleTodayClick}>
                        📅 {t('today')}
                    </button>
                </div>

                {/* Work Intensity Legend */}
                <div className="work-legend">
                    <span className="legend-item">
                        <div className="legend-color none"></div>
                        {t('legendNone')}
                    </span>
                    <span className="legend-item">
                        <div className="legend-color normal"></div>
                        {t('legendNormal')}
                    </span>
                    <span className="legend-item">
                        <div className="legend-color sick"></div>
                        {t('legendSick')}
                    </span>
                    <span className="legend-item">
                        <div className="legend-color overtime"></div>
                        {t('legendOvertime')}
                    </span>
                    <span className="legend-item">
                        <div className="legend-color vacation"></div>
                        {t('legendVacation')}
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
                                title={`${format(date, 'dd.MM.yyyy', { locale: currentLanguage === 'de' ? de : enUS })} - ${entriesCount} ${t('entries')}`}
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
                        <span className="entries-count">{selectedEntries.length} {t('entries')}</span>
                        {selectedEntries.length > 0 && (
                            <span className="total-time">
                                {Math.round((selectedEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) - selectedEntries.reduce((sum, entry) => sum + (entry.breakDuration || 0), 0)) / 60 * 10) / 10}{t('hours')} {t('totalHours')}
                            </span>
                        )}
                    </div>
                </div>

                <div className="calendar-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleShowForm}
                        disabled={showForm || editingEntryId || vacationDays.includes(selectedDate) || sickDays.includes(selectedDate)}
                    >
                        + {t('newEntry')}
                    </button>

                    <button
                        className={`btn ${vacationDays.includes(selectedDate) ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={() => toggleVacationDay(new Date(selectedDate))}
                        disabled={!vacationDays.includes(selectedDate) && (sickDays.includes(selectedDate) || hasWorkEntries(selectedDate))}
                    >
                        {vacationDays.includes(selectedDate) ? '🏖️ ' + t('removeVacation') : '🏖️ ' + t('setVacation')}
                    </button>

                    <button
                        className={`btn ${sickDays.includes(selectedDate) ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={() => toggleSickDay(new Date(selectedDate))}
                        disabled={!sickDays.includes(selectedDate) && (vacationDays.includes(selectedDate) || hasWorkEntries(selectedDate))}
                    >
                        {sickDays.includes(selectedDate) ? '🤒 ' + t('removeSick') : '🤒 ' + t('setSick')}
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
                            <p>{t('noEntries')}</p>
                            {!vacationDays.includes(selectedDate) && !sickDays.includes(selectedDate) && (
                                <p>{t('clickNewEntry')}</p>
                            )}
                        </div>
                    ) : (
                        selectedEntries
                            .sort((a, b) => {
                                // Sort dummy entries first, then by start time
                                if (a.isDummy && !b.isDummy) return -1;
                                if (!a.isDummy && b.isDummy) return 1;
                                return (a.startTime || '').localeCompare(b.startTime || '');
                            })
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

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                type="danger"
            />
        </div>
    );
};

export default Calendar;