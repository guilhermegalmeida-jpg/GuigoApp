import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Wallet, Users, Calendar, User, LogOut, Camera, X, 
  Loader2, TrendingDown, TrendingUp, PiggyBank, FileText, 
  Trash2, Plus, Edit2, Filter, CheckCircle, Search, ArrowLeft, Clock, ChevronDown, List, StickyNote, ClipboardList, CheckSquare, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { 
  LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, YAxis, Cell, LabelList, Legend 
} from 'recharts';

// --- ESTILOS CSS ---
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: #f3f4f6; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
`;

// --- CONFIGURAÇÃO SUPABASE ---
const supabaseUrl = "https://ufeocwgdamkdswdgxcrn.supabase.co";
const supabaseKey = "sb_publishable_Awq2eQiYjKspQRGxVHa6Vw_ojqLETS1"; 
const supabase = createClient(supabaseUrl, supabaseKey);

// --- CORES & LISTAS ---
const COLORS_CAT = ['#8B5CF6', '#10B981', '#EF4444', '#F59E0B', '#3B82F6', '#EC4899', '#6366F1'];
const DEFAULT_CATEGORIES_RECEITA = ['Salário (60%)', 'Adiantamento (40%)', 'Hora Extra (100%)', 'Banco de Horas', 'Investimento', 'Outros'];
const DEFAULT_CATEGORIES_DESPESA = ['Adesão', 'Alimentação', 'Educação', 'Lazer', 'Moradia', 'Pets', 'Saúde', 'Transporte', 'Vestuário'];
const DEFAULT_CATEGORIES_INVEST = ['Ações', 'Cripto', 'FIIs', 'Renda Fixa', 'Tesouro Direto'];
const DEFAULT_PAYMENT_METHODS = ['Cartão de Crédito', 'Cartão de Débito', 'Dinheiro', 'Investimento', 'Pix', 'Poupança', 'Transferência'];

// --- UTILS ---
const safeJSONParse = (key, fallback) => { try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : fallback; } catch { return fallback; } };
const formatarDataAmigavel = (dataString) => { if (!dataString) return ''; const [ano, mes, dia] = dataString.split('-'); const data = new Date(ano, mes - 1, dia); return data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }); };

const formatarMoeda = (valor) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(valor);
};

const getCleanObservation = (fullObs) => {
    if (!fullObs) return null;
    if (fullObs.includes('|')) {
        const parts = fullObs.split('|');
        const obsPart = parts.find(p => p.trim().startsWith('Obs:'));
        if (obsPart) {
            const text = obsPart.replace('Obs:', '').trim();
            return text.length > 0 ? text : null;
        }
        return null; 
    }
    return fullObs.trim().length > 0 ? fullObs : null;
};

// --- ÍCONE GUIGO (CABELO VOLUMOSO + ÓCULOS REDONDOS) ---
const GuigoAvatar = ({ size = 100 }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="95" fill="#E0F2FE" />
    <circle cx="100" cy="100" r="90" stroke="#3B82F6" strokeWidth="4" strokeDasharray="8 6"/>
    <path d="M60 90C50 80 50 60 65 50C75 30 95 25 110 25C125 25 145 30 155 50C170 60 170 80 160 90" stroke="#4B2C20" strokeWidth="14" strokeLinecap="round" fill="none"/>
    <path d="M70 55C75 45 85 45 90 55" stroke="#4B2C20" strokeWidth="8" strokeLinecap="round"/>
    <path d="M130 55C135 45 145 45 150 55" stroke="#4B2C20" strokeWidth="8" strokeLinecap="round"/>
    <path d="M100 165C130 165 150 140 150 105C150 75 130 55 100 55C70 55 50 75 50 105C50 140 70 165 100 165Z" fill="#FFDFC4" />
    <circle cx="75" cy="110" r="18" stroke="#1E3A8A" strokeWidth="4" fill="rgba(255,255,255,0.3)" />
    <circle cx="125" cy="110" r="18" stroke="#1E3A8A" strokeWidth="4" fill="rgba(255,255,255,0.3)" />
    <line x1="93" y1="110" x2="107" y2="110" stroke="#1E3A8A" strokeWidth="4" />
    <line x1="57" y1="110" x2="45" y2="105" stroke="#1E3A8A" strokeWidth="3" />
    <line x1="143" y1="110" x2="155" y2="105" stroke="#1E3A8A" strokeWidth="3" />
    <circle cx="75" cy="110" r="3" fill="#1E293B" />
    <circle cx="125" cy="110" r="3" fill="#1E293B" />
    <path d="M85 140C90 145 110 145 115 140" stroke="#9A3412" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// --- LAYOUT ---
const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'text-blue-600 font-black scale-110' : 'text-gray-400'}`}>
      <Icon size={24} strokeWidth={isActive ? 3 : 2} />
      <span className="text-[10px] mt-1 font-bold">{label}</span>
      {isActive && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1"></div>}
    </Link>
  );
};

const Layout = ({ children, title, onPlusClick, backButton }) => (
  <div className="min-h-screen bg-gray-50 pb-24 font-sans text-gray-900">
    <style>{scrollbarStyles}</style>
    <header className="bg-blue-600 p-6 pt-12 rounded-b-[40px] shadow-lg text-white mb-6 flex justify-between items-center sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {backButton && (
            <Link to="/carteira" className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-all">
                <ArrowLeft size={20} />
            </Link>
        )}
        <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight leading-none">{title}</h1>
            <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest text-blue-100 mt-1">Guigo App</p>
        </div>
      </div>
      {onPlusClick && (
        <button onClick={onPlusClick} className="bg-white/20 p-3 rounded-full shadow-lg hover:bg-white/40 transition-all border border-white/30">
          <Plus size={24} color="white" />
        </button>
      )}
    </header>
    <main className="px-4 w-full md:max-w-7xl mx-auto transition-all duration-300">{children}</main>
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3 pb-6 shadow-2xl z-50 px-2">
      <NavItem to="/carteira" icon={Wallet} label="Carteira" />
      <NavItem to="/transacoes" icon={List} label="Transações" />
      <NavItem to="/planejamento" icon={ClipboardList} label="Planejamento" />
      <NavItem to="/splitwise" icon={Users} label="Grupo" />
      <NavItem to="/perfil" icon={User} label="Perfil" />
    </nav>
  </div>
);

