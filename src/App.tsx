import { Outlet } from 'react-router-dom';
import { FirebaseTestPanel } from './components/dev/FirebaseTestPanel';

export function App() {
  // Note: Le seed Firebase est maintenant géré par le FirebaseTestPanel
  // Ce composant est accessible via le bouton flottant dans toutes les vues

  return (
    <>
      <Outlet />
      {/* Panneau de test Firebase (DEV ONLY - accessible partout) */}
      <FirebaseTestPanel />
    </>
  );
}
