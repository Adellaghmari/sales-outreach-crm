import { useCallback, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TopNav } from './TopNav';
import { NewLeadModal } from '../ui/NewLeadModal';
import { api } from '../../api/client';

export function AppLayout() {
  const [followUpCount, setFollowUpCount] = useState(0);
  const [pipelineValue, setPipelineValue] = useState(0);
  const [showNewLead, setShowNewLead] = useState(false);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  const refreshHeader = useCallback(() => {
    api.getDashboard()
      .then((data) => {
        setFollowUpCount(data.todayFollowUps?.length || 0);
        setPipelineValue(data.stats.pipelineValue || 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { refreshHeader(); }, [refreshHeader]);

  const handleLeadCreated = () => {
    setToast('Lead created successfully');
    refreshHeader();
    setTimeout(() => setToast(''), 3000);
    navigate('/leads');
  };

  return (
    <div className="app-layout">
      <TopNav followUpCount={followUpCount} pipelineValue={pipelineValue} onNewLead={() => setShowNewLead(true)} />
      <main className="main-content">
        <Outlet context={{ refreshHeader }} />
      </main>
      <NewLeadModal open={showNewLead} onClose={() => setShowNewLead(false)} onCreated={handleLeadCreated} />
      {toast && <div className="success-toast">{toast}</div>}
    </div>
  );
}
