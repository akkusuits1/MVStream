// ============================================
// CategoriesManager — Manage content categories
// ============================================

import { useState, useEffect } from 'react';
import { FolderOpen, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from '@/services/content';
import type { Category } from '@/services/content';
import ConfirmDialog from './ConfirmDialog';

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const slug = newName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const id = await addCategory({
      name: newName.trim(),
      slug,
      contentIds: [],
    });
    setCategories((prev) => [...prev, { id, name: newName.trim(), slug, contentIds: [], createdAt: Date.now() }]);
    setNewName('');
    setShowAdd(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    const slug = editName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await updateCategory(id, { name: editName.trim(), slug });
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: editName.trim(), slug } : c)),
    );
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDeleteTarget(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-white/40 text-sm">{categories.length} categories</p>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brand-primary hover:bg-brand-hover text-white transition-colors"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-brand-primary rounded-full animate-spin" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <FolderOpen size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/40 mb-4">No categories yet</p>
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-primary hover:bg-brand-hover text-white transition-colors"
          >
            Create First Category
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {showAdd && (
            <div className="bg-white/5 border border-brand-primary/30 rounded-xl p-4 flex items-center gap-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="Category name..."
                autoFocus
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
              />
              <button
                onClick={handleAdd}
                disabled={!newName.trim()}
                className="p-2 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors disabled:opacity-30"
              >
                <Check size={18} />
              </button>
              <button
                onClick={() => { setShowAdd(false); setNewName(''); }}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3"
            >
              <FolderOpen size={18} className="text-white/30 shrink-0" />
              {editingId === cat.id ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id!)}
                  autoFocus
                  className="flex-1 bg-transparent text-white text-sm outline-none"
                />
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">{cat.name}</p>
                  <p className="text-xs text-white/30">/{cat.slug}</p>
                </div>
              )}
              <div className="flex items-center gap-1 shrink-0">
                {editingId === cat.id ? (
                  <>
                    <button
                      onClick={() => handleUpdate(cat.id!)}
                      className="p-2 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditName(''); }}
                      className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditingId(cat.id!); setEditName(cat.name); }}
                      className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cat)}
                      className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This won't delete the actual content.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id!)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
