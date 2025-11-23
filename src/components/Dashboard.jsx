import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import VacationTimeline from './VacationTimeline';
import VacationCalendar from './VacationCalendar';
import VacationModal from './VacationModal';
import WorkerModal from './WorkerModal';

const Dashboard = ({ onLogout }) => {
  const [workers, setWorkers] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [maxConcurrent, setMaxConcurrent] = useState(2);
  const [viewMode, setViewMode] = useState('timeline'); // 'timeline' or 'calendar'

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [vacationToEdit, setVacationToEdit] = useState(null);

  // Fetch Data on Mount
  useEffect(() => {
    fetchData();
  }, []);

  // Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, (payload) => {
        console.log('Worker Change:', payload);
        fetchWorkers();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vacations' }, (payload) => {
        console.log('Vacation Change:', payload);
        fetchVacations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchWorkers(), fetchVacations()]);
    setLoading(false);
  };

  const fetchWorkers = async () => {
    const { data, error } = await supabase.from('workers').select('*').order('name');
    if (error) console.error('Error fetching workers:', error);
    else setWorkers(data);
  };

  const fetchVacations = async () => {
    const { data, error } = await supabase.from('vacations').select('*');
    if (error) console.error('Error fetching vacations:', error);
    else {
      // Convert date strings to match local format if needed, but Supabase returns YYYY-MM-DD which is fine
      setVacations(data.map(v => ({
        ...v,
        workerId: v.worker_id, // Map snake_case to camelCase for internal use
        startDate: v.start_date,
        endDate: v.end_date
      })));
    }
  };

  const handleDayClick = (date) => {
    setModalDate(date);
    setVacationToEdit(null); // New vacation
    setIsModalOpen(true);
  };

  const handleVacationClick = (vacationId) => {
    const vacation = vacations.find(v => v.id === vacationId);
    if (vacation) {
      setVacationToEdit(vacation);
      setModalDate(''); // Not needed for edit
      setIsModalOpen(true);
    }
  };

  const handleSaveVacation = async (vacationData) => {
    const payload = {
      worker_id: vacationData.workerId,
      start_date: vacationData.startDate,
      end_date: vacationData.endDate,
      status: 'approved'
    };

    if (vacationData.id) {
      // Update
      const { error } = await supabase
        .from('vacations')
        .update(payload)
        .eq('id', vacationData.id);
      if (error) alert('Fehler beim Speichern: ' + error.message);
    } else {
      // Create
      const { error } = await supabase
        .from('vacations')
        .insert([payload]);
      if (error) alert('Fehler beim Erstellen: ' + error.message);
    }
    // No need to manually setVacations, Realtime will trigger fetch
  };

  const handleDeleteVacation = async (vacationId) => {
    const { error } = await supabase
      .from('vacations')
      .delete()
      .eq('id', vacationId);
    if (error) alert('Fehler beim Löschen: ' + error.message);
  };

  // Worker Handlers
  const handleAddWorker = async (workerData) => {
    const { error } = await supabase
      .from('workers')
      .insert([{ name: workerData.name, department: workerData.department }]);
    if (error) alert('Fehler beim Hinzufügen: ' + error.message);
  };

  const handleDeleteWorker = async (workerId) => {
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('id', workerId);
    if (error) alert('Fehler beim Löschen: ' + error.message);
  };

  if (loading) return <div style={{ padding: '2rem', color: 'white' }}>Lade Daten...</div>;

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Frisco One <span style={{ fontWeight: '300', opacity: 0.7 }}>Vacation Planner</span></h1>
        <div className="controls">
          <button className="btn-icon" onClick={() => setIsWorkerModalOpen(true)} title="Mitarbeiter verwalten">
            👥
          </button>
          <button className="btn-icon" onClick={onLogout} title="Abmelden">
            🚪
          </button>
          <div className="divider"></div>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setViewMode('timeline')}
            >
              Timeline
            </button>
            <button
              className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
            >
              Calendar
            </button>
          </div>
          <div className="divider"></div>
          <label>
            Max Concurrent:
            <input
              type="number"
              value={maxConcurrent}
              onChange={(e) => setMaxConcurrent(parseInt(e.target.value))}
              min="1"
            />
          </label>
        </div>
      </header>

      <main className="main-content">
        {viewMode === 'timeline' ? (
          <VacationTimeline
            workers={workers}
            vacations={vacations}
            setVacations={setVacations}
            maxConcurrent={maxConcurrent}
          />
        ) : (
          <VacationCalendar
            vacations={vacations}
            workers={workers}
            maxConcurrent={maxConcurrent}
            onDayClick={handleDayClick}
            onVacationClick={handleVacationClick}
          />
        )}
      </main>

      <VacationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveVacation}
        onDelete={handleDeleteVacation}
        workers={workers}
        initialDate={modalDate}
        vacationToEdit={vacationToEdit}
        vacations={vacations}
        maxConcurrent={maxConcurrent}
      />

      <WorkerModal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        workers={workers}
        onAddWorker={handleAddWorker}
        onDeleteWorker={handleDeleteWorker}
      />

      <style>{`
        .dashboard {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .header {
          background: var(--color-bg-secondary);
          padding: var(--space-md) var(--space-xl);
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--color-bg-tertiary);
        }
        .header h1 {
          font-size: 1.5rem;
          color: var(--color-primary);
        }
        .controls {
          display: flex;
          gap: var(--space-md);
          align-items: center;
        }
        .divider {
          width: 1px;
          height: 24px;
          background: var(--color-bg-tertiary);
        }
        .view-toggle {
          display: flex;
          background: var(--color-bg-tertiary);
          padding: 2px;
          border-radius: var(--radius-md);
        }
        .toggle-btn {
          background: transparent;
          border: none;
          color: var(--color-text-secondary);
          padding: var(--space-xs) var(--space-md);
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 500;
        }
        .toggle-btn.active {
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          box-shadow: var(--shadow-sm);
        }
        .controls label {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }
        .controls input {
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-bg-tertiary);
          color: var(--color-text-primary);
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-sm);
          width: 60px;
        }
        .btn-icon {
          background: transparent;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: var(--space-xs);
          border-radius: var(--radius-sm);
          transition: background 0.2s;
        }
        .btn-icon:hover {
          background: var(--color-bg-tertiary);
        }
        .main-content {
          flex: 1;
          padding: var(--space-xl);
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
