// App.jsx - Código completo CORRIGIDO para atender TODOS os requisitos
import React, { useState, useEffect, useMemo } from "react";
import "./App.css";

function App() {
  const [schedule, setSchedule] = useState([]);
  const [newActivity, setNewActivity] = useState({
    nome: "",
    categoria: "talk",
    vagas: "30", // ✅ Alterado: agora é string para select com 10/30/50
    dataEvento: "",
    horaEvento: "",
  });
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [termoBusca, setTermoBusca] = useState("");
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const [mostrarModalLimpeza, setMostrarModalLimpeza] = useState(false);
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const categorias = {
    talk: { nome: "🎤 Palestra", cor: "#e91e63", icone: "🎤" },
    workshop: { nome: "🔧 Workshop", cor: "#ff9800", icone: "🔧" },
    painel: { nome: "👥 Painel", cor: "#4caf50", icone: "👥" },
  };

  useEffect(() => {
    try {
      const dadosSalvos = localStorage.getItem("@eventpulse_data_v2");
      if (dadosSalvos) {
        const eventosParseados = JSON.parse(dadosSalvos);
        const eventosMigrados = eventosParseados.map((evento) => ({
          ...evento,
          dataEvento: evento.dataEvento || "",
          horaEvento: evento.horaEvento || "",
          vagas: evento.vagas || 30,
          vagasRestantes:
            evento.vagasRestantes !== undefined
              ? evento.vagasRestantes
              : evento.vagas || 30,
        }));
        setSchedule(eventosMigrados);
      }
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!carregando) {
      localStorage.setItem("@eventpulse_data_v2", JSON.stringify(schedule));
    }
  }, [schedule, carregando]);

  const adicionarAtividade = (e) => {
    e.preventDefault();
    if (!newActivity.nome.trim()) return;
    if (!newActivity.dataEvento) {
      alert("⚠️ Por favor, selecione a data do evento!");
      return;
    }
    if (!newActivity.horaEvento) {
      alert("⚠️ Por favor, selecione a hora do evento!");
      return;
    }

    const vagasNum = parseInt(newActivity.vagas);

    const atividade = {
      id: crypto.randomUUID(),
      titulo: newActivity.nome,
      tipo: newActivity.categoria,
      status: "agendado",
      criadoEm: new Date().toLocaleString("pt-BR"),
      dataEvento: newActivity.dataEvento,
      horaEvento: newActivity.horaEvento,
      vagas: vagasNum, // ✅ vagas totais
      vagasRestantes: vagasNum, // ✅ vagas que ainda estão disponíveis
      participantes: 0, // ✅ opcional: contagem de inscritos
      destaque: newActivity.categoria === "workshop",
    };

    setSchedule([atividade, ...schedule]);
    setNewActivity({
      nome: "",
      categoria: "talk",
      vagas: "30",
      dataEvento: "",
      horaEvento: "",
    });
  };

  const avancarStatus = (id) => {
    setSchedule(
      schedule.map((item) => {
        if (item.id !== id) return item;
        const fluxo = {
          agendado: "andamento",
          andamento: "finalizado",
          finalizado: "agendado",
        };
        return { ...item, status: fluxo[item.status] };
      }),
    );
  };

  const removerAtividade = (id) => {
    setSchedule(schedule.filter((item) => item.id !== id));
  };

  // ✅ FUNÇÃO INSCREVER ALUNO - diminui vagasRestantes
  const inscreverAluno = (id) => {
    setSchedule(
      schedule.map((item) => {
        if (item.id === id && item.vagasRestantes > 0) {
          return {
            ...item,
            vagasRestantes: item.vagasRestantes - 1,
            participantes: item.participantes + 1,
          };
        }
        return item;
      }),
    );
  };

  const abrirModalEdicao = (evento) => {
    setEventoEditando({ ...evento });
    setMostrarModalEdicao(true);
  };

  const salvarEdicao = () => {
    setSchedule(
      schedule.map((item) =>
        item.id === eventoEditando.id ? eventoEditando : item,
      ),
    );
    setMostrarModalEdicao(false);
    setEventoEditando(null);
  };

  const atualizarCampoEditado = (campo, valor) => {
    setEventoEditando((prev) => ({ ...prev, [campo]: valor }));
  };

  // ✅ ALERTA PREVENTIVO DE LIMPEZA - window.confirm nativo
  const limparCronograma = () => {
    const confirmar = window.confirm(
      "⚠️ ATENÇÃO! Você está prestes a LIMPAR TODO O CRONOGRAMA.\n\n" +
        "Todos os eventos serão removidos permanentemente.\n" +
        "Esta ação NÃO pode ser desfeita.\n\n" +
        "Tem certeza que deseja continuar?",
    );

    if (confirmar) {
      setSchedule([]);
    }
  };

  const eventosProcessados = useMemo(() => {
    let resultado = [...schedule];

    if (filtroStatus !== "todos") {
      resultado = resultado.filter((item) => item.status === filtroStatus);
    }

    // ✅ FILTRO POR CAIXA DE PESQUISA - em tempo real
    if (termoBusca.trim()) {
      resultado = resultado.filter((item) =>
        item.titulo.toLowerCase().includes(termoBusca.toLowerCase()),
      );
    }

    // ✅ DESTAQUE CRONOLÓGICO DE WORKSHOPS - Workshops sempre no topo
    return resultado.sort((a, b) => {
      if (a.tipo === "workshop" && b.tipo !== "workshop") return -1;
      if (a.tipo !== "workshop" && b.tipo === "workshop") return 1;
      const dataA = new Date(`${a.dataEvento}T${a.horaEvento || "00:00"}`);
      const dataB = new Date(`${b.dataEvento}T${b.horaEvento || "00:00"}`);
      return dataB - dataA;
    });
  }, [schedule, filtroStatus, termoBusca]);

  const estatisticas = {
    total: schedule.length,
    workshops: schedule.filter((i) => i.tipo === "workshop").length,
    lotados: schedule.filter((i) => i.vagasRestantes === 0).length,
    andamento: schedule.filter((i) => i.status === "andamento").length,
  };

  const statusOptions = [
    { value: "agendado", label: "⏰ Agendado" },
    { value: "andamento", label: "🔄 Em Andamento" },
    { value: "finalizado", label: "✅ Finalizado" },
  ];

  const formatarDataEvento = (data, hora) => {
    if (!data) return "Data não definida";
    const partes = data.split("-");
    const dataFormatada = `${partes[2]}/${partes[1]}/${partes[0]}`;
    return hora ? `${dataFormatada} • ${hora}h` : dataFormatada;
  };

  if (carregando) {
    return <div className="skeleton-screen">⏳ Carregando eventos...</div>;
  }

  return (
    <div className="app-container">
      <div className="mega-header">
        <div className="logo-area">
          <div className="logo-icon">⚡</div>
          <div>
            <h1>EventPulse</h1>
            <p className="subtitle">Gestão de Eventos Acadêmicos</p>
          </div>
        </div>

        <div className="stats-mini">
          <div className="stat-mini">
            <span className="stat-num">{estatisticas.total}</span>
            <span>Eventos</span>
          </div>
          <div className="stat-mini">
            <span className="stat-num">{estatisticas.workshops}</span>
            <span>Workshops</span>
          </div>
          <div className="stat-mini">
            <span className="stat-num">{estatisticas.andamento}</span>
            <span>Ativos</span>
          </div>
        </div>

        {/* ✅ BOTÃO LIMPAR CRONOGRAMA */}
        <button onClick={limparCronograma} className="clean-all-btn">
          🧨 Limpar Cronograma
        </button>
      </div>

      <div className="form-card">
        <form onSubmit={adicionarAtividade}>
          <div className="form-group">
            <input
              type="text"
              value={newActivity.nome}
              onChange={(e) =>
                setNewActivity({ ...newActivity, nome: e.target.value })
              }
              placeholder="Digite o nome da atividade..."
              className="input-moderno"
            />

            <select
              value={newActivity.categoria}
              onChange={(e) =>
                setNewActivity({ ...newActivity, categoria: e.target.value })
              }
              className="select-estilizado"
            >
              {Object.entries(categorias).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.icone} {val.nome}
                </option>
              ))}
            </select>

            {/* ✅ SELECT COM 10, 30 OU 50 VAGAS */}
            <select
              value={newActivity.vagas}
              onChange={(e) =>
                setNewActivity({ ...newActivity, vagas: e.target.value })
              }
              className="select-estilizado"
            >
              <option value="10">🎟️ 10 vagas</option>
              <option value="30">🎟️ 30 vagas</option>
              <option value="50">🎟️ 50 vagas</option>
            </select>
          </div>

          <div className="datetime-row">
            <div className="datetime-wrapper data-wrapper">
              <span className="datetime-icon">📅</span>
              <input
                type="date"
                value={newActivity.dataEvento}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, dataEvento: e.target.value })
                }
                className="datetime-input"
              />
            </div>
            <div className="datetime-wrapper hora-wrapper">
              <span className="datetime-icon">⏰</span>
              <input
                type="time"
                value={newActivity.horaEvento}
                onChange={(e) =>
                  setNewActivity({ ...newActivity, horaEvento: e.target.value })
                }
                className="datetime-input"
              />
            </div>
            <button type="submit" className="btn-criar">
              + Criar Evento
            </button>
          </div>
        </form>
      </div>

      {/* ✅ FILTRO POR CAIXA DE PESQUISA */}
      <div className="control-bar">
        <div className="filter-group">
          <button
            onClick={() => setFiltroStatus("todos")}
            className={`filter-pill ${filtroStatus === "todos" ? "active" : ""}`}
          >
            📅 Todos
          </button>
          <button
            onClick={() => setFiltroStatus("agendado")}
            className={`filter-pill ${filtroStatus === "agendado" ? "active" : ""}`}
          >
            ⏰ Agendados
          </button>
          <button
            onClick={() => setFiltroStatus("andamento")}
            className={`filter-pill ${filtroStatus === "andamento" ? "active" : ""}`}
          >
            🔄 Em Andamento
          </button>
          <button
            onClick={() => setFiltroStatus("finalizado")}
            className={`filter-pill ${filtroStatus === "finalizado" ? "active" : ""}`}
          >
            ✅ Finalizados
          </button>
        </div>

        <div className="search-area">
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="🔎 Buscar por título..."
            className="search-input-moderno"
          />
          {termoBusca && (
            <button onClick={() => setTermoBusca("")} className="clear-search">
              ✖
            </button>
          )}
        </div>
      </div>

      <div className="events-timeline">
        {eventosProcessados.length === 0 ? (
          <div className="empty-state-custom">
            <div className="empty-emoji">📭</div>
            <h3>Nenhum evento encontrado</h3>
            <p>Crie seu primeiro evento acima!</p>
          </div>
        ) : (
          eventosProcessados.map((evento) => (
            <div
              key={evento.id}
              className={`event-card-v2 ${evento.tipo} ${evento.status}`}
              style={{ "--card-color": categorias[evento.tipo]?.cor }}
            >
              <div className="card-header">
                <div className="card-tipo">
                  {categorias[evento.tipo]?.icone}{" "}
                  {categorias[evento.tipo]?.nome}
                </div>
                {evento.destaque && (
                  <div className="badge-destaque">⭐ Destaque (Workshop)</div>
                )}
              </div>

              <h3 className="card-title">{evento.titulo}</h3>

              <div className="card-info">
                <div className="info-row">
                  <span>📊 Status:</span>
                  <strong>
                    {evento.status === "agendado" && "⏰ Agendado"}
                    {evento.status === "andamento" && "🔄 Em Andamento"}
                    {evento.status === "finalizado" && "✅ Finalizado"}
                  </strong>
                </div>
                <div className="info-row">
                  <span>📅 Quando:</span>
                  <strong>
                    {formatarDataEvento(evento.dataEvento, evento.horaEvento)}
                  </strong>
                </div>
                <div className="info-row">
                  <span>🎟️ Vagas:</span>
                  <strong
                    className={
                      evento.vagasRestantes === 0 ? "esgotado-text" : ""
                    }
                  >
                    {evento.vagasRestantes} / {evento.vagas}
                  </strong>
                </div>
              </div>

              {/* Barra de progresso das vagas */}
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${((evento.vagas - evento.vagasRestantes) / evento.vagas) * 100}%`,
                  }}
                />
              </div>

              <div className="card-actions">
                <button
                  onClick={() => avancarStatus(evento.id)}
                  className="action-btn status"
                >
                  {evento.status === "agendado" && "🎬 Iniciar"}
                  {evento.status === "andamento" && "🏁 Encerrar"}
                  {evento.status === "finalizado" && "🔄 Reabrir"}
                </button>

                {/* ✅ BOTÃO INSCREVER ALUNO */}
                <button
                  onClick={() => inscreverAluno(evento.id)}
                  disabled={evento.vagasRestantes === 0}
                  className={`action-btn enroll ${evento.vagasRestantes === 0 ? "disabled" : ""}`}
                >
                  {evento.vagasRestantes === 0
                    ? "❌ Esgotado"
                    : "📝 Inscrever Aluno"}
                </button>

                <button
                  onClick={() => abrirModalEdicao(evento)}
                  className="action-btn edit"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => removerAtividade(evento.id)}
                  className="action-btn delete"
                >
                  🗑️ Remover
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✅ BOTÃO REDONDO NO CANTO INFERIOR DIREITO */}
      <button className="float-info-btn" onClick={() => setMostrarInfo(true)}>
        🎨
      </button>

      {/* ✅ MODAL LISTANDO TODAS AS ALTERAÇÕES */}
      {mostrarInfo && (
        <div className="modal-overlay" onClick={() => setMostrarInfo(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✨ Features Implementadas</h2>
              <button
                className="modal-close"
                onClick={() => setMostrarInfo(false)}
              >
                ✖
              </button>
            </div>
            <div className="modal-body">
              <ul className="inovacoes-list">
                <li>
                  🏆 <strong>1. Destaque Cronológico de Workshops</strong> -
                  Workshops sempre aparecem no topo da lista
                </li>
                <li>
                  🔍 <strong>2. Filtro por Caixa de Pesquisa</strong> - Busca em
                  tempo real por título do evento
                </li>
                <li>
                  🎟️ <strong>3. Vagas Disponíveis</strong> - Opções de 10, 30 ou
                  50 vagas com botão "Inscrever Aluno"
                </li>
                <li>
                  ⚠️ <strong>4. Alerta Preventivo de Limpeza</strong> -
                  window.confirm antes de apagar todos os dados
                </li>
                <li>
                  🎨 <strong>5. Estilizações Marcantes</strong> - Cards com
                  gradientes, animações, barras de progresso, modal
                  personalizado
                </li>
                <li>
                  ✏️ <strong>Extra: Edição Completa</strong> - Edite todos os
                  campos do evento a qualquer momento
                </li>
                <li>
                  📅 <strong>Extra: Data e Hora</strong> - Defina quando o
                  evento vai acontecer
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {mostrarModalEdicao && eventoEditando && (
        <div
          className="modal-overlay"
          onClick={() => setMostrarModalEdicao(false)}
        >
          <div className="modal-edicao" onClick={(e) => e.stopPropagation()}>
            <div className="modal-edicao-header">
              <h2>✏️ Editar Evento</h2>
              <button
                className="modal-close"
                onClick={() => setMostrarModalEdicao(false)}
              >
                ✖
              </button>
            </div>
            <div className="modal-edicao-body">
              <div className="campo-edicao">
                <label>📌 Título</label>
                <input
                  type="text"
                  value={eventoEditando.titulo}
                  onChange={(e) =>
                    atualizarCampoEditado("titulo", e.target.value)
                  }
                  className="input-edicao"
                />
              </div>
              <div className="campo-edicao">
                <label>🎭 Tipo</label>
                <select
                  value={eventoEditando.tipo}
                  onChange={(e) =>
                    atualizarCampoEditado("tipo", e.target.value)
                  }
                  className="select-edicao"
                >
                  {Object.entries(categorias).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.icone} {val.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="campo-edicao">
                <label>📅 Data do Evento</label>
                <input
                  type="date"
                  value={eventoEditando.dataEvento || ""}
                  onChange={(e) =>
                    atualizarCampoEditado("dataEvento", e.target.value)
                  }
                  className="input-edicao"
                />
              </div>
              <div className="campo-edicao">
                <label>⏰ Hora do Evento</label>
                <input
                  type="time"
                  value={eventoEditando.horaEvento || ""}
                  onChange={(e) =>
                    atualizarCampoEditado("horaEvento", e.target.value)
                  }
                  className="input-edicao"
                />
              </div>
              <div className="campo-edicao">
                <label>📊 Status</label>
                <select
                  value={eventoEditando.status}
                  onChange={(e) =>
                    atualizarCampoEditado("status", e.target.value)
                  }
                  className="select-edicao"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="campo-edicao">
                <label>🎟️ Vagas Totais</label>
                <select
                  value={eventoEditando.vagas}
                  onChange={(e) => {
                    const novoValor = parseInt(e.target.value);
                    atualizarCampoEditado("vagas", novoValor);
                    if (eventoEditando.vagasRestantes > novoValor)
                      atualizarCampoEditado("vagasRestantes", novoValor);
                  }}
                  className="select-edicao"
                >
                  <option value="10">10 vagas</option>
                  <option value="30">30 vagas</option>
                  <option value="50">50 vagas</option>
                </select>
              </div>
              <div className="campo-edicao">
                <label>👥 Vagas Restantes</label>
                <input
                  type="number"
                  value={eventoEditando.vagasRestantes}
                  onChange={(e) => {
                    const valor = parseInt(e.target.value) || 0;
                    if (valor <= eventoEditando.vagas && valor >= 0)
                      atualizarCampoEditado("vagasRestantes", valor);
                  }}
                  className="input-edicao"
                  min="0"
                  max={eventoEditando.vagas}
                />
              </div>
            </div>
            <div className="modal-edicao-footer">
              <button
                onClick={() => setMostrarModalEdicao(false)}
                className="btn-cancelar-edicao"
              >
                Cancelar
              </button>
              <button onClick={salvarEdicao} className="btn-salvar-edicao">
                💾 Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
