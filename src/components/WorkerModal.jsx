import React, { useState } from 'react';

const WorkerModal = ({ isOpen, onClose, workers, onAddWorker, onDeleteWorker }) => {
    const [newWorkerName, setNewWorkerName] = useState('');
    const [newWorkerDept, setNewWorkerDept] = useState('');

    if (!isOpen) return null;

    const handleAdd = (e) => {
        e.preventDefault();
        if (newWorkerName && newWorkerDept) {
            onAddWorker({ name: newWorkerName, department: newWorkerDept });
            setNewWorkerName('');
            setNewWorkerDept('');
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Mitarbeiter verwalten</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="worker-list">
                    <h4>Aktuelle Mitarbeiter</h4>
                    {workers.length === 0 ? (
                        <p className="empty-msg">Keine Mitarbeiter vorhanden.</p>
                    ) : (
                        <ul>
                            {workers.map(worker => (
                                <li key={worker.id}>
                                    <div className="worker-info">
                                        <span className="worker-name">{worker.name}</span>
                                        <span className="worker-dept">{worker.department}</span>
                                    </div>
                                    <button
                                        className="delete-icon"
                                        onClick={() => onDeleteWorker(worker.id)}
                                        title="Mitarbeiter löschen"
                                    >
                                        &times;
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="add-worker-form">
                    <h4>Neuen Mitarbeiter hinzufügen</h4>
                    <form onSubmit={handleAdd}>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Name"
                                value={newWorkerName}
                                onChange={e => setNewWorkerName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="text"
                                placeholder="Abteilung (z.B. Lager)"
                                value={newWorkerDept}
                                onChange={e => setNewWorkerDept(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btn-block">Hinzufügen</button>
                    </form>
                </div>
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
          max-height: 80vh;
          overflow-y: auto;
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
        
        .worker-list {
          margin-bottom: var(--space-xl);
          border-bottom: 1px solid var(--color-bg-tertiary);
          padding-bottom: var(--space-lg);
        }
        .worker-list h4, .add-worker-form h4 {
          margin-top: 0;
          margin-bottom: var(--space-md);
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .worker-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .worker-list li {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-sm);
          background: var(--color-bg-primary);
          border-radius: var(--radius-sm);
          margin-bottom: var(--space-xs);
          border: 1px solid var(--color-bg-tertiary);
        }
        .worker-info {
          display: flex;
          flex-direction: column;
        }
        .worker-name {
          font-weight: 500;
          color: var(--color-text-primary);
        }
        .worker-dept {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
        }
        .delete-icon {
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0 var(--space-sm);
        }
        .delete-icon:hover {
          color: var(--color-danger);
        }
        .empty-msg {
          color: var(--color-text-secondary);
          font-style: italic;
        }

        .form-group {
          margin-bottom: var(--space-md);
        }
        .form-group input {
          width: 100%;
          padding: var(--space-sm);
          background: var(--color-bg-primary);
          border: 1px solid var(--color-bg-tertiary);
          color: var(--color-text-primary);
          border-radius: var(--radius-sm);
          font-size: 1rem;
        }
        .form-group input:focus {
          border-color: var(--color-primary);
          outline: none;
        }
        .btn-block {
          width: 100%;
        }
      `}</style>
        </div>
    );
};

export default WorkerModal;
