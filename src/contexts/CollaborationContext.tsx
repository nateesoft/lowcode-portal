import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CollaborativeUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  isOnline: boolean;
  lastSeen: Date;
  cursor?: {
    x: number;
    y: number;
  };
  currentNode?: string;
}

interface CollaborationContextType {
  users: CollaborativeUser[];
  currentUser: CollaborativeUser | null;
  isCollaborativeMode: boolean;
  addUser: (user: CollaborativeUser) => void;
  removeUser: (userId: string) => void;
  updateUserCursor: (userId: string, position: { x: number; y: number }) => void;
  updateUserNode: (userId: string, nodeId?: string) => void;
  setCollaborativeMode: (enabled: boolean) => void;
  generateDemoUsers: () => void;
}

const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};

interface CollaborationProviderProps {
  children: ReactNode;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<CollaborativeUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CollaborativeUser | null>(null);
  const [isCollaborativeMode, setIsCollaborativeMode] = useState(false);

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  useEffect(() => {
    // Initialize current user
    const user: CollaborativeUser = {
      id: 'current-user',
      name: 'You',
      email: 'user@example.com',
      color: colors[0],
      isOnline: true,
      lastSeen: new Date()
    };
    setCurrentUser(user);
  }, []);

  const addUser = (user: CollaborativeUser) => {
    setUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
  };

  const removeUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const updateUserCursor = (userId: string, position: { x: number; y: number }) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, cursor: position, lastSeen: new Date() }
        : user
    ));
  };

  const updateUserNode = (userId: string, nodeId?: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, currentNode: nodeId, lastSeen: new Date() }
        : user
    ));
  };

  const setCollaborativeMode = (enabled: boolean) => {
    setIsCollaborativeMode(enabled);
    if (!enabled) {
      setUsers([]);
    }
  };

  const generateDemoUsers = () => {
    const demoUsers: CollaborativeUser[] = [
      {
        id: 'user-1',
        name: 'Sarah Chen',
        email: 'sarah.chen@company.com',
        color: colors[1],
        isOnline: true,
        lastSeen: new Date(),
        cursor: { x: 200, y: 150 }
      },
      {
        id: 'user-2', 
        name: 'Mike Johnson',
        email: 'mike.j@company.com',
        color: colors[2],
        isOnline: true,
        lastSeen: new Date(Date.now() - 30000), // 30 seconds ago
        currentNode: 'node-1'
      },
      {
        id: 'user-3',
        name: 'Anna Rodriguez',
        email: 'anna.r@company.com',
        color: colors[3],
        isOnline: true,
        lastSeen: new Date(Date.now() - 120000), // 2 minutes ago
        cursor: { x: 450, y: 300 }
      },
      {
        id: 'user-4',
        name: 'David Kim',
        email: 'david.kim@company.com', 
        color: colors[4],
        isOnline: false,
        lastSeen: new Date(Date.now() - 600000) // 10 minutes ago
      }
    ];

    setUsers(demoUsers);
    setIsCollaborativeMode(true);

    // Simulate cursor movements
    const interval = setInterval(() => {
      setUsers(prev => prev.map(user => {
        if (user.isOnline && Math.random() > 0.7) {
          return {
            ...user,
            cursor: {
              x: Math.random() * 800 + 100,
              y: Math.random() * 400 + 100
            },
            lastSeen: new Date()
          };
        }
        return user;
      }));
    }, 3000);

    // Cleanup interval after 30 seconds for demo
    setTimeout(() => clearInterval(interval), 30000);
  };

  const value: CollaborationContextType = {
    users,
    currentUser,
    isCollaborativeMode,
    addUser,
    removeUser,
    updateUserCursor,
    updateUserNode,
    setCollaborativeMode,
    generateDemoUsers
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};