# Zeit Tracking App - Data Export/Import

## 🎉 **NEW FEATURE: Data Export & Import**

Your Zeit Tracking App now supports comprehensive data backup and restore functionality! Never lose your time tracking data again.

## 📊 **Features**

### **Export Options**
- **CSV Export**: Spreadsheet-compatible format for data analysis
- **JSON Export**: Complete backup with metadata

### **Import Options**
- **Merge Mode**: Add new entries without deleting existing data
- **Replace Mode**: Complete data replacement (with confirmation)

### **Data Protection**
- Duplicate detection during merge imports
- Data validation and error handling
- Automatic file format detection

## 🔧 **How to Use**

### **Exporting Data**
1. Navigate to the "💾 Daten" tab
2. Choose your preferred format:
   - **CSV**: For Excel, Google Sheets, or data analysis
   - **JSON**: For complete backup with metadata
3. Click the export button - file downloads automatically

### **Importing Data**
1. Choose import mode:
   - **Merge**: Adds new entries to existing data
   - **Replace**: Replaces all current data (⚠️ destructive)
2. Select your CSV or JSON file
3. Click "Choose file" and select your backup
4. Import progress and results are displayed

## 📋 **File Formats**

### **CSV Format**
```csv
ID,Date,Start Time,End Time,Break Duration (minutes),Description,Total Duration (minutes)
entry-123,2025-09-17,09:00,17:30,60,"Project work - development",450
entry-124,2025-09-18,08:30,16:00,45,"Meeting and documentation",405
```

### **JSON Format**
```json
{
  "version": "1.0",
  "exportDate": "2025-09-17T10:30:00.000Z",
  "application": "Zeit Tracking App",
  "totalEntries": 2,
  "dateRange": {
    "from": "2025-09-17",
    "to": "2025-09-18"
  },
  "data": [
    {
      "id": "entry-123",
      "date": "2025-09-17",
      "startTime": "09:00",
      "endTime": "17:30",
      "breakDuration": 60,
      "description": "Project work - development",
      "duration": 450
    }
  ]
}
```

## 🛡️ **Data Safety**

### **Backup Recommendations**
- Export your data weekly to prevent loss
- Keep multiple backup files with dates
- Test imports with small datasets first

### **Browser Storage**
- Data is stored in browser's localStorage
- Clearing browser data deletes time entries
- Regular exports protect against data loss

### **File Security**
- CSV files can be password-protected in Excel
- JSON files contain all app metadata
- No sensitive data is included by default

## 🚀 **Use Cases**

### **Data Analysis**
- Import CSV into Excel for charts and analysis
- Calculate monthly/yearly working hours
- Track productivity patterns

### **Backup & Restore**
- Regular automated backups
- Migrate data between devices
- Recover from browser data loss

### **Data Sharing**
- Share time logs with managers
- Submit timesheets in standardized format
- Integrate with payroll systems

## 🔄 **Migration Guide**

### **From Old Versions**
1. Export existing data to JSON format
2. Keep backup file safe
3. Update app if needed
4. Import data using JSON format

### **Between Browsers**
1. Export from source browser
2. Install app in target browser
3. Import data in merge mode
4. Verify all entries transferred

## ⚠️ **Important Notes**

- **Replace Mode** permanently deletes existing data
- Large imports may take a few seconds
- File size limit: ~10MB (thousands of entries)
- Supports only .csv and .json file extensions

## 📞 **Troubleshooting**

### **Import Errors**
- Check file format matches expected structure
- Ensure dates are in YYYY-MM-DD format
- Verify time format is HH:MM
- Remove special characters from descriptions

### **Export Issues**
- Ensure popup blockers allow downloads
- Check available storage space
- Try different export format if one fails

### **Performance**
- Large datasets (>1000 entries) may slow down imports
- Consider breaking large imports into smaller chunks
- Export regularly to maintain optimal performance

---

**💡 Tip**: Create a monthly backup routine - export your data at the end of each month for the best data protection strategy!