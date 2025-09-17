import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO, getDaysInMonth, startOfMonth, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { formatMinutesToHours, formatMinutesToTime, calculateTotalHours } from './timeCalculations';

/**
 * Generate PDF report for monthly time entries
 * @param {Array} timeEntries - Array of time entry objects for the month
 * @param {string} month - Month in YYYY-MM format
 * @param {object} userInfo - User information for header
 * @param {Array} vacationDays - Array of vacation dates in YYYY-MM-DD format
 * @param {Array} sickDays - Array of sick days in YYYY-MM-DD format
 */
export const generateMonthlyReport = (timeEntries, month, userInfo = {}, vacationDays = [], sickDays = []) => {
    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
        title: `Zeiterfassung ${month}`,
        subject: 'Monatliche Arbeitszeiterfassung',
        author: userInfo.name || 'Zeit Tracking App',
        creator: 'Zeit Tracking App'
    });

    // Modern header with subtle styling
    doc.setFontSize(24);
    doc.setTextColor(40, 40, 40);
    doc.text('Zeiterfassung', 20, 25);

    // Add a subtle line under header
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(20, 28, 190, 28);

    // Month and user information in a more compact layout
    doc.setFontSize(14);
    doc.setTextColor(60, 60, 60);
    const monthName = format(parseISO(`${month}-01`), 'MMMM yyyy', { locale: de });
    doc.text(monthName, 20, 35);

    // User info on same line if available - more compact
    if (userInfo.name || userInfo.company) {
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const userInfoParts = [];
        if (userInfo.name) userInfoParts.push(userInfo.name);
        if (userInfo.company) userInfoParts.push(userInfo.company);
        const userInfoText = userInfoParts.join(' • ');
        doc.text(userInfoText, 130, 35);
    }

    // Generate complete month data including empty days
    const [year, monthNum] = month.split('-');
    const daysInMonth = getDaysInMonth(new Date(year, monthNum - 1));
    const monthStart = startOfMonth(new Date(year, monthNum - 1));

    // Create entry map for quick lookup
    const entryMap = {};
    timeEntries.forEach(entry => {
        entryMap[entry.date] = entry;
    });

    // Generate table data for all days of the month
    const tableData = [];
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = addDays(monthStart, day - 1);
        const dateString = format(currentDate, 'yyyy-MM-dd');
        const entry = entryMap[dateString];

        let rowData;
        if (vacationDays.includes(dateString)) {
            // Vacation day
            rowData = [
                format(currentDate, 'dd.MM', { locale: de }),
                format(currentDate, 'EE', { locale: de }),
                '–',
                '–',
                '–',
                '–',
                '–',
                'Urlaub'
            ];
        } else if (sickDays.includes(dateString)) {
            // Sick day
            rowData = [
                format(currentDate, 'dd.MM', { locale: de }),
                format(currentDate, 'EE', { locale: de }),
                '–',
                '–',
                '–',
                '–',
                '–',
                'Krank'
            ];
        } else if (entry) {
            // Regular work day with entry
            rowData = [
                format(currentDate, 'dd.MM', { locale: de }),
                format(currentDate, 'EE', { locale: de }),
                entry.startTime || '–',
                entry.endTime || '–',
                formatMinutesToTime(entry.breakDuration || 0),
                formatMinutesToTime(entry.duration || 0),
                formatMinutesToTime((entry.duration || 0) - (entry.breakDuration || 0)),
                entry.description || '–'
            ];
        } else {
            // Empty day
            rowData = [
                format(currentDate, 'dd.MM', { locale: de }),
                format(currentDate, 'EE', { locale: de }),
                '–',
                '–',
                '–',
                '–',
                '–',
                '–'
            ];
        }

        tableData.push(rowData);
    }

    // Calculate totals only from actual work entries
    const totals = calculateTotalHours(timeEntries);
    const monthVacationDays = vacationDays.filter(date => date.startsWith(month));
    const monthSickDays = sickDays.filter(date => date.startsWith(month));

    // Add summary row with proper formatting
    tableData.push([
        'Summe',
        '',
        '',
        '',
        formatMinutesToTime(totals.totalBreaks),
        formatMinutesToTime(totals.totalDuration),
        formatMinutesToTime(totals.netTime),
        `${timeEntries.length}T • ${monthVacationDays.length}U • ${monthSickDays.length}K`
    ]);

    // Modern table configuration with minimal design - more compact
    const tableConfig = {
        startY: 45,
        head: [[
            'Datum',
            'Tag',
            'Von',
            'Bis',
            'Pause',
            'Gesamt',
            'Arbeit',
            'Beschreibung'
        ]],
        body: tableData,
        styles: {
            fontSize: 7,
            cellPadding: 1.5,
            textColor: [40, 40, 40],
            lineColor: [220, 220, 220],
            lineWidth: 0.1
        },
        headStyles: {
            fillColor: [250, 250, 250],
            textColor: [40, 40, 40],
            fontSize: 8,
            fontStyle: 'bold',
            lineColor: [180, 180, 180],
            lineWidth: 0.3,
            cellPadding: 2
        },
        alternateRowStyles: {
            fillColor: [252, 252, 252]
        },
        columnStyles: {
            0: { cellWidth: 16, halign: 'center' }, // Datum
            1: { cellWidth: 14, halign: 'center' }, // Tag
            2: { cellWidth: 14, halign: 'center' }, // Von
            3: { cellWidth: 14, halign: 'center' }, // Bis
            4: { cellWidth: 14, halign: 'center' }, // Pause
            5: { cellWidth: 16, halign: 'center' }, // Gesamt
            6: { cellWidth: 16, halign: 'center' }, // Arbeit
            7: { cellWidth: 50, halign: 'left' }    // Beschreibung
        },
        didParseCell: function (data) {
            const rowIndex = data.row.index;
            const isLastRow = rowIndex === tableData.length - 1;
            const isVacation = data.row.raw[7] === 'Urlaub';
            const isSick = data.row.raw[7] === 'Krank';
            const isWeekend = ['Sa', 'So'].includes(data.row.raw[1]);

            if (isLastRow) {
                // Summary row styling
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [240, 240, 240];
                data.cell.styles.textColor = [40, 40, 40];
                data.cell.styles.lineWidth = 0.5;
                data.cell.styles.lineColor = [160, 160, 160];
            } else if (isVacation) {
                // Vacation day - very light blue
                data.cell.styles.fillColor = [248, 252, 255];
                data.cell.styles.textColor = [70, 130, 180];
            } else if (isSick) {
                // Sick day - very light red
                data.cell.styles.fillColor = [255, 248, 248];
                data.cell.styles.textColor = [180, 70, 70];
            } else if (isWeekend) {
                // Weekend - very light gray
                data.cell.styles.fillColor = [248, 248, 248];
                data.cell.styles.textColor = [120, 120, 120];
            }
        },
        margin: { left: 20, right: 20 },
        tableWidth: 'auto'
    };

    // Generate table
    autoTable(doc, tableConfig);

    // Compact summary section at bottom
    const finalY = doc.lastAutoTable.finalY + 8;

    // Summary in a more compact, horizontal layout
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);

    const summaryItems = [
        `Arbeitszeit: ${formatMinutesToTime(totals.netTime)}`,
        `Pausen: ${formatMinutesToTime(totals.totalBreaks)}`,
        `Arbeitstage: ${timeEntries.length}`,
        `Urlaub: ${monthVacationDays.length}`,
        `Krank: ${monthSickDays.length}`
    ];

    const summaryText = summaryItems.join('  •  ');
    doc.text(summaryText, 20, finalY);

    // Modern footer with minimal design
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    const footerText = `Erstellt am ${format(new Date(), 'dd.MM.yyyy', { locale: de })}`;
    doc.text(footerText, 20, doc.internal.pageSize.height - 8);

    return doc;
};

/**
 * Download the generated PDF
 * @param {jsPDF} doc - The PDF document
 * @param {string} filename - Filename for the download
 */
export const downloadPDF = (doc, filename) => {
    doc.save(filename);
};

/**
 * Generate and download monthly report
 * @param {Array} timeEntries - Time entries for the month
 * @param {string} month - Month in YYYY-MM format
 * @param {object} userInfo - User information
 * @param {Array} vacationDays - Array of vacation dates
 * @param {Array} sickDays - Array of sick days
 */
export const generateAndDownloadReport = (timeEntries, month, userInfo = {}, vacationDays = [], sickDays = []) => {
    const doc = generateMonthlyReport(timeEntries, month, userInfo, vacationDays, sickDays);
    const filename = `Zeiterfassung_${month.replace('-', '_')}.pdf`;
    downloadPDF(doc, filename);
};