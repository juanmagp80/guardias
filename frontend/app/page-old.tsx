'use client';

import { useState, useEffect } from 'react';

interface Tecnico {
  id: string;
  nombre: string;
  email: string;
  dias_pendientes: number;
}

interface Guardia {
  id: string;
  tecnico_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  tecnicos: {
    nombre: string;
  };
}

interface Descanso {
  id: string;
  tecnico_id: string;
  fecha: string;
  tecnicos: {
    nombre: string;
  };
}

export default function Dashboard() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [guardias, setGuardias] = useState<Guardia[]>([]);
  const [descansos, setDescansos] = useState<Descanso[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTecnico, setSelectedTecnico] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const loadData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      
      const [tecnicosRes, guardiasRes, descansosRes] = await Promise.all([
        fetch(`${apiUrl}/tecnicos`),
        fetch(`${apiUrl}/guardias`),
        fetch(`${apiUrl}/descansos`)
      ]);

      const [tecnicosData, guardiasData, descansosData] = await Promise.all([
        tecnicosRes.json(),
        guardiasRes.json(),
        descansosRes.json()
      ]);

      if (tecnicosData.success) setTecnicos(tecnicosData.data);
      if (guardiasData.success) setGuardias(guardiasData.data);
      if (descansosData.success) setDescansos(descansosData.data);

      setLoading(false);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setLoading(false);
    }
  };  useEffect(() => {
    loadData();
  }, []);

  const crearGuardia = async (tecnicoId: string, fechaInicio: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/guardias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tecnico_id: tecnicoId, fecha_inicio: fechaInicio })
      });

      if (response.ok) {
        loadData();
        alert('Guardia asignada correctamente');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al asignar guardia');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al asignar guardia');
    }
  };

  // Función para crear descanso
  const crearDescanso = async (tecnicoId: string, fecha: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/descansos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tecnico_id: tecnicoId, fecha })
      });

      if (response.ok) {
        loadData();
        alert('Descanso asignado correctamente');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al asignar descanso');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al asignar descanso');
    }
  };

  // Función para incrementar días pendientes
  const incrementarDiasPendientes = async (tecnicoId: string, diasActuales: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/tecnicos/${tecnicoId}/dias-pendientes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dias_pendientes: diasActuales + 1 })
      });

      if (response.ok) {
        loadData();
        alert('Día pendiente añadido correctamente');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al añadir día pendiente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al añadir día pendiente');
    }
  };

  // Función para disminuir días pendientes
  const disminuirDiasPendientes = async (tecnicoId: string, diasActuales: number) => {
    if (diasActuales <= 0) {
      alert('No hay días pendientes para quitar');
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/tecnicos/${tecnicoId}/dias-pendientes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dias_pendientes: diasActuales - 1 })
      });

      if (response.ok) {
        loadData();
        alert('Día pendiente removido correctamente');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al remover día pendiente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al remover día pendiente');
    }
  };

  // Función para eliminar guardia
  const eliminarGuardia = async (guardiaId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta guardia?')) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/guardias/${guardiaId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadData();
        alert('Guardia eliminada correctamente');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al eliminar guardia');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar guardia');
    }
  };

  // Función para eliminar descanso
  const eliminarDescanso = async (descansoId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este día libre?')) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${apiUrl}/descansos/${descansoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadData();
        alert('Día libre eliminado correctamente');
      } else {
        const error = await response.json();
        alert(error.error || 'Error al eliminar día libre');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar día libre');
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOfWeek = new Date(firstDay);
    
    // Ajustar al domingo anterior si es necesario
    const dayOfWeek = firstDay.getDay();
    startOfWeek.setDate(firstDay.getDate() - dayOfWeek);
    
    const days = [];
    const current = new Date(startOfWeek);
    
    // Generar 42 días (6 semanas x 7 días) para llenar el calendario
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const monthDays = getDaysInMonth(currentMonth, currentYear);
  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentDate);

  // Funciones para navegar entre meses
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventosForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    const guardiasDelDia = guardias.filter(g => {
      const inicio = new Date(g.fecha_inicio);
      const fin = new Date(g.fecha_fin);
      return date >= inicio && date <= fin;
    });

    const descansosDelDia = descansos.filter(d => d.fecha === dateStr);

    return { guardias: guardiasDelDia, descansos: descansosDelDia };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Dashboard de Guardias
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Técnicos</h2>
              
              <select 
                value={selectedTecnico} 
                onChange={(e) => setSelectedTecnico(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              >
                <option value="">Seleccionar técnico</option>
                {tecnicos.map(tecnico => (
                  <option key={tecnico.id} value={tecnico.id}>
                    {tecnico.nombre}
                  </option>
                ))}
              </select>

              <div className="space-y-3">
                {tecnicos.map(tecnico => (
                  <div key={tecnico.id} className="p-4 border rounded-lg">
                    <div className="font-medium text-sm mb-2">
                      {tecnico.nombre}
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        tecnico.dias_pendientes > 0 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {tecnico.dias_pendientes} días pendientes
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => disminuirDiasPendientes(tecnico.id, tecnico.dias_pendientes)}
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:bg-gray-300"
                          title="Quitar un día pendiente"
                          disabled={tecnico.dias_pendientes <= 0}
                        >
                          -1 día
                        </button>
                        <button
                          onClick={() => incrementarDiasPendientes(tecnico.id, tecnico.dias_pendientes)}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                          title="Añadir un día pendiente"
                        >
                          +1 día
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Calendario</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={goToPreviousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="text-lg font-medium capitalize min-w-[200px] text-center">
                    {monthName}
                  </div>
                  
                  <button
                    onClick={goToNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Hoy
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="p-2 text-center font-medium text-gray-500">
                    {day}
                  </div>
                ))}

                {monthDays.map(date => {
                  const { guardias: guardiasDelDia, descansos: descansosDelDia } = getEventosForDate(date);
                  const isToday = date.toDateString() === today.toDateString();
                  const isCurrentMonth = date.getMonth() === currentMonth;
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  
                  return (
                    <div
                      key={date.getTime()}
                      className={`min-h-[100px] p-2 border rounded cursor-pointer transition-colors ${
                        isToday 
                          ? 'bg-blue-50 border-blue-300' 
                          : isCurrentMonth 
                            ? 'border-gray-200 hover:bg-gray-50' 
                            : 'border-gray-100 bg-gray-50 text-gray-400'
                      } ${isWeekend && isCurrentMonth ? 'bg-gray-25' : ''}`}
                      onClick={() => {
                        if (!isCurrentMonth) return; // No permitir clicks en días de otros meses
                        
                        if (!selectedTecnico) {
                          alert('Selecciona un técnico primero');
                          return;
                        }

                        const action = confirm('¿Qué quieres asignar?\n\nOK = Guardia (semana completa)\nCancelar = Descanso (un día)');
                        const dateStr = date.toISOString().split('T')[0];
                        
                        if (action) {
                          crearGuardia(selectedTecnico, dateStr);
                        } else {
                          crearDescanso(selectedTecnico, dateStr);
                        }
                      }}
                    >
                      <div className={`text-sm font-medium ${
                        isToday ? 'text-blue-700' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      {/* Mostrar guardias solo para días del mes actual */}
                      {isCurrentMonth && guardiasDelDia.map(guardia => (
                        <div key={guardia.id} className="text-xs bg-blue-100 text-blue-800 rounded p-1 mt-1 flex items-center justify-between">
                          <span>G: {guardia.tecnicos.nombre.split(' ')[0]}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              eliminarGuardia(guardia.id);
                            }}
                            className="ml-1 text-blue-600 hover:text-red-600 font-bold text-sm leading-none"
                            title="Eliminar guardia"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      
                      {/* Mostrar descansos solo para días del mes actual */}
                      {isCurrentMonth && descansosDelDia.map(descanso => (
                        <div key={descanso.id} className="text-xs bg-green-100 text-green-800 rounded p-1 mt-1 flex items-center justify-between">
                          <span>D: {descanso.tecnicos.nombre.split(' ')[0]}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              eliminarDescanso(descanso.id);
                            }}
                            className="ml-1 text-green-600 hover:text-red-600 font-bold text-sm leading-none"
                            title="Eliminar día libre"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
                  <span>Guardia (semana completa)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span>Descanso (un día)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
