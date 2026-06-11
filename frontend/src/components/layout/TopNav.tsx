import { Link, useLocation } from 'react-router-dom';
import './TopNav.css';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/leads', label: 'Leads' },
  { path: '/accounts', label: 'Accounts' },
  { path: '/pipeline', label: 'Pipeline' },
  { path: '/outreach', label: 'Outreach' },
  { path: '/follow-ups', label: 'Follow Ups' },
  { path: '/templates', label: 'Templates' },
  { path: '/reports', label: 'Reports' },
  { path: '/about', label: 'About' },
];

interface TopNavProps {
  followUpCount?: number;
  pipelineValue?: number;
  onNewLead?: () => void;
}

function isActivePath(pathname: string, path: string): boolean {
  return pathname === path || (path !== '/' && pathname.startsWith(path));
}

export function TopNav({ followUpCount = 0, pipelineValue = 0, onNewLead }: TopNavProps) {
  const location = useLocation();

  const formatValue = (val: number) => {
    if (val >= 1000) return `€${(val / 1000).toFixed(0)}k`;
    return `€${val.toFixed(0)}`;
  };

  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <div className="brand">
          <Link to="/" className="brand-link">
            <span className="brand-name">Sales Outreach CRM</span>
            <span className="brand-sub">Pipeline and Outreach Workspace</span>
          </Link>
        </div>

        <nav className="nav-links" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link${isActivePath(location.pathname, item.path) ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <div className="nav-stat">
            <span className="nav-stat-label">Follow ups today</span>
            <span className="nav-stat-value tabular">{followUpCount}</span>
          </div>
          <div className="nav-stat">
            <span className="nav-stat-label">Pipeline</span>
            <span className="nav-stat-value tabular">{formatValue(pipelineValue)}</span>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={onNewLead}>+ New lead</button>
        </div>
      </div>
    </header>
  );
}
