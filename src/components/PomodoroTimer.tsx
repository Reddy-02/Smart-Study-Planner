import React, { useState, useEffect, useCallback } from 'react';
import { StudySession } from './StudyPlanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, Square, Settings, Timer, Coffee, BookOpen } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PomodoroTimerProps {
  onSessionComplete: (session: Omit<StudySession, 'id' | 'date'>) => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onSessionComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [currentPhase, setCurrentPhase] = useState<'focus' | 'break'>('focus');
  const [sessionCount, setSessionCount] = useState(0);
  const [subject, setSubject] = useState('General Study');
  
  // Settings
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initialize timer with focus time
  useEffect(() => {
    setTimeLeft(settings.focusTime * 60);
  }, [settings.focusTime]);

  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = useCallback(() => {
    setIsRunning(false);
    
    // Record the completed session
    const sessionDuration = currentPhase === 'focus' 
      ? settings.focusTime 
      : sessionCount % settings.sessionsUntilLongBreak === 0 
        ? settings.longBreak 
        : settings.shortBreak;

    onSessionComplete({
      subject,
      duration: sessionDuration,
      type: currentPhase,
    });

    // Move to next phase
    if (currentPhase === 'focus') {
      setSessionCount(prev => prev + 1);
      const newSessionCount = sessionCount + 1;
      const isLongBreak = newSessionCount % settings.sessionsUntilLongBreak === 0;
      const breakDuration = isLongBreak ? settings.longBreak : settings.shortBreak;
      
      setCurrentPhase('break');
      setTimeLeft(breakDuration * 60);
    } else {
      setCurrentPhase('focus');
      setTimeLeft(settings.focusTime * 60);
    }

    // Play notification sound (optional)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        currentPhase === 'focus' ? 'Focus session complete!' : 'Break time over!',
        {
          body: currentPhase === 'focus' 
            ? 'Time for a break! You\'ve earned it.' 
            : 'Ready to get back to work?',
          icon: '/favicon.ico'
        }
      );
    }
  }, [currentPhase, sessionCount, settings, subject, onSessionComplete]);

  const startTimer = () => {
    setIsRunning(true);
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentPhase('focus');
    setTimeLeft(settings.focusTime * 60);
    setSessionCount(0);
  };

  const skipSession = () => {
    setTimeLeft(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalTime = () => {
    return currentPhase === 'focus' 
      ? settings.focusTime * 60 
      : sessionCount % settings.sessionsUntilLongBreak === 0 
        ? settings.longBreak * 60 
        : settings.shortBreak * 60;
  };

  const getProgress = () => {
    const total = getTotalTime();
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Timer Display */}
      <Card className="glass-card-hover text-center">
        <CardHeader>
          <div className="flex items-center justify-center gap-3 mb-4">
            {currentPhase === 'focus' ? (
              <BookOpen className="h-8 w-8 text-primary" />
            ) : (
              <Coffee className="h-8 w-8 text-accent" />
            )}
            <CardTitle className="text-2xl">
              {currentPhase === 'focus' ? 'Focus Time' : 'Break Time'}
            </CardTitle>
          </div>
          
          <div className="space-y-4">
            <div className="text-6xl font-mono font-bold text-gradient-primary">
              {formatTime(timeLeft)}
            </div>
            
            <Progress 
              value={getProgress()} 
              className="h-3" 
            />
            
            <div className="text-sm text-muted-foreground">
              Session {sessionCount + 1} • {subject}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex items-center justify-center gap-4 mb-6">
            {!isRunning ? (
              <Button 
                onClick={startTimer} 
                size="lg" 
                className="btn-hover-glow px-8"
              >
                <Play className="h-5 w-5 mr-2" />
                Start
              </Button>
            ) : (
              <Button 
                onClick={pauseTimer} 
                size="lg" 
                variant="outline" 
                className="px-8"
              >
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            )}
            
            <Button 
              onClick={resetTimer} 
              size="lg" 
              variant="outline"
            >
              <Square className="h-5 w-5 mr-2" />
              Reset
            </Button>
            
            <Button 
              onClick={skipSession} 
              size="lg" 
              variant="ghost"
              disabled={!isRunning}
            >
              Skip
            </Button>
          </div>

          {/* Subject Selection */}
          <div className="space-y-2">
            <Label htmlFor="subject">Current Subject</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General Study">General Study</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="History">History</SelectItem>
                <SelectItem value="Programming">Programming</SelectItem>
                <SelectItem value="Languages">Languages</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card text-center p-4">
          <div className="text-2xl font-bold text-primary">{sessionCount}</div>
          <div className="text-sm text-muted-foreground">Sessions Today</div>
        </Card>
        
        <Card className="glass-card text-center p-4">
          <div className="text-2xl font-bold text-accent">
            {Math.floor((sessionCount * settings.focusTime) / 60)}h {(sessionCount * settings.focusTime) % 60}m
          </div>
          <div className="text-sm text-muted-foreground">Focus Time</div>
        </Card>
        
        <Card className="glass-card text-center p-4">
          <div className="text-2xl font-bold text-success">
            {sessionCount > 0 ? Math.floor(sessionCount / settings.sessionsUntilLongBreak) : 0}
          </div>
          <div className="text-sm text-muted-foreground">Cycles Complete</div>
        </Card>
      </div>

      {/* Settings */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Timer Settings
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pomodoro Settings</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="focusTime">Focus Time (minutes)</Label>
                <Input
                  id="focusTime"
                  type="number"
                  value={settings.focusTime}
                  onChange={(e) => setSettings({
                    ...settings,
                    focusTime: parseInt(e.target.value) || 25
                  })}
                  min="1"
                  max="90"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shortBreak">Short Break (minutes)</Label>
                <Input
                  id="shortBreak"
                  type="number"
                  value={settings.shortBreak}
                  onChange={(e) => setSettings({
                    ...settings,
                    shortBreak: parseInt(e.target.value) || 5
                  })}
                  min="1"
                  max="30"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="longBreak">Long Break (minutes)</Label>
                <Input
                  id="longBreak"
                  type="number"
                  value={settings.longBreak}
                  onChange={(e) => setSettings({
                    ...settings,
                    longBreak: parseInt(e.target.value) || 15
                  })}
                  min="1"
                  max="60"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cycles">Sessions until Long Break</Label>
                <Input
                  id="cycles"
                  type="number"
                  value={settings.sessionsUntilLongBreak}
                  onChange={(e) => setSettings({
                    ...settings,
                    sessionsUntilLongBreak: parseInt(e.target.value) || 4
                  })}
                  min="2"
                  max="8"
                />
              </div>
            </div>
            
            <Button 
              onClick={() => setIsSettingsOpen(false)} 
              className="w-full"
            >
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};