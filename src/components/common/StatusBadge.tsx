import React from 'react';
import { StatusIndicator, TaskStatus, ProjectStatus, Division } from '../../types';

export const IndicatorBadge: React.FC<{ indicator: StatusIndicator; showDescription?: boolean }> = ({
  indicator,
  showDescription = false,
}) => {
  const config = {
    green: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      dot: 'bg-emerald-600',
    },
    yellow: {
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      dot: 'bg-amber-600',
    },
    red: {
      bg: 'bg-rose-50 text-rose-800 border-rose-300',
      dot: 'bg-rose-600',
    },
    gray: {
      bg: 'bg-slate-100 text-slate-700 border-slate-300',
      dot: 'bg-slate-500',
    },
  }[indicator.color] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-500',
  };

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} whitespace-nowrap`}
        title={indicator.description}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
        {indicator.label}
      </span>
      {showDescription && (
        <span className="text-xs text-slate-500 hidden md:inline">
          {indicator.description}
        </span>
      )}
    </div>
  );
};

export const TaskStatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const config = {
    'Belum Mulai': 'bg-slate-100 text-slate-700 border-slate-200',
    'Berjalan': 'bg-sky-50 text-sky-800 border-sky-200',
    'Review': 'bg-indigo-50 text-indigo-800 border-indigo-200',
    'Selesai': 'bg-emerald-50 text-emerald-800 border-emerald-200',
  }[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config} whitespace-nowrap`}>
      {status}
    </span>
  );
};

export const ProjectStatusBadge: React.FC<{ status: ProjectStatus }> = ({ status }) => {
  const config = {
    'Aktif': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'On Hold': 'bg-amber-50 text-amber-800 border-amber-200',
    'Selesai': 'bg-slate-100 text-slate-800 border-slate-300',
  }[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${config} whitespace-nowrap`}>
      {status}
    </span>
  );
};

export const DivisionBadge: React.FC<{ division: Division | '-' }> = ({ division }) => {
  const config = {
    'Arsitek': 'bg-blue-50 text-blue-800 border-blue-200',
    'Struktur': 'bg-amber-50 text-amber-900 border-amber-200',
    'MEP': 'bg-teal-50 text-teal-800 border-teal-200',
    'Admin': 'bg-slate-100 text-slate-700 border-slate-200',
    '-': 'bg-slate-100 text-slate-600 border-slate-200',
  }[division] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config} whitespace-nowrap`}>
      {division}
    </span>
  );
};
