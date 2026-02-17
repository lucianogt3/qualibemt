import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const RegistroOcorrencia = () => {
    const navigate = useNavigate();
    const [setores, setSetores] = useState([]);
    const [itensDinamicos, setItensDinamicos] = useState([]);
    const [foto, setFoto] = useState(null);
    
    const [formData, setFormData] = useState({
        origem: '',
        envolveu_paciente: '', 
        titulo_ocorrencia: '',
        unidade_notificante: '', // QUEM comunica o erro
        unidade_notificada: '',    // ONDE o erro ocorreu
        turno: '',
        gravidade: 'Leve',
        descricao: '',
        data_evento: new Date().toISOString().split('T')[0],
        nome_paciente: '',
        prontuario: '',
        data_nascimento_paciente: '',
        identificacao_notificante: ''
    });

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const [resSetores, resItens] = await Promise.all([
                    api.get('/api/admin/setores'),
                    api.get('/api/admin/config/itens')
                ]);
                setSetores(resSetores.data.filter(s => s.ativo) || []);
                setItensDinamicos(resItens.data.filter(i => i.ativo) || []);
            } catch (err) {
                console.error("Erro ao carregar dados", err);
            }
        };
        carregarDados();
    }, []);

    const itensAssistenciais = itensDinamicos.filter(i => i.categoria === 'Assistencial');
    const itensApoio = itensDinamicos.filter(i => i.categoria === 'Apoio');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        const finalData = { ...formData, envolveu_paciente: formData.envolveu_paciente === 'Sim' };
        Object.keys(finalData).forEach(key => data.append(key, finalData[key]));
        if (foto) data.append('foto', foto);

        try {
            const response = await api.post('/api/notificacoes/registrar', data);
            alert(`Registro enviado! Protocolo: ${response.data.protocolo}`);
            navigate('/');
        } catch (error) {
            alert("Erro ao enviar: " + (error.response?.data?.error || "Verifique a conexão"));
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-2xl mt-4 md:mt-10 rounded-3xl border border-gray-100 mb-20">
            <h2 className="text-2xl md:text-3xl font-black text-sky-900 mb-8 border-b-4 border-sky-500 pb-4 text-center italic uppercase">Notificação de Qualidade</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                
                {/* 1. SELEÇÃO DE ORIGEM E DATA */}
                <div className="bg-sky-50/50 p-4 md:p-6 rounded-2xl border-2 border-sky-100 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-sky-800 mb-2 uppercase tracking-widest">O que deseja registrar?</label>
                        <select required className="w-full border-2 p-3 rounded-xl focus:border-sky-500 font-bold text-sky-700 bg-white"
                            value={formData.origem}
                            onChange={e => setFormData({...formData, origem: e.target.value, envolveu_paciente: '', titulo_ocorrencia: ''})}>
                            <option value="">Selecione...</option>
                            <option value="NOT">Notificação de Incidente / Erro</option>
                            <option value="ELO">Elogio</option>
                            <option value="REC">Reclamação</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-sky-800 mb-2 uppercase tracking-widest">Data do Evento</label>
                        <input type="date" required className="w-full border-2 p-3 rounded-xl focus:border-sky-500 font-bold text-gray-600 bg-white"
                            value={formData.data_evento}
                            onChange={e => setFormData({...formData, data_evento: e.target.value})} />
                    </div>
                </div>

                {/* 2. BLOCO DE SETORES (DESTACADO) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {/* SETOR NOTIFICANTE */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-sky-600 mb-1 uppercase tracking-[0.15em] block ml-1">
                            🏢 Setor Notificante (Sua Unidade)
                        </label>
                        <select required 
                            className="w-full border-2 p-4 rounded-2xl bg-gray-50 font-bold text-gray-700 focus:border-sky-500 outline-none transition-all" 
                            value={formData.unidade_notificante}
                            onChange={e => setFormData({...formData, unidade_notificante: e.target.value})}>
                            <option value="">Quem está avisando?</option>
                            {setores.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                        </select>
                    </div>

                    {/* SETOR NOTIFICADO */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-orange-600 mb-1 uppercase tracking-[0.15em] block ml-1">
                            📍 Setor Notificado (Onde ocorreu)
                        </label>
                        <select required 
                            className="w-full border-2 p-4 rounded-2xl bg-orange-50/20 border-orange-100 font-bold text-gray-700 focus:border-orange-500 outline-none transition-all" 
                            value={formData.unidade_notificada}
                            onChange={e => setFormData({...formData, unidade_notificada: e.target.value})}>
                            <option value="">Onde aconteceu o fato?</option>
                            {setores.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                        </select>
                    </div>
                </div>

                {/* 3. LOGICA PARA NOTIFICAÇÃO (SIM/NÃO) */}
                {formData.origem === 'NOT' && (
                    <div className="bg-sky-900 p-6 rounded-2xl shadow-xl animate-in fade-in zoom-in duration-300">
                        <label className="block font-black text-white mb-4 text-center uppercase text-xs tracking-widest">A ocorrência envolveu um paciente?</label>
                        <div className="flex gap-4 justify-center">
                            <button type="button" 
                                onClick={() => setFormData({...formData, envolveu_paciente: 'Sim'})}
                                className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs transition-all ${formData.envolveu_paciente === 'Sim' ? 'bg-green-500 text-white scale-105 shadow-lg' : 'bg-sky-800 text-sky-300 hover:bg-sky-700'}`}>
                                Sim, envolveu
                            </button>
                            <button type="button" 
                                onClick={() => setFormData({...formData, envolveu_paciente: 'Não'})}
                                className={`flex-1 py-4 rounded-2xl font-black uppercase text-xs transition-all ${formData.envolveu_paciente === 'Não' ? 'bg-orange-500 text-white scale-105 shadow-lg' : 'bg-sky-800 text-sky-300 hover:bg-sky-700'}`}>
                                Não, processo/apoio
                            </button>
                        </div>
                    </div>
                )}

                {/* 4. CAMPOS DINÂMICOS */}
                {(formData.origem !== '' && (formData.origem !== 'NOT' || formData.envolveu_paciente !== '')) && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-10 duration-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-1">
                                <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest ml-1">Assunto / Título</label>
                                {formData.origem === 'NOT' ? (
                                    <select required className="w-full border-2 p-4 rounded-2xl bg-white font-bold text-sky-700 outline-none focus:border-sky-500 shadow-sm"
                                        value={formData.titulo_ocorrencia}
                                        onChange={e => setFormData({...formData, titulo_ocorrencia: e.target.value})}>
                                        <option value="">Selecione o tipo...</option>
                                        {formData.envolveu_paciente === 'Sim' 
                                            ? itensAssistenciais.map(i => <option key={i.id} value={i.titulo}>{i.titulo}</option>)
                                            : itensApoio.map(i => <option key={i.id} value={i.titulo}>{i.titulo}</option>)
                                        }
                                    </select>
                                ) : (
                                    <input type="text" placeholder="Resumo do assunto" required className="w-full border-2 p-4 rounded-2xl font-bold"
                                        value={formData.titulo_ocorrencia}
                                        onChange={e => setFormData({...formData, titulo_ocorrencia: e.target.value})} />
                                )}
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest ml-1">Turno do Evento</label>
                                <select required className="w-full border-2 p-4 rounded-2xl bg-white font-bold text-gray-700 shadow-sm" 
                                    value={formData.turno}
                                    onChange={e => setFormData({...formData, turno: e.target.value})}>
                                    <option value="">Selecione...</option>
                                    <option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Noite">Noite</option><option value="ADM">ADM</option>
                                </select>
                            </div>
                        </div>

                        {/* Dados do Paciente */}
                        {formData.envolveu_paciente === 'Sim' && (
                            <div className="p-6 border-2 border-sky-100 rounded-[2rem] bg-sky-50/20 grid grid-cols-1 md:grid-cols-3 gap-4 border-l-8 border-l-sky-500 shadow-sm">
                                <div className="md:col-span-3 font-black text-sky-800 uppercase text-[10px] tracking-[.2em] mb-2 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse"></span>
                                    Dados do Paciente
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-400 ml-1 uppercase">Nome Completo</label>
                                    <input type="text" className="w-full p-3 border-2 rounded-xl bg-white" 
                                        onChange={e => setFormData({...formData, nome_paciente: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-400 ml-1 uppercase">Prontuário</label>
                                    <input type="text" className="w-full p-3 border-2 rounded-xl bg-white" 
                                        onChange={e => setFormData({...formData, prontuario: e.target.value})} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-400 ml-1 uppercase">Data de Nascimento</label>
                                    <input type="date" className="w-full p-3 border-2 rounded-xl bg-white text-gray-500" 
                                        onChange={e => setFormData({...formData, data_nascimento_paciente: e.target.value})} />
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                             <label className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest ml-1">Descrição Detalhada do Relato</label>
                             <textarea placeholder="Relate os fatos de forma objetiva..." required
                                className="w-full border-2 p-4 rounded-2xl h-40 focus:border-sky-500 outline-none transition-all font-medium bg-gray-50 shadow-inner" 
                                onChange={e => setFormData({...formData, descricao: e.target.value})} />
                        </div>

                        <div className="bg-gray-50 p-6 md:p-8 border-4 border-dashed border-gray-100 rounded-[2.5rem] text-center hover:bg-white hover:border-sky-200 transition-all cursor-pointer group">
                            <label className="block text-gray-400 group-hover:text-sky-600 font-black mb-2 uppercase text-[10px] tracking-widest">📸 Evidência (Foto ou Documento)</label>
                            <input type="file" onChange={e => setFoto(e.target.files[0])} className="text-xs mx-auto text-gray-400" />
                        </div>

                        <button type="submit" className="w-full bg-sky-700 text-white py-6 rounded-3xl font-black text-xl hover:bg-sky-800 shadow-2xl shadow-sky-100 transition-all active:scale-95 uppercase tracking-tighter">
                            Finalizar Notificação
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default RegistroOcorrencia;