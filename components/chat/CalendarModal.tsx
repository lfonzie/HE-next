'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Minus, ChevronLeft, ChevronRight, Clock, MapPin, CheckCircle } from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  className?: string;
}

interface Event {
  id: string;
  title: string;
  date: Date;
  time?: string;
  location?: string;
  description?: string;
  type: 'study' | 'exam' | 'deadline' | 'personal';
}

const EVENT_TYPES = {
  study: { name: 'Estudo', color: 'bg-blue-500', icon: '📚' },
  exam: { name: 'Prova', color: 'bg-red-500', icon: '📝' },
  deadline: { name: 'Prazo', color: 'bg-orange-500', icon: '⏰' },
  personal: { name: 'Pessoal', color: 'bg-green-500', icon: '👤' }
};

export function CalendarModal({ isOpen, onClose, initialDate = new Date(), className = '' }: CalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    time: '',
    location: '',
    description: '',
    type: 'study'
  });

  useEffect(() => {
    if (isOpen && initialDate) {
      setCurrentDate(initialDate);
      setSelectedDate(initialDate);
    }
  }, [isOpen, initialDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const addEvent = () => {
    if (!newEvent.title || !selectedDate) return;

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      date: selectedDate,
      time: newEvent.time,
      location: newEvent.location,
      description: newEvent.description,
      type: newEvent.type as Event['type']
    };

    setEvents(prev => [...prev, event]);
    setNewEvent({
      title: '',
      time: '',
      location: '',
      description: '',
      type: 'study'
    });
    setShowEventForm(false);
  };

  const removeEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    return time;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString();
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-2xl max-w-4xl w-full shadow-2xl ${className}`}>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-2xl p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Calendário</h2>
              <p className="text-sm opacity-90">Organize seus estudos e eventos</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <h3 className="text-lg font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Week Days Header */}
                <div className="grid grid-cols-7 bg-gray-50">
                  {weekDays.map(day => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7">
                  {getDaysInMonth(currentDate).map((date, index) => {
                    if (!date) {
                      return <div key={index} className="h-16 border-b border-r border-gray-200" />;
                    }

                    const dayEvents = getEventsForDate(date);
                    const isCurrentDay = isToday(date);
                    const isSelectedDay = isSelected(date);

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(date)}
                        className={`h-16 border-b border-r border-gray-200 p-2 text-left hover:bg-gray-50 transition-colors ${
                          isCurrentDay ? 'bg-blue-50' : ''
                        } ${isSelectedDay ? 'bg-blue-100' : ''}`}
                      >
                        <div className={`text-sm font-medium ${
                          isCurrentDay ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {date.getDate()}
                        </div>
                        
                        {/* Event Indicators */}
                        <div className="flex gap-1 mt-1">
                          {dayEvents.slice(0, 3).map(event => (
                            <div
                              key={event.id}
                              className={`w-2 h-2 rounded-full ${EVENT_TYPES[event.type].color}`}
                              title={event.title}
                            />
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-gray-500">
                              +{dayEvents.length - 3}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Selected Date Info */}
              {selectedDate && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {formatDate(selectedDate)}
                  </h3>
                  
                  <div className="space-y-2">
                    {getEventsForDate(selectedDate).map(event => (
                      <div
                        key={event.id}
                        className="flex items-center gap-2 p-2 bg-white rounded border"
                      >
                        <span className="text-lg">{EVENT_TYPES[event.type].icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {event.title}
                          </div>
                          {event.time && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTime(event.time)}
                            </div>
                          )}
                          {event.location && (
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => removeEvent(event.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    
                    {getEventsForDate(selectedDate).length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-4">
                        Nenhum evento neste dia
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setShowEventForm(true)}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Evento
                  </button>
                </div>
              )}

              {/* Event Form */}
              {showEventForm && selectedDate && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Novo Evento</h4>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Título do evento"
                      value={newEvent.title || ''}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="time"
                        placeholder="Horário"
                        value={newEvent.time || ''}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                      
                      <select
                        value={newEvent.type || 'study'}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                        className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      >
                        {Object.entries(EVENT_TYPES).map(([key, type]) => (
                          <option key={key} value={key}>
                            {type.icon} {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="Local (opcional)"
                      value={newEvent.location || ''}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    
                    <textarea
                      placeholder="Descrição (opcional)"
                      value={newEvent.description || ''}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={addEvent}
                      disabled={!newEvent.title}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Adicionar
                    </button>
                    <button
                      onClick={() => setShowEventForm(false)}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Ações Rápidas</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-colors"
                  >
                    📅 Ir para hoje
                  </button>
                  <button
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setSelectedDate(tomorrow);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-colors"
                  >
                    ➡️ Amanhã
                  </button>
                  <button
                    onClick={() => {
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      setSelectedDate(nextWeek);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white rounded-lg transition-colors"
                  >
                    📆 Próxima semana
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
