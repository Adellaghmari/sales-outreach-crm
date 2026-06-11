import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { LeadDetail } from './pages/LeadDetail';
import { Pipeline } from './pages/Pipeline';
import { Outreach } from './pages/Outreach';
import { FollowUps } from './pages/FollowUps';
import { Templates } from './pages/Templates';
import { Reports } from './pages/Reports';
import { About } from './pages/About';
import { Accounts } from './pages/Accounts';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/leads/:id" element={<LeadDetail />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/outreach" element={<Outreach />} />
          <Route path="/follow-ups" element={<FollowUps />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
