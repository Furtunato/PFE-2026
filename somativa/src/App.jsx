// App.jsx - Código completo com input de participantes livre
import React, { useState, useEffect, useMemo } from 'react';
import './App.css';

function App() {
  // Estado com estrutura completamente diferente
  const [schedule, setSchedule] = useState([]);
  const [newActivity, setNewActivity] = useState({
    nome: '',
    categoria: 'talk',
    capacidade: 30,
    dataEvento: '',
    horaEvento: ''
  });
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [termoBusca, setTermoBusca] = useState('');
  const [mostrarInfo, setMostrarInfo] = useState(false);
  const [mostrarModalLimpeza, setMostrarModalLimpeza] = useState(false);
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [carregando, setCarregando] = useState(true);

  // Categorias e suas configurações
  const categorias = {
    talk: { nome: '🎤 Palestra', cor: '#e91e63', icone: '🎤' },
    workshop: { nome: '🔧 Workshop', cor: '#ff9800', icone: '🔧' },
    painel: { nome: '👥 Painel', cor: '#4caf50', icone: '👥' }
  };

  // Carregar dados
  useEffect(() => {
    try {
      const dadosSalvos = localStorage.getItem('@eventpulse_data_v2');
      if (dadosSalvos) {
        const eventosParseados = JSON.parse(dadosSalvos);
        const eventosMigrados = eventosParseados.map(evento => ({
          ...evento,
          dataEvento: evento.dataEvento || '',
          horaEvento: evento.horaEvento || '',
          capacidadeMax: evento.capacidadeMax || 30
        }));
        setSchedule(eventosMigrados);
      }
    } catch (err) {
      console.error('Erro ao carregar:', err);
    } finally {
      setCarregando(false);
    }
  }, []);

  // Salvar mudanças
  useEffect(() => {
    if (!carregando) {
      localStorage.setItem('@eventpulse_data_v2', JSON.stringify(schedule));
    }
  }, [schedule, carregando]);

  const adicionarAtividade = (e) => {
    e.preventDefault();
    if (!newActivity.nome.trim()) return;
    if (!newActivity.dataEvento) {
      alert('⚠️ Por favor, selecione a data do evento!');
      return;
    }
    if (!newActivity.horaEvento) {
      alert('⚠️ Por favor, selecione a hora do evento!');
      return;
    }
    if (newActivity.capacidade < 1) {
      alert('⚠️ A capacidade deve ser no mínimo 1 participante!');
      return;
    }

    const atividade = {
      id: crypto.randomUUID(),
      titulo: newActivity.nome,
      tipo: newActivity.categoria,
      status: 'agendado',
      criadoEm: new Date().toLocaleString('pt-BR'),
      dataEvento: newActivity.dataEvento,
      horaEvento: newActivity.horaEvento,
      capacidadeMax: parseInt(newActivity.capacidade),
      participantes: 0,
      destaque: newActivity.categoria === 'workshop'
    };

    setSchedule([atividade, ...schedule]);
    setNewActivity({ 
      nome: '', 
      categoria: 'talk', 
      capacidade: 30,
      dataEvento: '',
      horaEvento: ''
    });
  };

  const avancarStatus = (id) => {
    setSchedule(schedule.map(item => {
      if (item.id !== id) return item;
      
      const fluxo = {
        'agendado': 'andamento',
        'andamento': 'finalizado',
        'finalizado': 'agendado'
      };
      
      return { ...item, status: fluxo[item.status] };
    }));
  };

  const removerAtividade = (id) => {
    setSchedule(schedule.filter(item => item.id !== id));
  };

  const registrarParticipante = (id) => {
    setSchedule(schedule.map(item => {
      if (item.id === id && item.participantes < item.capacidadeMax) {
        return { ...item, participantes: item.participantes + 1 };
      }
      return item;
    }));
  };

  // Abrir modal de edição
  const abrirModalEdicao = (evento) => {
    setEventoEditando({ ...evento });
    setMostrarModalEdicao(true);
  };

  // Salvar edição do evento
  const salvarEdicao = () => {
    setSchedule(schedule.map(item => 
      item.id === eventoEditando.id ? eventoEditando : item
    ));
    setMostrarModalEdicao(false);
    setEventoEditando(null);
  };

  // Atualizar campo do evento sendo editado
  const atualizarCampoEditado = (campo, valor) => {
    setEventoEditando(prev => ({ ...prev, [campo]: valor }));
  };

  // Função que abre o modal personalizado
  const abrirModalLimpeza = () => {
    setMostrarModalLimpeza(true);
  };

  // Função que confirma a limpeza
  const confirmarLimpeza = () => {
    setSchedule([]);
    setMostrarModalLimpeza(false);
  };

  // Função que cancela a limpeza
  const cancelarLimpeza = () => {
    setMostrarModalLimpeza(false);
  };

  // Processamento de eventos com regras especiais
  const eventosProcessados = useMemo(() => {
    let resultado = [...schedule];
    
    if (filtroStatus !== 'todos') {
      resultado = resultado.filter(item => item.status === filtroStatus);
    }
    
    if (termoBusca.trim()) {
      resultado = resultado.filter(item =>
        item.titulo.toLowerCase().includes(termoBusca.toLowerCase())
      );
    }
    
    return resultado.sort((a, b) => {
      if (a.tipo === 'workshop' && b.tipo !== 'workshop') return -1;
      if (a.tipo !== 'workshop' && b.tipo === 'workshop') return 1;
      const dataA = new Date(`${a.dataEvento}T${a.horaEvento || '00:00'}`);
      const dataB = new Date(`${b.dataEvento}T${b.horaEvento || '00:00'}`);
      return dataB - dataA;
    });
  }, [schedule, filtroStatus, termoBusca]);

  const estatisticas = {
    total: schedule.length,
    workshops: schedule.filter(i => i.tipo === 'workshop').length,
    lotados: schedule.filter(i => i.participantes >= i.capacidadeMax).length,
    andamento: schedule.filter(i => i.status === 'andamento').length
  };

  const statusOptions = [
    { value: 'agendado', label: '⏰ Agendado' },
    { value: 'andamento', label: '🔄 Em Andamento' },
    { value: 'finalizado', label: '✅ Finalizado' }
  ];

  const formatarDataEvento = (data, hora) => {
    if (!data) return 'Data não definida';
    const partes = data.split('-');
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
            <p className="subtitle">Sua central acadêmica</p>
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
        
        <button onClick={abrirModalLimpeza} className="clean-all-btn">
          🧨 Limpar Tudo
        </button>
      </div>

      {/* Formulário com campos bonitos */}
      <div className="form-card">
        <form onSubmit={adicionarAtividade}>
          <div className="form-group">
            <input
              type="text"
              value={newActivity.nome}
              onChange={(e) => setNewActivity({ ...newActivity, nome: e.target.value })}
              placeholder="Digite o nome da atividade..."
              className="input-moderno"
            />
            
            <select 
              value={newActivity.categoria}
              onChange={(e) => setNewActivity({ ...newActivity, categoria: e.target.value })}
              className="select-estilizado"
            >
              {Object.entries(categorias).map(([key, val]) => (
                <option key={key} value={key}>{val.icone} {val.nome}</option>
              ))}
            </select>
            
            <div className="capacidade-wrapper">
              <span className="capacidade-icon">🎟️</span>
              <input
                type="number"
                value={newActivity.capacidade}
                onChange={(e) => setNewActivity({ ...newActivity, capacidade: Math.max(1, parseInt(e.target.value) || 1) })}
                className="input-capacidade"
                placeholder="Capacidade"
                min="1"
                step="1"
              />
            </div>
          </div>
          
          <div className="datetime-row">
            <div className="datetime-wrapper data-wrapper">
              <span className="datetime-icon">📅</span>
              <input
                type="date"
                value={newActivity.dataEvento}
                onChange={(e) => setNewActivity({ ...newActivity, dataEvento: e.target.value })}
                className="datetime-input"
                placeholder="Data"
              />
            </div>
            <div className="datetime-wrapper hora-wrapper">
              <span className="datetime-icon">⏰</span>
              <input
                type="time"
                value={newActivity.horaEvento}
                onChange={(e) => setNewActivity({ ...newActivity, horaEvento: e.target.value })}
                className="datetime-input"
                placeholder="Hora"
              />
            </div>
            <button type="submit" className="btn-criar">
              + Criar Evento
            </button>
          </div>
        </form>
      </div>

      <div className="control-bar">
        <div className="filter-group">
          <button onClick={() => setFiltroStatus('todos')} className={`filter-pill ${filtroStatus === 'todos' ? 'active' : ''}`}>📅 Todos</button>
          <button onClick={() => setFiltroStatus('agendado')} className={`filter-pill ${filtroStatus === 'agendado' ? 'active' : ''}`}>⏰ Agendados</button>
          <button onClick={() => setFiltroStatus('andamento')} className={`filter-pill ${filtroStatus === 'andamento' ? 'active' : ''}`}>🔄 Em Andamento</button>
          <button onClick={() => setFiltroStatus('finalizado')} className={`filter-pill ${filtroStatus === 'finalizado' ? 'active' : ''}`}>✅ Finalizados</button>
        </div>
        
        <div className="search-area">
          <input type="text" value={termoBusca} onChange={(e) => setTermoBusca(e.target.value)} placeholder="🔎 Buscar por título..." className="search-input-moderno" />
          {termoBusca && <button onClick={() => setTermoBusca('')} className="clear-search">✖</button>}
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
          eventosProcessados.map(evento => (
            <div key={evento.id} className={`event-card-v2 ${evento.tipo} ${evento.status}`} style={{ '--card-color': categorias[evento.tipo]?.cor }}>
              <div className="card-header">
                <div className="card-tipo">{categorias[evento.tipo]?.icone} {categorias[evento.tipo]?.nome}</div>
                {evento.destaque && <div className="badge-destaque">⭐ Destaque</div>}
              </div>
              
              <h3 className="card-title">{evento.titulo}</h3>
              
              <div className="card-info">
                <div className="info-row">
                  <span>📊 Status:</span>
                  <strong>{evento.status === 'agendado' && '⏰ Agendado'}{evento.status === 'andamento' && '🔄 Em Andamento'}{evento.status === 'finalizado' && '✅ Finalizado'}</strong>
                </div>
                <div className="info-row">
                  <span>📅 Quando:</span>
                  <strong>{formatarDataEvento(evento.dataEvento, evento.horaEvento)}</strong>
                </div>
                <div className="info-row">
                  <span>👥 Participantes:</span>
                  <strong>{evento.participantes} / {evento.capacidadeMax}</strong>
                </div>
              </div>
              
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${(evento.participantes / evento.capacidadeMax) * 100}%` }} />
              </div>
              
              <div className="card-actions">
                <button onClick={() => avancarStatus(evento.id)} className="action-btn status">
                  {evento.status === 'agendado' && '🎬 Iniciar'}
                  {evento.status === 'andamento' && '🏁 Encerrar'}
                  {evento.status === 'finalizado' && '🔄 Reabrir'}
                </button>
                <button onClick={() => registrarParticipante(evento.id)} disabled={evento.participantes >= evento.capacidadeMax} className={`action-btn enroll ${evento.participantes >= evento.capacidadeMax ? 'disabled' : ''}`}>
                  {evento.participantes >= evento.capacidadeMax ? '🔒 Lotado' : '🎟️ Marcar Presença'}
                </button>
                <button onClick={() => abrirModalEdicao(evento)} className="action-btn edit">✏️ Editar</button>
                <button onClick={() => removerAtividade(evento.id)} className="action-btn delete">🗑️ Remover</button>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="float-info-btn" onClick={() => setMostrarInfo(true)}>🎨</button>

      {mostrarInfo && (
        <div className="modal-overlay" onClick={() => setMostrarInfo(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✨ Inovações Implementadas</h2>
              <button className="modal-close" onClick={() => setMostrarInfo(false)}>✖</button>
            </div>
            <div className="modal-body">
              <ul className="inovacoes-list">
                <li>🏆 <strong>Workshops no Topo</strong> - Workshops sempre em primeiro lugar</li>
                <li>🔍 <strong>Busca Instantânea</strong> - Filtro por título em tempo real</li>
                <li>🎯 <strong>Capacidade Livre</strong> - Digite qualquer número de participantes</li>
                <li>📅 <strong>Data e Hora do Evento</strong> - Interface bonita para definir quando vai acontecer</li>
                <li>✏️ <strong>Edição Completa</strong> - Edite título, tipo, data, hora, capacidade e status</li>
                <li>⚠️ <strong>Modal Personalizado</strong> - Confirmação de limpeza elegante</li>
                <li>🌈 <strong>Design Único</strong> - Cards com gradientes e animações</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {mostrarModalLimpeza && (
        <div className="modal-overlay" onClick={cancelarLimpeza}>
          <div className="modal-confirmacao" onClick={(e) => e.stopPropagation()}>
            <div className="modal-confirmacao-header"><div className="icone-alerta">⚠️</div><h2>Limpar Cronograma</h2></div>
            <div className="modal-confirmacao-body">
              <p>Tem certeza que deseja <strong>remover todos os eventos</strong>?</p>
              <p className="texto-aviso">Esta ação é irreversível e todos os dados serão perdidos permanentemente.</p>
              <div className="estatistica-previa"><span>📊 Serão removidos:</span><strong>{estatisticas.total} evento(s)</strong></div>
            </div>
            <div className="modal-confirmacao-footer">
              <button onClick={cancelarLimpeza} className="btn-cancelar">❌ Cancelar</button>
              <button onClick={confirmarLimpeza} className="btn-confirmar">🗑️ Sim, Limpar Tudo</button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalEdicao && eventoEditando && (
        <div className="modal-overlay" onClick={() => setMostrarModalEdicao(false)}>
          <div className="modal-edicao" onClick={(e) => e.stopPropagation()}>
            <div className="modal-edicao-header">
              <h2>✏️ Editar Evento</h2>
              <button className="modal-close" onClick={() => setMostrarModalEdicao(false)}>✖</button>
            </div>
            <div className="modal-edicao-body">
              <div className="campo-edicao">
                <label>📌 Título</label>
                <input type="text" value={eventoEditando.titulo} onChange={(e) => atualizarCampoEditado('titulo', e.target.value)} className="input-edicao" />
              </div>
              
              <div className="campo-edicao">
                <label>🎭 Tipo</label>
                <select value={eventoEditando.tipo} onChange={(e) => atualizarCampoEditado('tipo', e.target.value)} className="select-edicao">
                  {Object.entries(categorias).map(([key, val]) => (<option key={key} value={key}>{val.icone} {val.nome}</option>))}
                </select>
              </div>
              
              <div className="campo-edicao">
                <label>📅 Data do Evento</label>
                <input type="date" value={eventoEditando.dataEvento || ''} onChange={(e) => atualizarCampoEditado('dataEvento', e.target.value)} className="input-edicao" />
              </div>
              
              <div className="campo-edicao">
                <label>⏰ Hora do Evento</label>
                <input type="time" value={eventoEditando.horaEvento || ''} onChange={(e) => atualizarCampoEditado('horaEvento', e.target.value)} className="input-edicao" />
              </div>
              
              <div className="campo-edicao">
                <label>📊 Status</label>
                <select value={eventoEditando.status} onChange={(e) => atualizarCampoEditado('status', e.target.value)} className="select-edicao">
                  {statusOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                </select>
              </div>
              
              <div className="campo-edicao">
                <label>🎟️ Capacidade Máxima</label>
                <input 
                  type="number" 
                  value={eventoEditando.capacidadeMax} 
                  onChange={(e) => {
                    const valor = parseInt(e.target.value) || 1;
                    if (valor >= 1) {
                      atualizarCampoEditado('capacidadeMax', valor);
                      // Se os participantes atuais forem maiores que a nova capacidade, ajusta
                      if (eventoEditando.participantes > valor) {
                        atualizarCampoEditado('participantes', valor);
                      }
                    }
                  }} 
                  className="input-edicao" 
                  min="1"
                  step="1"
                />
                <small className="helper-text">Digite qualquer número de participantes</small>
              </div>
              
              <div className="campo-edicao">
                <label>👥 Participantes Atuais</label>
                <input 
                  type="number" 
                  value={eventoEditando.participantes} 
                  onChange={(e) => { 
                    const valor = parseInt(e.target.value) || 0; 
                    if (valor <= eventoEditando.capacidadeMax && valor >= 0) {
                      atualizarCampoEditado('participantes', valor);
                    }
                  }} 
                  className="input-edicao" 
                  min="0" 
                  max={eventoEditando.capacidadeMax} 
                  step="1"
                />
                <small className="helper-text">Máximo: {eventoEditando.capacidadeMax}</small>
              </div>
            </div>
            <div className="modal-edicao-footer">
              <button onClick={() => setMostrarModalEdicao(false)} className="btn-cancelar-edicao">Cancelar</button>
              <button onClick={salvarEdicao} className="btn-salvar-edicao">💾 Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;