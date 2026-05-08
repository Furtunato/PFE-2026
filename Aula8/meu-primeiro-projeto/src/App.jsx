import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // --- Estados existentes ---
  const [taskText, setTaskText] = useState("");
  const [priority, setPriority] = useState("Baixa");
  const [taskList, setTaskList] = useState([]);
  const [filter, setFilter] = useState("Todas");

  // --- NOVO Estado para Busca em Tempo Real ---
  const [searchTerm, setSearchTerm] = useState("");

  // --- Carregar tarefas do LocalStorage ao iniciar ---
  useEffect(() => {
    const saved = localStorage.getItem("@taskflow_data");
    if (saved) setTaskList(JSON.parse(saved));
  }, []);

  // --- Salvar tarefas no LocalStorage sempre que a lista mudar ---
  useEffect(() => {
    localStorage.setItem("@taskflow_data", JSON.stringify(taskList));
  }, [taskList]);

  // --- Adicionar nova tarefa ---
  const addTask = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    const newTask = {
      id: crypto.randomUUID(),
      text: taskText,
      priority: priority,
      completed: false,
      createdAt: new Date().toLocaleDateString()
    };

    setTaskList([newTask, ...taskList]);
    setTaskText("");
  };

  // --- Alternar status (concluído/pendente) ---
  const toggleTask = (id) => {
    setTaskList(taskList.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  // --- Editar tarefa ---
  const editTask = (id, newText) => {
    if (!newText.trim()) return;
    setTaskList(taskList.map(t =>
      t.id === id ? { ...t, text: newText.trim() } : t
    ));
  };

  // --- Excluir tarefa com CONFIRMAÇÃO ---
  const deleteTask = (id) => {
    const userConfirmed = window.confirm("Tem certeza que deseja remover esta tarefa permanentemente?");
    if (userConfirmed) {
      setTaskList(taskList.filter(t => t.id !== id));
    }
  };

  // --- Lógica de FILTRAGEM (Status + Busca) ---
  const filteredTasks = taskList
    .filter(t => {
      if (filter === "Pendentes") return !t.completed;
      if (filter === "Concluídas") return t.completed;
      return true;
    })
    .filter(t => {
      return t.text.toLowerCase().includes(searchTerm.toLowerCase());
    });

  // --- ORDENAÇÃO: Prioridade Alta no topo ---
  const priorityOrder = { "Alta": 1, "Média": 2, "Baixa": 3 };
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="app-container">
      <header>
        <h1>📌 TaskFlow</h1>
        <p>Gestão de Produtividade com Prioridades</p>
      </header>

      {/* Formulário para adicionar tarefa */}
      <section className="form-section">
        <form onSubmit={addTask}>
          <input
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Digite a descrição da tarefa..."
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Baixa">Baixa Prioridade</option>
            <option value="Média">Média Prioridade</option>
            <option value="Alta">Alta Prioridade</option>
          </select>
          <button type="submit">➕ Criar Tarefa</button>
        </form>
      </section>

      {/* Campo de Busca em Tempo Real */}
      <section className="search-section">
        <input
          type="text"
          placeholder="🔍 Buscar tarefas por palavra-chave..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </section>

      {/* Filtros por status */}
      <section className="filter-section">
        {["Todas", "Pendentes", "Concluídas"].map(f => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </section>

      {/* Grid de tarefas com ordenação */}
      <main className="task-grid">
        {sortedTasks.length === 0 ? (
          <div className="no-tasks">✨ Nenhuma tarefa encontrada. Adicione uma! ✨</div>
        ) : (
          sortedTasks.map(item => (
            <TaskCard
              key={item.id}
              task={item}
              onToggle={toggleTask}
              onEdit={editTask}
              onDelete={deleteTask}
            />
          ))
        )}
      </main>
    </div>
  );
}

// --- COMPONENTE TaskCard ---
function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleEditSubmit = () => {
    if (editText.trim() !== "") {
      onEdit(task.id, editText);
      setIsEditing(false);
    }
  };

  return (
    <div className={`task-card ${task.priority.toLowerCase()} ${task.completed ? 'done' : ''}`}>
      <div className="task-content">
        {isEditing ? (
          <div className="edit-mode">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleEditSubmit()}
            />
            <button onClick={handleEditSubmit} className="save-edit">💾 Salvar</button>
            <button onClick={() => setIsEditing(false)} className="cancel-edit">❌ Cancelar</button>
          </div>
        ) : (
          <>
            <h3>{task.text}</h3>
            <span className={`priority-badge ${task.priority.toLowerCase()}`}>
              🎯 Prioridade: {task.priority}
            </span>
            <small>📅 Criada em: {task.createdAt}</small>
          </>
        )}
      </div>
      <div className="task-actions">
        {!isEditing && (
          <>
            <button onClick={() => onToggle(task.id)}>
              {task.completed ? "🔄 Reabrir" : "✅ Concluir"}
            </button>
            <button onClick={() => setIsEditing(true)} className="edit">
              ✏️ Editar
            </button>
            <button onClick={() => onDelete(task.id)} className="delete">
              🗑️ Remover
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;