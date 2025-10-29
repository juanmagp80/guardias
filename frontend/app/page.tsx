'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Clock, 
  Plus, 
  Minus, 
  X, 
  Shield, 
  Coffee, 
  ChevronLeft, 
  ChevronRight,
  Trash2,
  UserCheck,
  CalendarDays,
  Activity,
  Star,
  Zap
} from 'lucide-react';

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
}

interface Descanso {
  id: string;
  tecnico_id: string;
  fecha: string;
  procesado?: boolean;
}

export default function Dashboard() {
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [guardias, setGuardias] = useState<Guardia[]>([]);
  const [descansos, setDescansos] = useState<Descanso[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTecnico, setSelectedTecnico] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper para obtener la URL base de la API
  const getApiUrl = () => {
    // En desarrollo, usar el backend Express local
    if (process.env.NODE_ENV === 'development') {
      return 'http://localhost:3001/api';
    }
    // En producción, usar el backend Express desplegado
    // TODO: Cambiar por la URL del backend desplegado
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  };

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Helper function para obtener nombre del técnico por ID
  const getTecnicoName = (tecnicoId: string) => {
    const tecnico = tecnicos.find(t => t.id === tecnicoId);
    return tecnico?.nombre || 'Desconocido';
  };

  const loadData = async () => {
    console.log('[LOAD DATA] Iniciando carga de datos...');
    setLoading(true);
    
    try {
      const apiUrl = getApiUrl();
      console.log('[LOAD DATA] API URL:', apiUrl);
      
      // Cargar técnicos (sabemos que funciona)
      try {
        console.log('[LOAD DATA] Cargando técnicos...');
        const tecnicosRes = await fetch(`${apiUrl}/tecnicos`);
        if (tecnicosRes.ok) {
          const tecnicosData = await tecnicosRes.json();
          console.log('[LOAD DATA] Técnicos cargados:', tecnicosData);
          
          if (Array.isArray(tecnicosData)) {
            setTecnicos(tecnicosData);
          } else if (tecnicosData.success && tecnicosData.data) {
            setTecnicos(tecnicosData.data);
          } else {
            console.warn('[LOAD DATA] Formato inesperado de técnicos:', tecnicosData);
            setTecnicos([]);
          }
        } else {
          console.error('[LOAD DATA] Error cargando técnicos:', tecnicosRes.status);
          setTecnicos([]);
        }
      } catch (error) {
        console.error('[LOAD DATA] Excepción cargando técnicos:', error);
        setTecnicos([]);
      }

      // Intentar cargar guardias (con fallback)
      try {
        console.log('[LOAD DATA] Cargando guardias...');
        const guardiasRes = await fetch(`${apiUrl}/guardias`);
        if (guardiasRes.ok) {
          const guardiasData = await guardiasRes.json();
          console.log('[LOAD DATA] Guardias cargadas:', guardiasData);
          
          if (Array.isArray(guardiasData)) {
            setGuardias(guardiasData);
          } else if (guardiasData.success && guardiasData.data) {
            setGuardias(guardiasData.data);
          } else {
            console.warn('[LOAD DATA] Guardias: usando array vacío');
            setGuardias([]);
          }
        } else {
          console.warn('[LOAD DATA] Guardias API error, usando array vacío');
          setGuardias([]);
        }
      } catch (error) {
        console.warn('[LOAD DATA] Excepción guardias, usando array vacío:', error);
        setGuardias([]);
      }

      // Intentar cargar descansos (con fallback)
      try {
        console.log('[LOAD DATA] Cargando descansos...');
        const descansosRes = await fetch(`${apiUrl}/descansos`);
        if (descansosRes.ok) {
          const descansosData = await descansosRes.json();
          console.log('[LOAD DATA] Descansos cargados:', descansosData);
          
          if (Array.isArray(descansosData)) {
            setDescansos(descansosData);
          } else if (descansosData.success && descansosData.data) {
            setDescansos(descansosData.data);
          } else {
            console.warn('[LOAD DATA] Descansos: usando array vacío');
            setDescansos([]);
          }
        } else {
          console.warn('[LOAD DATA] Descansos API error, usando array vacío');
          setDescansos([]);
        }
      } catch (error) {
        console.warn('[LOAD DATA] Excepción descansos, usando array vacío:', error);
        setDescansos([]);
      }

      console.log('[LOAD DATA] Carga completada');
      setLoading(false);
      
    } catch (error) {
      console.error('[LOAD DATA] Error general:', error);
      // Asegurar que al menos tenemos arrays vacíos
      setTecnicos([]);
      setGuardias([]);
      setDescansos([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const crearGuardia = async (tecnicoId: string, fechaInicio: string) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/guardias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tecnico_id: tecnicoId, fecha_inicio: fechaInicio })
      });

      if (response.ok) {
        loadData();
        // TODO: Mostrar notificación elegante
      } else {
        const error = await response.json();
        alert(error.error || 'Error al asignar guardia');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al asignar guardia');
    }
  };

  const crearDescanso = async (tecnicoId: string, fecha: string) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/descansos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tecnico_id: tecnicoId, fecha })
      });

      if (response.ok) {
        loadData();
        // TODO: Mostrar notificación elegante
      } else {
        const error = await response.json();
        alert(error.error || 'Error al asignar descanso');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al asignar descanso');
    }
  };

  const incrementarDiasPendientes = async (tecnicoId: string, diasActuales: number) => {
    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/tecnicos/${tecnicoId}/dias-pendientes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dias_pendientes: diasActuales + 1 })
      });

      if (response.ok) {
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al añadir día pendiente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al añadir día pendiente');
    }
  };

  const disminuirDiasPendientes = async (tecnicoId: string, diasActuales: number) => {
    if (diasActuales <= 0) {
      // TODO: Mostrar notificación elegante
      return;
    }

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/tecnicos/${tecnicoId}/dias-pendientes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dias_pendientes: diasActuales - 1 })
      });

      if (response.ok) {
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al remover día pendiente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al remover día pendiente');
    }
  };

  const eliminarGuardia = async (guardiaId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta guardia?')) return;

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/guardias/${guardiaId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadData();
      } else {
        const error = await response.json();
        alert(error.error || 'Error al eliminar guardia');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar guardia');
    }
  };

  const eliminarDescanso = async (descansoId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este día libre?')) return;

    try {
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/descansos/${descansoId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadData();
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
    
    const dayOfWeek = firstDay.getDay();
    startOfWeek.setDate(firstDay.getDate() - dayOfWeek);
    
    const days = [];
    const current = new Date(startOfWeek);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const monthDays = getDaysInMonth(currentMonth, currentYear);
  const monthName = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentDate);

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

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getStats = () => {
    const totalGuardias = guardias.length;
    const totalDescansos = descansos.length;
    const totalDiasPendientes = tecnicos.reduce((sum, t) => sum + t.dias_pendientes, 0);
    
    return { totalGuardias, totalDescansos, totalDiasPendientes };
  };

  const { totalGuardias, totalDescansos, totalDiasPendientes } = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              ⚡ Dashboard de Guardias ⚡
            </h1>
            <p className="text-xl text-purple-200">
              Gestión inteligente del equipo de Sevilla
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Total Guardias</p>
                  <p className="text-3xl font-bold text-white">{totalGuardias}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Días Libres</p>
                  <p className="text-3xl font-bold text-white">{totalDescansos}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Días Pendientes</p>
                  <p className="text-3xl font-bold text-white">{totalDiasPendientes}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Panel de Técnicos */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Técnicos</h2>
                </div>

                <select
                  value={selectedTecnico}
                  onChange={(e) => setSelectedTecnico(e.target.value)}
                  className="w-full p-3 mb-6 bg-white/5 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:border-purple-400 focus:outline-none transition-colors"
                >
                  <option value="">Seleccionar técnico</option>
                  {tecnicos.map(tecnico => (
                    <option key={tecnico.id} value={tecnico.id} className="text-gray-900">
                      {tecnico.nombre}
                    </option>
                  ))}
                </select>

                <div className="space-y-4">
                  <AnimatePresence>
                    {tecnicos.map((tecnico, index) => (
                      <motion.div
                        key={tecnico.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 backdrop-blur rounded-xl p-4 border border-white/10 hover:border-white/30 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-full flex items-center justify-center">
                              <UserCheck className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-white text-sm">
                                {tecnico.nombre.split(' ').slice(0, 2).join(' ')}
                              </h3>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                            tecnico.dias_pendientes > 0 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                              : 'bg-green-500/20 text-green-300 border border-green-500/30'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {tecnico.dias_pendientes} días
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => disminuirDiasPendientes(tecnico.id, tecnico.dias_pendientes)}
                            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            disabled={tecnico.dias_pendientes <= 0}
                          >
                            <Minus className="w-3 h-3" />
                            -1
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => incrementarDiasPendientes(tecnico.id, tecnico.dias_pendientes)}
                            className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            +1
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            {/* Calendario */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                {/* Header del calendario */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-pink-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white capitalize">{monthName}</h2>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigateMonth(-1)}
                      className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigateMonth(1)}
                      className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-white transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="p-3 text-center font-medium text-purple-300 text-sm">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Días del calendario */}
                <div className="grid grid-cols-7 gap-2">
                  <AnimatePresence>
                    {monthDays.map((date, index) => {
                      const { guardias: guardiasDelDia, descansos: descansosDelDia } = getEventosForDate(date);
                      const isToday = date.toDateString() === today.toDateString();
                      const isCurrentMonth = date.getMonth() === currentMonth;
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      
                      return (
                        <motion.div
                          key={`${date.getTime()}-${currentMonth}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ delay: index * 0.01 }}
                          className={`min-h-[120px] p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                            isToday 
                              ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400/50 shadow-lg' 
                              : isCurrentMonth 
                                ? 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20' 
                                : 'bg-white/5 border-white/5 opacity-50'
                          } ${isWeekend && isCurrentMonth ? 'bg-purple-500/10' : ''}`}
                          onClick={() => {
                            if (!isCurrentMonth) return;
                            
                            if (!selectedTecnico) {
                              alert('Selecciona un técnico primero');
                              return;
                            }

                            const action = confirm('¿Qué quieres asignar?\\n\\nOK = Guardia (semana completa)\\nCancelar = Descanso (un día)');
                            const dateStr = date.toISOString().split('T')[0];
                            
                            if (action) {
                              crearGuardia(selectedTecnico, dateStr);
                            } else {
                              crearDescanso(selectedTecnico, dateStr);
                            }
                          }}
                          whileHover={{ scale: isCurrentMonth ? 1.02 : 1 }}
                          whileTap={{ scale: isCurrentMonth ? 0.98 : 1 }}
                        >
                          <div className={`text-sm font-medium mb-2 ${
                            isToday ? 'text-yellow-300' : isCurrentMonth ? 'text-white' : 'text-gray-500'
                          }`}>
                            {date.getDate()}
                            {isToday && <Star className="w-3 h-3 inline ml-1" />}
                          </div>

                          <div className="space-y-1">
                            {isCurrentMonth && guardiasDelDia.map(guardia => (
                              <motion.div
                                key={guardia.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="group relative flex items-center justify-between bg-blue-500/20 text-blue-300 rounded-lg p-1 text-xs border border-blue-500/30"
                              >
                                <div className="flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  <span>{getTecnicoName(guardia.tecnico_id).split(' ')[0]}</span>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    eliminarGuardia(guardia.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3 text-red-400 hover:text-red-300" />
                                </motion.button>
                              </motion.div>
                            ))}

                            {isCurrentMonth && descansosDelDia.map(descanso => (
                              <motion.div
                                key={descanso.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="group relative flex items-center justify-between bg-green-500/20 text-green-300 rounded-lg p-1 text-xs border border-green-500/30"
                              >
                                <div className="flex items-center gap-1">
                                  <Coffee className="w-3 h-3" />
                                  <span>{getTecnicoName(descanso.tecnico_id).split(' ')[0]}</span>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    eliminarDescanso(descanso.id);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="w-3 h-3 text-red-400 hover:text-red-300" />
                                </motion.button>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Leyenda */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 flex flex-wrap gap-4 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500/20 border border-blue-500/30 rounded"></div>
                    <span className="text-purple-200">Guardia (semana completa)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500/20 border border-green-500/30 rounded"></div>
                    <span className="text-purple-200">Descanso (un día)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-purple-200">Día actual</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}