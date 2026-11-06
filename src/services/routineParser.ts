import { Exercise, MuscleGroup, Routine, RoutineExerciseConfig } from '../types/workout';

export interface ParsedDayRoutine {
  dayName: string;
  dayIndex: number; // 0 = Dom, 1 = Lun, ..., 6 = Sab
  title: string;
  muscleGroups: MuscleGroup[];
  exercises: {
    name: string;
    sets: number;
    targetReps: string;
    muscleGroup: MuscleGroup;
    equipment: 'barra' | 'mancuernas' | 'maquina' | 'polea' | 'peso_corporal';
  }[];
}

const DAY_MAP: Record<string, number> = {
  lunes: 1,
  lun: 1,
  martes: 2,
  mar: 2,
  miercoles: 3,
  miércoles: 3,
  mie: 3,
  mié: 3,
  jueves: 4,
  jue: 4,
  viernes: 5,
  vie: 5,
  sabado: 6,
  sábado: 6,
  sab: 6,
  sáb: 6,
  domingo: 0,
  dom: 0,
};

// Muscle group keyword detection
export function detectMuscleGroup(text: string): MuscleGroup {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (lower.includes('pecho') || lower.includes('pectoral') || lower.includes('apertura') || lower.includes('peck deck')) {
    return 'pecho';
  }
  if (lower.includes('espalda') || lower.includes('dorsal') || lower.includes('remo') || lower.includes('jalon') || lower.includes('dominada')) {
    return 'espalda';
  }
  if (lower.includes('tricep') || lower.includes('skullcrusher') || lower.includes('press frances')) {
    return 'triceps';
  }
  if (lower.includes('bicep') || lower.includes('martillo') || lower.includes('scott')) {
    return 'biceps';
  }
  if (lower.includes('hombro') || lower.includes('deltoide') || lower.includes('lateral') || lower.includes('pajaro') || lower.includes('militar') || lower.includes('face pull')) {
    return 'hombros';
  }
  if (lower.includes('cuadricep') || lower.includes('prensa') || lower.includes('hack') || lower.includes('bulgara')) {
    return 'cuadriceps';
  }
  if (lower.includes('femoral') || lower.includes('isquio') || lower.includes('rumano') || lower.includes('rdl')) {
    return 'isquios';
  }
  if (lower.includes('gluteo') || lower.includes('hip thrust') || lower.includes('abduccion')) {
    return 'gluteos';
  }
  if (lower.includes('gemelo') || lower.includes('pantorrilla') || lower.includes('talon')) {
    return 'pantorrillas';
  }
  if (lower.includes('pierna') || lower.includes('sentadilla')) {
    return 'cuadriceps';
  }
  if (lower.includes('abdomen') || lower.includes('core') || lower.includes('plancha') || lower.includes('crunch')) {
    return 'core';
  }
  return 'cuerpo_completo';
}

function detectEquipment(text: string): 'barra' | 'mancuernas' | 'maquina' | 'polea' | 'peso_corporal' {
  const lower = text.toLowerCase();
  if (lower.includes('mancuerna')) return 'mancuernas';
  if (lower.includes('barra') || lower.includes('barra z')) return 'barra';
  if (lower.includes('polea') || lower.includes('cuerda') || lower.includes('gironda')) return 'polea';
  if (lower.includes('corporal') || lower.includes('fondo') || lower.includes('dominada') || lower.includes('plancha')) return 'peso_corporal';
  return 'maquina';
}

