// src/views/Admin/index.tsx
// Wrapper pour la redirection vers le dashboard admin

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function AdminIndex(): JSX.Element {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/admin', { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-full">
      <span
        className="material-symbols-outlined text-primary text-4xl animate-spin"
        aria-hidden="true"
      >
        progress_activity
      </span>
    </div>
  );
}

export default AdminIndex;
