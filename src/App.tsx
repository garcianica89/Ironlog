import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ActiveTab,
  Exercise,
  Routine,
  SessionExercise,
  WorkoutSession,
  WorkoutSet
} from './types/workout';
import {
  loadActiveSession,
  loadExercises,
  loadRoutines,
  loadSettings,
  loadWorkoutHistory,
  saveActiveSession,
  saveExercises,
  saveRoutines,
  saveSettings,
  saveWorkoutHistory,
  AppSettings
} from './services/storage';
import { DEFAULT_EXERCISES } from './data/exerciseCatalog';
import { DEFAULT_ROUTINES, INITIAL_SAMPLE_HISTORY } from './data/defaultRoutines';
import { Navigation } from './components/Navigation';
import { WorkoutActive } from './components/WorkoutActive';
import { RoutineManager } from './components/RoutineManager';
import { ProgressCharts } from './components/ProgressCharts';
import { WorkoutHistory } from './components/WorkoutHistory';
import { CalendarDayPicker } from './components/CalendarDayPicker';
import { ToolsSettings } from './components/ToolsSettings';
import { RestTimer } from './components/RestTimer';
import { PlateCalculatorModal } from './components/PlateCalculatorModal';
import { ExerciseSelectorModal } from './components/ExerciseSelectorModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { InstallPromptBanner } from './components/InstallPromptBanner';
import { WifiOff, Smartphone, Calendar, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('hoy');
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [exercises, setExercises] = useState<Exercise[]>(loadExercises);
  const [routines, setRoutines] = useState<Routine[]>(loadRoutines);
  const [history, setHistory] = useState<WorkoutSession[]>(loadWorkoutHistory);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(loadActiveSession);

  // Modals & Floating Components
  const [isPlateCalcOpen, setIsPlateCalcOpen] = useState(false);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);
  const [isExerciseSelectorOpen, setIsExerciseSelectorOpen] = useState(false);
  const [exerciseSelectCallback, setExerciseSelectCallback] = useState<((ex: Exercise) => void) | null>(null);

  // Rest Timer State
  const [isRestTimerOpen, setIsRestTimerOpen] = useState(false);
  const [restTimerSeconds, setRestTimerSeconds] = useState(90);

  // Online / Offline Status
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // PWA hook
  const { isInstalled: isPWAInstalled } = usePWAInstall();

  // Save active session automatically
  useEffect(() => {
    saveActiveSession(activeSession);
  }, [activeSession]);

  // Online/Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update Settings
  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Update Routines
  const handleSaveRoutines = (newRoutines: Routine[]) => {
    setRoutines(newRoutines);
    saveRoutines(newRoutines);
  };

  // Add custom exercise
  const handleAddCustomExercise = (newEx: Omit<Exercise, 'id'>): Exercise => {
    const ex: Exercise = {
      ...newEx,
      id: `custom-ex-${Date.now()}`,
    };
    const updated = [ex, ...exercises];
    setExercises(updated);
    saveExercises(updated);
    return ex;
  };

  // Start rest timer
  const handleStartRestTimer = (seconds: number) => {
    setRestTimerSeconds(seconds);
    setIsRestTimerOpen(true);
  };

  // Open Exercise selector for active session
  const handleOpenExerciseSelectorForSession = () => {
    setExerciseSelectCallback(() => (selected: Exercise) => {
      if (!activeSession) return;
      const newSessionExercise: SessionExercise = {
        id: `se-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        exerciseId: selected.id,
        exerciseName: selected.name,
        muscleGroup: selected.muscleGroup,
        order: activeSession.exercises.length + 1,
        sets: [
          {
            id: `s-${Date.now()}-1`,
            setNumber: 1,
            type: 'normal',
            weightKg: 20,
            reps: 10,
            completed: false,
          },
          {
            id: `s-${Date.now()}-2`,
            setNumber: 2,
            type: 'normal',
            weightKg: 20,
            reps: 10,
            completed: false,
          },
          {
            id: `s-${Date.now()}-3`,
            setNumber: 3,
            type: 'normal',
            weightKg: 20,
            reps: 10,
            completed: false,
          },
        ],
      };
      setActiveSession({
        ...activeSession,
        exercises: [...activeSession.exercises, newSessionExercise],
      });
    });
    setIsExerciseSelectorOpen(true);
  };

  // Open Exercise selector for Routine Builder
  const handleOpenExerciseSelectorForRoutine = (callback: (ex: Exercise) => void) => {
    setExerciseSelectCallback(() => callback);
    setIsExerciseSelectorOpen(true);
  };

  // Start a routine today
  const handleStartRoutineToday = (routine: Routine) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const sessionExercises: SessionExercise[] = routine.exercises.map((re, idx) => {
      const catalogEx = exercises.find((e) => e.id === re.exerciseId);
      const exerciseName = re.exerciseName || catalogEx?.name || 'Ejercicio';
      const muscleGroup = catalogEx ? catalogEx.muscleGroup : 'pecho';

      const sets: WorkoutSet[] = [];
      const numSets = re.defaultSets || 3;

      for (let i = 1; i <= numSets; i++) {
        sets.push({
          id: `set-${Date.now()}-${idx}-${i}`,
          setNumber: i,
          type: 'normal',
          weightKg: re.targetWeight || 0,
          reps: 10,
          completed: false,
        });
      }

      return {
        id: `se-${Date.now()}-${idx}`,
        exerciseId: re.exerciseId,
        exerciseName,
        muscleGroup,
        order: idx + 1,
        sets,
      };
    });

    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      date: todayStr,
      name: routine.name,
      routineId: routine.id,
      completed: false,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exercises: sessionExercises,
    };

    setActiveSession(newSession);
    setActiveTab('hoy');
  };

  // Finish and save completed workout
  const handleFinishSession = (sessionToFinish: WorkoutSession) => {
    const completedSession: WorkoutSession = {
      ...sessionToFinish,
      completed: true,
      endTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [completedSession, ...history];
    setHistory(newHistory);
    saveWorkoutHistory(newHistory);

    // Clear active session
    setActiveSession(null);
    saveActiveSession(null);

    // Big Confetti Celebration
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });

    // Navigate to charts so user instantly sees new progress!
    setActiveTab('graficas');
  };

  // Repeat past session
  const handleRepeatSession = (pastSession: WorkoutSession) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const clonedExercises: SessionExercise[] = pastSession.exercises.map((ex, idx) => ({
      id: `se-${Date.now()}-${idx}`,
      exerciseId: ex.exerciseId,
      exerciseName: ex.exerciseName,
      muscleGroup: ex.muscleGroup,
      order: idx + 1,
      sets: ex.sets.map((s, sIdx) => ({
        id: `s-${Date.now()}-${idx}-${sIdx}`,
        setNumber: s.setNumber,
        type: s.type,
        weightKg: s.weightKg,
        reps: s.reps,
        completed: false,
        previousWeight: s.weightKg,
        previousReps: s.reps,
      })),
    }));

    const newSession: WorkoutSession = {
      id: `session-${Date.now()}`,
      date: todayStr,
      name: pastSession.name,
      routineId: pastSession.routineId,
      completed: false,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exercises: clonedExercises,
    };

    setActiveSession(newSession);
    setActiveTab('hoy');
  };

  // Delete past session
  const handleDeleteSession = (sessionId: string) => {
    const updated = history.filter((s) => s.id !== sessionId);
    setHistory(updated);
    saveWorkoutHistory(updated);
  };

  // Move past session date
  const handleMoveSessionDate = (sessionId: string, newDate: string) => {
    const updated = history.map((s) => (s.id === sessionId ? { ...s, date: newDate } : s));
    setHistory(updated);
    saveWorkoutHistory(updated);
  };

  // Select date to train from Calendar
  const handleSelectDateToTrain = (dateStr: string) => {
    // If there's an active session, update its date
    if (activeSession) {
      setActiveSession({ ...activeSession, date: dateStr });
    } else {
      // Create empty session with this date
      const newSession: WorkoutSession = {
        id: `session-${Date.now()}`,
        date: dateStr,
        name: 'Entrenamiento Libre',
        completed: false,
        startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        exercises: [],
      };
      setActiveSession(newSession);
    }
    setActiveTab('hoy');
  };

  // Reset demo data
  const handleResetData = () => {
    setExercises(DEFAULT_EXERCISES);
    saveExercises(DEFAULT_EXERCISES);
    setRoutines(DEFAULT_ROUTINES);
    saveRoutines(DEFAULT_ROUTINES);
    setHistory(INITIAL_SAMPLE_HISTORY);
    saveWorkoutHistory(INITIAL_SAMPLE_HISTORY);
    setActiveSession(null);
    saveActiveSession(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Mobile Install Prompt Banner */}
      <InstallPromptBanner onOpenModal={() => setIsPWAInstallOpen(true)} />

      {/* Top Header & Navigation */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenPWAInstall={() => setIsPWAInstallOpen(true)}
        isPWAInstalled={isPWAInstalled}
        hasActiveSession={!!activeSession}
      />

      {/* Offline gym indicator */}
      {!isOnline && (
        <div className="bg-amber-500/90 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Modo Sin Conexión — Tus datos se guardan de forma segura en este celular.</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-5 pb-10">
        {activeTab === 'hoy' && (
          <WorkoutActive
            session={activeSession}
            onUpdateSession={setActiveSession}
            onFinishSession={handleFinishSession}
            routines={routines}
            exercisesCatalog={exercises}
            history={history}
            unit={settings.unit}
            onOpenExerciseSelector={handleOpenExerciseSelectorForSession}
            onStartRestTimer={handleStartRestTimer}
            soundEnabled={settings.soundEnabled}
          />
        )}

        {activeTab === 'rutinas' && (
          <RoutineManager
            routines={routines}
            onSaveRoutines={handleSaveRoutines}
            onStartRoutineToday={handleStartRoutineToday}
            exercisesCatalog={exercises}
            onAddMultipleExercises={(newExs) => {
              const updated = [...newExs, ...exercises];
              setExercises(updated);
              saveExercises(updated);
            }}
            onOpenExerciseSelectorForRoutine={handleOpenExerciseSelectorForRoutine}
          />
        )}

        {activeTab === 'historial' && (
          <div className="space-y-6">
            {/* Embedded Calendar Day Mover & History */}
            <CalendarDayPicker
              history={history}
              onSelectDateToTrain={handleSelectDateToTrain}
              onMoveWorkoutSession={handleMoveSessionDate}
              unit={settings.unit}
            />

            <WorkoutHistory
              history={history}
              onRepeatSession={handleRepeatSession}
              onDeleteSession={handleDeleteSession}
              onMoveSessionDate={handleMoveSessionDate}
              unit={settings.unit}
            />
          </div>
        )}

        {activeTab === 'graficas' && (
          <ProgressCharts
            history={history}
            exercisesCatalog={exercises}
            unit={settings.unit}
          />
        )}

        {activeTab === 'herramientas' && (
          <ToolsSettings
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onOpenPlateCalculator={() => setIsPlateCalcOpen(true)}
            onOpenPWAInstall={() => setIsPWAInstallOpen(true)}
            onResetData={handleResetData}
            isPWAInstalled={isPWAInstalled}
          />
        )}
      </main>

      {/* Floating Rest Timer */}
      <RestTimer
        initialSeconds={restTimerSeconds}
        isOpen={isRestTimerOpen}
        onClose={() => setIsRestTimerOpen(false)}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() =>
          handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })
        }
      />

      {/* Plate Calculator Modal */}
      <PlateCalculatorModal
        isOpen={isPlateCalcOpen}
        onClose={() => setIsPlateCalcOpen(false)}
        unit={settings.unit}
      />

      {/* Exercise Selector Modal */}
      <ExerciseSelectorModal
        isOpen={isExerciseSelectorOpen}
        onClose={() => {
          setIsExerciseSelectorOpen(false);
          setExerciseSelectCallback(null);
        }}
        exercises={exercises}
        onSelectExercise={(ex) => {
          if (exerciseSelectCallback) {
            exerciseSelectCallback(ex);
          }
        }}
        onAddCustomExercise={handleAddCustomExercise}
      />

      {/* PWA Install Modal */}
      <PWAInstallModal
        isOpen={isPWAInstallOpen}
        onClose={() => setIsPWAInstallOpen(false)}
      />
    </div>
  );
}
