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
  const [viewMode, setViewMode] = useState('calendar');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [vacationToEdit, setVacationToEdit] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    totalWorkers: 0,
    currentlyOnVacation: 0,
    availableWorkers: 0,
    futureVacations: 0
  });

  // Next Vacations List
  const [nextVacations, setNextVacations] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('realtime_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => fetchWorkers())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vacations' }, () => fetchVacations())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    calculateStats();
  }, [vacations, workers]);

  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Total Workers
    const totalWorkers = workers.length;

    // 2. Currently on Vacation
    const currentlyOnVacation = vacations.filter(v => {
      const start = new Date(v.startDate);
      const end = new Date(v.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return today >= start && today <= end;
    }).length;

    // 3. Available Workers
    const availableWorkers = totalWorkers - currentlyOnVacation;

    // 4. Future Vacations (starts tomorrow or later)
    const futureVacationsCount = vacations.filter(v => {
      const start = new Date(v.startDate);
      start.setHours(0, 0, 0, 0);
      return start > today;
    }).length;

    setStats({
      totalWorkers,
      currentlyOnVacation,
      availableWorkers,
      futureVacations: futureVacationsCount
    });

    // Calculate Next Vacations List
    const upcoming = vacations
      .filter(v => {
        const end = new Date(v.endDate);
        end.setHours(23, 59, 59, 999);
        return end >= today; // Show current and future vacations
      })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5)
      .map(v => {
        const worker = workers.find(w => w.id === v.workerId);
        return {
          ...v,
          workerName: worker ? worker.name : 'Unbekannt'
        };
      });

    setNextVacations(upcoming);
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchWorkers(), fetchVacations()]);
    setLoading(false);
  };

  const fetchWorkers = async () => {
    const { data, error } = await supabase.from('workers').select('*').order('name');
    if (!error) setWorkers(data);
  };

  const fetchVacations = async () => {
    const { data, error } = await supabase.from('vacations').select('*');
    if (!error) {
      setVacations(data.map(v => ({
        ...v,
        workerId: v.worker_id,
        startDate: v.start_date,
        endDate: v.end_date
      })));
    }
  };

  // Handlers
  const handleDayClick = (date) => {
    setModalDate(date);
    setVacationToEdit(null);
    setIsModalOpen(true);
  };

  const handleVacationClick = (vacationId) => {
    const vacation = vacations.find(v => v.id === vacationId);
    if (vacation) {
      setVacationToEdit(vacation);
      setModalDate('');
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
      await supabase.from('vacations').update(payload).eq('id', vacationData.id);
    } else {
      await supabase.from('vacations').insert([payload]);
    }
  };

  const handleDeleteVacation = async (vacationId) => {
    await supabase.from('vacations').delete().eq('id', vacationId);
  };

  const handleAddWorker = async (workerData) => {
    await supabase.from('workers').insert([{ name: workerData.name, department: workerData.department }]);
  };

  const handleDeleteWorker = async (workerId) => {
    await supabase.from('workers').delete().eq('id', workerId);
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Lade Daten...</div>;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body)', paddingBottom: '2rem' }}>
      {/* Header */}
      <header style={{ background: 'white', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>FL</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Frisco Leiharbeit</h1>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setIsWorkerModalOpen(true)} className="btn btn-secondary">
              + Mitarbeiter
            </button>
            <button onClick={onLogout} className="btn-icon" title="Abmelden">
              🚪
            </button>
          </div>
        </div>
      </header>

      <div className="container">
        {/* Dashboard Title & Meta */}
        <div style={{ margin: '2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Übersicht über Ihre Personaldaten</p>
          </div>
          <div style={{ background: 'var(--accent-green)', color: 'var(--icon-green)', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: '500' }}>
            Heute: {new Date().toLocaleDateString('de-DE')}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

          {/* Card 1: Aktuell im Urlaub */}
          <div className="card stat-card">
            <div>
              <span className="stat-label">Aktuell im Urlaub</span>
              <span className="stat-value">{stats.currentlyOnVacation}</span>
            </div>
            <div className="icon-badge badge-yellow">🏖️</div>
          </div>

          {/* Card 2: Verfügbare Mitarbeiter */}
          <div className="card stat-card">
            <div>
              <span className="stat-label">Verfügbare Mitarbeiter</span>
              <span className="stat-value">{stats.availableWorkers}</span>
            </div>
            <div className="icon-badge badge-green">✅</div>
          </div>

          {/* Card 3: Geplante Urlaube */}
          <div className="card stat-card">
            <div>
              <span className="stat-label">Geplante Urlaube</span>
              <span className="stat-value">{stats.futureVacations}</span>
            </div>
            <div className="icon-badge badge-blue">📅</div>
          </div>

          {/* Card 4: Mitarbeiter Gesamt */}
          <div className="card stat-card">
            <div>
              <span className="stat-label">Mitarbeiter Gesamt</span>
              <span className="stat-value">{stats.totalWorkers}</span>
            </div>
            <div className="icon-badge badge-purple">👥</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>

          {/* Main Content Area (Calendar/Timeline) */}
          <div className="card" style={{ minHeight: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                {viewMode === 'timeline' ? 'Urlaubsplanung' : 'Kalenderübersicht'}
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={`btn ${viewMode === 'timeline' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setViewMode('timeline')}
                >
                  Zeitstrahl
                </button>
                <button
                  className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setViewMode('calendar')}
                >
                  Kalender
                </button>
              </div>
            </div>

            <div style={{ height: '500px' }}>
              {viewMode === 'timeline' ? (
                <VacationTimeline
                  workers={workers}
                  vacations={vacations}
                  maxConcurrent={maxConcurrent}
                  onDayClick={handleDayClick}
                  onVacationClick={handleVacationClick}
                />
              ) : (
                <VacationCalendar
                  vacations={vacations}
                  workers={workers}
                  onDayClick={handleDayClick}
                  onVacationClick={handleVacationClick}
                />
              )}
            </div>
          </div>

          {/* Next Vacations List */}
          <div className="card" style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Nächste Urlaube</h3>
            {nextVacations.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Keine anstehenden Urlaube.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {nextVacations.map((vacation, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-body)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--accent-blue)',
                      color: 'var(--icon-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.8rem'
                    }}>
                      {vacation.workerName.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{vacation.workerName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {new Date(vacation.startDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} - {new Date(vacation.endDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setViewMode('calendar')}>
              Alle anzeigen
            </button>
          </div>

        </div>
      </div>

      {/* Modals */}
      {isModalOpen && (
        <VacationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveVacation}
          onDelete={handleDeleteVacation}
          workers={workers}
          vacations={vacations}
          maxConcurrent={maxConcurrent}
          initialDate={modalDate}
          vacationToEdit={vacationToEdit}
        />
      )}

      {isWorkerModalOpen && (
        <WorkerModal
          isOpen={isWorkerModalOpen}
          onClose={() => setIsWorkerModalOpen(false)}
          onSave={handleAddWorker}
          onDelete={handleDeleteWorker}
          workers={workers}
        />
      )}
    </div>
  );
};

export default Dashboard;
