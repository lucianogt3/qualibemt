import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ConfiguracoesOcorrencia = () => {
    const [itens, setItens] = useState([]);
    const [setores, setSetores] = useState([]);
    const [novoItem, setNovoItem] = useState({ nome: '', categoria: 'Assistencial' });
    const [novoSetor, setNovoSetor] = useState({ nome: '' });

    // 1. Carregar dados (Certifique-se que o api.js NÃO tem /api na baseURL)
    const carregarDados = async () => {
        try {
            const [resItens, resSetores] = await Promise.all([
                api.get('/api/admin/config/itens'),
                api.get('/api/admin/setores')
            ]);
            setItens(resItens.data || []);
            setSetores(resSetores.data || []);
        } catch (err) { 
            console.error("Erro ao carregar dados", err); 
        }
    };

    useEffect(() => { carregarDados(); }, []);

    // 2. Adicionar Item - Envia 'titulo' para bater com o modelo corrigido
    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/config/itens', { 
                titulo: novoItem.nome, 
                categoria: novoItem.categoria 
            });
            setNovoItem({ nome: '', categoria: 'Assistencial' });
            carregarDados();
        } catch (err) { 
            console.error("Erro no envio:", err.response);
            alert("Erro ao adicionar título. Verifique se o Python está rodando."); 
        }
    };

    // 3. Adicionar Setor
    const handleAddSetor = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/admin/setores', { nome: novoSetor.nome });
            setNovoSetor({ nome: '' });
            carregarDados();
        } catch (err) { 
            alert("Erro ao adicionar setor"); 
        }
    };

    // 4. Alternar Status
    const handleToggle = async (tipo, id) => {
        try {
            const url = tipo === 'item' 
                ? `/api/admin/config/itens/${id}/toggle` 
                : `/api/admin/setores/${id}/toggle`;
            await api.patch(url);
            carregarDados();
        } catch (err) {
            alert("Erro ao alterar status");
        }
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl md:text-3xl font-black text-sky-900 mb-8 italic uppercase">
                ⚙️ Gestão de Tabelas Mestras
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* COLUNA DE TÍTULOS */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-sky-600">
                    <h2 className="text-xl font-bold mb-4 text-sky-800 italic">📋 Títulos de Ocorrência</h2>
                    <form onSubmit={handleAddItem} className="flex flex-col sm:flex-row gap-2 mb-6">
                        <input 
                            className="flex-1 border-2 border-gray-100 p-2 rounded-lg outline-none focus:border-sky-500 font-medium" 
                            placeholder="Ex: Queda de Paciente" 
                            value={novoItem.nome} 
                            onChange={e => setNovoItem({...novoItem, nome: e.target.value})} 
                            required 
                        />
                        <select 
                            className="border-2 border-gray-100 p-2 rounded-lg bg-white font-bold text-sky-700" 
                            value={novoItem.categoria} 
                            onChange={e => setNovoItem({...novoItem, categoria: e.target.value})}
                        >
                            <option value="Assistencial">Assistencial</option>
                            <option value="Apoio">Apoio</option>
                        </select>
                        <button type="submit" className="bg-sky-600 text-white px-5 py-2 rounded-lg font-black hover:bg-sky-700 transition shadow-md active:scale-95">
                            +
                        </button>
                    </form>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {itens.map(i => (
                            <div key={i.id} className={`flex justify-between items-center p-3 border-2 border-gray-50 rounded-xl transition-all ${!i.ativo ? 'bg-gray-100 opacity-60' : 'bg-white hover:border-sky-100 shadow-sm'}`}>
                                <div>
                                    <span className={`font-bold ${!i.ativo ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                        {i.titulo}
                                    </span>
                                    <p className="text-[10px] font-black uppercase text-sky-400 tracking-wider">{i.categoria}</p>
                                </div>
                                <button 
                                    onClick={() => handleToggle('item', i.id)}
                                    className={`p-2 rounded-lg transition-colors ${i.ativo ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                >
                                    {i.ativo ? '🚫' : '✅'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* COLUNA DE SETORES */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-green-600">
                    <h2 className="text-xl font-bold mb-4 text-green-800 italic">🏥 Setores / Unidades</h2>
                    <form onSubmit={handleAddSetor} className="flex gap-2 mb-6">
                        <input 
                            className="flex-1 border-2 border-gray-100 p-2 rounded-lg outline-none focus:border-green-500 font-medium" 
                            placeholder="Ex: UTI Adulto" 
                            value={novoSetor.nome} 
                            onChange={e => setNovoSetor({nome: e.target.value})} 
                            required 
                        />
                        <button type="submit" className="bg-green-600 text-white px-5 py-2 rounded-lg font-black hover:bg-green-700 transition shadow-md active:scale-95">
                            +
                        </button>
                    </form>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {setores.map(s => (
                            <div key={s.id} className={`flex justify-between items-center p-3 border-2 border-gray-50 rounded-xl transition-all ${!s.ativo ? 'bg-gray-100 opacity-60' : 'bg-white hover:border-green-50 shadow-sm'}`}>
                                <span className={`font-bold ${!s.ativo ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                    {s.nome}
                                </span>
                                <button 
                                    onClick={() => handleToggle('setor', s.id)}
                                    className={`p-2 rounded-lg transition-colors ${s.ativo ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}
                                >
                                    {s.ativo ? '🚫' : '✅'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfiguracoesOcorrencia;