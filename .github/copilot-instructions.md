# Copilot Instructions for Time Tracking Web App

## Project Overview
This is a time tracking web application (Zeit Tracking App) designed for personal or small team use. The app focuses on simplicity, offline functionality, and practical time management features.

## Core Features & Architecture
- **Timer System**: Start/stop functionality with automatic duration calculation
- **Calendar Interface**: Manual time entry and editing capabilities
- **Reporting**: Monthly time reports with break calculations, exportable to PDF
- **Data Persistence**: Local storage for offline functionality
- **UI/UX**: Clean, intuitive design prioritizing usability

## Key Technical Patterns

### Data Structure
```javascript
// Time entries should follow this structure
const timeEntry = {
  id: string,           // UUID or timestamp-based
  date: string,         // ISO date (YYYY-MM-DD)
  startTime: string,    // HH:MM format
  endTime: string,      // HH:MM format
  breakDuration: number, // minutes
  description: string,  // optional task description
  duration: number      // calculated total minutes
}
```

### State Management
- Use local state for real-time timer operations
- Implement localStorage persistence for all time entries
- Consider using Context API or lightweight state management for global timer state
- Always validate time calculations on both input and display

### Component Architecture
```
src/
├── components/
│   ├── Timer/          # Start/stop timer component
│   ├── Calendar/       # Date picker and entry management
│   ├── TimeEntry/      # Individual time entry form/display
│   └── Reports/        # PDF generation and export
├── hooks/
│   ├── useTimer.js     # Timer logic and state
│   ├── useTimeEntries.js # CRUD operations for entries
│   └── useLocalStorage.js # Persistence layer
└── utils/
    ├── timeCalculations.js # Duration, break calculations
    └── pdfGenerator.js     # Monthly report generation
```

## Development Guidelines

### Time Calculations
- Always work with minutes internally for precision
- Display times in HH:MM format consistently
- Account for break times in total calculations
- Validate that end time > start time
- Handle overnight sessions (crossing midnight)

### Data Validation
```javascript
// Always validate time entries
const validateTimeEntry = (entry) => {
  // Check required fields, time format, logical consistency
  // Return validation errors for user feedback
}
```

### PDF Export Requirements
- Include company/user header information
- Show daily entries with start/end times and breaks
- Calculate total hours worked per day and month
- Format for professional appearance (suitable for time sheets)
- Consider using libraries like jsPDF or React-PDF

### UI/UX Considerations
- **Accessibility**: Ensure keyboard navigation and screen reader support
- **Mobile-first**: Design for mobile use (people track time on-the-go)
- **Visual feedback**: Clear indication of active timer state
- **Quick actions**: Easy start/stop, quick time entry shortcuts
- **Error handling**: Clear validation messages and error states

## Technology Recommendations
- **Framework**: React or Vanilla JS (for simplicity and offline capability)
- **Styling**: CSS Modules, Styled Components, or Tailwind CSS
- **Date handling**: date-fns or dayjs (lighter than moment.js)
- **PDF generation**: jsPDF or React-PDF
- **Testing**: Focus on time calculation logic and data persistence

## Critical Implementation Notes
- **Timer accuracy**: Use `Date.now()` for precision, not intervals
- **Data backup**: Implement export/import for user data safety
- **Performance**: Optimize for handling months of time entries
- **Timezone handling**: Store times in user's local timezone consistently

## File Naming Conventions
- Use descriptive names: `TimerDisplay.jsx`, `MonthlyReport.jsx`
- Utils in camelCase: `calculateDuration.js`, `formatTime.js`
- Component folders match component names
- Test files: `ComponentName.test.js`

## Common Pitfalls to Avoid
- Don't rely solely on JavaScript timers for duration calculation
- Always persist timer state to survive page refreshes
- Validate time inputs against impossible values (25:00, negative durations)
- Handle edge cases: month boundaries, daylight saving time changes
- Ensure PDF exports work across different browsers

When implementing features, prioritize data integrity and user experience over complex functionality.