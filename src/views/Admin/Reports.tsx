// src/views/Admin/Reports.tsx
// Rapports et analytics - Tableau des commandes exportable CSV

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import type { Order } from '../../db/types';

export default function AdminReports(): JSX.Element {
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [isExporting, setIsExporting] = useState(false);

  // Calculer les dates de filtre
  const getDateRange = () => {
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();

    switch (dateFilter) {
      case 'today':
        return { start: todayStart, end: now };
      case 'week':
        const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
        return { start: weekAgo, end: now };
      case 'month':
        const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
        return { start: monthAgo, end: now };
      case 'all':
      default:
        return { start: 0, end: now };
    }
  };

  // Charger les commandes depuis Dexie
  const allOrders = useLiveQuery(() => db.orders.toArray(), []);

  // Filtrer les commandes par date
  const { start, end } = getDateRange();
  const filteredOrders = allOrders?.filter(
    (order) => order.createdAt >= start && order.createdAt <= end
  );

  // Trier par date décroissante
  const sortedOrders = filteredOrders?.sort((a, b) => b.createdAt - a.createdAt);

  // Calculer les statistiques
  const totalRevenue = sortedOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
  const paidOrders = sortedOrders?.filter((o) => o.status === 'paye').length || 0;
  const activeOrders = sortedOrders?.filter((o) => 
    ['en_attente', 'en_preparation', 'pret'].includes(o.status)
  ).length || 0;

  // Formater une date
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Export CSV
  const exportToCSV = async () => {
    setIsExporting(true);

    try {
      // En-têtes CSV
      const headers = [
        'ID',
        'Table',
        'Client',
        'Statut',
        'Items',
        'Total (€)',
        'Date',
        'Heure',
        'Notes',
      ];

      // Lignes de données
      const rows = sortedOrders?.map((order) => [
        order.id,
        order.tableId,
        order.customerName || '-',
        order.status,
        order.items.map((i) => `${i.quantity}x ${i.name}`).join(' | '),
        order.total?.toFixed(2) || '0.00',
        formatDate(order.createdAt),
        formatTime(order.createdAt),
        order.notes || '',
      ]) || [];

      // Créer le contenu CSV
      const csvContent = [
        headers.join(';'),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(';')),
      ].join('\n');

      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const filename = `rapport-commandes-${dateFilter}-${formatDate(Date.now()).replace(/\//g, '-')}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  // Badge de statut
  const getStatusBadge = (status: Order['status']) => {
    const statusClasses: Record<Order['status'], string> = {
      en_attente: 'bg-surface-variant text-on-surface',
      en_preparation: 'bg-primary/20 text-primary',
      pret: 'bg-tertiary/20 text-tertiary',
      servi: 'bg-blue-500/20 text-blue-400',
      paye: 'bg-surface-container-highest text-on-surface-variant',
      annule: 'bg-error/20 text-error',
    };

    const statusLabels: Record<Order['status'], string> = {
      en_attente: 'À PRÉPARER',
      en_preparation: 'EN COURS',
      pret: 'PRÊT',
      servi: 'SERVI',
      paye: 'PAYÉ',
      annule: 'ANNULÉ',
    };

    return (
      <span className={`font-mono text-xs font-bold px-2 py-1 rounded uppercase ${statusClasses[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            Rapports & Analytics
          </h2>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            Exportez et analysez les commandes
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={isExporting || !sortedOrders?.length}
          className="bg-primary-container text-on-primary-container font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100 transition-all"
        >
          <span className="material-symbols-outlined">
            {isExporting ? 'progress_activity' : 'download'}
          </span>
          {isExporting ? 'Export...' : 'Exporter CSV'}
        </button>
      </div>

      {/* Filtres de date */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setDateFilter('today')}
          className={`px-4 py-2 rounded-lg font-label font-bold text-sm transition-colors ${
            dateFilter === 'today'
              ? 'bg-primary-container text-on-primary-container'
              : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Aujourd'hui
        </button>
        <button
          onClick={() => setDateFilter('week')}
          className={`px-4 py-2 rounded-lg font-label font-bold text-sm transition-colors ${
            dateFilter === 'week'
              ? 'bg-primary-container text-on-primary-container'
              : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          7 derniers jours
        </button>
        <button
          onClick={() => setDateFilter('month')}
          className={`px-4 py-2 rounded-lg font-label font-bold text-sm transition-colors ${
            dateFilter === 'month'
              ? 'bg-primary-container text-on-primary-container'
              : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          30 derniers jours
        </button>
        <button
          onClick={() => setDateFilter('all')}
          className={`px-4 py-2 rounded-lg font-label font-bold text-sm transition-colors ${
            dateFilter === 'all'
              ? 'bg-primary-container text-on-primary-container'
              : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Tout
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-surface-container p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary">receipt_long</span>
            <span className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider">
              Total Commandes
            </span>
          </div>
          <p className="font-mono text-3xl font-bold text-on-surface">
            {sortedOrders?.length || 0}
          </p>
        </div>

        <div className="rounded-xl bg-surface-container p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-tertiary">euro_symbol</span>
            <span className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider">
              Chiffre d'Affaires
            </span>
          </div>
          <p className="font-mono text-3xl font-bold text-on-surface">
            €{totalRevenue.toFixed(2).replace('.00', '.')}
          </p>
        </div>

        <div className="rounded-xl bg-surface-container p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-secondary">check_circle</span>
            <span className="text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider">
              Commandes Payées
            </span>
          </div>
          <p className="font-mono text-3xl font-bold text-on-surface">
            {paidOrders}
            <span className="text-sm font-normal text-on-surface-variant ml-2">
              / {activeOrders} en cours
            </span>
          </p>
        </div>
      </div>

      {/* Tableau des commandes */}
      <div className="rounded-xl border border-outline-variant/10 bg-surface-container overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-high">
              <tr>
                <th className="text-left px-6 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  ID
                </th>
                <th className="text-left px-6 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Table
                </th>
                <th className="text-left px-6 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Client
                </th>
                <th className="text-left px-6 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Statut
                </th>
                <th className="text-left px-6 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Items
                </th>
                <th className="text-right px-6 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left px-6 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {sortedOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-surface-container-high/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-on-surface-variant">
                      #{order.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-body text-sm text-on-surface">
                      Table {order.tableId}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-body text-sm text-on-surface">
                      {order.customerName || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {order.items.slice(0, 3).map((item, i) => (
                        <span
                          key={i}
                          className="font-mono text-xs bg-surface-container-highest text-on-surface-variant px-2 py-1 rounded"
                        >
                          {item.quantity}x {item.name.split(' ')[0]}
                        </span>
                      ))}
                      {order.items.length > 3 && (
                        <span className="font-mono text-xs text-on-surface-variant px-2 py-1">
                          +{order.items.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-mono text-sm font-bold text-primary">
                      €{(order.total || 0).toFixed(2).replace('.00', '.')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-on-surface">
                        {formatDate(order.createdAt)}
                      </span>
                      <span className="font-mono text-xs text-on-surface-variant">
                        {formatTime(order.createdAt)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!sortedOrders || sortedOrders.length === 0) && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-4xl mb-4">
              receipt_long
            </span>
            <p className="text-on-surface-variant text-sm">
              Aucune commande pour cette période
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
