import React from 'react';
import { Task, UserStats } from './StudyPlanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Star, Target, Clock, BookOpen, Zap, Award, Crown, Medal } from 'lucide-react';

interface GamificationPanelProps {
  userStats: UserStats;
  tasks: Task[];
}

export const GamificationPanel: React.FC<GamificationPanelProps> = ({ userStats, tasks }) => {
  const completedTasks = tasks.filter(task => task.completed);
  const todayCompletedTasks = completedTasks.filter(task => {
    if (!task.completedAt) return false;
    const today = new Date().toDateString();
    const taskDate = new Date(task.completedAt).toDateString();
    return today === taskDate;
  });

  // Calculate current streak
  const calculateStreak = () => {
    const sortedCompletedTasks = completedTasks
      .filter(task => task.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime());

    if (sortedCompletedTasks.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const task of sortedCompletedTasks) {
      const taskDate = new Date(task.completedAt!);
      taskDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor((currentDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === streak) {
        streak++;
      } else if (dayDiff === streak + 1) {
        // Gap of one day, but check if there was activity on that day
        continue;
      } else {
        break;
      }
    }

    return streak;
  };

  const currentStreak = calculateStreak();

  // Define achievement system
  const achievements = [
    {
      id: 'first-task',
      title: 'Getting Started',
      description: 'Complete your first task',
      icon: Star,
      requirement: 1,
      current: completedTasks.length,
      unlocked: completedTasks.length >= 1,
      color: 'text-yellow-500',
    },
    {
      id: 'task-master',
      title: 'Task Master',
      description: 'Complete 10 tasks',
      icon: Target,
      requirement: 10,
      current: completedTasks.length,
      unlocked: completedTasks.length >= 10,
      color: 'text-blue-500',
    },
    {
      id: 'dedicated-learner',
      title: 'Dedicated Learner',
      description: 'Complete 25 tasks',
      icon: BookOpen,
      requirement: 25,
      current: completedTasks.length,
      unlocked: completedTasks.length >= 25,
      color: 'text-green-500',
    },
    {
      id: 'productivity-guru',
      title: 'Productivity Guru',
      description: 'Complete 50 tasks',
      icon: Crown,
      requirement: 50,
      current: completedTasks.length,
      unlocked: completedTasks.length >= 50,
      color: 'text-purple-500',
    },
    {
      id: 'streak-starter',
      title: 'Streak Starter',
      description: 'Maintain a 3-day streak',
      icon: Flame,
      requirement: 3,
      current: currentStreak,
      unlocked: currentStreak >= 3,
      color: 'text-orange-500',
    },
    {
      id: 'streak-keeper',
      title: 'Streak Keeper',
      description: 'Maintain a 7-day streak',
      icon: Zap,
      requirement: 7,
      current: currentStreak,
      unlocked: currentStreak >= 7,
      color: 'text-red-500',
    },
    {
      id: 'streak-legend',
      title: 'Streak Legend',
      description: 'Maintain a 30-day streak',
      icon: Medal,
      requirement: 30,
      current: currentStreak,
      unlocked: currentStreak >= 30,
      color: 'text-indigo-500',
    },
    {
      id: 'daily-grinder',
      title: 'Daily Grinder',
      description: 'Complete 5 tasks in one day',
      icon: Award,
      requirement: 5,
      current: todayCompletedTasks.length,
      unlocked: todayCompletedTasks.length >= 5,
      color: 'text-pink-500',
    },
  ];

  const unlockedAchievements = achievements.filter(achievement => achievement.unlocked);
  const nextAchievements = achievements
    .filter(achievement => !achievement.unlocked)
    .sort((a, b) => (a.requirement - a.current) - (b.requirement - b.current))
    .slice(0, 3);

  // Calculate level based on completed tasks
  const getLevel = (tasksCompleted: number) => {
    return Math.floor(tasksCompleted / 5) + 1;
  };

  const currentLevel = getLevel(completedTasks.length);
  const tasksForNextLevel = (currentLevel * 5) - completedTasks.length;
  const levelProgress = ((completedTasks.length % 5) / 5) * 100;

  return (
    <div className="space-y-6">
      {/* User Level & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-primary">
                <Crown className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gradient-primary mb-2">
              Level {currentLevel}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {tasksForNextLevel > 0 ? `${tasksForNextLevel} tasks to level ${currentLevel + 1}` : 'Max level!'}
            </p>
            <Progress value={levelProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-hero">
                <Flame className="h-8 w-8 text-white animate-glow" />
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-500 mb-2">
              {currentStreak}
            </div>
            <p className="text-sm text-muted-foreground">
              Day Streak 🔥
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 rounded-full bg-success/20">
                <Trophy className="h-8 w-8 text-success" />
              </div>
            </div>
            <div className="text-3xl font-bold text-success mb-2">
              {unlockedAchievements.length}
            </div>
            <p className="text-sm text-muted-foreground">
              Achievements Unlocked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <div className="space-y-6">
        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-success" />
                Unlocked Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className="glass-card p-4 text-center animate-slide-up"
                    >
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 rounded-full bg-success/20">
                          <Icon className={`h-6 w-6 ${achievement.color}`} />
                        </div>
                      </div>
                      <h3 className="font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {achievement.description}
                      </p>
                      <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                        Unlocked ✓
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Achievements */}
        {nextAchievements.length > 0 && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Next Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nextAchievements.map((achievement) => {
                  const Icon = achievement.icon;
                  const progressPercent = (achievement.current / achievement.requirement) * 100;
                  
                  return (
                    <div
                      key={achievement.id}
                      className="glass-card p-4 text-center opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-3 rounded-full bg-muted/20">
                          <Icon className={`h-6 w-6 ${achievement.color} opacity-50`} />
                        </div>
                      </div>
                      <h3 className="font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        {achievement.description}
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>{achievement.current}</span>
                          <span>{achievement.requirement}</span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                        <Badge variant="outline" className="text-xs">
                          {achievement.requirement - achievement.current} more to go
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Daily Stats */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Today's Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {todayCompletedTasks.length}
                </div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-accent mb-1">
                  {currentStreak}
                </div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-success mb-1">
                  {Math.round((completedTasks.length / Math.max(tasks.length, 1)) * 100)}%
                </div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Motivational Message */}
        <Card className="glass-card text-center bg-gradient-primary text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-center mb-4">
              <Star className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {currentStreak > 0 
                ? `Amazing! You're on a ${currentStreak}-day streak! 🔥`
                : completedTasks.length > 0
                ? "Great job on your progress! Keep it up! 💪"
                : "Ready to start your learning journey? 🚀"
              }
            </h3>
            <p className="opacity-90">
              {completedTasks.length === 0
                ? "Complete your first task to start earning achievements!"
                : `You've completed ${completedTasks.length} tasks. Every step counts towards your goals!`
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};