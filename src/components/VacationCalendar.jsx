import React, { useState } from 'react';
import { getHolidays } from '../utils/holidays';

const VacationCalendar = ({ vacations, workers, maxConcurrent, onDayClick, onVacationClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showHolidays, setShowHolidays] = useState(true);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Mock School Holidays NRW (Simplified Ranges)
  const schoolHolidays = [
    { start: '2023-10-02', end: '2023-10-14', name: 'Herbstferien' },
    { start: '2023-12-21', end: '2024-01-05', name: 'Weihnachtsferien' },
    { start: '2024-03-25', end: '2024-04-06', name: 'Osterferien' },
    { start: '2024-07-08', end: '2024-08-20', name: 'Sommerferien' },
    { start: '2024-10-14', end: '2024-10-26', name: 'Herbstferien' },
    { start: '2024-12-23', end: '2025-01-06', name: 'Weihnachtsferien' },
    { start: '2025-04-14', end: '2025-04-26', name: 'Osterferien' },
    { start: '2025-07-14', end: '2025-08-26', name: 'Sommerferien' },
  ];

  const getDayInfo = (day) => {
    const dateToCheck = new Date(year, month, day);
    dateToCheck.setHours(12, 0, 0, 0);

    // Get Vacations
    const activeVacations = vacations.filter(v => {
      const start = new Date(v.startDate);
      const end = new Date(v.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return dateToCheck >= start && dateToCheck <= end;
    });

    const workerInfos = activeVacations.map(v => {
      const worker = workers.find(w => w.id === v.workerId);
      return {
        name: worker ? worker.name : 'Unknown',
        vacationId: v.id
      };
    });

    // Get Holiday
    let holidayName = null;
    if (showHolidays) {
      const holidays = getHolidays(year);
      const holiday = holidays.find(h =>
        h.date.getDate() === day && h.date.getMonth() === month
      );
      if (holiday) holidayName = holiday.name;
    }

    // Get School Holiday
    let schoolHolidayName = null;
    if (showHolidays && !holidayName) {
      const sh = schoolHolidays.find(h => {
        const start = new Date(h.start);
        const end = new Date(h.end);
        return dateToCheck >= start && dateToCheck <= end;
      });
      if (sh) schoolHolidayName = sh.name;
    }

    return { count: activeVacations.length, workerInfos, holidayName, schoolHolidayName };
  };

  const handleDayClick = (day) => {
    if (onDayClick) {
      const date = new Date(year, month, day, 12, 0, 0);
      onDayClick(date.toISOString().split('T')[0]);
    }
  };

  const handleBadgeClick = (e, vacationId) => {
    e.stopPropagation();
    if (onVacationClick) {
      onVacationClick(vacationId);
    }
  };

  const renderCalendarDays = () => {
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const { count, workerInfos, holidayName, schoolHolidayName } = getDayInfo(day);
      const isFull = count >= maxConcurrent;
      const ratio = count / maxConcurrent;

      let statusClass = 'available';
      if (isFull) statusClass = 'full';
      else if (ratio >= 0.5) statusClass = 'warning';

      let holidayClass = '';
      if (holidayName) holidayClass = 'is-holiday';
      else if (schoolHolidayName) holidayClass = 'is-school-holiday';

      days.push(
        <div
          key={day}
          className={`calendar-day ${statusClass} ${holidayClass}`}
          onClick={() => handleDayClick(day)}
        >
          <div className="day-header">
            <span className="day-number">{day}</span>
            {(holidayName || schoolHolidayName) && (
              <span className="holiday-label">{holidayName || schoolHolidayName}</span>
            )}
          </div>

          <div className="day-content">
            {workerInfos.map((info, idx) => (
              <div
                key={idx}
                className="worker-badge"
                onClick={(e) => handleBadgeClick(e, info.vacationId)}
                title="Klicken zum Bearbeiten"
              >
                {info.name}
              </div>
            ))}
          </div>

          <div className="day-footer">
            <span className="count">{count}/{maxConcurrent}</span>
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="nav-controls">
          <button onClick={prevMonth} className="nav-btn">&lt;</button>
          <h2>{monthNames[month]} {year}</h2>
          <button onClick={nextMonth} className="nav-btn">&gt;</button>
        </div>

        <div className="options">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={showHolidays}
              onChange={e => setShowHolidays(e.target.checked)}
            />
            <span className="slider"></span>
            <span className="label-text">Feiertage & Ferien (NRW)</span>
          </label>
        </div>
      </div>

      <div className="weekdays-grid">
        <div>Mo</div><div>Di</div><div>Mi</div><div>Do</div><div>Fr</div><div>Sa</div><div>So</div>
      </div>

      <div className="days-grid">
        {renderCalendarDays()}
      </div>

      <style>{`
        .calendar-container {
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-lg);
        }
        .nav-controls {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }
        .calendar-header h2 {
          color: var(--color-text-primary);
          font-size: 1.5rem;
          min-width: 200px;
          text-align: center;
        }
        .nav-btn {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nav-btn:hover {
          background: var(--color-primary);
          color: var(--color-bg-primary);
        }
        
        .options {
          display: flex;
          align-items: center;
        }
        .toggle-switch {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          cursor: pointer;
          color: var(--color-text-secondary);
          font-size: 0.9rem;
        }
        .toggle-switch input {
          display: none;
        }
        .slider {
          width: 36px;
          height: 20px;
          background-color: var(--color-bg-tertiary);
          border-radius: 20px;
          position: relative;
          transition: 0.3s;
        }
        .slider:before {
          content: "";
          position: absolute;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          top: 2px;
          left: 2px;
          transition: 0.3s;
        }
        input:checked + .slider {
          background-color: var(--color-primary);
        }
        input:checked + .slider:before {
          transform: translateX(16px);
        }
        
        .weekdays-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: var(--space-sm);
          margin-bottom: var(--space-sm);
          text-align: center;
          color: var(--color-text-secondary);
          font-weight: 600;
        }

        .days-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: var(--space-sm);
          flex: 1;
          overflow-y: auto;
        }

        .calendar-day {
          background: var(--color-bg-primary);
          border-radius: var(--radius-md);
          padding: var(--space-sm);
          min-height: 120px;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--color-bg-tertiary);
          position: relative;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .calendar-day:hover {
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .calendar-day.is-holiday {
          background: rgba(234, 179, 8, 0.05); /* Yellow tint */
          border-color: rgba(234, 179, 8, 0.3);
        }
        .calendar-day.is-school-holiday {
           background: rgba(56, 189, 248, 0.05); /* Blue tint */
        }

        .day-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-xs);
        }
        
        .day-number {
          font-weight: 600;
          color: var(--color-text-primary);
        }
        
        .holiday-label {
          font-size: 0.7rem;
          color: var(--color-warning);
          text-align: right;
          max-width: 70%;
          line-height: 1.1;
        }
        .is-school-holiday .holiday-label {
          color: var(--color-text-accent);
        }

        .day-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow-y: auto;
        }

        .worker-badge {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
          font-size: 0.75rem;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          cursor: pointer;
          transition: background 0.2s;
        }
        .worker-badge:hover {
          background: var(--color-primary);
          color: white;
        }

        .day-footer {
          margin-top: var(--space-xs);
          text-align: right;
          font-size: 0.8rem;
          color: var(--color-text-secondary);
        }
        
        .calendar-day.full .day-footer {
          color: var(--color-danger);
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default VacationCalendar;
