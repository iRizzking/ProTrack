import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { OwnerDashboard } from './components/dashboard/OwnerDashboard';
import { ProjectList } from './components/projects/ProjectList';
import { ProjectDetail } from './components/projects/ProjectDetail';
import { MyTasks } from './components/tasks/MyTasks';
import { UserManagement } from './components/admin/UserManagement';

const AppContent: React.FC = () => {
  const { currentUser, isPIC } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>(() => (isPIC ? 'my-tasks' : 'dashboard'));
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If not logged in, show clean Login Page
  if (!currentUser || !currentUser.aktif) {
    return <LoginPage />;
  }

  // When clicking on a project card
  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const handleBackFromProject = () => {
    setSelectedProjectId(null);
  };

  const handleSelectTab = (tab: string) => {
    setCurrentTab(tab);
    setSelectedProjectId(null);
  };

  // Render main screen
  const renderContent = () => {
    // If a project detail is currently open
    if (selectedProjectId) {
      return (
        <ProjectDetail
          projectId={selectedProjectId}
          onBack={handleBackFromProject}
        />
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return <OwnerDashboard onSelectProject={handleSelectProject} />;
      case 'projects':
        return <ProjectList onSelectProject={handleSelectProject} />;
      case 'my-tasks':
        return <MyTasks />;
      case 'users':
        return <UserManagement />;
      default:
        return <OwnerDashboard onSelectProject={handleSelectProject} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar navigation */}
      <Sidebar
        currentTab={selectedProjectId ? 'projects' : currentTab}
        onSelectTab={handleSelectTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
