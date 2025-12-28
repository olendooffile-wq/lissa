
import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { User, Coupon, Wristband, NewsItem, MenuItem } from '../types';
import { supabase } from '../supabase';
import { 
  Plus, Edit, Users, Ticket, CreditCard, Newspaper, 
  Coffee, X, Camera, Loader2, Trash2, 
  RefreshCcw, CheckCircle, Skull, AlertTriangle
} from 'lucide-react';

type TabType = 'clients' | 'coupons' | 'wristbands' | 'news' | 'menu';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('clients');
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<{id: string, name: string} | null>(null);
  const [clients, setClients] = useState<User[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
    fetchClients();
  }, [activeTab]);

  const fetchClients = async () => {
    try {
      const { data } = await supabase.from('users').select('*').eq('role', 'client');
      if (data) setClients(data);
    } catch (err) { console.error("Erro fetch clients:", err); }
  };

  const fetchData = async () => {
    setLoading(true);
    setLastError(null);
    const tableName = activeTab === 'clients' ? 'users' : activeTab;
    try {
      let query = supabase.from(tableName).select('*');
      if (activeTab === 'clients') query = query.eq('role', 'client');
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setDataList(data || []);
    } catch (err: any) {
      setLastError(`Erro de carregamento: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!confirmDeleteId) return;
    const { id, name } = confirmDeleteId;
    setDeletingId(id);
    setConfirmDeleteId(null);
    const tableName = activeTab === 'clients' ? 'users' : activeTab;
    try {
      const { error } = await supabase.from(tableName).delete().match({ id: id });
      if (error) throw error;
      setSuccessMessage(`Removido com sucesso.`);
      setDataList(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      setLastError(err.message.includes('foreign key') ? "Este fã possui dados vinculados (cupons ou pulseiras). Apague-os primeiro." : err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setLastError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const rawData: any = Object.fromEntries(formData.entries());
    const tableName = activeTab === 'clients' ? 'users' : activeTab;
    
    const finalPhoto = previewPhoto || editingItem?.photo || editingItem?.image || `https://picsum.photos/seed/${activeTab}-${Date.now()}/400/400`;

    let payload: any = { ...rawData };
    
    if (payload.code) {
      payload.code = payload.code.trim().toUpperCase();
    }
    
    if (activeTab === 'clients') {
      payload.photo = finalPhoto;
      payload.role = 'client';
      payload.status = 'active';
    } else if (activeTab === 'news' || activeTab === 'menu') {
      payload.image = finalPhoto;
    }

    try {
      let error;
      if (editingItem) {
        const { error: updateError } = await supabase.from(tableName).update(payload).eq('id', editingItem.id);
        error = updateError;
      } else {
        // Remove ID para deixar o Supabase gerar o UUID automaticamente
        delete payload.id;
        const { error: insertError } = await supabase.from(tableName).insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      setSuccessMessage("Salvo com sucesso!");
      setIsModalOpen(false);
      setEditingItem(null);
      setPreviewPhoto(null);
      fetchData();
      if (activeTab === 'clients') fetchClients();
    } catch (err: any) {
      setLastError(err.message || "Erro ao salvar no banco de dados.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout role="admin" title="Purple Admin Center">
      <div className="flex flex-col gap-6 pb-24">
        {lastError && (
          <div className="mx-2 p-5 bg-red-950/90 border border-red-500 rounded-[2.5rem] flex items-start gap-4 animate-in slide-in-from-top-4 shadow-2xl z-[100]">
            <Skull className="text-red-500 shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h4 className="text-[10px] font-black uppercase text-red-500 tracking-widest italic">Erro de Conexão</h4>
              <p className="text-[11px] font-bold text-white mt-1 leading-tight">{lastError}</p>
            </div>
            <button onClick={() => setLastError(null)} className="text-red-500/50"><X size={20}/></button>
          </div>
        )}

        {successMessage && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-green-500 text-white px-8 py-5 rounded-full shadow-2xl font-black uppercase text-[10px] tracking-widest animate-in fade-in slide-in-from-top-10">
            <CheckCircle size={18} /> {successMessage}
          </div>
        )}

        <div className="flex items-center gap-3 px-2">
          <div className="flex overflow-x-auto gap-3 pb-3 no-scrollbar flex-1">
            {[
              { id: 'clients', label: 'Fãs', icon: <Users size={16}/> },
              { id: 'coupons', label: 'Mimos', icon: <Ticket size={16}/> },
              { id: 'wristbands', label: 'Passes', icon: <CreditCard size={16}/> },
              { id: 'news', label: 'News', icon: <Newspaper size={16}/> },
              { id: 'menu', label: 'Menu', icon: <Coffee size={16}/> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as TabType); setLastError(null); }}
                className={`flex-shrink-0 flex items-center gap-2.5 px-8 py-5 rounded-[1.8rem] font-black uppercase text-[9px] tracking-[0.2em] transition-all border ${
                  activeTab === tab.id ? 'bg-white text-black border-white shadow-xl' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/50'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
          <button onClick={() => fetchData()} className="p-5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500 hover:text-white transition-all">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="px-2">
           <button 
             onClick={() => { setEditingItem(null); setPreviewPhoto(null); setLastError(null); setIsModalOpen(true); }}
             className="w-full py-7 bg-purple-600 text-white rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.4em] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl italic"
           >
             <Plus size={20} /> Adicionar Novo {activeTab}
           </button>
        </div>

        <div className="space-y-4 px-2">
          {dataList.length > 0 ? dataList.map((item) => (
            <div key={item.id} className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-[2.8rem] flex items-center justify-between group backdrop-blur-md">
              <div className="flex items-center gap-5 min-w-0">
                {(item.photo || item.image) && (
                  <img src={item.photo || item.image} className="w-16 h-16 rounded-[1.5rem] object-cover shrink-0" />
                )}
                <div className="min-w-0">
                  <h4 className="font-black text-[15px] uppercase italic text-white truncate tracking-tighter">{item.name || item.title || item.code}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest truncate">{item.discount || item.price || item.event_name}</span>
                    {item.status && (
                      <span className={`text-[7px] px-2 py-0.5 rounded-full uppercase font-black ${item.status === 'active' || item.status === 'valid' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {item.status === 'active' ? 'Ativo' : item.status === 'expired' ? 'Inativo' : item.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2.5 ml-4">
                <button onClick={() => { setEditingItem(item); setPreviewPhoto(item.photo || item.image); setIsModalOpen(true); }} className="p-4 bg-zinc-900 text-zinc-500 rounded-2xl hover:text-white"><Edit size={18} /></button>
                <button onClick={() => setConfirmDeleteId({ id: item.id, name: item.name || item.title || item.code || 'item' })} className="p-4 bg-zinc-900 text-zinc-500 hover:text-red-500 rounded-2xl"><Trash2 size={18} /></button>
              </div>
            </div>
          )) : (
            <div className="text-center py-40 opacity-20"><p className="text-[10px] font-black uppercase tracking-[0.5em]">{loading ? 'Carregando...' : 'Tabela Vazia'}</p></div>
          )}
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
          <div className="bg-zinc-950 w-full max-w-sm rounded-[3.5rem] border border-red-500/50 p-10 text-center">
            <AlertTriangle className="text-red-500 mx-auto mb-6" size={48} />
            <h3 className="text-2xl font-black uppercase italic text-white mb-4">Confirmar?</h3>
            <p className="text-zinc-500 text-[11px] font-bold uppercase mb-10 tracking-widest">Apagar "{confirmDeleteId.name}"?</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setConfirmDeleteId(null)} className="py-6 bg-zinc-900 text-zinc-400 rounded-[1.8rem] font-black uppercase text-[10px]">Não</button>
              <button onClick={executeDelete} className="py-6 bg-red-600 text-white rounded-[1.8rem] font-black uppercase text-[10px]">Sim</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-zinc-950 w-full max-w-lg rounded-[4rem] border border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] shadow-2xl">
            <div className="p-10 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/10">
              <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">{editingItem ? 'Editar' : 'Novo'} {activeTab}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-600 hover:text-white p-3"><X size={36} /></button>
            </div>
            <form onSubmit={handleSave} className="p-10 overflow-y-auto space-y-8 no-scrollbar">
              {(activeTab === 'clients' || activeTab === 'news' || activeTab === 'menu') && (
                <div className="flex flex-col items-center gap-6">
                  <div onClick={() => fileInputRef.current?.click()} className="w-32 h-32 rounded-[3rem] bg-zinc-900 border-2 border-dashed border-zinc-800 flex items-center justify-center overflow-hidden cursor-pointer hover:border-purple-500 transition-all shadow-inner group relative">
                    {previewPhoto ? <img src={previewPhoto} className="w-full h-full object-cover" /> : <Camera className="text-zinc-700" size={40} />}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setPreviewPhoto(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} className="hidden" accept="image/*" />
                </div>
              )}

              {activeTab === 'clients' && (
                <>
                  <div className="space-y-2"><label className="admin-label">Nome</label><input name="name" defaultValue={editingItem?.name} className="admin-input" required /></div>
                  <div className="space-y-2"><label className="admin-label">Email</label><input name="email" defaultValue={editingItem?.email} type="email" className="admin-input" required /></div>
                  <div className="space-y-2"><label className="admin-label">Senha</label><input name="password" defaultValue={editingItem?.password} className="admin-input" required /></div>
                </>
              )}
              {activeTab === 'coupons' && (
                <>
                  <div className="space-y-2"><label className="admin-label">Dono</label><select name="client_id" defaultValue={editingItem?.client_id} className="admin-input" required><option value="">Selecionar Fã...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div className="space-y-2"><label className="admin-label">Código</label><input name="code" defaultValue={editingItem?.code} placeholder="EX: VIP10" className="admin-input" required /></div>
                  <div className="space-y-2"><label className="admin-label">Prêmio</label><input name="discount" defaultValue={editingItem?.discount} placeholder="EX: 10% OFF" className="admin-input" required /></div>
                  <div className="space-y-2"><label className="admin-label">Expiração</label><input name="validity" defaultValue={editingItem?.validity} type="date" className="admin-input" required /></div>
                </>
              )}
              {activeTab === 'wristbands' && (
                <>
                  <div className="space-y-2"><label className="admin-label">Fã</label><select name="client_id" defaultValue={editingItem?.client_id} className="admin-input" required><option value="">Selecionar Fã...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  <div className="space-y-2"><label className="admin-label">Evento</label><input name="event_name" defaultValue={editingItem?.event_name} className="admin-input" required /></div>
                  <div className="space-y-2"><label className="admin-label">Código</label><input name="code" defaultValue={editingItem?.code} className="admin-input" required /></div>
                </>
              )}
              {activeTab === 'news' && (
                <>
                  <div className="space-y-2"><label className="admin-label">Título</label><input name="title" defaultValue={editingItem?.title} className="admin-input" required /></div>
                  <div className="space-y-2"><label className="admin-label">Data</label><input name="date" defaultValue={editingItem?.date} type="date" className="admin-input" required /></div>
                  <div className="space-y-2"><label className="admin-label">Conteúdo</label><textarea name="content" defaultValue={editingItem?.content} className="admin-input h-32 pt-6" required /></div>
                </>
              )}
              {activeTab === 'menu' && (
                <>
                  <div className="space-y-2"><label className="admin-label">Produto</label><input name="name" defaultValue={editingItem?.name} className="admin-input" required /></div>
                  <div className="space-y-2"><label className="admin-label">Preço</label><input name="price" defaultValue={editingItem?.price} className="admin-input" required /></div>
                  <div className="space-y-2"><label className="admin-label">Descrição</label><textarea name="description" defaultValue={editingItem?.description} className="admin-input h-28 pt-6" required /></div>
                </>
              )}

              <button type="submit" disabled={saving} className="w-full py-7 rounded-[2.5rem] bg-white text-black font-black uppercase text-[12px] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4">
                {saving ? <Loader2 className="animate-spin" size={22} /> : <CheckCircle size={22} />}
                {saving ? 'Gravando...' : 'Finalizar'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-label { display: block; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; color: #52525b; margin-left: 1.5rem; }
        .admin-input { width: 100%; background: #09090b; border: 2px solid #18181b; border-radius: 2rem; padding: 1.5rem 2rem; color: white; font-size: 14px; font-weight: 700; outline: none; transition: all 0.2s; }
        .admin-input:focus { border-color: #9333ea; background: #000; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </Layout>
  );
};

export default AdminDashboard;
