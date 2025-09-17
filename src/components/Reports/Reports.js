import React, { useState } from 'react';
import { useTimeEntries } from '../../hooks/useTimeEntries';
import { useLanguage } from '../../contexts/LanguageContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { generateAndDownloadReport } from '../../utils/pdfGenerator';
import { formatDateGerman, calculateTotalHours, formatMinutesToHours, formatMinutesToTime } from '../../utils/timeCalculations';
import { format, parseISO } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import './Reports.css';

// Enhanced Year Grid Selector Component
const YearGridSelector = ({ selectedMonth, onMonthChange }) => {
    const { currentLanguage } = useLanguage();
    const [selectedYear, setSelectedYear] = useState(() => {
        return parseInt(selectedMonth.split('-')[0]);
    });
    const [isGridVisible, setIsGridVisible] = useState(false);
    const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const selectedMonthNum = parseInt(selectedMonth.split('-')[1]);

    const months = currentLanguage === 'de'
        ? ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate year options (current year ± 10 years)
    const generateYearOptions = () => {
        const years = [];
        for (let i = currentYear - 10; i <= currentYear + 5; i++) {
            years.push(i);
        }
        return years;
    };

    const yearOptions = generateYearOptions();

    const handleYearChange = (direction) => {
        const newYear = selectedYear + direction;
        setSelectedYear(newYear);
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setIsYearDropdownOpen(false);
    };

    const handleMonthSelect = (monthIndex) => {
        const monthValue = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}`;
        onMonthChange(monthValue);
        setIsGridVisible(false); // Close grid after selection
    };

    const isCurrentMonth = (monthIndex) => {
        return selectedYear === currentYear && (monthIndex + 1) === currentMonth;
    };

    const isSelectedMonth = (monthIndex) => {
        return selectedYear === parseInt(selectedMonth.split('-')[0]) && (monthIndex + 1) === selectedMonthNum;
    };

    const getSelectedMonthName = () => {
        const monthIndex = selectedMonthNum - 1;
        return months[monthIndex];
    };

    return (
        <div className="year-grid-selector">
            {/* Date Button */}
            <button
                type="button"
                className={`date-selector-button ${isGridVisible ? 'active' : ''}`}
                onClick={() => setIsGridVisible(!isGridVisible)}
            >
                <span className="selected-date">
                    {getSelectedMonthName()} {selectedYear}
                </span>
                <span className={`dropdown-chevron ${isGridVisible ? 'open' : ''}`}>
                    &#8250;
                </span>
            </button>

            {/* Collapsible Month Grid */}
            {isGridVisible && (
                <div className="month-grid-container">
                    {/* Year Header with Dropdown */}
                    <div className="year-header">
                        <button
                            type="button"
                            className="year-nav-btn"
                            onClick={() => handleYearChange(-1)}
                            title="Vorheriges Jahr"
                        >
                            &#8249;
                        </button>

                        <div className="year-dropdown-wrapper">
                            <button
                                type="button"
                                className={`year-dropdown-button ${isYearDropdownOpen ? 'open' : ''}`}
                                onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                            >
                                <span>{selectedYear}</span>
                                <span className={`year-dropdown-arrow ${isYearDropdownOpen ? 'open' : ''}`}>
                                    &#8250;
                                </span>
                            </button>

                            {isYearDropdownOpen && (
                                <div className="year-dropdown-menu">
                                    {yearOptions.map(year => (
                                        <button
                                            key={year}
                                            type="button"
                                            className={`year-option ${year === selectedYear ? 'selected' : ''}`}
                                            onClick={() => handleYearSelect(year)}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            className="year-nav-btn"
                            onClick={() => handleYearChange(1)}
                            title="Nächstes Jahr"
                        >
                            &#8250;
                        </button>
                    </div>

                    {/* Months Grid */}
                    <div className="months-grid">
                        {months.map((month, index) => (
                            <button
                                key={index}
                                type="button"
                                className={`month-grid-button ${isSelectedMonth(index) ? 'selected' : ''
                                    } ${isCurrentMonth(index) ? 'current' : ''}`}
                                onClick={() => handleMonthSelect(index)}
                                title={`${month} ${selectedYear}`}
                            >
                                {month}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Reports = () => {
    const { t, currentLanguage } = useLanguage();
    const { getEntriesForMonth } = useTimeEntries();
    const [vacationDays] = useLocalStorage('vacationDays', []);
    const [sickDays] = useLocalStorage('sickDays', []);
    const [userInfo] = useLocalStorage('userInfo', { name: '', company: '' });
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

    const monthEntries = getEntriesForMonth(selectedMonth);
    const totals = calculateTotalHours(monthEntries);

    // Calculate vacation and sick days for the selected month
    const monthVacationDays = vacationDays.filter(date => date.startsWith(selectedMonth));
    const monthSickDays = sickDays.filter(date => date.startsWith(selectedMonth));

    // Get all entries including dummy entries for vacation/sick days
    const getAllEntriesForMonth = () => {
        const allEntries = [...monthEntries];

        // Add vacation dummy entries
        monthVacationDays.forEach(date => {
            // Only add if there are no work entries for this date
            if (!monthEntries.some(entry => entry.date === date)) {
                allEntries.push({
                    id: `vacation-${date}`,
                    date: date,
                    startTime: '',
                    endTime: '',
                    duration: 0,
                    breakDuration: 0,
                    description: t('vacationDay'),
                    isVacation: true,
                    isDummy: true
                });
            }
        });

        // Add sick day dummy entries
        monthSickDays.forEach(date => {
            // Only add if there are no work entries for this date
            if (!monthEntries.some(entry => entry.date === date)) {
                allEntries.push({
                    id: `sick-${date}`,
                    date: date,
                    startTime: '',
                    endTime: '',
                    duration: 0,
                    breakDuration: 0,
                    description: t('sickDay'),
                    isSick: true,
                    isDummy: true
                });
            }
        });

        return allEntries;
    };

    const allMonthEntries = getAllEntriesForMonth();

    const handleGenerateReport = () => {
        if (monthEntries.length === 0) {
            alert(t('noEntriesMonth'));
            return;
        }

        generateAndDownloadReport(monthEntries, selectedMonth, userInfo, vacationDays, sickDays);
    };

    // Group entries by date for display (including dummy entries)
    const entriesByDate = allMonthEntries.reduce((acc, entry) => {
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
                <h2>{t('reportsTitle')}</h2>

                <YearGridSelector
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                />
            </div>

            <div className="reports-content">
                <div className="month-summary">
                    <h3>
                        {t('summary')} {format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy', { locale: currentLanguage === 'de' ? de : enUS })}
                    </h3>

                    <div className="summary-stats">
                        <div className="stat-card">
                            <div className="stat-label">{t('workDays')}</div>
                            <div className="stat-value">{monthEntries.filter(entry => entry.duration > 0).length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">{t('totalTime')}</div>
                            <div className="stat-value">{formatMinutesToTime(totals.totalDuration)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">{t('breaks')}</div>
                            <div className="stat-value">{formatMinutesToTime(totals.totalBreaks)}</div>
                        </div>
                        <div className="stat-card highlight">
                            <div className="stat-label">{t('workTime')}</div>
                            <div className="stat-value">{formatMinutesToTime(totals.netTime)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">{t('vacationDays')}</div>
                            <div className="stat-value">{monthVacationDays.length}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">{t('sickDays')}</div>
                            <div className="stat-value">{monthSickDays.length}</div>
                        </div>
                    </div>
                </div>

                <div className="export-section">
                    <button
                        className="btn btn-export"
                        onClick={handleGenerateReport}
                        disabled={monthEntries.length === 0}
                    >
                        📄 {t('pdfExport')}
                    </button>
                    <p className="export-info">
                        {t('exportInfo')}
                    </p>
                </div>

                <div className="entries-preview">
                    <h4>{currentLanguage === 'de' ? 'Vorschau der Einträge' : 'Preview of Entries'}</h4>

                    {allMonthEntries.length === 0 ? (
                        <div className="no-entries">
                            <p>{t('noEntriesMonth')}</p>
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
                                                <span>{t('workTimeLabel')}: {formatMinutesToTime(dayTotals.netTime)}</span>
                                                {dayTotals.totalBreaks > 0 && (
                                                    <span>{t('pauseLabel')}: {formatMinutesToTime(dayTotals.totalBreaks)}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="day-entries">
                                            {dayEntries
                                                .sort((a, b) => {
                                                    // Sort dummy entries first, then by start time
                                                    if (a.isDummy && !b.isDummy) return -1;
                                                    if (!a.isDummy && b.isDummy) return 1;
                                                    return (a.startTime || '').localeCompare(b.startTime || '');
                                                })
                                                .map(entry => (
                                                    <div key={entry.id} className={`entry-row ${entry.isDummy ? 'dummy-entry' : ''}`}>
                                                        <div className="entry-time">
                                                            {entry.isDummy ?
                                                                (entry.isVacation ? '🏖️' : '🤒') :
                                                                `${entry.startTime || '-'} - ${entry.endTime || '-'}`
                                                            }
                                                        </div>
                                                        <div className="entry-duration">
                                                            {entry.isDummy ? '-' : formatMinutesToTime(entry.duration || 0)}
                                                        </div>
                                                        <div className="entry-description">
                                                            {entry.description || t('noDescription')}
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