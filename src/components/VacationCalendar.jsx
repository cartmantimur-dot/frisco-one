import React, { useState } from 'react';
import { getHolidays } from '../utils/holidays';

const VacationCalendar = ({ vacations, workers, maxConcurrent, onDayClick, onVacationClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showHolidays, setShowHolidays] = useState(true);
  const [showSchoolVacations, setShowSchoolVacations] = useState(false);

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

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Mock School Holidays NRW
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
    if (showSchoolVacations && !holidayName) {
      const sh = schoolHolidays.find(h => {
        const start = new Date(h.start);
        const end = new Date(h.end);
        return dateToCheck >= start && dateToCheck <= end;
      });
      if (sh) schoolHolidayName = sh.name;
    }

    return { count: activeVacations.length, workerInfos, holidayName, schoolHolidayName };
  };

  const renderCalendarDays = () => {
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} style={{ background: 'transparent' }}></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const { count, workerInfos, holidayName, schoolHolidayName } = getDayInfo(day);
      const isFull = count >= maxConcurrent;
      const ratio = count / maxConcurrent;
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      let bgStyle = 'white';
      if (isFull) bgStyle = '#fee2e2'; // Red 100
      else if (ratio >= 0.5) bgStyle = '#ffedd5'; // Orange 100

      if (holidayName) bgStyle = '#fef9c3'; // Yellow 100
      else if (schoolHolidayName) bgStyle = '#e0f2fe'; // Blue 100

      days.push(
        <div
          key={day}
          onClick={() => onDayClick && onDayClick(date.toISOString().split('T')[0])}
          style={{
            minHeight: '120px',
            padding: '0.5rem',
            borderRight: '1px solid var(--border-color)',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: bgStyle,
            position: 'relative',
            cursor: 'pointer',
            transition: 'background 0.2s',
            display: 'flex',
            flexDirection: 'column'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bgStyle}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{
              fontWeight: isToday ? 'bold' : 'normal',
              color: isToday ? 'var(--primary)' : (isWeekend ? 'var(--text-light)' : 'var(--text-main)'),
              background: isToday ? 'var(--accent-blue)' : 'transparent',
              padding: isToday ? '2px 6px' : '0',
              borderRadius: '4px'
            }}>
              {day}
            </span>
            {(holidayName || schoolHolidayName) && (
              <span style={{ fontSize: '0.7rem', color: 'var(--icon-yellow)', textAlign: 'right', maxWidth: '70%', lineHeight: '1.1', fontWeight: '500' }}>
                {holidayName || schoolHolidayName}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            {workerInfos.map((info, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  onVacationClick && onVacationClick(info.vacationId);
                }}
                style={{
                  fontSize: '0.75rem',
                  background: 'var(--accent-blue)',
                  borderLeft: '2px solid var(--primary)',
                  color: 'var(--icon-blue)',
                  padding: '2px 4px',
                  borderRadius: '0 4px 4px 0',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontWeight: '500'
                }}
                title={info.name}
              >
                {info.name}
              </div>
            ))}
          </div>

          {count > 0 && (
            <div style={{ marginTop: 'auto', textAlign: 'right', fontSize: '0.7rem', color: isFull ? 'red' : 'var(--text-light)' }}>
              {count}/{maxConcurrent}
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="vacation-calendar" style={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
      {/* Calendar Header */}
      <div className="calendar-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        borderBottom: '1px solid var(--border-color)',
        background: '#f8fafc'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={prevMonth} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>◀</button>
          <button onClick={nextMonth} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>▶</button>
        </div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>
          {currentDate.toLocaleString('de-DE', { month: 'long', year: 'numeric' })}
        </h2>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={showHolidays} onChange={(e) => setShowHolidays(e.target.checked)} />
            Feiertage
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={showSchoolVacations} onChange={(e) => setShowSchoolVacations(e.target.checked)} />
            Ferien
          </label>
        </div>
      </div>

      {/* Days Header */}
      <div className="days-header" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        textAlign: 'center',
        padding: '0.75rem 0',
        background: '#f1f5f9',
        borderBottom: '1px solid var(--border-color)',
        fontWeight: '600',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)'
      }}>
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        flex: 1,
        overflowY: 'auto',
        background: 'white'
      }}>
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default VacationCalendar;
