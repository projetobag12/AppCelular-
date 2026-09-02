import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, Clock, MapPin, Plus } from 'lucide-react';

export const InternalCalendarApp: React.FC = () => {
  const [tasks, setTasks] = useState([
    {
      id: 't-1',
      time: '09:00 - 10:30',
      title: 'Reunião de Alinhamento de Vendas & Metas Q3',
      location: 'Sede AlfaLog / Sala Virtual 01',
      completed: true,
    },
    {
      id: 't-2',
      time: '11:00 - 12:30',
      title: 'Visita Técnica e Entrega de Proposta',
      location: 'Supermercados Estrela do Sul - Loja 01',
      completed: true,
    },
    {
      id: 't-3',
      time: '14:00 - 15:30',
      title: 'Vistoria e Auditoria de Qualidade em Galpão',
      location: 'CD Logístico Cajamar - Bloco 4',
      completed: false,
    },
    {
      id: 't-4',
      time: '16:30 - 17:30',
      title: 'Fechamento de Roteiro e Sincronização MDM',
      location: 'Escritório Regional',
      completed: false,
    },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none">
      {/* Top Header */}
      <div className="bg-rose-950/40 border-b border-rose-700/40 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">Agenda Corporativa</h3>
            <p className="text-[10px] text-rose-300">Hoje: 02 de Setembro de 2026</p>
          </div>
        </div>
        <span className="text-[10px] bg-rose-950 px-2 py-0.5 rounded border border-rose-700 text-rose-300 font-semibold">
          4 Atividades
        </span>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        <div className="flex justify-between items-center text-[11px] text-slate-400 px-1">
          <span>Escala e Visitas Programadas</span>
          <span className="text-emerald-400 font-semibold">
            {tasks.filter((t) => t.completed).length} / {tasks.length} concluídas
          </span>
        </div>

        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`p-3 rounded-xl border transition cursor-pointer ${
              task.completed
                ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                : 'bg-slate-800/90 border-slate-700 text-slate-100 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
                  <Clock className="w-3 h-3" />
                  {task.time}
                </div>
                <h4 className={`text-xs font-bold ${task.completed ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                  {task.title}
                </h4>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <MapPin className="w-3 h-3 text-rose-400" />
                  {task.location}
                </div>
              </div>
              <div className="pt-1">
                <CheckCircle2
                  className={`w-5 h-5 transition ${task.completed ? 'text-emerald-400 fill-emerald-950' : 'text-slate-600'}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
