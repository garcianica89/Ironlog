import { Routine, WorkoutSession } from '../types/workout';

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'routine-lunes-pecho-biceps',
    name: 'Lunes: Pecho y Bíceps',
    description: 'Enfoque en pecho con máquinas y mancuernas, más aislamiento de bíceps.',
    muscleGroups: ['pecho', 'biceps'],
    assignedDays: [1], // Lunes
    exercises: [
      { exerciseId: 'press-pecho-maquina', exerciseName: 'Press de pecho en máquina', defaultSets: 3, targetReps: '8-12', targetWeight: 60 },
      { exerciseId: 'press-inclinado-mancuernas', exerciseName: 'Press inclinado con mancuernas', defaultSets: 3, targetReps: '8-12', targetWeight: 24 },
      { exerciseId: 'aperturas-maquina', exerciseName: 'Aperturas en máquina', defaultSets: 2, targetReps: '12-15', targetWeight: 45 },
      { exerciseId: 'curl-biceps-barra-z', exerciseName: 'Curl de bíceps con barra Z', defaultSets: 3, targetReps: '10-12', targetWeight: 30 },
      { exerciseId: 'curl-martillo', exerciseName: 'Curl martillo con mancuernas', defaultSets: 2, targetReps: '10-12', targetWeight: 14 },
    ],
  },
  {
    id: 'routine-martes-espalda-triceps',
    name: 'Martes: Espalda y Tríceps',
    description: 'Tracciones para amplitud y densidad de espalda, más tríceps en polea.',
    muscleGroups: ['espalda', 'triceps'],
    assignedDays: [2], // Martes
    exercises: [
      { exerciseId: 'jalon-al-pecho', exerciseName: 'Jalón al pecho', defaultSets: 3, targetReps: '8-12', targetWeight: 55 },
      { exerciseId: 'remo-gironda', exerciseName: 'Remo sentado en polea', defaultSets: 3, targetReps: '8-12', targetWeight: 50 },
      { exerciseId: 'remo-pecho-apoyado', exerciseName: 'Remo con pecho apoyado', defaultSets: 2, targetReps: '10-12', targetWeight: 45 },
      { exerciseId: 'extensiones-triceps-polea', exerciseName: 'Extensión de tríceps en polea', defaultSets: 3, targetReps: '10-12', targetWeight: 25 },
      { exerciseId: 'extension-triceps-trasnuca', exerciseName: 'Extensión de tríceps por encima de la cabeza', defaultSets: 2, targetReps: '10-12', targetWeight: 20 },
    ],
  },
  {
    id: 'routine-miercoles-piernas',
    name: 'Miércoles: Cuádriceps y Piernas',
    description: 'Fuerza e hipertrofia de tren inferior, cuádriceps, femoral y gemelos.',
    muscleGroups: ['cuadriceps', 'isquios', 'pantorrillas'],
    assignedDays: [3], // Miércoles
    exercises: [
      { exerciseId: 'prensa-piernas', exerciseName: 'Prensa de piernas', defaultSets: 3, targetReps: '8-12', targetWeight: 160 },
      { exerciseId: 'sentadilla-hack', exerciseName: 'Sentadilla hack o guiada', defaultSets: 2, targetReps: '8-12', targetWeight: 80 },
      { exerciseId: 'extensiones-cuadriceps', exerciseName: 'Extensión de cuádriceps', defaultSets: 3, targetReps: '10-15', targetWeight: 50 },
      { exerciseId: 'curl-femoral-sentado', exerciseName: 'Curl femoral sentado', defaultSets: 2, targetReps: '10-12', targetWeight: 45 },
      { exerciseId: 'elevacion-gemelos-pie', exerciseName: 'Elevación de gemelos de pie', defaultSets: 3, targetReps: '12-15', targetWeight: 60 },
    ],
  },
  {
    id: 'routine-jueves-pecho-espalda-biceps',
    name: 'Jueves: Pecho, Espalda y Bíceps',
    description: 'Sesión combinada de torso anterior y posterior.',
    muscleGroups: ['pecho', 'espalda', 'biceps'],
    assignedDays: [4], // Jueves
    exercises: [
      { exerciseId: 'press-inclinado-maquina', exerciseName: 'Press inclinado en máquina', defaultSets: 3, targetReps: '8-12', targetWeight: 55 },
      { exerciseId: 'aperturas-maquina', exerciseName: 'Aperturas en máquina', defaultSets: 2, targetReps: '12-15', targetWeight: 45 },
      { exerciseId: 'remo-pecho-apoyado', exerciseName: 'Remo con pecho apoyado', defaultSets: 3, targetReps: '8-12', targetWeight: 50 },
      { exerciseId: 'jalon-pecho-neutro', exerciseName: 'Jalón al pecho con agarre neutro', defaultSets: 2, targetReps: '10-12', targetWeight: 50 },
      { exerciseId: 'curl-biceps-mancuernas', exerciseName: 'Curl de bíceps con mancuernas', defaultSets: 2, targetReps: '10-12', targetWeight: 14 },
    ],
  },
  {
    id: 'routine-viernes-gluteos-femorales',
    name: 'Viernes: Glúteos y Femorales',
    description: 'Cadena posterior completa: glúteo mayor, isquiotibiales y pantorrillas.',
    muscleGroups: ['gluteos', 'isquios', 'pantorrillas'],
    assignedDays: [5], // Viernes
    exercises: [
      { exerciseId: 'hip-thrust', exerciseName: 'Hip thrust', defaultSets: 3, targetReps: '8-12', targetWeight: 100 },
      { exerciseId: 'curl-femoral-sentado', exerciseName: 'Curl femoral sentado', defaultSets: 3, targetReps: '10-12', targetWeight: 50 },
      { exerciseId: 'peso-muerto-rumano-mancuernas', exerciseName: 'Peso muerto rumano con mancuernas', defaultSets: 2, targetReps: '8-10', targetWeight: 28 },
      { exerciseId: 'abduccion-cadera-maquina', exerciseName: 'Abducción de cadera en máquina', defaultSets: 2, targetReps: '12-15', targetWeight: 55 },
      { exerciseId: 'elevacion-gemelos-pie', exerciseName: 'Elevación de gemelos de pie', defaultSets: 2, targetReps: '12-15', targetWeight: 60 },
    ],
  },
  {
    id: 'routine-sabado-hombros-triceps',
    name: 'Sábado: Hombros y Tríceps',
    description: 'Deltoides anterior, lateral y posterior, más extensiones de tríceps.',
    muscleGroups: ['hombros', 'triceps'],
    assignedDays: [6], // Sábado
    exercises: [
      { exerciseId: 'press-hombros-maquina', exerciseName: 'Press de hombros en máquina', defaultSets: 2, targetReps: '8-12', targetWeight: 45 },
      { exerciseId: 'elevaciones-laterales', exerciseName: 'Elevaciones laterales con mancuernas', defaultSets: 3, targetReps: '12-15', targetWeight: 12 },
      { exerciseId: 'pajaros-maquina', exerciseName: 'Pájaros en máquina', defaultSets: 3, targetReps: '12-15', targetWeight: 40 },
      { exerciseId: 'extensiones-triceps-polea', exerciseName: 'Extensión de tríceps en polea', defaultSets: 3, targetReps: '10-12', targetWeight: 25 },
      { exerciseId: 'extension-triceps-cuerda-trasnuca', exerciseName: 'Extensión de tríceps con cuerda por encima de la cabeza', defaultSets: 2, targetReps: '10-12', targetWeight: 20 },
    ],
  },
];

