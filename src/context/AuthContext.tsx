import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { StorageService } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  allUsers: User[];
  login: (email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  isOwner: boolean;
  isAdmin: boolean;
  isPIC: boolean;
  canManageProjects: boolean;
  canManageTasks: boolean;
  canManageUsers: boolean;
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getActiveUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => StorageService.getUsers());

  const refreshUsers = () => {
    setAllUsers(StorageService.getUsers());
    setCurrentUser(StorageService.getActiveUser());
  };

  useEffect(() => {
    const unsub = StorageService.subscribe(() => {
      refreshUsers();
    });
    return unsub;
  }, []);

  const login = (email: string, password: string) => {
    const res = StorageService.login(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
    }
    return res;
  };

  const logout = () => {
    StorageService.logout();
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    StorageService.setActiveUser(userId);
    const u = StorageService.getUser(userId);
    if (u) setCurrentUser(u);
  };

  const isAuthenticated = !!currentUser && currentUser.aktif;
  const isOwner = currentUser?.role === 'Owner';
  const isAdmin = currentUser?.role === 'Admin';
  const isPIC = currentUser?.role === 'PIC';

  const canManageProjects = isAdmin;
  const canManageTasks = isAdmin;
  const canManageUsers = isAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        allUsers,
        login,
        logout,
        switchUser,
        isOwner,
        isAdmin,
        isPIC,
        canManageProjects,
        canManageTasks,
        canManageUsers,
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
