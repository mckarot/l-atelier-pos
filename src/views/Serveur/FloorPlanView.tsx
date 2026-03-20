// src/views/Serveur/FloorPlanView.tsx
// Vue principale du plan de salle

import { useState } from 'react';
import { FloorPlan } from '../../components/serveur/FloorPlan';
import { SelectedTable } from '../../components/serveur/SelectedTable';
import type { FloorTable } from '../../components/serveur/types';

export default function FloorPlanView(): JSX.Element {
  const [selectedTable, setSelectedTable] = useState<FloorTable | null>(null);

  const handleTableSelect = (table: FloorTable) => {
    setSelectedTable(table);
  };

  const handleClosePanel = () => {
    setSelectedTable(null);
  };

  const handleCheckout = () => {
    // TODO: Implementer le processus d'encaissement
    console.log('Checkout for table', selectedTable?.id);
    setSelectedTable(null);
  };

  const handleAddNote = () => {
    // TODO: Implementer l'ajout de note
    console.log('Add note for table', selectedTable?.id);
  };

  const handleSplit = () => {
    // TODO: Implementer la division de l'addition
    console.log('Split bill for table', selectedTable?.id);
  };

  return (
    <>
      <FloorPlan
        onTableSelect={handleTableSelect}
        selectedTableId={selectedTable?.id || null}
      />

      {selectedTable && (
        <SelectedTable
          table={selectedTable}
          onClose={handleClosePanel}
          onCheckout={handleCheckout}
          onAddNote={handleAddNote}
          onSplit={handleSplit}
        />
      )}
    </>
  );
}