// Normalize exercise string for matching
function normalizeText(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Robust parser that strictly separates days and extracts exercises
 * WITHOUT tangling or matching wrong exercises.
 */
export function parseRoutinesByDays(
  rawText: string,
  existingCatalog: Exercise[]
): {
  routines: Routine[];
  newExercisesToAdd: Exercise[];
  parsedDays: ParsedDayRoutine[];
} {
  const lines = rawText.split('\n');
  const parsedDays: ParsedDayRoutine[] = [];
  let currentDay: ParsedDayRoutine | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    // Check if this line is a Day Header:
    // e.g. "LUNES — PECHO Y BÍCEPS" or "MARTES: ESPALDA" or "MIÉRCOLES - PIERNAS"
    const dayHeaderMatch = rawLine.match(
      /^(LUNES|MARTES|MI[EÉ]RCOLES|JUEVES|VIERNES|S[AÁ]BADO|DOMINGO)\b(?:\s*[-—–:|]\s*(.+))?/i
    );

    if (dayHeaderMatch) {
      const rawDayName = dayHeaderMatch[1].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const dayIndex = DAY_MAP[rawDayName] ?? 1;
      const subtitle = dayHeaderMatch[2] ? dayHeaderMatch[2].trim() : '';

      const capitalizedDay =
        dayHeaderMatch[1].charAt(0).toUpperCase() + dayHeaderMatch[1].slice(1).toLowerCase();
      const title = subtitle ? `${capitalizedDay}: ${subtitle}` : capitalizedDay;

      // Extract muscle groups for this day
      const muscleGroup = detectMuscleGroup(title);

      currentDay = {
        dayName: capitalizedDay,
        dayIndex,
        title,
        muscleGroups: [muscleGroup],
        exercises: [],
      };
      parsedDays.push(currentDay);
      continue;
    }

    // If we have an active day, parse as exercise line
    if (currentDay) {
      // Strip bullets: "- ", "* ", "1. ", "• "
      let cleanLine = rawLine.replace(/^[-*•–—\d.)]+\s*/, '').trim();
      if (!cleanLine) continue;

      let exerciseName = cleanLine;
      let sets = 3;
      let targetReps = '10';

      // Match sets and reps patterns:
      // "Press de pecho en máquina — 3 × 8–12"
      // "Prensa de piernas - 3x8-12"
      // "Curl femoral 2 x 10 a 12"
      const setsRepsRegex = /[-—–:]?\s*(\d+)\s*(?:[×xX*]|series?\s*(?:de)?)\s*([0-9–\-]+(?:\s*a\s*\d+)?)/i;
      const match = cleanLine.match(setsRepsRegex);

      if (match && typeof match.index === 'number') {
        sets = parseInt(match[1]) || 3;
        targetReps = match[2].trim().replace(/\s+/g, '');
        exerciseName = cleanLine.slice(0, match.index).replace(/[-—–:]\s*$/, '').trim();
      }

      // Cleanup exercise name
      exerciseName = exerciseName.replace(/[-—–:]\s*$/, '').trim();

      if (exerciseName.length >= 2) {
        const muscleGroup = detectMuscleGroup(exerciseName);
        const equipment = detectEquipment(exerciseName);

        currentDay.exercises.push({
          name: exerciseName,
          sets,
          targetReps,
          muscleGroup,
          equipment,
        });

        if (!currentDay.muscleGroups.includes(muscleGroup)) {
          currentDay.muscleGroups.push(muscleGroup);
        }
      }
    }
  }

