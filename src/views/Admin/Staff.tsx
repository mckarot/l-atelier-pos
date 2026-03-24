// src/views/Admin/Staff.tsx
// Gestion du personnel - CRUD minimaliste

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { getDb } from '../../firebase/config';
import type { User, UserRole } from '../../firebase/types';

export default function AdminStaff(): JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Formulaire state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('serveur');
  const [isActive, setIsActive] = useState(true);

  // Charger les utilisateurs depuis Firebase
  useEffect(() => {
    const usersRef = collection(getDb(), 'users');
    const q = query(usersRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as User));
        setUsers(usersList);
      },
      (error) => {
        console.error('[AdminStaff] Error loading users:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Ouvrir le modal pour un nouvel utilisateur
  const handleOpenCreate = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('serveur');
    setIsActive(true);
    setIsModalOpen(true);
  };

  // Ouvrir le modal pour édition
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setIsActive(user.isActive);
    setIsModalOpen(true);
  };

  // Créer ou mettre à jour
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) return;

    try {
      if (editingUser) {
        // Mise à jour
        const userRef = doc(getDb(), 'users', editingUser.id);
        await updateDoc(userRef, {
          name,
          email,
          role,
          isActive,
        });
      } else {
        // Création
        await addDoc(collection(getDb(), 'users'), {
          name,
          email,
          role,
          isActive,
          createdAt: Timestamp.now(),
        });
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('[AdminStaff] Error saving user:', error);
    }
  };

  // Supprimer
  const handleDelete = async (id: string, userName: string) => {
    if (!confirm(`Supprimer ${userName} ?`)) return;
    try {
      const userRef = doc(getDb(), 'users', id);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('[AdminStaff] Error deleting user:', error);
    }
  };

  // Toggle status
  const handleToggleStatus = async (user: User) => {
    try {
      const userRef = doc(getDb(), 'users', user.id);
      await updateDoc(userRef, {
        isActive: !user.isActive,
      });
    } catch (error) {
      console.error('[AdminStaff] Error toggling user status:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-headline text-2xl font-bold text-on-surface">
            Gestion du Personnel
          </h2>
          <p className="font-body text-sm text-on-surface-variant mt-1">
            Gérez les utilisateurs et leurs rôles
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-primary-container text-on-primary-container font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Ajouter un utilisateur
        </button>
      </div>

      {/* Tableau */}
      <div className="rounded-xl border border-outline-variant/10 bg-surface-container overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-container-high">
            <tr>
              <th className="text-left px-6 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Nom
              </th>
              <th className="text-left px-6 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Email
              </th>
              <th className="text-left px-6 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Rôle
              </th>
              <th className="text-left px-6 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Statut
              </th>
              <th className="text-right px-6 py-4 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-surface-container-high/50 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-body text-sm text-on-surface font-medium">
                    {user.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="font-mono text-sm text-on-surface-variant">
                    {user.email}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`
                    font-mono text-xs font-bold px-2 py-1 rounded uppercase
                    ${user.role === 'admin' ? 'bg-primary/20 text-primary' : ''}
                    ${user.role === 'kds' ? 'bg-secondary/20 text-secondary' : ''}
                    ${user.role === 'serveur' ? 'bg-tertiary/20 text-tertiary' : ''}
                    ${user.role === 'client' ? 'bg-blue-500/20 text-blue-400' : ''}
                  `}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggleStatus(user)}
                    className={`
                      font-mono text-xs font-bold px-3 py-1 rounded
                      ${user.isActive
                        ? 'bg-tertiary/20 text-tertiary hover:bg-tertiary/30'
                        : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'}
                      transition-colors
                    `}
                  >
                    {user.isActive ? 'ACTIF' : 'INACTIF'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="p-2 rounded-lg hover:bg-surface-container-highest transition-colors"
                      aria-label={`Modifier ${user.name}`}
                    >
                      <span className="material-symbols-outlined text-on-surface-variant text-sm">
                        edit
                      </span>
                    </button>
                    <button
                      onClick={() => handleDelete(user.id, user.name)}
                      className="p-2 rounded-lg hover:bg-error/10 transition-colors"
                      aria-label={`Supprimer ${user.name}`}
                    >
                      <span className="material-symbols-outlined text-error text-sm">
                        delete
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-on-surface-variant/40 text-4xl mb-4">
              group
            </span>
            <p className="text-on-surface-variant text-sm">
              Aucun utilisateur - Cliquez sur "Ajouter un utilisateur" pour commencer
            </p>
          </div>
        )}
      </div>

      {/* Modal de création/édition */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-surface-container-low p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-headline text-xl font-bold text-on-surface mb-6">
              {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom */}
              <div>
                <label className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface-container-high text-on-surface rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Jean Dupont"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-high text-on-surface rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="jean@latelier.pos"
                  required
                />
              </div>

              {/* Rôle */}
              <div>
                <label className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Rôle
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-surface-container-high text-on-surface rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="admin">Administrateur</option>
                  <option value="kds">Cuisine (KDS)</option>
                  <option value="serveur">Serveur</option>
                  <option value="client">Client</option>
                </select>
              </div>

              {/* Statut */}
              <div>
                <label className="block text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                  Statut
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsActive(true)}
                    className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                      isActive
                        ? 'bg-tertiary/20 text-tertiary border-2 border-tertiary'
                        : 'bg-surface-container-highest text-on-surface-variant border-2 border-transparent'
                    }`}
                  >
                    ACTIF
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsActive(false)}
                    className={`flex-1 py-3 rounded-lg font-bold transition-colors ${
                      !isActive
                        ? 'bg-surface-container-highest text-on-surface border-2 border-on-surface'
                        : 'bg-surface-container-highest text-on-surface-variant border-2 border-transparent'
                    }`}
                  >
                    INACTIF
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-lg border border-outline-variant/40 px-4 py-3 text-on-surface font-bold hover:bg-surface-container-highest transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary-container text-on-primary-container font-bold px-4 py-3 hover:brightness-110 transition-all"
                >
                  {editingUser ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
