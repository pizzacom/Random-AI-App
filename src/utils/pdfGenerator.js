import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { formatMinutesToHours, formatMinutesToTime, calculateTotalHours } from './timeCalculations';

/**
 * Generate PDF report for monthly time entries
 * @param {Array} timeEntries - Array of time entry objects for the month
 * @param {string} month - Month in YYYY-MM format
 * @param {object} userInfo - User information for header
 */
export const generateMonthlyReport = (timeEntries, month, userInfo = {}) => {
    const doc = new jsPDF();

    // Set document properties
    doc.setProperties({
        title: `Zeiterfassung ${month}`,
        subject: 'Monatliche Arbeitszeiterfassung',
        author: userInfo.name || 'Zeit Tracking App',
        creator: 'Zeit Tracking App'
    });

    // Header
    doc.setFontSize(20);
    doc.text('Zeiterfassung', 20, 25);

    doc.setFontSize(12);
    const monthName = format(parseISO(`${month}-01`), 'MMMM yyyy', { locale: de });
    doc.text(`Monat: ${monthName}`, 20, 35);

    if (userInfo.name) {
        doc.text(`Name: ${userInfo.name}`, 20, 45);
    }
    if (userInfo.company) {
        doc.text(`Firma: ${userInfo.company}`, 20, 55);
    }

    // Prepare table data
    const tableData = timeEntries.map(entry => [
        format(parseISO(entry.date), 'dd.MM.yyyy', { locale: de }),
        format(parseISO(entry.date), 'EEEE', { locale: de }),
        entry.startTime || '-',
        entry.endTime || '-',
        formatMinutesToTime(entry.breakDuration || 0),
        formatMinutesToTime(entry.duration || 0),
        formatMinutesToHours(entry.duration - (entry.breakDuration || 0)),
        entry.description || ''
    ]);

    // Calculate totals
    const totals = calculateTotalHours(timeEntries);

    // Add total row
    tableData.push([
        'Gesamt',
        '',
        '',
        '',
        formatMinutesToTime(totals.totalBreaks),
        formatMinutesToTime(totals.totalDuration),
        formatMinutesToHours(totals.netTime),
        ''
    ]);

    // Table configuration
    const tableConfig = {
        startY: userInfo.company ? 65 : 55,
        head: [[
            'Datum',
            'Wochentag',
            'Beginn',
            'Ende',
            'Pause',
            'Gesamt',
            'Arbeitszeit (h)',
            'Beschreibung'
        ]],
        body: tableData,
        styles: {
            fontSize: 10,
            cellPadding: 3,
        },
        headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255,
            fontSize: 10,
            fontStyle: 'bold'
        },
        alternateRowStyles: {
            fillColor: [245, 245, 245]
        },
        columnStyles: {
            0: { cellWidth: 25 }, // Datum
            1: { cellWidth: 25 }, // Wochentag
            2: { cellWidth: 20 }, // Beginn
            3: { cellWidth: 20 }, // Ende
            4: { cellWidth: 20 }, // Pause
            5: { cellWidth: 20 }, // Gesamt
            6: { cellWidth: 25 }, // Arbeitszeit
            7: { cellWidth: 35 }  // Beschreibung
        },
        didParseCell: function (data) {
            // Style the total row
            if (data.row.index === tableData.length - 1) {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.fillColor = [220, 220, 220];
            }
        }
    };

    // Generate table
    doc.autoTable(tableConfig);

    // Add summary section
    const finalY = doc.lastAutoTable.finalY + 20;

    doc.setFontSize(12);
    doc.text('Zusammenfassung:', 20, finalY);

    doc.setFontSize(10);
    doc.text(`Gesamte Arbeitszeit: ${formatMinutesToHours(totals.netTime)} Stunden`, 20, finalY + 10);
    doc.text(`Gesamte Pausenzeit: ${formatMinutesToHours(totals.totalBreaks)} Stunden`, 20, finalY + 20);
    doc.text(`Arbeitstage: ${timeEntries.filter(entry => entry.duration > 0).length}`, 20, finalY + 30);

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
            `Erstellt am ${format(new Date(), 'dd.MM.yyyy HH:mm', { locale: de })} - Seite ${i} von ${pageCount}`,
            20,
            doc.internal.pageSize.height - 10
        );
    }

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
 */
export const generateAndDownloadReport = (timeEntries, month, userInfo = {}) => {
    const doc = generateMonthlyReport(timeEntries, month, userInfo);
    const filename = `Zeiterfassung_${month.replace('-', '_')}.pdf`;
    downloadPDF(doc, filename);
};