// Direct canonical synonym dictionary for gym movements in Spanish
const CANONICAL_SYNONYMS: Record<string, string> = {
  'press de pecho en maquina': 'press-pecho-maquina',
  'press de pecho maquina': 'press-pecho-maquina',
  'press pecho maquina': 'press-pecho-maquina',
  'press inclinado con mancuernas': 'press-inclinado-mancuernas',
  'press inclinado mancuernas': 'press-inclinado-mancuernas',
  'press inclinado en maquina': 'press-inclinado-maquina',
  'press inclinado maquina': 'press-inclinado-maquina',
  'aperturas en maquina': 'aperturas-maquina',
  'aperturas maquina': 'aperturas-maquina',
  'peck deck': 'aperturas-maquina',
  'mariposa en maquina': 'aperturas-maquina',
  'curl de biceps con barra z': 'curl-biceps-barra-z',
  'curl biceps barra z': 'curl-biceps-barra-z',
  'curl martillo con mancuernas': 'curl-martillo',
  'curl martillo': 'curl-martillo',
  'jalon al pecho': 'jalon-al-pecho',
  'jalon al pecho en polea': 'jalon-al-pecho',
  'jalon dorsal': 'jalon-al-pecho',
  'remo sentado en polea': 'remo-gironda',
  'remo sentado en polea gironda': 'remo-gironda',
  'remo gironda': 'remo-gironda',
  'remo con pecho apoyado': 'remo-pecho-apoyado',
  'remo con pecho apoyado en maquina': 'remo-pecho-apoyado',
  'remo apoyo pecho': 'remo-pecho-apoyado',
  'extension de triceps en polea': 'extensiones-triceps-polea',
  'extensiones de triceps en polea': 'extensiones-triceps-polea',
  'extension de triceps por encima de la cabeza': 'extension-triceps-trasnuca',
  'extension de triceps trasnuca': 'extension-triceps-trasnuca',
  'prensa de piernas': 'prensa-piernas',
  'prensa de piernas 45': 'prensa-piernas',
  'prensa': 'prensa-piernas',
  'sentadilla hack o guiada': 'sentadilla-hack',
  'sentadilla hack': 'sentadilla-hack',
  'sentadilla guiada': 'sentadilla-hack',
  'extension de cuadriceps': 'extensiones-cuadriceps',
  'extensiones de cuadriceps': 'extensiones-cuadriceps',
  'extensiones de cuadriceps en maquina': 'extensiones-cuadriceps',
  'curl femoral sentado': 'curl-femoral-sentado',
  'elevacion de gemelos de pie': 'elevacion-gemelos-pie',
  'elevacion de talones de pie': 'elevacion-gemelos-pie',
  'elevacion de talones de pie gemelos': 'elevacion-gemelos-pie',
  'elevacion de gemelos': 'elevacion-gemelos-pie',
  'gemelos de pie': 'elevacion-gemelos-pie',
  'jalon al pecho con agarre neutro': 'jalon-pecho-neutro',
  'jalon pecho neutro': 'jalon-pecho-neutro',
  'curl de biceps con mancuernas': 'curl-biceps-mancuernas',
  'curl biceps mancuernas': 'curl-biceps-mancuernas',
  'hip thrust': 'hip-thrust',
  'hip thrust con barra': 'hip-thrust',
  'empuje de cadera': 'hip-thrust',
  'peso muerto rumano con mancuernas': 'peso-muerto-rumano-mancuernas',
  'peso muerto rumano mancuernas': 'peso-muerto-rumano-mancuernas',
  'abduccion de cadera en maquina': 'abduccion-cadera-maquina',
  'abduccion cadera maquina': 'abduccion-cadera-maquina',
  'press de hombros en maquina': 'press-hombros-maquina',
  'press hombros maquina': 'press-hombros-maquina',
  'elevaciones laterales con mancuernas': 'elevaciones-laterales',
  'elevaciones laterales': 'elevaciones-laterales',
  'pajaros en maquina': 'pajaros-maquina',
  'pajaros en maquina deltoides posterior': 'pajaros-maquina',
  'pajaros maquina': 'pajaros-maquina',
  'extension de triceps con cuerda por encima de la cabeza': 'extension-triceps-cuerda-trasnuca',
  'extension triceps cuerda por encima de la cabeza': 'extension-triceps-cuerda-trasnuca',
  'press de banca con barra': 'press-banca-barra',
  'press banca barra': 'press-banca-barra',
  'press banca': 'press-banca-barra',
  'dominadas': 'dominadas',
  'peso muerto convencional': 'peso-muerto-convencional',
  'sentadilla trasera con barra': 'sentadilla-trasera',
};

// Convert to Routine objects with EXACT exercise names preserved
  const newExercisesToAdd: Exercise[] = [];
  const catalogCopy = [...existingCatalog];

  const routines: Routine[] = parsedDays.map((pd, rIdx) => {
    const routineExercises: RoutineExerciseConfig[] = pd.exercises.map((pEx) => {
      const normalizedPExName = normalizeText(pEx.name);

      // 1. Check Canonical Synonyms
      const canonicalId = CANONICAL_SYNONYMS[normalizedPExName];
      let matched = canonicalId ? catalogCopy.find((c) => c.id === canonicalId) : undefined;

      // 2. Exact match against catalog name
      if (!matched) {
        matched = catalogCopy.find((cat) => normalizeText(cat.name) === normalizedPExName);
      }

      // 3. Match against aliases
      if (!matched) {
        matched = catalogCopy.find((cat) =>
          cat.aliases?.some((a) => normalizeText(a) === normalizedPExName)
        );
      }

      // 4. Fallback: create a dedicated exercise with the EXACT name requested by user
      if (!matched) {
        const safeSlug = normalizedPExName.slice(0, 24).replace(/\s+/g, '-');
        matched = {
          id: `ex-${safeSlug}`,
          name: pEx.name,
          muscleGroup: pEx.muscleGroup,
          equipment: pEx.equipment,
          isCustom: true,
        };
        newExercisesToAdd.push(matched);
        catalogCopy.push(matched);
      }

      return {
        exerciseId: matched.id,
        exerciseName: pEx.name,
        defaultSets: pEx.sets,
        targetReps: pEx.targetReps,
      };
    });

    return {
      id: `routine-day-${pd.dayIndex}-${Date.now().toString().slice(-4)}-${rIdx}`,
      name: pd.title,
      description: `Rutina para ${pd.dayName} (${pd.exercises.length} ejercicios)`,
      muscleGroups: pd.muscleGroups,
      assignedDays: [pd.dayIndex],
      exercises: routineExercises,
    };
  });

  return { routines, newExercisesToAdd, parsedDays };
}
