// src/views/Serveur/FloorPlanView.tsx
// Vue principale du plan de salle

import { useState } from 'react';
import { FloorPlan } from '../../components/serveur/FloorPlan';
import { SelectedTable } from '../../components/serveur/SelectedTable';
import { PaymentModal } from '../../components/serveur/PaymentModal';
import { NoteModal } from '../../components/serveur/NoteModal';
import { SplitBillModal } from '../../components/serveur/SplitBillModal';
import { useServerOrders } from '../../hooks/useServerOrders';
import type { FloorTable } from '../../components/serveur/types';

export default function FloorPlanView(): JSX.Element {
  const [selectedTable, setSelectedTable] = useState<FloorTable | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);

  const { completePayment, updateOrderNotes, splitOrder } = useServerOrders();

  const handleTableSelect = (table: FloorTable) => {
    setSelectedTable(table);
  };

  const handleClosePanel = () => {
    setSelectedTable(null);
  };

  const handleOpenCheckout = () => {
    setIsPaymentModalOpen(true);
  };

  const handleConfirmCheckout = async (paymentMethod: 'especes' | 'cb' | 'none') => {
    if (!selectedTable?.currentOrder) return;
    await completePayment(selectedTable.currentOrder.id, selectedTable.id, paymentMethod);
    setSelectedTable(null);
  };

  const handleOpenAddNote = () => {
    setIsNoteModalOpen(true);
  };

  const handleSaveNotes = async (notes: string) => {
    if (!selectedTable?.currentOrder) return;
    await updateOrderNotes(selectedTable.currentOrder.id, notes);
  };

  const handleOpenSplit = () => {
    setIsSplitModalOpen(true);
  };

  const handleConfirmSplit = async (itemIndices: number[], splitType: 'equal' | 'items') => {
    if (!selectedTable?.currentOrder) return;
    await splitOrder(selectedTable.currentOrder.id, selectedTable.id, itemIndices, splitType);
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
          onCheckout={handleOpenCheckout}
          onAddNote={handleOpenAddNote}
          onSplit={handleOpenSplit}
        />
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handleConfirmCheckout}
        total={selectedTable?.currentOrder?.total || 0}
      />

      {/* Note Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNotes}
        existingNotes={selectedTable?.currentOrder?.notes}
      />

      {/* Split Bill Modal */}
      <SplitBillModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
        onConfirm={handleConfirmSplit}
        items={selectedTable?.currentOrder?.items || []}
      />
    </>
  );
}
