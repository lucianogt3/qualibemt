import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const Badge = ({ ativo }) => (
  <span
    className={`px-2 py-1 rounded-full text-[11px] font-black uppercase ${
      ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
    }`}
  >
    {ativo ? "Ativo" : "Inativo"}
  </span>
);

const TabButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 rounded-xl font-black uppercase text-xs tracking-widest transition ${
      active
        ? "bg-sky-700 text-white shadow"
        : "bg-white text-sky-900 border border-gray-200 hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

const ConfiguracaoItens = () => {
  const [tab, setTab] = useState("itens"); // "itens" | "setores"

  // ITENS
  const [itens, setItens] = useState([]);
  const [novoItem, setNovoItem] = useState({ nome: "", categoria: "Assistencial" });
  const [buscaItens, setBuscaItens] = useState("");

  // SETORES
  const [setores, setSetores] = useState([]);
  const [novoSetor, setNovoSetor] = useState({ nome: "" });
  const [buscaSetores, setBuscaSetores] = useState("");

  const [loading, setLoading] = useState(true);

  // ========= LOADERS =========
  const carregarItens = async () => {
    const res = await api.get("/api/config/itens");
    setItens(res.data || []);
  };

  const carregarSetores = async () => {
    // ✅ ajuste aqui se sua rota for diferente
    const res = await api.get("/api/admin/setores");
    setSetores(res.data || []);
  };

  const carregarTudo = async () => {
    try {
      setLoading(true);
      await Promise.all([carregarItens(), carregarSetores()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTudo();
  }, []);

  // ========= FILTROS =========
  const itensFiltrados = useMemo(() => {
    const q = (buscaItens || "").trim().toLowerCase();
    if (!q) return itens;
    return itens.filter((i) => `${i.nome} ${i.categoria}`.toLowerCase().includes(q));
  }, [itens, buscaItens]);

  const setoresFiltrados = useMemo(() => {
    const q = (buscaSetores || "").trim().toLowerCase();
    if (!q) return setores;
    return setores.filter((s) => (s.nome || "").toLowerCase().includes(q));
  }, [setores, buscaSetores]);

  // ========= AÇÕES ITENS =========
  const handleSubmitItem = async (e) => {
    e.preventDefault();
    if (!novoItem.nome.trim()) return alert("Informe o nome do item.");

    await api.post("/api/config/itens", {
      nome: novoItem.nome.trim(),
      categoria: novoItem.categoria,
    });

    setNovoItem((prev) => ({ ...prev, nome: "" }));
    carregarItens();
  };

  const toggleItem = async (id) => {
    // ✅ ajuste aqui se sua rota for diferente
    await api.patch(`/api/config/itens/${id}/toggle`);
    carregarItens();
  };

  // ========= AÇÕES SETORES =========
  const handleSubmitSetor = async (e) => {
    e.preventDefault();
    if (!novoSetor.nome.trim()) return alert("Informe o nome do setor.");

    // ✅ ajuste aqui se sua rota for diferente
    await api.post("/api/admin/setores", { nome: novoSetor.nome.trim() });

    setNovoSetor({ nome: "" });
    carregarSetores();
  };

  const toggleSetor = async (id) => {
    // ✅ ajuste aqui se sua rota for diferente
    await api.patch(`/api/admin/setores/${id}/toggle`);
    carregarSetores();
  };

  if (loading) {
    return (
      <div className="p-20 text-center font-black text-sky-900 animate-pulse uppercase tracking-widest">
        Carregando configurações...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-sky-900 p-6 text-white">
            <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase">
              Configurações do Sistema
            </h2>
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-2">
              Itens do formulário • Setores • Organização do fluxo
            </p>
          </div>

          {/* TABS */}
          <div className="p-4 md:p-6 flex gap-2 flex-wrap bg-white border-b border-gray-100">
            <TabButton active={tab === "itens"} onClick={() => setTab("itens")}>
              Itens do formulário
            </TabButton>
            <TabButton active={tab === "setores"} onClick={() => setTab("setores")}>
              Setores do hospital
            </TabButton>
          </div>

          {/* CONTEÚDO */}
          <div className="p-4 md:p-6">
            {tab === "itens" ? (
              <>
                {/* CARD CADASTRO ITENS */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="text-xl font-black text-sky-900 uppercase italic">
                        Itens do Formulário
                      </h3>
                      <p className="text-xs text-gray-500 font-bold mt-1">
                        Ex.: Queda, Erro de Medicação, Falha de Comunicação...
                      </p>
                    </div>

                    <div className="w-full md:w-auto">
                      <input
                        className="w-full md:w-80 border-2 border-gray-100 p-3 rounded-2xl outline-none font-bold"
                        placeholder="Buscar item..."
                        value={buscaItens}
                        onChange={(e) => setBuscaItens(e.target.value)}
                      />
                    </div>
                  </div>

                  <form
                    onSubmit={handleSubmitItem}
                    className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3"
                  >
                    <input
                      className="md:col-span-7 border-2 border-gray-100 p-3 rounded-2xl outline-none font-bold"
                      placeholder="Nome do Item (Ex: Queda)"
                      value={novoItem.nome}
                      onChange={(e) => setNovoItem({ ...novoItem, nome: e.target.value })}
                    />

                    <select
                      className="md:col-span-3 border-2 border-gray-100 p-3 rounded-2xl bg-white font-black text-sky-900"
                      value={novoItem.categoria}
                      onChange={(e) =>
                        setNovoItem({ ...novoItem, categoria: e.target.value })
                      }
                    >
                      <option value="Assistencial">Assistencial (Paciente)</option>
                      <option value="Apoio">Apoio (Infra/ADM)</option>
                    </select>

                    <button className="md:col-span-2 bg-sky-700 hover:bg-sky-800 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">
                      Adicionar
                    </button>
                  </form>
                </div>

                {/* LISTA ITENS */}
                <div className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 md:p-6 flex items-center justify-between flex-wrap gap-2">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                      {itensFiltrados.length} itens
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr className="text-xs uppercase text-gray-400">
                          <th className="p-4">Item</th>
                          <th className="p-4">Categoria</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itensFiltrados.map((item) => (
                          <tr key={item.id} className="border-t hover:bg-gray-50 transition">
                            <td className="p-4 font-bold text-sky-900">{item.nome}</td>
                            <td className="p-4 text-xs font-black uppercase text-sky-600">
                              {item.categoria}
                            </td>
                            <td className="p-4">
                              <Badge ativo={item.ativo !== false} />
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => toggleItem(item.id)}
                                className="px-3 py-2 rounded-xl text-xs font-black uppercase bg-gray-100 hover:bg-gray-200 transition"
                              >
                                {item.ativo !== false ? "Inativar" : "Ativar"}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {itensFiltrados.length === 0 && (
                          <tr>
                            <td className="p-6 text-center text-gray-400 font-bold" colSpan={4}>
                              Nenhum item encontrado.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* CARD CADASTRO SETORES */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="text-xl font-black text-sky-900 uppercase italic">
                        Setores do Hospital
                      </h3>
                      <p className="text-xs text-gray-500 font-bold mt-1">
                        Ex.: UTI, Centro Cirúrgico, Hotelaria, Farmácia...
                      </p>
                    </div>

                    <div className="w-full md:w-auto">
                      <input
                        className="w-full md:w-80 border-2 border-gray-100 p-3 rounded-2xl outline-none font-bold"
                        placeholder="Buscar setor..."
                        value={buscaSetores}
                        onChange={(e) => setBuscaSetores(e.target.value)}
                      />
                    </div>
                  </div>

                  <form
                    onSubmit={handleSubmitSetor}
                    className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-3"
                  >
                    <input
                      className="md:col-span-10 border-2 border-gray-100 p-3 rounded-2xl outline-none font-bold"
                      placeholder="Nome do Setor (Ex: UTI Adulto)"
                      value={novoSetor.nome}
                      onChange={(e) => setNovoSetor({ nome: e.target.value })}
                    />

                    <button className="md:col-span-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">
                      Adicionar
                    </button>
                  </form>
                </div>

                {/* LISTA SETORES */}
                <div className="mt-6 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 md:p-6 flex items-center justify-between flex-wrap gap-2">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">
                      {setoresFiltrados.length} setores
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr className="text-xs uppercase text-gray-400">
                          <th className="p-4">Setor</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-center">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {setoresFiltrados.map((s) => (
                          <tr key={s.id} className="border-t hover:bg-gray-50 transition">
                            <td className="p-4 font-bold text-sky-900">{s.nome}</td>
                            <td className="p-4">
                              <Badge ativo={s.ativo !== false} />
                            </td>
                            <td className="p-4 text-center">
                              <button
                                onClick={() => toggleSetor(s.id)}
                                className="px-3 py-2 rounded-xl text-xs font-black uppercase bg-gray-100 hover:bg-gray-200 transition"
                              >
                                {s.ativo !== false ? "Inativar" : "Ativar"}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {setoresFiltrados.length === 0 && (
                          <tr>
                            <td className="p-6 text-center text-gray-400 font-bold" colSpan={3}>
                              Nenhum setor encontrado.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracaoItens;
