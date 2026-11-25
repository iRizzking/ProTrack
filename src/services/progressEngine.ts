import { Task, Project, StatusIndicator } from '../types';
import { StorageService } from './storage';

export const ProgressEngine = {
  /**
   * PRD 7.5: Progres PIC per proyek = rata-rata tertimbang (bobot task) dari task miliknya.
   */
  calculatePICProgress(projectId: string, picId: string): number {
    const tasks = StorageService.getProjectTasks(projectId).filter((t) => t.pic_id === picId);
    if (tasks.length === 0) return 0;

    const totalWeight = tasks.reduce((acc, t) => acc + (t.bobot || 1), 0);
    if (totalWeight <= 0) return 0;

    const weightedSum = tasks.reduce((acc, t) => acc + t.progres * (t.bobot || 1), 0);
    return Math.round((weightedSum / totalWeight) * 10) / 10;
  },

  /**
   * PRD 7.5: Progres divisi = rata-rata tertimbang semua task divisi tersebut.
   */
  calculateDivisionProgress(projectId: string, division: string): number {
    const tasks = StorageService.getProjectTasks(projectId).filter((t) => t.divisi === division);
    if (tasks.length === 0) return 0;

    const totalWeight = tasks.reduce((acc, t) => acc + (t.bobot || 1), 0);
    if (totalWeight <= 0) return 0;

    const weightedSum = tasks.reduce((acc, t) => acc + t.progres * (t.bobot || 1), 0);
    return Math.round((weightedSum / totalWeight) * 10) / 10;
  },

  /**
   * PRD 7.5: Progres proyek = rata-rata tertimbang dari progres tiap divisi sesuai bobot divisi.
   */
  calculateProjectProgress(projectId: string): number {
    const divWeights = StorageService.getProjectWeights(projectId);
    const tasks = StorageService.getProjectTasks(projectId);

    if (tasks.length === 0) return 0;

    // If division weights exist, calculate weighted average of division progresses
    if (divWeights.length > 0) {
      const totalDivWeight = divWeights.reduce((acc, dw) => acc + dw.bobot, 0);
      if (totalDivWeight > 0) {
        const weightedDivSum = divWeights.reduce((acc, dw) => {
          const divProgress = this.calculateDivisionProgress(projectId, dw.divisi);
          return acc + divProgress * dw.bobot;
        }, 0);
        return Math.round((weightedDivSum / totalDivWeight) * 10) / 10;
      }
    }

    // Fallback: task weighted average
    const totalTaskWeight = tasks.reduce((acc, t) => acc + (t.bobot || 1), 0);
    if (totalTaskWeight <= 0) return 0;
    const taskSum = tasks.reduce((acc, t) => acc + t.progres * (t.bobot || 1), 0);
    return Math.round((taskSum / totalTaskWeight) * 10) / 10;
  },

  /**
   * PRD 7.5: Indikator status:
   * - Hijau: sesuai atau lebih cepat dari jadwal
   * - Kuning: terlambat ringan (-5% sampai -20% dibanding ideal)
   * - Merah: overdue (lewat deadline atau terlambat berat > 20%)
   * Berdasarkan progres aktual dibanding progres ideal menurut timeline (waktu berjalan / total durasi).
   */
  getTaskIndicator(task: Task): StatusIndicator {
    const now = new Date();
    const start = new Date(task.tanggal_mulai);
    const end = new Date(task.deadline);

    // If already finished
    if (task.status === 'Selesai' || task.progres >= 100) {
      return {
        color: 'green',
        label: 'Selesai',
        description: 'Pekerjaan telah rampung 100%.',
        idealProgress: 100,
        diff: 0,
      };
    }

    // If past deadline and not finished
    if (now > end) {
      const daysOverdue = Math.ceil((now.getTime() - end.getTime()) / (1000 * 60 * 60 * 24));
      return {
        color: 'red',
        label: 'Overdue',
        description: `Melewati deadline target (${daysOverdue} hari lalu).`,
        idealProgress: 100,
        diff: task.progres - 100,
      };
    }

    // Calculate timeline progression
    const totalDuration = Math.max(1, end.getTime() - start.getTime());
    const elapsed = Math.max(0, now.getTime() - start.getTime());
    const idealProgress = Math.min(100, Math.round((elapsed / totalDuration) * 100));

    const diff = task.progres - idealProgress;

    if (diff >= -5) {
      return {
        color: 'green',
        label: 'Tepat Waktu',
        description: diff >= 5 ? `Lebih cepat +${diff}% dari jadwal.` : 'Sesuai dengan target jadwal.',
        idealProgress,
        diff,
      };
    }

    if (diff >= -20) {
      return {
        color: 'yellow',
        label: 'Terlambat Ringan',
        description: `Tertinggal ${Math.abs(diff)}% dari target ideal ${idealProgress}%.`,
        idealProgress,
        diff,
      };
    }

    return {
      color: 'red',
      label: 'Kritis',
      description: `Tertinggal berat ${Math.abs(diff)}% dari target ideal ${idealProgress}%.`,
      idealProgress,
      diff,
    };
  },

  /**
   * PRD 7.5 & 7.6: Project Level Status Indicator
   */
  getProjectIndicator(project: Project): StatusIndicator {
    if (project.status === 'Selesai') {
      return {
        color: 'green',
        label: 'Selesai',
        description: 'Proyek telah diselesaikan.',
      };
    }

    const tasks = StorageService.getProjectTasks(project.id);
    if (tasks.length === 0) {
      return {
        color: 'gray',
        label: 'Belum Ada Task',
        description: 'Silakan tambahkan task pada proyek ini.',
      };
    }

    const now = new Date();
    const deadline = new Date(project.deadline);
    const overdueTasks = tasks.filter((t) => now > new Date(t.deadline) && t.progres < 100);

    if (overdueTasks.length > 0 || (now > deadline && ProgressEngine.calculateProjectProgress(project.id) < 100)) {
      return {
        color: 'red',
        label: `${overdueTasks.length} Task Overdue`,
        description: 'Ada task atau proyek yang melewati batas deadline.',
      };
    }

    const yellowTasks = tasks.filter((t) => this.getTaskIndicator(t).color === 'yellow');
    if (yellowTasks.length > 0) {
      return {
        color: 'yellow',
        label: `${yellowTasks.length} Sedikit Terlambat`,
        description: 'Beberapa task perlu pengawasan agar tidak terlambat.',
      };
    }

    return {
      color: 'green',
      label: 'On Track',
      description: 'Seluruh task berjalan sesuai jadwal.',
    };
  },

  /**
   * Helper: Total overdue tasks in system or project
   */
  countOverdueTasks(projectId?: string): number {
    const tasks = projectId ? StorageService.getProjectTasks(projectId) : StorageService.getTasks();
    const now = new Date();
    return tasks.filter((t) => now > new Date(t.deadline) && t.progres < 100).length;
  },

  /**
   * Helper: Tasks approaching deadline (within N days, default H-3)
   */
  getApproachingDeadlineTasks(days: number = 3, projectId?: string): Task[] {
    const tasks = projectId ? StorageService.getProjectTasks(projectId) : StorageService.getTasks();
    const now = new Date();
    const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return tasks.filter((t) => {
      const d = new Date(t.deadline);
      return d >= now && d <= threshold && t.progres < 100;
    });
  },

  /**
   * Helper: Average progress across active projects
   */
  getAverageActiveProjectsProgress(): number {
    const active = StorageService.getProjects().filter((p) => p.status === 'Aktif');
    if (active.length === 0) return 0;
    const total = active.reduce((acc, p) => acc + this.calculateProjectProgress(p.id), 0);
    return Math.round((total / active.length) * 10) / 10;
  },
};
