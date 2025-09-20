import React from 'react';
import { Task, StudySession } from './StudyPlanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Clock, CheckCircle, Target, Calendar, BookOpen } from 'lucide-react';

interface AnalyticsDashboardProps {
  tasks: Task[];
  sessions: StudySession[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ tasks, sessions }) => {
  // Calculate task statistics
  const completedTasks = tasks.filter(task => task.completed);
  const activeTasks = tasks.filter(task => !task.completed);
  const overdueTasks = activeTasks.filter(task => new Date(task.deadline) < new Date());
  
  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 50;

  // Pie chart data for task distribution
  const taskDistributionData = [
    { name: 'Completed', value: completedTasks.length, color: 'hsl(var(--success))' },
    { name: 'Active', value: activeTasks.length - overdueTasks.length, color: 'hsl(var(--primary))' },
    { name: 'Overdue', value: overdueTasks.length, color: 'hsl(var(--destructive))' },
  ].filter(item => item.value > 0);

  // Calculate time spent per subject
  const subjectTimeData = sessions
    .filter(session => session.type === 'focus')
    .reduce((acc, session) => {
      const subject = session.subject;
      acc[subject] = (acc[subject] || 0) + session.duration;
      return acc;
    }, {} as Record<string, number>);

  const subjectChartData = Object.entries(subjectTimeData).map(([subject, time]) => ({
    subject,
    time: Math.round(time / 60), // Convert to hours
    timeFormatted: `${Math.floor(time / 60)}h ${time % 60}m`,
  }));

  // Calculate weekly progress
  const getWeeklyData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTasks = tasks.filter(task => 
        task.completedAt && task.completedAt.split('T')[0] === date
      );
      const dayTime = sessions
        .filter(session => 
          session.type === 'focus' && session.date.split('T')[0] === date
        )
        .reduce((total, session) => total + session.duration, 0);

      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        tasks: dayTasks.length,
        time: Math.round(dayTime / 60), // Convert to hours
      };
    });
  };

  const weeklyData = getWeeklyData();

  // Calculate total study time
  const totalStudyTime = sessions
    .filter(session => session.type === 'focus')
    .reduce((total, session) => total + session.duration, 0);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const COLORS = [
    'hsl(var(--success))',
    'hsl(var(--primary))',
    'hsl(var(--destructive))',
    'hsl(var(--warning))',
    'hsl(var(--accent))',
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{completedTasks.length}</div>
                <p className="text-sm text-muted-foreground">Tasks Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{activeTasks.length}</div>
                <p className="text-sm text-muted-foreground">Active Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">{formatTime(totalStudyTime)}</div>
                <p className="text-sm text-muted-foreground">Total Study Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(completionRate)}%</div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tasks Completed</span>
              <span>{completedTasks.length} / {tasks.length}</span>
            </div>
            <Progress value={completionRate} className="h-3" />
            <p className="text-xs text-muted-foreground">
              {Math.round(completionRate)}% of your tasks are complete
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Distribution Pie Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Task Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {taskDistributionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No task data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subject Time Bar Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Time per Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subjectChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      subjectChartData.find(d => d.time === value)?.timeFormatted || `${value}h`,
                      'Study Time'
                    ]}
                  />
                  <Bar 
                    dataKey="time" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No study session data available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress Line Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Bar 
                yAxisId="left"
                dataKey="tasks" 
                fill="hsl(var(--accent))" 
                name="Tasks Completed"
                opacity={0.7}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="time" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                name="Study Hours"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};