// Helper to generate ISO dates relative to today
const getRelativeDateStr = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_SAMPLE_HISTORY: WorkoutSession[] = [
  // 14 days ago - Empuje
  {
    id: 'session-demo-1',
    date: getRelativeDateStr(14),
    name: 'Empuje (Pecho, Hombro, Tríceps)',
    routineId: 'routine-empuje',
    completed: true,
    durationMinutes: 62,
    exercises: [
      {
        id: 'se-1-1',
        exerciseId: 'press-banca-barra',
        exerciseName: 'Press de Banca con Barra',
        muscleGroup: 'pecho',
        order: 1,
        sets: [
          { id: 's1', setNumber: 1, type: 'warmup', weightKg: 50, reps: 10, completed: true },
          { id: 's2', setNumber: 2, type: 'normal', weightKg: 70, reps: 10, completed: true },
          { id: 's3', setNumber: 3, type: 'normal', weightKg: 72.5, reps: 8, completed: true },
          { id: 's4', setNumber: 4, type: 'normal', weightKg: 75, reps: 6, completed: true },
        ],
      },
      {
        id: 'se-1-2',
        exerciseId: 'press-inclinado-mancuernas',
        exerciseName: 'Press Inclinado con Mancuernas',
        muscleGroup: 'pecho',
        order: 2,
        sets: [
          { id: 's5', setNumber: 1, type: 'normal', weightKg: 24, reps: 10, completed: true },
          { id: 's6', setNumber: 2, type: 'normal', weightKg: 24, reps: 10, completed: true },
          { id: 's7', setNumber: 3, type: 'normal', weightKg: 24, reps: 9, completed: true },
        ],
      },
      {
        id: 'se-1-3',
        exerciseId: 'press-militar-barra',
        exerciseName: 'Press Militar de Pie con Barra (OHP)',
        muscleGroup: 'hombros',
        order: 3,
        sets: [
          { id: 's8', setNumber: 1, type: 'normal', weightKg: 40, reps: 8, completed: true },
          { id: 's9', setNumber: 2, type: 'normal', weightKg: 42.5, reps: 8, completed: true },
          { id: 's10', setNumber: 3, type: 'normal', weightKg: 45, reps: 6, completed: true },
        ],
      },
    ],
  },
  // 12 days ago - Tirón
  {
    id: 'session-demo-2',
    date: getRelativeDateStr(12),
    name: 'Tirón (Espalda, Bíceps, Posterior)',
    routineId: 'routine-tiron',
    completed: true,
    durationMinutes: 58,
    exercises: [
      {
        id: 'se-2-1',
        exerciseId: 'peso-muerto-convencional',
        exerciseName: 'Peso Muerto Convencional',
        muscleGroup: 'espalda',
        order: 1,
        sets: [
          { id: 's11', setNumber: 1, type: 'warmup', weightKg: 70, reps: 8, completed: true },
          { id: 's12', setNumber: 2, type: 'normal', weightKg: 110, reps: 6, completed: true },
          { id: 's13', setNumber: 3, type: 'normal', weightKg: 115, reps: 6, completed: true },
        ],
      },
      {
        id: 'se-2-2',
        exerciseId: 'remo-con-barra',
        exerciseName: 'Remo con Barra 90º / Pendlay',
        muscleGroup: 'espalda',
        order: 2,
        sets: [
          { id: 's14', setNumber: 1, type: 'normal', weightKg: 65, reps: 10, completed: true },
          { id: 's15', setNumber: 2, type: 'normal', weightKg: 65, reps: 10, completed: true },
          { id: 's16', setNumber: 3, type: 'normal', weightKg: 70, reps: 8, completed: true },
        ],
      },
    ],
  },
  // 9 days ago - Pierna
  {
    id: 'session-demo-3',
    date: getRelativeDateStr(9),
    name: 'Pierna & Glúteo Completo',
    routineId: 'routine-pierna',
    completed: true,
    durationMinutes: 65,
    exercises: [
      {
        id: 'se-3-1',
        exerciseId: 'sentadilla-trasera',
        exerciseName: 'Sentadilla Trasera con Barra',
        muscleGroup: 'cuadriceps',
        order: 1,
        sets: [
          { id: 's17', setNumber: 1, type: 'warmup', weightKg: 60, reps: 10, completed: true },
          { id: 's18', setNumber: 2, type: 'normal', weightKg: 90, reps: 8, completed: true },
          { id: 's19', setNumber: 3, type: 'normal', weightKg: 92.5, reps: 8, completed: true },
          { id: 's20', setNumber: 4, type: 'normal', weightKg: 95, reps: 7, completed: true },
        ],
      },
    ],
  },
  // 7 days ago - Empuje (Progress shown!)
  {
    id: 'session-demo-4',
    date: getRelativeDateStr(7),
    name: 'Empuje (Pecho, Hombro, Tríceps)',
    routineId: 'routine-empuje',
    completed: true,
    durationMinutes: 60,
    exercises: [
      {
        id: 'se-4-1',
        exerciseId: 'press-banca-barra',
        exerciseName: 'Press de Banca con Barra',
        muscleGroup: 'pecho',
        order: 1,
        sets: [
          { id: 's21', setNumber: 1, type: 'warmup', weightKg: 50, reps: 10, completed: true },
          { id: 's22', setNumber: 2, type: 'normal', weightKg: 72.5, reps: 10, completed: true },
          { id: 's23', setNumber: 3, type: 'normal', weightKg: 75, reps: 8, completed: true },
          { id: 's24', setNumber: 4, type: 'normal', weightKg: 77.5, reps: 7, completed: true },
        ],
      },
      {
        id: 'se-4-2',
        exerciseId: 'press-inclinado-mancuernas',
        exerciseName: 'Press Inclinado con Mancuernas',
        muscleGroup: 'pecho',
        order: 2,
        sets: [
          { id: 's25', setNumber: 1, type: 'normal', weightKg: 26, reps: 10, completed: true },
          { id: 's26', setNumber: 2, type: 'normal', weightKg: 26, reps: 10, completed: true },
          { id: 's27', setNumber: 3, type: 'normal', weightKg: 26, reps: 9, completed: true },
        ],
      },
    ],
  },
  // 2 days ago - Empuje (Recent PR)
  {
    id: 'session-demo-5',
    date: getRelativeDateStr(2),
    name: 'Empuje (Pecho, Hombro, Tríceps)',
    routineId: 'routine-empuje',
    completed: true,
    durationMinutes: 64,
    exercises: [
      {
        id: 'se-5-1',
        exerciseId: 'press-banca-barra',
        exerciseName: 'Press de Banca con Barra',
        muscleGroup: 'pecho',
        order: 1,
        sets: [
          { id: 's28', setNumber: 1, type: 'warmup', weightKg: 60, reps: 8, completed: true },
          { id: 's29', setNumber: 2, type: 'normal', weightKg: 75, reps: 10, completed: true },
          { id: 's30', setNumber: 3, type: 'normal', weightKg: 80, reps: 8, completed: true },
          { id: 's31', setNumber: 4, type: 'normal', weightKg: 82.5, reps: 6, completed: true },
        ],
      },
    ],
  },
];