// --- COMPONENTE: ITEM DE TRANSAÇÃO (LAYOUT AJUSTADO) ---
const TransactionItem = ({ g, onEdit, onDelete, onPay, showTime, isPlanning }) => {
  const cleanObs = getCleanObservation(g.observacao);
  const isAtrasado = isPlanning && new Date(g.vencimento) < new Date().setHours(0,0,0,0) && g.status !== 'Pago';
  
  let iconColorBg = 'bg-red-50 text-red-500';
  let icon = <TrendingDown size={18}/>;
  let valorColor = 'text-red-600';

  if (g.status === 'Pago') {
      iconColorBg = 'bg-green-50 text-green-500'; 
      icon = <CheckCircle size={18}/>;
      valorColor = 'text-green-600'; 
  } else if (g.tipo === 'Receita') {
      iconColorBg = 'bg-green-50 text-green-500';
      icon = <TrendingUp size={18}/>;
      valorColor = 'text-green-600';
  } else if (g.tipo === 'Investimento') {
      iconColorBg = 'bg-blue-50 text-blue-600';
      icon = <PiggyBank size={18}/>;
      valorColor = 'text-blue-600';
  }

  if (isAtrasado) {
      iconColorBg = 'bg-red-100 text-red-600';
      icon = <AlertCircle size={18}/>;
  }

  return (
    <div className={`bg-white p-4 rounded-3xl flex justify-between items-start shadow-sm border-l-4 transition-all mb-3 animate-in slide-in-from-bottom duration-300 ${isAtrasado ? 'border-red-500' : g.status === 'Pago' ? 'border-green-500' : 'border-transparent'}`}>
      <div className="flex items-start gap-3 w-full">
        <div className={`p-3 rounded-2xl shrink-0 ${iconColorBg}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-800 text-xs">{g.descricao}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                    <span className="text-[8px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-bold uppercase">{g.categoria}</span>
                    {isPlanning && (
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-bold uppercase text-white ${isAtrasado ? 'bg-red-500' : g.status === 'Pago' ? 'bg-green-500' : 'bg-yellow-400'}`}>
                            {isAtrasado ? 'Atrasado' : g.status}
                        </span>
                    )}
                </div>
              </div>
              
              <div className="text-right flex flex-col items-end">
                  <p className={`text-xs font-black whitespace-nowrap ${valorColor}`}>
                      {(!isPlanning && g.tipo !== 'Despesa') ? '+' : ''} {formatarMoeda(g.valor)}
                  </p>
                  
                  {/* DATA E HORA ALINHADOS À DIREITA ABAIXO DO VALOR */}
                  <div className="flex items-center gap-1 text-[9px] text-gray-400 mt-0.5">
                        {isPlanning ? formatarDataAmigavel(g.vencimento) : (
                            <>
                                {new Date(g.created_at || g.data).toLocaleDateString('pt-BR')}
                                {showTime && g.created_at && ` - ${new Date(g.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`}
                            </>
                        )}
                        <Clock size={8}/> 
                  </div>
              </div>
          </div>

          {cleanObs && (
              <div className="mt-2 bg-yellow-50 p-2 rounded-xl border border-yellow-100 flex gap-2 items-start">
                  <StickyNote size={12} className="text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-gray-600 font-medium leading-snug break-all">{cleanObs}</p>
              </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col gap-2 ml-2 pl-2 border-l border-gray-100 justify-center min-h-[40px]">
          {onPay && g.status !== 'Pago' && (
              <button onClick={() => onPay(g)} className="text-green-500 hover:bg-green-50 p-1 rounded-full" title="Pagar"><CheckSquare size={16}/></button>
          )}
          {onEdit && <button onClick={() => onEdit(g)} className="text-gray-300 hover:text-blue-500 p-1"><Edit2 size={14}/></button>}
          {onDelete && <button onClick={() => onDelete(g.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={14}/></button>}
      </div>
    </div>
  );
};

// --- MODAL DE TRANSAÇÃO (REUTILIZÁVEL) ---
const TransactionModal = ({ showModal, setShowModal, editId, tipoModal, setTipoModal, form, setForm, salvar, loading, customCats, setCustomCats, customPay, setCustomPay }) => {
    if (!showModal) return null;

    const getCategories = () => {
        let base = [];
        if(tipoModal === 'Receita') base = DEFAULT_CATEGORIES_RECEITA;
        else if(tipoModal === 'Despesa') base = DEFAULT_CATEGORIES_DESPESA;
        else base = DEFAULT_CATEGORIES_INVEST;
        return [...base, ...customCats.filter(c => !base.includes(c))].sort();
    };

    const getPayments = () => {
        return [...DEFAULT_PAYMENT_METHODS, ...customPay.filter(p => !DEFAULT_PAYMENT_METHODS.includes(p))].sort();
    };

    const handleAddOption = (type, value) => {
        if (value === 'new_option') {
            const novo = prompt(`Nome da nova ${type === 'cat' ? 'categoria' : 'forma de pagamento'}:`);
            if (novo) {
                if (type === 'cat') {
                    const newList = [...customCats, novo]; setCustomCats(newList); localStorage.setItem('guigo_custom_cats', JSON.stringify(newList)); setForm({ ...form, cat: novo });
                } else {
                    const newList = [...customPay, novo]; setCustomPay(newList); localStorage.setItem('guigo_custom_pay', JSON.stringify(newList)); setForm({ ...form, pagamento: novo });
                }
            } else {
                if(type === 'cat') setForm({...form, cat: ''}); else setForm({...form, pagamento: ''});
            }
        } else {
            if (type === 'cat') setForm({ ...form, cat: value }); else setForm({ ...form, pagamento: value });
        }
    };

    const handleDeleteCustomOption = (type, value) => {
        if(window.confirm(`Apagar "${value}"?`)) {
            if(type === 'cat') {
                const newList = customCats.filter(c => c !== value); setCustomCats(newList); localStorage.setItem('guigo_custom_cats', JSON.stringify(newList)); setForm({...form, cat: ''});
            } else {
                const newList = customPay.filter(p => p !== value); setCustomPay(newList); localStorage.setItem('guigo_custom_pay', JSON.stringify(newList)); setForm({...form, pagamento: ''});
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 pb-2">
                    <h2 className="text-xl font-black italic text-gray-800">{editId ? 'Editar' : 'Novo'} Lançamento</h2>
                    <button onClick={() => setShowModal(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><X size={20}/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar space-y-5">
                    <div className="flex gap-2 bg-gray-50 p-1 rounded-2xl mb-4">
                    {['Receita', 'Despesa', 'Investimento'].map(t => (
                        <button key={t} onClick={() => { setTipoModal(t); setForm({...form, cat: ''}); }} className={`flex-1 py-3 rounded-xl font-bold text-[10px] transition-all ${tipoModal === t ? (t === 'Receita' ? 'bg-white text-green-600 shadow-sm border' : t === 'Investimento' ? 'bg-white text-blue-600 shadow-sm border' : 'bg-white text-red-600 shadow-sm border') : 'text-gray-400 hover:bg-gray-100'}`}>{t}</button>
                    ))}
                    </div>

                    <form id="transacaoForm" onSubmit={salvar} className="space-y-4">
                        {tipoModal === 'Investimento' ? (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">Nome</label>
                                        <input type="text" placeholder="Ex: PETR4" className="w-full p-3 bg-white rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500" value={form.desc} onChange={e=>setForm({...form, desc: e.target.value})} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">Tipo</label>
                                        <select className="w-full p-3 bg-white rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500" value={form.cat} onChange={(e) => handleAddOption('cat', e.target.value)}>
                                            <option value="">Selecione...</option>
                                            {getCategories().map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-600 mb-1 block">Instituição</label>
                                    <input type="text" placeholder="Ex: XP Investimentos" className="w-full p-3 bg-white rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500" value={form.instituicao} onChange={e=>setForm({...form, instituicao: e.target.value})} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">Valor Inicial</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-gray-400 text-sm">R$</span>
                                            <input type="number" step="0.01" className="w-full p-3 pl-8 bg-white rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500" value={form.valor} onChange={e=>setForm({...form, valor: e.target.value})} placeholder="0,00" required />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">Valor Atual</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-gray-400 text-sm">R$</span>
                                            <input type="number" step="0.01" className="w-full p-3 pl-8 bg-white rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500" value={form.valor_atual} onChange={e=>setForm({...form, valor_atual: e.target.value})} placeholder="0,00" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">Data Compra</label>
                                        <input type="date" className="w-full p-3 bg-white rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500" value={form.data} onChange={e=>setForm({...form, data: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">Vencimento</label>
                                        <input type="date" className="w-full p-3 bg-white rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500" value={form.vencimento} onChange={e=>setForm({...form, vencimento: e.target.value})} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">Retorno (%)</label>
                                        <div className="relative">
                                            <input type="number" className="w-full p-3 pr-8 bg-white rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500" value={form.retorno} onChange={e=>setForm({...form, retorno: e.target.value})} placeholder="0,00" />
                                            <span className="absolute right-3 top-3 text-gray-400 text-sm">%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 mb-1 block">Status</label>
                                        <select className="w-full p-3 bg-white rounded-lg border border-gray-200 text-sm outline-none focus:border-blue-500" value={form.status} onChange={e=>setForm({...form, status: e.target.value})}>
                                            <option>Ativo</option>
                                            <option>Resgatado</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-1">Valor do Lançamento</label>
                                    <input type="number" step="0.01" placeholder="0,00" className={`w-full bg-transparent font-black text-center text-4xl outline-none ${tipoModal === 'Receita' ? 'text-green-600' : 'text-red-600'}`} value={form.valor} onChange={e=>setForm({...form, valor: e.target.value})} required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold text-gray-600 mb-1 block">Data</label><input type="date" className="w-full p-3 bg-white rounded-lg border border-gray-200 text-sm outline-none" value={form.data} onChange={e=>setForm({...form, data: e.target.value})} required /></div>
                                    <div className="relative"><label className="text-xs font-bold text-gray-600 mb-1 block">Categoria</label><select className="w-full p-3 bg-white rounded-lg border border-gray-200 text-sm outline-none appearance-none" value={form.cat} onChange={(e) => handleAddOption('cat', e.target.value)}><option value="">Selecione...</option><option value="new_option" className="text-blue-600 font-bold">Adicionar nova...</option>{getCategories().map(c => <option key={c} value={c}>{c}</option>)}</select>{customCats.includes(form.cat) && <button type="button" onClick={() => handleDeleteCustomOption('cat', form.cat)} className="absolute right-2 top-8 text-red-400 hover:text-red-600"><Trash2 size={14}/></button>}</div>
                                </div>
                                {tipoModal === 'Despesa' && (
                                    <div className="relative"><label className="text-xs font-bold text-gray-600 mb-1 block">Pagamento</label><select className="w-full p-3 bg-white rounded-lg border border-gray-200 text-sm outline-none appearance-none" value={form.pagamento} onChange={(e) => handleAddOption('pay', e.target.value)}><option value="">Selecione...</option><option value="new_option" className="text-blue-600 font-bold">Adicionar nova...</option>{getPayments().map(p => <option key={p} value={p}>{p}</option>)}</select>{customPay.includes(form.pagamento) && <button type="button" onClick={() => handleDeleteCustomOption('pay', form.pagamento)} className="absolute right-2 top-8 text-red-400 hover:text-red-600"><Trash2 size={14}/></button>}</div>
                                )}
                                <div><label className="text-xs font-bold text-gray-600 mb-1 block">Descrição</label><input type="text" placeholder="Descrição" className="w-full p-3 bg-white rounded-lg border border-gray-200 text-sm outline-none" value={form.desc} onChange={e=>setForm({...form, desc: e.target.value})} required /></div>
                            </>
                        )}
                        <div><label className="text-xs font-bold text-gray-600 mb-1 block">Observações</label><textarea placeholder="Notas adicionais..." className="w-full p-3 bg-white rounded-lg border border-gray-200 text-sm h-24 resize-none outline-none" value={form.obs} onChange={e=>setForm({...form, obs: e.target.value})} /></div>
                    </form>
                </div>
                <div className="p-6 pt-4 border-t border-gray-100">
                    <button form="transacaoForm" type="submit" disabled={loading} className={`w-full py-4 text-white font-black rounded-xl shadow-lg transition-all hover:opacity-90 active:scale-95 ${tipoModal === 'Receita' ? 'bg-green-600' : tipoModal === 'Investimento' ? 'bg-blue-600' : 'bg-red-600'}`}>{loading ? <Loader2 className="animate-spin mx-auto" /> : "Confirmar"}</button>
                </div>
            </div>
        </div>
    );
};

// --- CALENDÁRIO WIDGET ---
const CalendarWidget = ({ planos, currentDate, onMonthChange }) => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const monthName = currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const getStatusForDay = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const items = planos.filter(p => p.vencimento === dateStr);
        if (items.length === 0) return null;
        if (items.some(p => p.status === 'Pago')) return 'bg-green-400';
        if (items.some(p => new Date(p.vencimento) < new Date().setHours(0,0,0,0) && p.status !== 'Pago')) return 'bg-red-400';
        return 'bg-yellow-400';
    };

    return (
        <div className="bg-white p-5 rounded-[30px] shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => onMonthChange(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20}/></button>
                <h3 className="font-black text-gray-800 capitalize">{monthName}</h3>
                <button onClick={() => onMonthChange(1)} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20}/></button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 mb-2">
                {['D','S','T','Q','Q','S','S'].map((d,i)=><span key={i}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const statusColor = getStatusForDay(day);
                    const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();
                    return (
                        <div key={day} className={`h-8 flex items-center justify-center rounded-full text-xs font-bold relative ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                            {day}
                            {statusColor && <div className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${statusColor}`}></div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- NOVA ABA: PLANEJAMENTO (FINAL) ---
const Planejamento = () => {
    const [currentDate, setCurrentDate] = useState(() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d; });
    const [planos, setPlanos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null); 
    const [novoPlano, setNovoPlano] = useState({ descricao: '', valor: '', vencimento: '', categoria: 'Alimentação', tipo: 'Despesa' });
    const user = localStorage.getItem('guigo_user');
    const [customCats, setCustomCats] = useState(safeJSONParse('guigo_custom_cats', []));
    
    // Lista de categorias dinâmica baseada no tipo selecionado (Receita, Despesa, Investimento)
    const getCategoriesForType = (type) => {
        let base = [];
        if(type === 'Receita') base = DEFAULT_CATEGORIES_RECEITA;
        else if(type === 'Investimento') base = DEFAULT_CATEGORIES_INVEST;
        else base = DEFAULT_CATEGORIES_DESPESA;
        return [...base, ...customCats.filter(c => !base.includes(c))].sort();
    };

    const carregarPlanos = async () => {
        const { data } = await supabase.from('planejamento').select('*').eq('usuario', user).order('vencimento', { ascending: true });
        if (data) setPlanos(data);
    };

    useEffect(() => { carregarPlanos(); }, []);

    const changeMonth = (delta) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentDate(newDate);
    };

    const handleAddCat = (e) => {
        if(e.target.value === 'new_option') {
            const novo = prompt("Nova categoria:");
            if(novo) {
                const newList = [...customCats, novo]; setCustomCats(newList); localStorage.setItem('guigo_custom_cats', JSON.stringify(newList)); setNovoPlano({...novoPlano, categoria: novo});
            }
        } else { setNovoPlano({...novoPlano, categoria: e.target.value}); }
    };

    const salvarPlano = async (e) => {
        e.preventDefault(); setLoading(true);
        const payload = { ...novoPlano, usuario: user, status: novoPlano.status || 'Pendente' };
        
        if (editId) {
            await supabase.from('planejamento').update(payload).eq('id', editId);
        } else {
            await supabase.from('planejamento').insert([payload]);
        }
        
        setNovoPlano({ descricao: '', valor: '', vencimento: '', categoria: 'Alimentação', tipo: 'Despesa' });
        setEditId(null);
        setShowModal(false); 
        carregarPlanos(); 
        setLoading(false);
    };

    const abrirEdicao = (plano) => {
        setNovoPlano({ 
            descricao: plano.descricao, 
            valor: plano.valor, 
            vencimento: plano.vencimento, 
            categoria: plano.categoria, 
            tipo: plano.tipo || 'Despesa',
            status: plano.status
        });
        setEditId(plano.id);
        setShowModal(true);
    };

    const marcarComoPago = async (plano) => {
        if (window.confirm(`Confirmar pagamento de ${plano.descricao}?`)) {
            await supabase.from('planejamento').update({ status: 'Pago' }).eq('id', plano.id);
            const valorFinal = plano.tipo === 'Receita' ? Math.abs(plano.valor) : -Math.abs(plano.valor);
            await supabase.from('lancamentos').insert([{ 
                descricao: plano.descricao, 
                valor: valorFinal, 
                tipo: plano.tipo || 'Despesa', 
                categoria: plano.categoria, 
                data: new Date().toISOString().split('T')[0], 
                usuario: user, 
                observacao: 'Pagamento planejado realizado' 
            }]);
            carregarPlanos();
        }
    };

    const deletarPlano = async (id) => { if(window.confirm("Remover este planejamento?")) { await supabase.from('planejamento').delete().eq('id', id); carregarPlanos(); } };

    const filteredPlanos = planos.filter(p => {
        const d = new Date(p.vencimento);
        const adjustedDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
        return adjustedDate.getMonth() === currentDate.getMonth() && adjustedDate.getFullYear() === currentDate.getFullYear();
    });

    const totalReceitas = filteredPlanos.filter(p => p.tipo === 'Receita').reduce((a, b) => a + Number(b.valor), 0);
    const totalDespesas = filteredPlanos.filter(p => p.tipo !== 'Receita' && p.tipo !== 'Investimento').reduce((a, b) => a + Number(b.valor), 0);
    const totalInvestimentos = filteredPlanos.filter(p => p.tipo === 'Investimento').reduce((a, b) => a + Number(b.valor), 0);
    
    const chartData = [
        { name: 'Rendas', valor: totalReceitas },
        { name: 'Despesas', valor: totalDespesas },
        { name: 'Investimentos', valor: totalInvestimentos }
    ];

    const agendados = filteredPlanos.filter(p => p.status !== 'Pago');
    const pagos = filteredPlanos.filter(p => p.status === 'Pago');

    return (
        <Layout title="Planejamento" onPlusClick={() => { setEditId(null); setNovoPlano({ descricao: '', valor: '', vencimento: '', categoria: '', tipo: 'Despesa' }); setShowModal(true); }}>
            <CalendarWidget planos={planos} currentDate={currentDate} onMonthChange={changeMonth} />

            <div className="bg-white p-5 rounded-[30px] shadow-sm mb-6">
                <h4 className="text-center font-bold text-gray-400 text-xs uppercase mb-4">Previsão Mensal</h4>
                <div className="h-40 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" tick={{fontSize: 10, fontWeight: 'bold'}} width={70} />
                            <Tooltip cursor={{fill: 'transparent'}} formatter={(val) => formatarMoeda(val)} />
                            <Bar dataKey="valor" radius={[0, 4, 4, 0]} barSize={20}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'Rendas' ? '#10B981' : entry.name === 'Investimentos' ? '#3B82F6' : '#EF4444'} />
                                ))}
                                <LabelList dataKey="valor" position="right" formatter={(val) => formatarMoeda(val)} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#6B7280' }} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="space-y-6 pb-20">
                <div>
                    <h4 className="font-black text-gray-800 ml-2 mb-3 text-sm uppercase flex items-center gap-2"><Clock size={16}/> Próximos Lançamentos</h4>
                    <div className="space-y-2">
                        {agendados.length === 0 ? <p className="text-xs text-gray-400 ml-2">Nada pendente para este mês.</p> : agendados.map(p => (
                            <TransactionItem key={p.id} g={{...p, tipo: p.tipo || 'Despesa', observacao: ''}} isPlanning={true} onEdit={() => abrirEdicao(p)} onDelete={() => deletarPlano(p.id)} onPay={() => marcarComoPago(p)} showTime={false} />
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="font-black text-gray-400 ml-2 mb-3 text-sm uppercase flex items-center gap-2"><CheckCircle size={16}/> Já Pagos</h4>
                    <div className="space-y-2">
                        {pagos.length === 0 ? <p className="text-xs text-gray-400 ml-2">Nenhum pagamento realizado.</p> : pagos.map(p => (
                            <TransactionItem key={p.id} g={{...p, tipo: p.tipo || 'Despesa', observacao: ''}} isPlanning={true} onEdit={() => abrirEdicao(p)} onDelete={() => deletarPlano(p.id)} showTime={false} />
                        ))}
                    </div>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-[30px] p-6 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg">{editId ? 'Editar' : 'Novo'} Planejamento</h3><button onClick={() => setShowModal(false)}><X size={20}/></button></div>
                        <form onSubmit={salvarPlano} className="space-y-4">
                            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                                {['Despesa', 'Receita', 'Investimento'].map(t => (
                                    <button type="button" key={t} onClick={() => setNovoPlano({...novoPlano, tipo: t, categoria: ''})} className={`flex-1 py-2 rounded-lg text-[10px] font-bold ${novoPlano.tipo === t ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}>{t}</button>
                                ))}
                            </div>
                            <div><label className="text-[10px] font-bold text-gray-400">Descrição</label><input type="text" placeholder="Ex: Aluguel" className="w-full p-3 bg-gray-50 rounded-xl border outline-none text-sm" value={novoPlano.descricao} onChange={e => setNovoPlano({...novoPlano, descricao: e.target.value})} required /></div>
                            <div><label className="text-[10px] font-bold text-gray-400">Valor</label><input type="number" step="0.01" placeholder="0,00" className="w-full p-3 bg-gray-50 rounded-xl border outline-none text-sm" value={novoPlano.valor} onChange={e => setNovoPlano({...novoPlano, valor: e.target.value})} required /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="text-[10px] font-bold text-gray-400">Vencimento</label><input type="date" className="w-full p-3 bg-gray-50 rounded-xl border outline-none text-sm" value={novoPlano.vencimento} onChange={e => setNovoPlano({...novoPlano, vencimento: e.target.value})} required /></div>
                                <div><label className="text-[10px] font-bold text-gray-400">Categoria</label><select className="w-full p-3 bg-gray-50 rounded-xl border outline-none text-sm" value={novoPlano.categoria} onChange={handleAddCat}>
                                    <option value="">Selecione...</option>
                                    {getCategoriesForType(novoPlano.tipo).map(c => <option key={c} value={c}>{c}</option>)}
                                    <option value="new_option">Adicionar nova...</option>
                                </select></div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold mt-2 shadow-lg">{loading ? <Loader2 className="animate-spin mx-auto"/> : (editId ? "Salvar Alterações" : "Agendar")}</button>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

// --- CARTEIRA (DASHBOARD) ---
const Carteira = () => {
  const [gastos, setGastos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState('Receita');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [rangeMeses, setRangeMeses] = useState(6);
  const user = localStorage.getItem('guigo_user');
  const nomeUser = localStorage.getItem('guigo_nome') || 'Amigo';
  
  const [customCats, setCustomCats] = useState(safeJSONParse('guigo_custom_cats', []));
  const [customPay, setCustomPay] = useState(safeJSONParse('guigo_custom_pay', []));

  const [form, setForm] = useState({ 
    desc: '', valor: '', cat: '', obs: '', data: new Date().toISOString().split('T')[0], 
    pagamento: '', instituicao: '', vencimento: '', retorno: '', status: 'Ativo', valor_atual: ''
  });

  const carregar = async () => {
    const { data } = await supabase.from('lancamentos').select('*').eq('usuario', user).order('data', { ascending: false });
    if (data) setGastos(data || []);
  };

  useEffect(() => { carregar(); }, []);

  const processarDadosFluxo = () => {
    const hoje = new Date();
    const dadosPorMes = {};
    for (let i = rangeMeses - 1; i >= 0; i--) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        const mesAno = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        dadosPorMes[key] = { name: mesAno, Receita: 0, Despesa: 0, Investimento: 0, sortKey: key };
    }
    gastos.forEach(g => {
        const d = new Date(g.data);
        const dataAjustada = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
        const key = `${dataAjustada.getFullYear()}-${String(dataAjustada.getMonth() + 1).padStart(2, '0')}`;
        if (dadosPorMes[key]) {
            const valor = Math.abs(Number(g.valor));
            if (g.tipo === 'Receita') dadosPorMes[key].Receita += valor;
            if (g.tipo === 'Despesa') dadosPorMes[key].Despesa += valor;
            if (g.tipo === 'Investimento') dadosPorMes[key].Investimento += valor;
        }
    });
    return Object.values(dadosPorMes).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  };
  const chartData = processarDadosFluxo();

  const barData = Object.entries(
    gastos.filter(g => g.tipo === 'Despesa').reduce((acc, g) => {
      acc[g.categoria] = (acc[g.categoria] || 0) + Math.abs(Number(g.valor));
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  const totais = {
    saldo: gastos.reduce((a, b) => a + Number(b.valor), 0),
    receitas: gastos.filter(g => g.tipo === 'Receita').reduce((a, b) => a + Number(b.valor), 0),
    despesas: gastos.filter(g => g.tipo === 'Despesa').reduce((a, b) => a + Number(b.valor), 0),
    invest: gastos.filter(g => g.tipo === 'Investimento').reduce((a, b) => a + Number(b.valor), 0)
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setTipoModal(item.tipo);
    let obsTexto = item.observacao || '';
    let instituicao = '', vencimento = '', retorno = '', status = '', valor_atual = '';
    if (item.tipo === 'Investimento' && obsTexto.includes('|')) {
        const parts = obsTexto.split('|');
        parts.forEach(p => {
            if(p.includes('Inst:')) instituicao = p.replace('Inst:','').trim();
            if(p.includes('Venc:')) vencimento = p.replace('Venc:','').trim();
            if(p.includes('Ret:')) retorno = p.replace('Ret:','').trim();
            if(p.includes('Status:')) status = p.replace('Status:','').trim();
            if(p.includes('Obs:')) obsTexto = p.replace('Obs:','').trim();
        });
    }
    setForm({ desc: item.descricao, valor: Math.abs(item.valor), cat: item.categoria, obs: obsTexto, data: item.data, pagamento: item.forma_pagamento || '', instituicao, vencimento, retorno, status, valor_atual });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apagar transação?")) {
        await supabase.from('lancamentos').delete().eq('id', id);
        carregar();
    }
  };

  const salvar = async (e) => {
    e.preventDefault();
    setLoading(true);
    let valorFinal = parseFloat(form.valor);
    if (tipoModal === 'Despesa') valorFinal = -Math.abs(valorFinal);
    else valorFinal = Math.abs(valorFinal);

    let obsFinal = form.obs;
    if (tipoModal === 'Investimento') {
       obsFinal = `Inst: ${form.instituicao} | Venc: ${form.vencimento} | Ret: ${form.retorno} | Status: ${form.status} | Obs: ${form.obs}`;
    }

    const payload = { 
      descricao: form.desc, valor: valorFinal, tipo: tipoModal, categoria: form.cat, observacao: obsFinal, 
      forma_pagamento: tipoModal === 'Despesa' ? form.pagamento : null, data: form.data, usuario: user
    };

    let error;
    if (editId) {
        const { error: err } = await supabase.from('lancamentos').update(payload).eq('id', editId); error = err;
    } else {
        const { error: err } = await supabase.from('lancamentos').insert([payload]); error = err;
    }

    if (!error) {
      setShowModal(false); setEditId(null);
      setForm({ desc: '', valor: '', cat: '', obs: '', data: new Date().toISOString().split('T')[0], pagamento: '', instituicao: '', vencimento: '', retorno: '', valor_atual: '' });
      carregar();
    } else { alert("Erro: " + error.message); }
    setLoading(false);
  };

  return (
    <Layout title={`Olá, ${nomeUser}! 👋`} onPlusClick={() => { setEditId(null); setShowModal(true); }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-gray-400 flex justify-between items-center"><div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Saldo Atual</p><p className="text-2xl font-black text-gray-800 mt-1">{formatarMoeda(totais.saldo)}</p></div><div className="p-3 bg-gray-100 rounded-2xl text-gray-600"><Wallet size={24}/></div></div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-green-400 flex justify-between items-center"><div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Receitas</p><p className="text-2xl font-black text-green-600 mt-1">{formatarMoeda(totais.receitas)}</p></div><div className="p-3 bg-green-50 rounded-2xl text-green-600"><TrendingUp size={24}/></div></div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-red-400 flex justify-between items-center"><div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Despesas</p><p className="text-2xl font-black text-red-600 mt-1">{formatarMoeda(Math.abs(totais.despesas))}</p></div><div className="p-3 bg-red-50 rounded-2xl text-red-600"><TrendingDown size={24}/></div></div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-blue-500 flex justify-between items-center"><div><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Investimentos</p><p className="text-2xl font-black text-blue-600 mt-1">{formatarMoeda(totais.invest)}</p></div><div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><PiggyBank size={24}/></div></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-[32px] shadow-sm"><div className="flex justify-between items-center mb-4"><h3 className="text-xs font-black uppercase text-gray-400">Fluxo Mensal</h3><div className="relative"><select value={rangeMeses} onChange={(e) => setRangeMeses(Number(e.target.value))} className="appearance-none bg-gray-100 text-gray-600 text-[10px] font-bold py-1.5 pl-3 pr-8 rounded-xl focus:outline-none"><option value="3">3 Meses</option><option value="6">6 Meses</option><option value="12">1 Ano</option></select><ChevronDown size={12} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" /></div></div><div className="h-48 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" /><XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} dy={10} /><YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} /><Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px'}} itemStyle={{paddingBottom: 2}} formatter={(val) => formatarMoeda(val)} /><Legend wrapperStyle={{fontSize: '10px', paddingTop: '10px'}} /><Line type="monotone" dataKey="Receita" stroke="#10B981" strokeWidth={3} dot={{r: 3, fill: '#10B981'}} activeDot={{r: 6}} /><Line type="monotone" dataKey="Despesa" stroke="#EF4444" strokeWidth={3} dot={{r: 3, fill: '#EF4444'}} activeDot={{r: 6}} /><Line type="monotone" dataKey="Investimento" stroke="#3B82F6" strokeWidth={3} dot={{r: 3, fill: '#3B82F6'}} activeDot={{r: 6}} /></LineChart></ResponsiveContainer></div></div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm"><div className="flex justify-between items-center mb-4"><h3 className="text-xs font-black uppercase text-gray-400">Despesas por Categoria</h3><span className="text-xs font-bold text-red-500">Total: {formatarMoeda(Math.abs(totais.despesas))}</span></div><div className="h-48 w-full">{barData.length > 0 ? (<ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={barData} margin={{ top: 0, right: 50, left: 10, bottom: 0 }}><XAxis type="number" hide /><YAxis dataKey="name" type="category" width={70} tick={{fontSize: 9, fontWeight: 'bold'}} /><Tooltip cursor={{fill: 'transparent'}} formatter={(val) => formatarMoeda(val)} /><Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>{barData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS_CAT[index % COLORS_CAT.length]} />))}<LabelList dataKey="value" position="right" formatter={(val) => formatarMoeda(val)} style={{ fontSize: '10px', fontWeight: 'bold', fill: '#6B7280' }} /></Bar></BarChart></ResponsiveContainer>) : <p className="text-center text-xs text-gray-400 py-10">Sem despesas registradas.</p>}</div></div>
      </div>
      <div className="space-y-3 pb-8"><div className="flex justify-between items-center px-2"><h4 className="font-black text-gray-800">Transações Recentes</h4><button onClick={() => navigate('/transacoes')} className="text-blue-600 text-xs font-bold uppercase hover:underline">Ver todas</button></div>{gastos.slice(0, 5).map(g => (<TransactionItem key={g.id} g={g} onEdit={handleEdit} onDelete={handleDelete} showTime={false} />))}</div>
      <TransactionModal showModal={showModal} setShowModal={setShowModal} editId={editId} tipoModal={tipoModal} setTipoModal={setTipoModal} form={form} setForm={setForm} salvar={salvar} loading={loading} customCats={customCats} setCustomCats={setCustomCats} customPay={customPay} setCustomPay={setCustomPay} />
    </Layout>
  );
};

// --- TRANSAÇÕES (PÁGINA) ---
const Transacoes = () => {
  const [gastos, setGastos] = useState([]);
  const [filteredGastos, setFilteredGastos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [tipoModal, setTipoModal] = useState('Receita');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const user = localStorage.getItem('guigo_user');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [payFilter, setPayFilter] = useState('all');
  const [customCats, setCustomCats] = useState(safeJSONParse('guigo_custom_cats', []));
  const [customPay, setCustomPay] = useState(safeJSONParse('guigo_custom_pay', []));
  const [form, setForm] = useState({ desc: '', valor: '', cat: '', obs: '', data: new Date().toISOString().split('T')[0], pagamento: '', instituicao: '', vencimento: '', retorno: '', status: 'Ativo', valor_atual: '' });

  const allCategories = [...new Set([...DEFAULT_CATEGORIES_RECEITA, ...DEFAULT_CATEGORIES_DESPESA, ...DEFAULT_CATEGORIES_INVEST, ...customCats])].sort();
  const allPayments = [...new Set([...DEFAULT_PAYMENT_METHODS, ...customPay])].sort();

  const fetchAll = async () => { const { data } = await supabase.from('lancamentos').select('*').eq('usuario', user).order('data', { ascending: false }); if (data) { setGastos(data); setFilteredGastos(data); } };
  useEffect(() => { fetchAll(); }, [user]);

  useEffect(() => {
    let result = gastos;
    if (search) result = result.filter(g => g.descricao?.toLowerCase().includes(search.toLowerCase()));
    if (startDate) result = result.filter(g => g.data >= startDate);
    if (endDate) result = result.filter(g => g.data <= endDate);
    if (typeFilter !== 'all') result = result.filter(g => g.tipo === typeFilter);
    if (catFilter !== 'all') result = result.filter(g => g.categoria === catFilter);
    if (payFilter !== 'all') result = result.filter(g => g.forma_pagamento === payFilter);
    setFilteredGastos(result);
  }, [gastos, search, startDate, endDate, typeFilter, catFilter, payFilter]);

  const clearFilters = () => { setSearch(''); setStartDate(''); setEndDate(''); setTypeFilter('all'); setCatFilter('all'); setPayFilter('all'); };

  const handleEdit = (item) => {
    setEditId(item.id); setTipoModal(item.tipo);
    let obsTexto = item.observacao || ''; let instituicao = '', vencimento = '', retorno = '', status = '', valor_atual = '';
    if (item.tipo === 'Investimento' && obsTexto.includes('|')) {
        const parts = obsTexto.split('|');
        parts.forEach(p => {
            if(p.includes('Inst:')) instituicao = p.replace('Inst:','').trim();
            if(p.includes('Venc:')) vencimento = p.replace('Venc:','').trim();
            if(p.includes('Ret:')) retorno = p.replace('Ret:','').trim();
            if(p.includes('Status:')) status = p.replace('Status:','').trim();
            if(p.includes('Obs:')) obsTexto = p.replace('Obs:','').trim();
        });
    }
    setForm({ desc: item.descricao, valor: Math.abs(item.valor), cat: item.categoria, obs: obsTexto, data: item.data, pagamento: item.forma_pagamento || '', instituicao, vencimento, retorno, status, valor_atual });
    setShowModal(true);
  };

  const handleDelete = async (id) => { if (window.confirm("Apagar transação?")) { await supabase.from('lancamentos').delete().eq('id', id); fetchAll(); } };

  const salvar = async (e) => { e.preventDefault(); setLoading(true); let valorFinal = parseFloat(form.valor); if (tipoModal === 'Despesa') valorFinal = -Math.abs(valorFinal); else valorFinal = Math.abs(valorFinal); let obsFinal = form.obs; if (tipoModal === 'Investimento') { obsFinal = `Inst: ${form.instituicao} | Venc: ${form.vencimento} | Ret: ${form.retorno} | Status: ${form.status} | Obs: ${form.obs}`; } const payload = { descricao: form.desc, valor: valorFinal, tipo: tipoModal, categoria: form.cat, observacao: obsFinal, forma_pagamento: tipoModal === 'Despesa' ? form.pagamento : null, data: form.data, usuario: user }; let error; if (editId) { const { error: err } = await supabase.from('lancamentos').update(payload).eq('id', editId); error = err; } else { const { error: err } = await supabase.from('lancamentos').insert([payload]); error = err; } if (!error) { setShowModal(false); setEditId(null); setForm({ desc: '', valor: '', cat: '', obs: '', data: new Date().toISOString().split('T')[0], pagamento: '', instituicao: '', vencimento: '', retorno: '', status: 'Ativo', valor_atual: '' }); fetchAll(); } else { alert("Erro: " + error.message); } setLoading(false); };

  const groupedGastos = filteredGastos.reduce((acc, g) => {
      const dateKey = formatarDataAmigavel(g.data);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(g);
      return acc;
  }, {});

  return (
    <Layout title="Transações" onPlusClick={() => { setEditId(null); setShowModal(true); }}>
      <div className="bg-white p-5 rounded-[32px] shadow-sm mb-6 space-y-4">
        <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
            <Search size={18} className="text-gray-400" /><input type="text" placeholder="Buscar..." className="bg-transparent outline-none flex-1 text-sm font-medium" value={search} onChange={e => setSearch(e.target.value)} />
            {(search || startDate || endDate || typeFilter !== 'all' || catFilter !== 'all' || payFilter !== 'all') && (<button onClick={clearFilters} className="text-[10px] font-bold text-red-500 uppercase">Limpar</button>)}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div><label className="text-[10px] font-bold text-gray-400 uppercase ml-1">De</label><input type="date" className="w-full bg-gray-50 p-2 rounded-xl text-xs font-bold border border-gray-100 outline-none" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Até</label><input type="date" className="w-full bg-gray-50 p-2 rounded-xl text-xs font-bold border border-gray-100 outline-none" value={endDate} onChange={e => setEndDate(e.target.value)} /></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Tipo</label><select className="w-full bg-gray-50 p-2 rounded-xl text-xs font-bold border border-gray-100 outline-none" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}><option value="all">Todos</option><option value="Receita">Receitas</option><option value="Despesa">Despesas</option><option value="Investimento">Investimentos</option></select></div>
            <div><label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Categoria</label><select className="w-full bg-gray-50 p-2 rounded-xl text-xs font-bold border border-gray-100 outline-none" value={catFilter} onChange={e => setCatFilter(e.target.value)}><option value="all">Todas</option>{allCategories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="col-span-2"><label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Pagamento</label><select className="w-full bg-gray-50 p-2 rounded-xl text-xs font-bold border border-gray-100 outline-none" value={payFilter} onChange={e => setPayFilter(e.target.value)}><option value="all">Todos</option>{allPayments.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
        </div>
      </div>
      <div className="space-y-6 pb-8">
        {Object.keys(groupedGastos).length > 0 ? Object.entries(groupedGastos).map(([date, items]) => (
            <div key={date} className="animate-in fade-in duration-500"><h5 className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest pl-2">{date}</h5><div className="space-y-2">{items.map(g => (<TransactionItem key={g.id} g={g} onEdit={handleEdit} onDelete={handleDelete} showTime={true} />))}</div></div>
        )) : <div className="text-center py-10"><Filter size={40} className="mx-auto text-gray-200 mb-2"/><p className="text-gray-400 text-sm font-bold">Nenhum resultado encontrado.</p></div>}
      </div>
      <TransactionModal showModal={showModal} setShowModal={setShowModal} editId={editId} tipoModal={tipoModal} setTipoModal={setTipoModal} form={form} setForm={setForm} salvar={salvar} loading={loading} customCats={customCats} setCustomCats={setCustomCats} customPay={customPay} setCustomPay={setCustomPay} />
    </Layout>
  );
};

// --- OUTROS ---
const Splitwise = () => { const [contas, setContas] = useState([]); const user = localStorage.getItem('guigo_user'); useEffect(() => { const fetch = async () => { const { data } = await supabase.from('coletivo').select('*').or(`pago_por.eq.${user},quem_deve.eq.${user}`).order('created_at', { ascending: false }); if (data) setContas(data); }; fetch(); }, [user]); return (<Layout title="Grupo"><div className="space-y-3 mt-4">{contas.length > 0 ? contas.map(c => (<div key={c.id} className="bg-white p-4 rounded-3xl shadow-sm border-r-4 border-indigo-400 flex justify-between items-center"><div><p className="font-bold text-xs">{c.descricao}</p><p className="text-[8px] text-gray-400">Pago por {c.pago_por === user ? 'você' : 'amigo'}</p></div><p className={`text-xs font-black ${c.pago_por === user ? 'text-green-600' : 'text-red-500'}`}>{formatarMoeda(c.valor_divida)}</p></div>)) : <p className="text-center py-20 text-gray-400 italic">Nenhuma divisão no grupo.</p>}</div></Layout>); };
const Agenda = () => { const [eventos, setEventos] = useState([]); useEffect(() => { const fetch = async () => { const { data } = await supabase.from('agenda').select('*').order('data_evento', { ascending: true }); if (data) setEventos(data); }; fetch(); }, []); return (<Layout title="Agenda Galáctica"><div className="space-y-3 mt-4">{eventos.map(ev => (<div key={ev.id} className="bg-white p-4 rounded-3xl shadow-sm flex items-center gap-4 border-l-4 border-emerald-500 transition-all"><div className="bg-emerald-50 p-2 rounded-xl text-emerald-600 font-bold text-[8px]">{ev.data_evento?.split('-').reverse().slice(0,2).join('/')}</div><p className="font-bold flex-1 text-xs text-gray-800">{ev.nome_evento}</p><CheckCircle size={16} className="text-emerald-500" /></div>))}</div></Layout>); };
const Perfil = ({ onLogout }) => { const [fotoUrl, setFotoUrl] = useState(localStorage.getItem('guigo_foto') || ''); const [loading, setLoading] = useState(false); const email = localStorage.getItem('guigo_user'); const nome = localStorage.getItem('guigo_nome'); const handleUpload = async (e) => { const file = e.target.files[0]; if (!file) return; setLoading(true); const fileName = `${Date.now()}_${file.name}`; const { error } = await supabase.storage.from('fotos_perfil').upload(fileName, file); if (!error) { const { data: urlData } = supabase.storage.from('fotos_perfil').getPublicUrl(fileName); setFotoUrl(urlData.publicUrl); localStorage.setItem('guigo_foto', urlData.publicUrl); await supabase.from('usuarios').update({ foto_url: urlData.publicUrl }).eq('email', email); } setLoading(false); }; return (<Layout title="Meu Perfil"><div className="bg-white p-8 rounded-[40px] text-center shadow-sm mt-4 relative"><div className="flex justify-center mb-6 relative"><div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-50 shadow-xl flex items-center justify-center bg-gray-50">{fotoUrl && fotoUrl !== 'null' ? <img src={fotoUrl} className="w-full h-full object-cover" /> : <GuigoAvatar size={100} />}</div><label className="absolute bottom-0 right-10 bg-blue-600 p-2.5 rounded-full text-white cursor-pointer shadow-lg hover:scale-110 transition-all">{loading ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}<input type="file" className="hidden" accept="image/*" onChange={handleUpload} /></label></div><h3 className="text-xl font-black text-gray-800 uppercase tracking-tighter">{nome}</h3><p className="text-gray-400 font-bold mb-8 text-[8px] uppercase tracking-widest">{email}</p><button onClick={onLogout} className="w-full py-4 bg-red-50 text-red-500 font-bold rounded-3xl hover:bg-red-100 transition-colors">Sair do Guigo</button></div></Layout>); };
const Auth = ({ setAuth }) => { const [email, setEmail] = useState(''); const [senha, setSenha] = useState(''); const [nome, setNome] = useState(''); const [isLogin, setIsLogin] = useState(true); const handleAuth = async (e) => { e.preventDefault(); if (isLogin) { const { data } = await supabase.from('usuarios').select('*').eq('email', email).eq('senha', senha).maybeSingle(); if (data) { localStorage.setItem('guigo_user', data.email); localStorage.setItem('guigo_nome', data.nome); localStorage.setItem('guigo_foto', data.foto_url); setAuth(true); } else { alert("Dados incorretos."); } } else { const { error } = await supabase.from('usuarios').insert([{ email, senha, nome }]); if (!error) { alert("Conta criada com sucesso! Faça login."); setIsLogin(true); } else { alert("Erro ao criar conta: " + error.message); } } }; return (<div className="min-h-screen bg-blue-600 flex flex-col items-center justify-center p-6 text-white text-center"><GuigoAvatar size={140} /><h1 className="text-5xl font-black mt-4 mb-10 italic uppercase">GUIGO</h1><form onSubmit={handleAuth} className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl text-gray-900 space-y-4">{!isLogin && (<input type="text" placeholder="Seu Nome" className="w-full p-4 bg-gray-100 rounded-2xl outline-none" onChange={e=>setNome(e.target.value)} required />)}<input type="email" placeholder="E-mail" className="w-full p-4 bg-gray-100 rounded-2xl outline-none" onChange={e=>setEmail(e.target.value)} required /><input type="password" placeholder="Senha" className="w-full p-4 bg-gray-100 rounded-2xl outline-none" onChange={e=>setSenha(e.target.value)} required /><button className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all">{isLogin ? "Entrar" : "Criar Conta"}</button><button type="button" onClick={() => setIsLogin(!isLogin)} className="text-xs text-blue-600 font-bold mt-4 hover:underline">{isLogin ? "Não tem conta? Cadastre-se" : "Já tenho conta. Entrar"}</button></form></div>); };

export default function App() {
  const [auth, setAuth] = useState(!!localStorage.getItem('guigo_user'));
  const handleLogout = () => { localStorage.clear(); setAuth(false); };
  return (
    <Router>
      <Routes>
        <Route path="/login" element={!auth ? <Auth setAuth={setAuth} /> : <Navigate to="/carteira" />} />
        <Route path="/carteira" element={auth ? <Carteira /> : <Navigate to="/login" />} />
        <Route path="/transacoes" element={auth ? <Transacoes /> : <Navigate to="/login" />} />
        <Route path="/planejamento" element={auth ? <Planejamento /> : <Navigate to="/login" />} />
        <Route path="/splitwise" element={auth ? <Splitwise /> : <Navigate to="/login" />} />
        <Route path="/agenda" element={auth ? <Agenda /> : <Navigate to="/login" />} />
        <Route path="/perfil" element={auth ? <Perfil onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}