import React, { useState, useEffect } from 'react';
import { isWeekend, isHoliday } from '../utils/holidays';

const VacationModal = ({ isOpen, onClose, onSave, onDelete, workers, initialDate, vacationToEdit, vacations, maxConcurrent }) => {
  const [workerId, setWorkerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (vacationToEdit) {
        setWorkerId(vacationToEdit.workerId);
        setStartDate(vacationToEdit.startDate);
        setEndDate(vacationToEdit.endDate);
      } else {
        setWorkerId('');
        setStartDate(initialDate || '');
        setEndDate(initialDate || '');
      }
    }
  }, [isOpen, initialDate, vacationToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!workerId || !startDate || !endDate) {
      setError('Bitte alle Felder ausfüllen');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setError('Enddatum muss nach Startdatum liegen');
      return;
    }

    // Check constraints
    let current = new Date(start);
    while (current <= end) {
      // Skip weekends and holidays for capacity check
      if (!isWeekend(current) && !isHoliday(current)) {
        const count = vacations.filter(v => {
          // Exclude current vacation if editing
          if (vacationToEdit && v.id === vacationToEdit.id) return false;

          const vStart = new Date(v.startDate);
          const vEnd = new Date(v.endDate);
          // Only count overlapping days that are NOT weekends/holidays
          // But here we are checking a specific 'current' day which we already know is not a weekend/holiday
          return current >= vStart && current <= vEnd;
        }).length;

        if (count >= maxConcurrent) {
          setError(`Kapazität am ${current.toLocaleDateString()} überschritten! Max: ${maxConcurrent}`);
          return;
        }
      }

      current.setDate(current.getDate() + 1);
    }

    onSave({
      id: vacationToEdit ? vacationToEdit.id : undefined,
      workerId: parseInt(workerId),
      startDate,
      endDate
    });
    onClose();
  };

  const handleDelete = () => {
    if (onDelete && vacationToEdit) {
      onDelete(vacationToEdit.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{vacationToEdit ? 'Urlaub bearbeiten' : 'Urlaub eintragen'}</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mitarbeiter</label>
            <select value={workerId} onChange={e => setWorkerId(e.target.value)} autoFocus>
              <option value="">Bitte wählen...</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Von</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Bis</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <div className="modal-actions">
            {vacationToEdit && (
              <button type="button" className="btn btn-danger" onClick={handleDelete} style={{ marginRight: 'auto' }}>
                Löschen
              </button>
            )}
            <button type="button" className="btn btn-secondary" onClick={onClose}>Abbrechen</button>
            <button type="submit" className="btn btn-primary">Speichern</button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }
        .modal-content {
          background: var(--color-bg-secondary);
          padding: var(--space-lg);
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 500px;
          border: 1px solid var(--color-bg-tertiary);
          box-shadow: var(--shadow-lg);
          animation: slideIn 0.2s ease-out;
        }
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-lg);
        }
        .modal-header h3 {
          margin: 0;
          color: var(--color-text-primary);
        }
        .close-btn {
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          font-size: 1.5rem;
          cursor: pointer;
        }
        .close-btn:hover {
          color: var(--color-text-primary);
        }
        .form-group {
          margin-bottom: var(--space-md);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-md);
        }
        .form-group label {
          display: block;
          margin-bottom: var(--space-xs);
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }
        .form-group select,
        .form-group input {
          width: 100%;
          padding: var(--space-sm);
          background: var(--color-bg-primary);
          border: 1px solid var(--color-bg-tertiary);
          color: var(--color-text-primary);
          border-radius: var(--radius-sm);
          font-size: 1rem;
        }
        .form-group select:focus,
        .form-group input:focus {
          border-color: var(--color-primary);
          outline: none;
        }
        .error-msg {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-danger);
          padding: var(--space-sm);
          border-radius: var(--radius-sm);
          margin-bottom: var(--space-md);
          font-size: 0.9rem;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: var(--space-md);
          margin-top: var(--space-lg);
        }
        .btn-secondary {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }
        .btn-secondary:hover {
          background: var(--color-bg-primary);
        }
        .btn-danger {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-danger);
        }
        .btn-danger:hover {
          background: var(--color-danger);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default VacationModal;
