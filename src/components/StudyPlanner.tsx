import React, { useState, useEffect } from 'react';
import { TaskManager } from './TaskManager';
import { PomodoroTimer } from './PomodoroTimer';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { GamificationPanel } from './GamificationPanel';
import { ThemeToggle } from './ThemeToggle';
import { VoiceInput } from './VoiceInput';
import { SearchFilter } from './SearchFilter';
import { Calendar, BookOpen, Timer, BarChart3, Trophy, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface Task {
  id: string;
  title: string;
  subject: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number;
  deadline: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface StudySession {
  id: string;
  taskId?: string;
  subject: string;
  duration: number;
  date: string;
  type: 'focus' | 'break';
}

export interface UserStats {
  streak: number;
  tasksCompleted: number;
  totalStudyTime: number;
  badges: string[];
  lastActiveDate: string;
}

export const StudyPlanner = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    streak: 0,
    tasksCompleted: 0,
    totalStudyTime: 0,
    badges: [],
    lastActiveDate: new Date().toDateString(),
  });
  const [activeTab, setActiveTab] = useState('tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'due-today'>('all');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('study-planner-tasks');
    const savedSessions = localStorage.getItem('study-planner-sessions');
    const savedStats = localStorage.getItem('study-planner-stats');

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedSessions) setSessions(JSON.parse(savedSessions));
    if (savedStats) setUserStats(JSON.parse(savedStats));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('study-planner-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('study-planner-sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('study-planner-stats', JSON.stringify(userStats));
  }, [userStats]);

  const addTask = (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id 
        ? { ...task, ...updates, ...(updates.completed && !task.completed ? { completedAt: new Date().toISOString() } : {}) }
        : task
    ));

    // Update user stats if task completed
    if (updates.completed && !tasks.find(t => t.id === id)?.completed) {
      setUserStats(prev => ({
        ...prev,
        tasksCompleted: prev.tasksCompleted + 1,
      }));
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const addSession = (sessionData: Omit<StudySession, 'id' | 'date'>) => {
    const newSession: StudySession = {
      ...sessionData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    setSessions([...sessions, newSession]);
    
    // Update total study time
    if (sessionData.type === 'focus') {
      setUserStats(prev => ({
        ...prev,
        totalStudyTime: prev.totalStudyTime + sessionData.duration,
      }));
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (filterStatus) {
      case 'active':
        return matchesSearch && !task.completed;
      case 'completed':
        return matchesSearch && task.completed;
      case 'due-today':
        const today = new Date().toDateString();
        const taskDate = new Date(task.deadline).toDateString();
        return matchesSearch && taskDate === today && !task.completed;
      default:
        return matchesSearch;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-card m-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-primary">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient-primary">Smart Study Planner</h1>
              <p className="text-muted-foreground">Your AI-powered productivity companion</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <VoiceInput onTaskAdd={addTask} />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-6 pb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-card p-2 grid w-full grid-cols-4">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              Pomodoro
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6">
            <SearchFilter
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
            />
            <TaskManager
              tasks={filteredTasks}
              onAddTask={addTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          </TabsContent>

          <TabsContent value="timer">
            <PomodoroTimer onSessionComplete={addSession} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard tasks={tasks} sessions={sessions} />
          </TabsContent>

          <TabsContent value="achievements">
            <GamificationPanel userStats={userStats} tasks={tasks} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};