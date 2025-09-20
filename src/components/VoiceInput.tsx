import React, { useState, useRef, useEffect } from 'react';
import { Task } from './StudyPlanner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VoiceInputProps {
  onTaskAdd: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTaskAdd }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        // Process final transcript
        if (finalTranscript) {
          processVoiceCommand(finalTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = 'Speech recognition error occurred.';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available. Please check permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permissions.';
            break;
          case 'network':
            errorMessage = 'Network error occurred during speech recognition.';
            break;
        }
        
        toast({
          title: "Voice Input Error",
          description: errorMessage,
          variant: "destructive",
        });
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const processVoiceCommand = (command: string) => {
    try {
      // Parse voice command to extract task details
      const parsedTask = parseTaskFromVoice(command);
      
      if (parsedTask) {
        onTaskAdd(parsedTask);
        setTranscript('');
        
        toast({
          title: "Task Added Successfully!",
          description: `"${parsedTask.title}" has been added to your task list.`,
        });
      } else {
        toast({
          title: "Could not understand command",
          description: "Try saying something like: 'Add task study math with high priority due tomorrow'",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      toast({
        title: "Error Processing Command",
        description: "There was an error processing your voice command. Please try again.",
        variant: "destructive",
      });
    }
  };

  const parseTaskFromVoice = (command: string): Omit<Task, 'id' | 'completed' | 'createdAt'> | null => {
    const lowerCommand = command.toLowerCase();
    
    // Check if it's a task creation command
    const taskKeywords = ['add task', 'create task', 'new task', 'task'];
    const isTaskCommand = taskKeywords.some(keyword => lowerCommand.includes(keyword));
    
    if (!isTaskCommand) {
      return null;
    }

    // Extract task title (everything after task keywords and before other keywords)
    let title = command;
    taskKeywords.forEach(keyword => {
      if (lowerCommand.includes(keyword)) {
        title = command.substring(command.toLowerCase().indexOf(keyword) + keyword.length).trim();
      }
    });

    // Extract priority
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (lowerCommand.includes('high priority') || lowerCommand.includes('urgent') || lowerCommand.includes('important')) {
      priority = 'high';
      title = title.replace(/\b(high priority|urgent|important)\b/gi, '').trim();
    } else if (lowerCommand.includes('low priority') || lowerCommand.includes('low')) {
      priority = 'low';
      title = title.replace(/\b(low priority|low)\b/gi, '').trim();
    }

    // Extract subject
    let subject = 'General Study';
    const subjects = ['math', 'mathematics', 'science', 'physics', 'chemistry', 'biology', 'english', 'history', 'programming', 'coding', 'language'];
    for (const sub of subjects) {
      if (lowerCommand.includes(sub)) {
        subject = sub.charAt(0).toUpperCase() + sub.slice(1);
        title = title.replace(new RegExp(`\\b${sub}\\b`, 'gi'), '').trim();
        break;
      }
    }

    // Extract deadline
    let deadline = new Date();
    deadline.setDate(deadline.getDate() + 1); // Default to tomorrow
    
    if (lowerCommand.includes('today')) {
      deadline = new Date();
      title = title.replace(/\btoday\b/gi, '').trim();
    } else if (lowerCommand.includes('tomorrow')) {
      deadline = new Date();
      deadline.setDate(deadline.getDate() + 1);
      title = title.replace(/\btomorrow\b/gi, '').trim();
    } else if (lowerCommand.includes('next week')) {
      deadline = new Date();
      deadline.setDate(deadline.getDate() + 7);
      title = title.replace(/\bnext week\b/gi, '').trim();
    }

    // Extract estimated time
    let estimatedTime = 30; // Default 30 minutes
    const timeMatch = lowerCommand.match(/(\d+)\s*(minutes?|mins?|hours?|hrs?)/);
    if (timeMatch) {
      const value = parseInt(timeMatch[1]);
      const unit = timeMatch[2];
      if (unit.includes('hour') || unit.includes('hr')) {
        estimatedTime = value * 60;
      } else {
        estimatedTime = value;
      }
      title = title.replace(new RegExp(timeMatch[0], 'gi'), '').trim();
    }

    // Clean up title
    title = title.replace(/\b(with|for|due|in)\b/gi, '').trim();
    title = title.replace(/\s+/g, ' ').trim();

    if (!title || title.length < 2) {
      return null;
    }

    return {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      subject,
      priority,
      estimatedTime,
      deadline: deadline.toISOString().split('T')[0],
      notes: `Added via voice input: "${command}"`,
    };
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      recognitionRef.current.start();
      
      toast({
        title: "Voice Input Active",
        description: "Listening... Try saying: 'Add task study math with high priority due tomorrow'",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return (
      <Button variant="outline" disabled className="opacity-50">
        <MicOff className="h-4 w-4 mr-2" />
        Voice Not Supported
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isListening ? "destructive" : "outline"}
        size="icon"
        onClick={isListening ? stopListening : startListening}
        className={`glass-card-hover btn-hover-scale ${isListening ? 'animate-pulse' : ''}`}
        aria-label={isListening ? "Stop voice input" : "Start voice input"}
      >
        {isListening ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
      
      {isListening && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="animate-pulse">
            <Volume2 className="h-3 w-3 mr-1" />
            Listening...
          </Badge>
          {transcript && (
            <Badge variant="secondary" className="max-w-xs truncate">
              {transcript}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};