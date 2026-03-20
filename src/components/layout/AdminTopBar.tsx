// src/components/layout/AdminTopBar.tsx
import { cn, iconFilled } from '../../utils/cn';

interface AdminTopBarProps {
  activeOrdersCount: number;
  onSearch: (query: string) => void;
  searchQuery: string;
}

export function AdminTopBar({
  activeOrdersCount,
  onSearch,
  searchQuery,
}: AdminTopBarProps): JSX.Element {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onSearch('');
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <header
      className="h-16 flex justify-between items-center px-8 bg-surface/80 backdrop-blur-xl sticky top-0 z-30 border-b border-outline-variant/10"
      role="banner"
    >
      <div className="flex items-center gap-8">
        <h1 className="text-lg font-black text-on-surface uppercase font-headline tracking-tighter">
          L'ATELIER POS
        </h1>
        <div className="hidden md:flex items-center bg-surface-container-high px-4 py-1.5 rounded-lg border border-outline-variant/10">
          <span
            className="material-symbols-outlined text-on-surface-variant text-sm mr-2"
            aria-hidden="true"
          >
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher une commande..."
            className="bg-transparent border-none text-sm focus:ring-0 placeholder:text-on-surface-variant/50 w-64 text-on-surface"
            aria-label="Rechercher une commande"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Compteur commandes */}
        <div
          className="flex items-center gap-2 px-3 py-1 bg-surface-container-highest rounded-lg"
          role="status"
          aria-label="Synchronisation active"
        >
          <span
            className="material-symbols-outlined text-on-surface-variant text-sm animate-spin"
            aria-hidden="true"
          >
            sync
          </span>
          <span className="text-xs font-mono font-bold text-on-surface">
            SYNC: OK
          </span>
          <span className="text-[10px] font-mono text-on-surface-variant/60">
            {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* User menu */}
        <button
          className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors"
          aria-label="Menu utilisateur"
        >
          <span
            className={cn(iconFilled(), 'text-3xl text-on-surface')}
            aria-hidden="true"
          >
            account_circle
          </span>
        </button>
      </div>
    </header>
  );
}
