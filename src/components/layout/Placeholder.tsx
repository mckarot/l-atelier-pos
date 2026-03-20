// src/components/layout/Placeholder.tsx
// Composant placeholder pour les vues en cours de développement

interface PlaceholderProps {
  viewName: string;
  description?: string;
}

export function Placeholder({ viewName, description }: PlaceholderProps) {
  return (
    <div className="min-h-screen bg-surface-container flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <span
          className="material-symbols-outlined text-primary text-6xl mb-4"
          aria-hidden="true"
        >
          construction
        </span>
        <h1 className="text-2xl font-black text-on-surface font-headline mb-2">
          {viewName}
        </h1>
        <p className="text-on-surface-variant mb-6">
          {description || 'Cette vue est en cours de développement.'}
        </p>
        <div className="bg-surface-container-highest rounded-lg p-4">
          <p className="text-xs text-on-surface-variant font-mono">
            Statut : <span className="text-primary">EN CONSTRUCTION</span>
          </p>
          <p className="text-xs text-on-surface-variant font-mono mt-1">
            Route : <span className="text-tertiary">/{viewName.toLowerCase()}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
