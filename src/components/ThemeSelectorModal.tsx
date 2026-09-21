import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ThemeId, ThemeConfig } from '../types';
import { Palette, Check, Sparkles, X, Sun, Moon, Eye, Contrast } from 'lucide-react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  if (!isOpen) return null;

  const categories = ['Todos', 'Clásico', 'Modo Oscuro', 'Colorido', 'Accesibilidad'];

  const filteredThemes =
    selectedCategory === 'Todos'
      ? availableThemes
      : availableThemes.filter((t) => t.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Estilos y Temas
                </span>
                <span className="text-[11px] text-slate-400">8 Variantes Populares</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold mt-1 text-white">
                Personalización de la Interfaz Gráfica
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Selecciona tu estilo preferido: desde la sobriedad institucional clásica hasta modo oscuro OLED o colores académicos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Cerrar modal de temas"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Themes Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredThemes.map((theme: ThemeConfig) => {
              const isSelected = currentTheme === theme.id;

              return (
                <div
                  key={theme.id}
                  onClick={() => setTheme(theme.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/30 bg-indigo-50/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-400 hover:shadow-xs bg-white'
                  }`}
                >
                  <div>
                    {/* Top Row: Theme Name & Category */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{theme.name}</span>
                        {theme.isDark ? (
                          <Moon className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {theme.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed mb-3">
                      {theme.tagline}
                    </p>
                  </div>

                  {/* Palette preview swatches & Active indicator */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-1.5" title="Muestra de paleta">
                      <div
                        className="w-5 h-5 rounded-full border border-slate-300 shadow-xs"
                        style={{ backgroundColor: theme.palette.background }}
                        title="Fondo"
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-slate-300 shadow-xs"
                        style={{ backgroundColor: theme.palette.card }}
                        title="Tarjetas"
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-slate-300 shadow-xs"
                        style={{ backgroundColor: theme.palette.primary }}
                        title="Primario"
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-slate-300 shadow-xs"
                        style={{ backgroundColor: theme.palette.accent }}
                        title="Acento"
                      />
                    </div>

                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[11px] font-bold shadow-xs">
                        <Check className="w-3 h-3" />
                        Activo
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600"
                      >
                        Aplicar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>El tema seleccionado se guarda automáticamente en tu navegador.</span>
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
