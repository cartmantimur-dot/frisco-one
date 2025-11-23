import React, { useState } from 'react';

const VacationTimeline = ({ workers, vacations, setVacations, maxConcurrent }) => {
    const [selectedWorker, setSelectedWorker] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState(null);

    const handleAddVacation = (e) => {
        e.preventDefault();
        setError(null);

        if (!selectedWorker || !startDate || !endDate) {
            setError('Please fill in all fields');
            return;
        }

        // Check constraints
        // Simple overlap check: for each day in range, count existing vacations
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            setError('End date must be after start date');
            return;
        }

        // Check capacity for every day in the range
        let current = new Date(start);
        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];

            // Count vacations on this day
            const count = vacations.filter(v => {
                const vStart = new Date(v.startDate);
                const vEnd = new Date(v.endDate);
                return current >= vStart && current <= vEnd;
            }).length;

            if (count >= maxConcurrent) {
                setError(`Capacity exceeded on ${dateStr}. Max allowed: ${maxConcurrent}`);
                return;
            }

            current.setDate(current.getDate() + 1);
        }

        const newVacation = {
            id: Date.now(),
            workerId: parseInt(selectedWorker),
            startDate,
            endDate,
            status: 'approved'
        };

        setVacations([...vacations, newVacation]);
        // Reset form
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="timeline-container">
            <div className="sidebar">
                <h3>Add Vacation</h3>
                <form onSubmit={handleAddVacation} className="add-form">
                    <div className="form-group">
                        <label>Worker</label>
                        <select value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)}>
                            <option value="">Select Worker</option>
                            {workers.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Start Date</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>
                    {error && <div className="error-msg">{error}</div>}
                    <button type="submit" className="btn btn-primary">Add Vacation</button>
                </form>

                <div className="stats">
                    <h3>Stats</h3>
                    <div className="stat-item">
                        <span>Total Workers</span>
                        <strong>{workers.length}</strong>
                    </div>
                    <div className="stat-item">
                        <span>Active Vacations</span>
                        <strong>{vacations.length}</strong>
                    </div>
                </div>
            </div>

            <div className="timeline-view">
                <div className="timeline-header">
                    <h3>Overview</h3>
                </div>
                <div className="timeline-grid">
                    {workers.map(worker => {
                        const workerVacations = vacations.filter(v => v.workerId === worker.id);
                        return (
                            <div key={worker.id} className="worker-row">
                                <div className="worker-info">
                                    <div className="worker-name">{worker.name}</div>
                                    <div className="worker-dept">{worker.department}</div>
                                </div>
                                <div className="worker-timeline">
                                    {workerVacations.map(v => (
                                        <div key={v.id} className="vacation-block">
                                            {v.startDate} - {v.endDate}
                                        </div>
                                    ))}
                                    {workerVacations.length === 0 && <span className="no-vacation">No vacation planned</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
        .timeline-container {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: var(--space-xl);
          height: 100%;
        }
        .sidebar {
          background: var(--color-bg-secondary);
          padding: var(--space-lg);
          border-radius: var(--radius-lg);
          height: fit-content;
        }
        .sidebar h3 {
          margin-bottom: var(--space-md);
          color: var(--color-text-primary);
        }
        .form-group {
          margin-bottom: var(--space-md);
        }
        .form-group label {
          display: block;
          margin-bottom: var(--space-xs);
          font-size: 0.85rem;
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
        }
        .form-group select:focus,
        .form-group input:focus {
          border-color: var(--color-primary);
          outline: none;
        }
        .error-msg {
          color: var(--color-danger);
          font-size: 0.85rem;
          margin-bottom: var(--space-md);
          padding: var(--space-sm);
          background: rgba(239, 68, 68, 0.1);
          border-radius: var(--radius-sm);
        }
        .stats {
          margin-top: var(--space-xl);
          padding-top: var(--space-lg);
          border-top: 1px solid var(--color-bg-tertiary);
        }
        .stat-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: var(--space-sm);
          color: var(--color-text-secondary);
        }
        .stat-item strong {
          color: var(--color-text-primary);
        }
        
        .timeline-view {
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          overflow-x: auto;
        }
        .worker-row {
          display: flex;
          padding: var(--space-md) 0;
          border-bottom: 1px solid var(--color-bg-tertiary);
        }
        .worker-row:last-child {
          border-bottom: none;
        }
        .worker-info {
          width: 200px;
          flex-shrink: 0;
        }
        .worker-name {
          font-weight: 500;
        }
        .worker-dept {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
        }
        .worker-timeline {
          flex: 1;
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
        }
        .vacation-block {
          background: rgba(56, 189, 248, 0.2);
          border: 1px solid var(--color-primary);
          color: var(--color-primary);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          white-space: nowrap;
        }
        .no-vacation {
          color: var(--color-text-secondary);
          font-size: 0.85rem;
          font-style: italic;
        }
      `}</style>
        </div>
    );
};

export default VacationTimeline;
