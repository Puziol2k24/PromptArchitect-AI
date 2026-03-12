
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ====================== TYPES ======================

type CareerCategory = 'F4' | 'F3' | 'FRECA' | 'F2' | 'F1';

type GameScreen =
  | 'welcome'
  | 'create-driver'
  | 'team-select'
  | 'hub'
  | 'pre-race'
  | 'lights-out'
  | 'race-result'
  | 'career-event'
  | 'season-end'
  | 'team-offers'
  | 'promotion';

interface TeamDef {
  id: string;
  name: string;
  category: CareerCategory;
  performance: number;
  color: string;
  description: string;
}

interface AIDriver {
  id: string;
  name: string;
  teamId: string;
  skill: number;
  points: number;
  wins: number;
}

interface RaceResultEntry {
  name: string;
  isPlayer: boolean;
  position: number;
  points: number;
}

interface PlayerSave {
  firstName: string;
  lastName: string;
  teamId: string;
  category: CareerCategory;
  season: number;
  raceIndex: number;
  points: number;
  wins: number;
  podiums: number;
  driverSkill: number;
  teamPerformanceBonus: number;
  aiDrivers: AIDriver[];
  seasonResults: number[];
  careerHistory: {
    season: number;
    category: CareerCategory;
    position: number;
    teamId: string;
    points: number;
  }[];
}

interface CareerEventDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  effect: 'skill_boost' | 'performance_boost' | 'performance_penalty' | 'none';
  value: number;
}

// ====================== GAME DATA ======================

const TEAMS: TeamDef[] = [
  // F4
  { id: 'apex-f4', name: 'Apex Racing Academy', category: 'F4', performance: 42, color: '#3B82F6', description: 'A respected talent factory with a focus on driver development.' },
  { id: 'pioneer-f4', name: 'Pioneer Motorsport', category: 'F4', performance: 50, color: '#10B981', description: 'A balanced team known for technical reliability and consistent results.' },
  { id: 'velocity-f4', name: 'Velocity F4 Team', category: 'F4', performance: 57, color: '#EF4444', description: 'The top F4 outfit. Aggressive strategy, strong machinery.' },
  // F3
  { id: 'quantum-f3', name: 'Quantum Racing', category: 'F3', performance: 61, color: '#8B5CF6', description: 'Young outfit making waves in F3 with innovative car setups.' },
  { id: 'nova-f3', name: 'Nova Motorsport', category: 'F3', performance: 66, color: '#F59E0B', description: 'Experienced team with multiple F3 podiums in recent years.' },
  { id: 'stellar-f3', name: 'Stellar Racing F3', category: 'F3', performance: 73, color: '#EC4899', description: 'The dominant force in F3. Championship-calibre machinery.' },
  // FRECA
  { id: 'vortex-freca', name: 'Vortex Racing', category: 'FRECA', performance: 72, color: '#06B6D4', description: 'A strong technical team competing in Formula Regional.' },
  { id: 'pulse-freca', name: 'Pulse Motorsport', category: 'FRECA', performance: 77, color: '#84CC16', description: 'Progressive outfit known for rapid car development mid-season.' },
  { id: 'nexus-freca', name: 'Nexus FR', category: 'FRECA', performance: 83, color: '#F97316', description: 'The benchmark team in Formula Regional. Championships expected.' },
  // F2
  { id: 'horizon-f2', name: 'Horizon Racing', category: 'F2', performance: 79, color: '#6366F1', description: 'A consistent F2 front-runner with strong strategic capabilities.' },
  { id: 'meridian-f2', name: 'Meridian Motorsport', category: 'F2', performance: 84, color: '#14B8A6', description: 'Technical excellence and bold race strategy define this team.' },
  { id: 'eclipse-f2', name: 'Eclipse Racing', category: 'F2', performance: 88, color: '#A855F7', description: 'Ambitious team with a direct path to F1 partnerships.' },
  { id: 'zenith-f2', name: 'Zenith F2', category: 'F2', performance: 93, color: '#DC2626', description: 'The most competitive F2 team—reserved only for top prospects.' },
  // F1
  { id: 'arcturus-f1', name: 'Arcturus Grand Prix', category: 'F1', performance: 73, color: '#64748B', description: "A struggling F1 team—but it's Formula 1. The dream is real." },
  { id: 'solaris-f1', name: 'Solaris Racing', category: 'F1', performance: 80, color: '#0EA5E9', description: 'A midfield team with genuine points-scoring capability.' },
  { id: 'nebula-f1', name: 'Nebula F1', category: 'F1', performance: 87, color: '#7C3AED', description: 'A consistent front-runner aiming for the constructors\' title.' },
  { id: 'apexgp-f1', name: 'Apex Grand Prix', category: 'F1', performance: 93, color: '#DC2626', description: 'Championship-contending team. Top-tier machinery and strategy.' },
  { id: 'quantum-f1', name: 'Quantum F1', category: 'F1', performance: 97, color: '#D97706', description: 'Multiple constructors\' champions. The car can win anywhere.' },
  { id: 'stellar-f1', name: 'Stellar Racing F1', category: 'F1', performance: 100, color: '#10B981', description: 'The pinnacle of motorsport. The fastest car. The ultimate dream.' },
];

const AI_DRIVER_POOL = [
  'Marco Delacroix', 'Riku Tanaka', 'Lena Bauer', 'Carlos Merino',
  'Theo Marchetti', 'Aiko Shimizu', 'Felix Rosenthal', 'Sofia Andrada',
  'Nikos Papadakis', 'Zara Bellamy', 'Ivan Novak', 'Priya Sharma',
  'Luca Ferretti', 'Hana Kobayashi', 'Ahmed Khalil', 'Mia Van der Berg',
  'Rafael Oliveira', 'Yuki Matsuda', 'Axel Lund', 'Camille Moreau',
  'Diego Vargas', 'Emma Lindqvist', 'Kai Hoffmann', 'Nadia Petrov',
];

const CIRCUITS: Record<CareerCategory, string[]> = {
  F4: ['Rosetta Park', 'Lago Azzurro Circuit', 'Monte Veloce', 'Grandia Autodrome', 'Portello International', 'Stella Rossa Park', 'Valle Serena', 'Torre Alta'],
  F3: ['Cielo Ring', 'Harbour Street Circuit', 'Lumina Park', 'Northgate International', 'Pinebrook Circuit', 'Sunset Raceway', 'Grandvallis Autodrome', 'Arcadia Ring', 'Maravella Park', 'Riva Circuit'],
  FRECA: ['Iberia Circuit', 'Cristal Bay Autodrome', 'Alpentour Raceway', 'Lauro Park', 'Vento Ring', 'Cascadia International', 'Porto Arena', 'Sienna Circuit', 'Westbrook Park', 'Baia del Sole'],
  F2: ['Deserta Circuit', 'Royal Street Track', 'Zenith Park', 'Caspian Ring', 'Marina Circuit', 'Northfield GP', 'Aurum Autodrome', 'Forest Ring', 'Terranova Circuit', 'Hawksworth Raceway', 'Shogun Circuit', 'Sandstone Park'],
  F1: ['Apex Circuit', 'Royale Arena', 'Celestia GP', 'Meridian Park', 'Crystal Bay Street', 'Northgate F1 Circuit', 'Sirocco Autodrome', 'Castle Raceway', 'Laguna Circuit', 'Velocity Ring', 'Solstice Park', 'Stormfront Circuit', 'Harbourfront GP', 'Pinnacle Park', 'Desert Challenge', 'Sunset Grand Prix', 'Rainforest Circuit', 'Highland Ring', 'Snowfield Circuit', 'Grand Finale Autodrome'],
};

const POINTS_TABLE = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

const RACE_COUNTS: Record<CareerCategory, number> = {
  F4: 8, F3: 10, FRECA: 10, F2: 12, F1: 20,
};

const GRID_SIZES: Record<CareerCategory, number> = {
  F4: 16, F3: 18, FRECA: 16, F2: 14, F1: 20,
};

const CATEGORY_LABELS: Record<CareerCategory, string> = {
  F4: 'Formula 4', F3: 'Formula 3', FRECA: 'Formula Regional', F2: 'Formula 2', F1: 'Formula 1',
};

const CATEGORY_ORDER: CareerCategory[] = ['F4', 'F3', 'FRECA', 'F2', 'F1'];

const CAREER_EVENTS: CareerEventDef[] = [
  { id: 'talent', title: 'Talent Spotted!', description: 'A senior engineer from a higher category attended your last race. Word is spreading about your raw talent.', emoji: '⭐', effect: 'skill_boost', value: 3 },
  { id: 'sponsor', title: 'New Sponsorship Deal', description: 'A major sponsor has come on board. Your team has extra budget for car development this season.', emoji: '💰', effect: 'performance_boost', value: 5 },
  { id: 'teammate', title: 'Teammate Departs', description: 'Your teammate has been headhunted by a rival team. You become the undisputed team leader.', emoji: '🔄', effect: 'skill_boost', value: 2 },
  { id: 'upgrade', title: 'Major Car Upgrade', description: 'The team has introduced a significant aerodynamic package. The car feels noticeably faster.', emoji: '🔧', effect: 'performance_boost', value: 8 },
  { id: 'engine', title: 'Engine Reliability Issues', description: 'The team has hit a rough patch. Engine reliability has been compromised for the near future.', emoji: '⚠️', effect: 'performance_penalty', value: 6 },
  { id: 'media', title: 'Media Spotlight', description: "Your performances have attracted widespread attention. The pressure is on—use it as fuel.", emoji: '📺', effect: 'none', value: 0 },
  { id: 'streak', title: "You're On Fire!", description: "You're in the form of your life. The mechanics say they've never seen someone so in tune with the car.", emoji: '🔥', effect: 'skill_boost', value: 4 },
  { id: 'setback', title: 'Technical Setback', description: 'A mysterious handling issue has the engineers puzzled. It should be resolved within a race or two.', emoji: '🛠️', effect: 'performance_penalty', value: 3 },
];

const SAVE_KEY = 'f1career_save_v2';
const CAREER_EVENT_PROBABILITY = 0.22;
const LIGHTS_BUILD_INTERVAL_MS = 600; // ms between each light illuminating
const LIGHTS_MIN_GO_DELAY_MS = 3600;  // minimum time before lights extinguish (after 5th light)
const LIGHTS_GO_VARIANCE_MS = 2000;   // random additional wait before GO
const LIGHTS_AUTO_REACT_MS = 2000;    // auto-react timeout after lights go out

// ====================== HELPERS ======================

function getNextCategory(cat: CareerCategory): CareerCategory | null {
  const idx = CATEGORY_ORDER.indexOf(cat);
  return idx < CATEGORY_ORDER.length - 1 ? CATEGORY_ORDER[idx + 1] : null;
}

function isPromotionEligible(cat: CareerCategory, position: number): boolean {
  if (cat === 'F1') return false;
  if (cat === 'F2') return position <= 5;
  return position <= 3;
}

function getTeamsForCategory(cat: CareerCategory): TeamDef[] {
  return TEAMS.filter(t => t.category === cat);
}

function generateAIDrivers(category: CareerCategory, playerTeamId: string): AIDriver[] {
  const teams = getTeamsForCategory(category);
  const gridSize = GRID_SIZES[category];
  const shuffled = [...AI_DRIVER_POOL].sort(() => Math.random() - 0.5);
  const drivers: AIDriver[] = [];
  let di = 0;

  for (const team of teams) {
    const count = teams.length <= 3 ? 2 : (Math.random() > 0.5 ? 2 : 3);
    for (let i = 0; i < count && di < shuffled.length && drivers.length < gridSize - 1; i++) {
      const baseSkill = team.performance + (Math.random() * 20 - 10);
      drivers.push({
        id: `ai-${di}`,
        name: shuffled[di],
        teamId: team.id,
        skill: Math.max(20, Math.min(95, baseSkill)),
        points: 0,
        wins: 0,
      });
      di++;
    }
  }
  return drivers;
}

function simulateRace(
  playerSkill: number,
  teamPerf: number,
  teamBonus: number,
  reactionBonus: number,
  aiDrivers: AIDriver[],
  gridSize: number
): { playerPosition: number; allResults: RaceResultEntry[] } {
  const playerScore = playerSkill * 0.55 + (teamPerf + teamBonus) * 0.45 + reactionBonus + (Math.random() * 18 - 9);

  const aiScored = aiDrivers.map(d => {
    const tp = TEAMS.find(t => t.id === d.teamId)?.performance ?? 50;
    return { ...d, score: d.skill * 0.55 + tp * 0.45 + (Math.random() * 18 - 9) };
  }).sort((a, b) => b.score - a.score);

  let playerPosition = 1;
  for (const ai of aiScored) {
    if (ai.score > playerScore) playerPosition++;
  }
  playerPosition = Math.min(playerPosition, gridSize);

  const allResults: RaceResultEntry[] = [];
  let aiIdx = 0;
  for (let pos = 1; pos <= Math.min(gridSize, aiScored.length + 1); pos++) {
    if (pos === playerPosition) {
      allResults.push({ name: 'You', isPlayer: true, position: pos, points: pos <= POINTS_TABLE.length ? POINTS_TABLE[pos - 1] : 0 });
    } else if (aiIdx < aiScored.length) {
      allResults.push({ name: aiScored[aiIdx].name, isPlayer: false, position: pos, points: pos <= POINTS_TABLE.length ? POINTS_TABLE[pos - 1] : 0 });
      aiIdx++;
    }
  }

  return { playerPosition, allResults };
}

function buildStandings(
  playerPoints: number,
  playerName: string,
  aiDrivers: AIDriver[]
): { name: string; points: number; isPlayer: boolean; position: number }[] {
  const entries = [
    { name: playerName, points: playerPoints, isPlayer: true },
    ...aiDrivers.map(d => ({ name: d.name, points: d.points, isPlayer: false })),
  ];
  entries.sort((a, b) => b.points - a.points);
  return entries.map((e, i) => ({ ...e, position: i + 1 }));
}

function getReactionRating(ms: number): { label: string; color: string; bonus: number } {
  if (ms < 0) return { label: 'FALSE START!', color: '#EF4444', bonus: -10 };
  if (ms < 150) return { label: 'PERFECT!', color: '#10B981', bonus: 12 };
  if (ms < 300) return { label: 'GREAT!', color: '#84CC16', bonus: 7 };
  if (ms < 500) return { label: 'GOOD', color: '#F59E0B', bonus: 3 };
  if (ms < 800) return { label: 'AVERAGE', color: '#94A3B8', bonus: 0 };
  return { label: 'SLOW', color: '#EF4444', bonus: -5 };
}

function buildTeamOffers(category: CareerCategory, champPos: number, currentTeamId: string): TeamDef[] {
  const nextCat = getNextCategory(category);
  const currentTeams = getTeamsForCategory(category).filter(t => t.id !== currentTeamId).sort((a, b) => b.performance - a.performance);
  const nextTeams = nextCat ? getTeamsForCategory(nextCat).sort((a, b) => a.performance - b.performance) : [];

  let offers: TeamDef[] = [];

  if (champPos === 1) {
    offers = [...nextTeams, ...currentTeams.slice(0, 1)];
  } else if (champPos <= 3) {
    offers = [...nextTeams.slice(0, Math.ceil(nextTeams.length * 0.6)), ...currentTeams.slice(0, 1)];
  } else if (champPos <= 6) {
    offers = currentTeams.slice(0, 2);
  } else {
    offers = currentTeams.slice(0, 1);
  }

  // Deduplicate
  offers = offers.filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i);

  // Always at least 1 offer
  if (offers.length === 0) {
    const fallback = getTeamsForCategory(category);
    if (fallback.length > 0) offers = [fallback[0]];
  }

  return offers.slice(0, 4);
}

// ====================== COMPONENT ======================

const F1CareerGame: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>('welcome');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [player, setPlayer] = useState<PlayerSave | null>(null);
  const [hasSave, setHasSave] = useState(false);

  // Lights mini-game state
  const [lightsOn, setLightsOn] = useState(0); // 0-5
  const [lightsPhase, setLightsPhase] = useState<'idle' | 'building' | 'go' | 'done'>('idle');
  const [canReact, setCanReact] = useState(false);
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const lightsOutTimeRef = useRef<number>(0);
  const hasReactedRef = useRef(false);

  // Post-race state
  const [lastRaceResult, setLastRaceResult] = useState<{
    playerPosition: number;
    playerPoints: number;
    reactionMs: number;
    allResults: RaceResultEntry[];
  } | null>(null);

  const [currentEvent, setCurrentEvent] = useState<CareerEventDef | null>(null);
  const [teamOffers, setTeamOffers] = useState<TeamDef[]>([]);
  const [isPromotionPending, setIsPromotionPending] = useState(false);
  const [promotionCategory, setPromotionCategory] = useState<CareerCategory | null>(null);
  const [finalChampionshipPosition, setFinalChampionshipPosition] = useState(0);
  const [finalStandings, setFinalStandings] = useState<{ name: string; points: number; isPlayer: boolean; position: number }[]>([]);
  const [confirmDeleteSave, setConfirmDeleteSave] = useState(false);

  // Ref-backed player for use in closures/timeouts
  const playerRef = useRef<PlayerSave | null>(null);
  useEffect(() => { playerRef.current = player; }, [player]);

  // Check for existing save on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      setHasSave(!!saved);
    } catch { /* ignore */ }
  }, []);

  // Auto-save whenever player state changes
  useEffect(() => {
    if (player) {
      try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(player));
      } catch { /* ignore */ }
    }
  }, [player]);

  // Starting lights animation
  useEffect(() => {
    if (screen !== 'lights-out') return;

    setLightsOn(0);
    setLightsPhase('building');
    setCanReact(false);
    setReactionMs(null);
    hasReactedRef.current = false;
    lightsOutTimeRef.current = 0;

    const ids: ReturnType<typeof setTimeout>[] = [];

    // Illuminate one light every LIGHTS_BUILD_INTERVAL_MS
    for (let i = 1; i <= 5; i++) {
      ids.push(setTimeout(() => setLightsOn(i), i * LIGHTS_BUILD_INTERVAL_MS));
    }

    // Random delay then extinguish all lights
    const goDelay = LIGHTS_MIN_GO_DELAY_MS + Math.random() * LIGHTS_GO_VARIANCE_MS;
    ids.push(setTimeout(() => {
      setLightsOn(0);
      setLightsPhase('go');
      lightsOutTimeRef.current = Date.now();
      setCanReact(true);

      // Auto-react if player is too slow
      ids.push(setTimeout(() => {
        if (!hasReactedRef.current) {
          triggerReaction(LIGHTS_AUTO_REACT_MS);
        }
      }, LIGHTS_AUTO_REACT_MS));
    }, goDelay));

    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // Core reaction handler – can be called by button or auto-timeout
  const triggerReaction = useCallback((overrideMs?: number) => {
    if (hasReactedRef.current) return;
    hasReactedRef.current = true;
    setCanReact(false);
    setLightsPhase('done');

    const ms = overrideMs !== undefined
      ? overrideMs
      : lightsOutTimeRef.current === 0
        ? -1 // false start
        : Date.now() - lightsOutTimeRef.current;

    setReactionMs(ms);

    // Brief pause to show result, then simulate race
    setTimeout(() => {
      const currentPlayer = playerRef.current;
      if (currentPlayer) processRaceNow(currentPlayer, ms);
    }, 1800);
  }, []);

  const handleReactionClick = () => {
    if (lightsPhase === 'done') return;
    triggerReaction();
  };

  // ---- Race simulation (pure, takes a snapshot of player) ----
  function processRaceNow(p: PlayerSave, reactionTimeMs: number) {
    const team = TEAMS.find(t => t.id === p.teamId);
    if (!team) return;

    const { bonus } = getReactionRating(reactionTimeMs);
    const { playerPosition, allResults } = simulateRace(
      p.driverSkill, team.performance, p.teamPerformanceBonus, bonus,
      p.aiDrivers, GRID_SIZES[p.category]
    );

    const playerPoints = playerPosition <= POINTS_TABLE.length ? POINTS_TABLE[playerPosition - 1] : 0;

    // Update AI drivers' cumulative points
    const updatedAI: AIDriver[] = p.aiDrivers.map(ai => {
      const r = allResults.find(x => x.name === ai.name);
      return r ? { ...ai, points: ai.points + r.points } : ai;
    });

    const skillGain = playerPosition <= 5 ? 0.5 : 0.1;

    const updatedPlayer: PlayerSave = {
      ...p,
      points: p.points + playerPoints,
      wins: playerPosition === 1 ? p.wins + 1 : p.wins,
      podiums: playerPosition <= 3 ? p.podiums + 1 : p.podiums,
      driverSkill: Math.min(95, p.driverSkill + skillGain),
      aiDrivers: updatedAI,
      seasonResults: [...p.seasonResults, playerPosition],
      raceIndex: p.raceIndex + 1,
    };

    setLastRaceResult({ playerPosition, playerPoints, reactionMs: reactionTimeMs, allResults });
    setPlayer(updatedPlayer);
    setScreen('race-result');
  }

  // ---- Navigation handlers ----
  function handleContinueFromRaceResult() {
    if (!player) return;
    const totalRaces = RACE_COUNTS[player.category];
    const isLastRace = player.raceIndex >= totalRaces;

    if (isLastRace) {
      triggerSeasonEnd(player);
    } else if (Math.random() < CAREER_EVENT_PROBABILITY) {
      // Random career event ~22% chance mid-season
      const ev = CAREER_EVENTS[Math.floor(Math.random() * CAREER_EVENTS.length)];
      setCurrentEvent(ev);
      setScreen('career-event');
    } else {
      setScreen('hub');
    }
  }

  function handleCareerEventContinue() {
    if (!player || !currentEvent) return;

    let updated = { ...player };
    if (currentEvent.effect === 'skill_boost') {
      updated.driverSkill = Math.min(95, updated.driverSkill + currentEvent.value);
    } else if (currentEvent.effect === 'performance_boost') {
      updated.teamPerformanceBonus = Math.min(20, updated.teamPerformanceBonus + currentEvent.value);
    } else if (currentEvent.effect === 'performance_penalty') {
      updated.teamPerformanceBonus = Math.max(-15, updated.teamPerformanceBonus - currentEvent.value);
    }

    setPlayer(updated);
    setCurrentEvent(null);

    if (updated.raceIndex >= RACE_COUNTS[updated.category]) {
      triggerSeasonEnd(updated);
    } else {
      setScreen('hub');
    }
  }

  function triggerSeasonEnd(p: PlayerSave) {
    const standings = buildStandings(p.points, `${p.firstName} ${p.lastName}`, p.aiDrivers);
    const playerRow = standings.find(s => s.isPlayer)!;
    const champPos = playerRow.position;

    setFinalStandings(standings);
    setFinalChampionshipPosition(champPos);

    const updatedPlayer: PlayerSave = {
      ...p,
      careerHistory: [
        ...p.careerHistory,
        { season: p.season, category: p.category, position: champPos, teamId: p.teamId, points: p.points },
      ],
    };
    setPlayer(updatedPlayer);

    const nextCat = getNextCategory(p.category);
    const canPromote = isPromotionEligible(p.category, champPos) && nextCat !== null;
    setIsPromotionPending(canPromote);
    setPromotionCategory(canPromote ? nextCat : null);

    const offerCategory = canPromote && nextCat ? nextCat : p.category;
    const offers = buildTeamOffers(offerCategory, champPos, canPromote ? '' : p.teamId);
    // If promoting, also sprinkle in same-category offer for safety
    if (canPromote) {
      const samecat = getTeamsForCategory(p.category).sort((a, b) => b.performance - a.performance)[0];
      if (samecat && !offers.find(o => o.id === samecat.id)) offers.push(samecat);
    }
    setTeamOffers(offers.filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i).slice(0, 4));

    setScreen('season-end');
  }

  function handleSelectTeamOffer(teamId: string) {
    if (!player) return;
    const team = TEAMS.find(t => t.id === teamId);
    if (!team) return;

    const targetCat = isPromotionPending && promotionCategory ? promotionCategory : player.category;
    const newAI = generateAIDrivers(targetCat, teamId);

    const updatedPlayer: PlayerSave = {
      ...player,
      category: targetCat,
      teamId,
      season: player.season + 1,
      raceIndex: 0,
      points: 0,
      wins: 0,
      podiums: 0,
      teamPerformanceBonus: 0,
      aiDrivers: newAI,
      seasonResults: [],
    };

    setPlayer(updatedPlayer);
    setIsPromotionPending(false);
    setPromotionCategory(null);

    if (isPromotionPending) {
      setScreen('promotion');
    } else {
      setScreen('hub');
    }
  }

  function handleNewGame() {
    setFirstName('');
    setLastName('');
    setScreen('create-driver');
  }

  function handleLoadGame() {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const p: PlayerSave = JSON.parse(saved);
        setPlayer(p);
        setScreen('hub');
      }
    } catch { /* corrupted save – ignore */ }
  }

  function handleDeleteSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
    setHasSave(false);
  }

  // ---- Derived data ----
  const standings = player
    ? buildStandings(player.points, `${player.firstName} ${player.lastName}`, player.aiDrivers)
    : [];
  const playerStanding = standings.find(s => s.isPlayer);
  const currentTeam = player ? TEAMS.find(t => t.id === player.teamId) : null;
  const totalRaces = player ? RACE_COUNTS[player.category] : 0;
  const currentCircuit = player
    ? CIRCUITS[player.category][Math.min(player.raceIndex, CIRCUITS[player.category].length - 1)]
    : '';

  // ---- Shared sub-renders ----
  const StandingsList = ({ list, limit = 10 }: { list: { name: string; points: number; isPlayer: boolean; position: number }[]; limit?: number }) => (
    <div className="space-y-1">
      {list.slice(0, limit).map(s => (
        <div
          key={`${s.name}-${s.position}`}
          className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
            s.isPlayer
              ? 'bg-red-500/20 text-red-200 font-bold ring-1 ring-red-500/40'
              : 'bg-white/5 text-slate-300'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className={`w-5 text-center font-bold text-xs ${s.position <= 3 ? 'text-yellow-400' : 'text-slate-500'}`}>
              {s.position}
            </span>
            {s.isPlayer ? '🏎️ ' : ''}{s.name}
          </span>
          <span className="font-bold tabular-nums">{s.points} pts</span>
        </div>
      ))}
    </div>
  );

  const PerformanceBar = ({ value, color, label }: { value: number; color: string; label?: string }) => (
    <div>
      {label && <div className="flex justify-between text-xs text-slate-400 mb-1"><span>{label}</span><span>{value}/100</span></div>}
      <div className="w-full bg-white/10 rounded-full h-1.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-1.5 rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );

  // ====================== RENDER ======================

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-x-hidden">
      <AnimatePresence mode="wait">

        {/* ======== WELCOME ======== */}
        {screen === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
          >
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-10 relative"
            >
              <div className="text-7xl mb-4 select-none">🏁</div>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-orange-400 to-red-500">
                F1 Career Sim
              </h1>
              <p className="text-slate-400 text-lg mt-3">Your journey from F4 to the pinnacle of motorsport</p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex flex-col gap-4 w-full max-w-xs"
            >
              <button
                onClick={handleNewGame}
                className="py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-red-500/30 active:scale-95"
              >
                🚀 New Career
              </button>
              {hasSave && (
                <button
                  onClick={handleLoadGame}
                  className="py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 ring-1 ring-white/20 active:scale-95"
                >
                  📂 Continue Career
                </button>
              )}
            </motion.div>

            {hasSave && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <AnimatePresence mode="wait">
                  {!confirmDeleteSave ? (
                    <motion.button
                      key="delete-btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setConfirmDeleteSave(true)}
                      className="text-slate-600 hover:text-red-400 text-sm transition-colors"
                    >
                      🗑 Delete Save
                    </motion.button>
                  ) : (
                    <motion.div
                      key="confirm-delete"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3"
                    >
                      <span className="text-slate-400 text-sm">Sure?</span>
                      <button
                        onClick={() => { handleDeleteSave(); setConfirmDeleteSave(false); }}
                        className="px-3 py-1 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-lg text-sm font-bold transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteSave(false)}
                        className="px-3 py-1 bg-white/10 text-slate-400 hover:bg-white/20 rounded-lg text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 flex gap-6 text-xs text-slate-600 select-none"
            >
              {(['F4', 'F3', 'FRECA', 'F2', 'F1'] as CareerCategory[]).map((cat, i) => (
                <React.Fragment key={cat}>
                  <span>{cat}</span>
                  {i < 4 && <span>→</span>}
                </React.Fragment>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* ======== CREATE DRIVER ======== */}
        {screen === 'create-driver' && (
          <motion.div
            key="create-driver"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <div className="w-full max-w-sm">
              <button onClick={() => setScreen('welcome')} className="text-slate-400 mb-8 flex items-center gap-2 hover:text-white transition-colors text-sm">
                ← Back
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-black">Create Your Driver</h2>
                <p className="text-slate-400 mt-2">Your identity throughout your entire career.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-widest block mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="e.g. Alex"
                    maxLength={20}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-lg"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 uppercase tracking-widest block mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="e.g. Ramirez"
                    maxLength={20}
                    onKeyDown={e => e.key === 'Enter' && firstName.trim() && lastName.trim() && setScreen('team-select')}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500 text-lg"
                  />
                </div>

                <AnimatePresence>
                  {firstName && lastName && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-4 bg-white/5 rounded-2xl"
                    >
                      <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Driver Preview</p>
                      <p className="text-2xl font-black">{firstName} {lastName}</p>
                      <p className="text-red-400 text-sm mt-1">Formula 4 Rookie · Season 1</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => setScreen('team-select')}
                  disabled={!firstName.trim() || !lastName.trim()}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/30"
                >
                  Confirm Driver →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======== TEAM SELECT (F4 start) ======== */}
        {screen === 'team-select' && (
          <motion.div
            key="team-select"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-col items-center min-h-screen p-6 pt-10 pb-16"
          >
            <div className="w-full max-w-lg">
              <button onClick={() => setScreen('create-driver')} className="text-slate-400 mb-6 flex items-center gap-2 hover:text-white transition-colors text-sm">
                ← Back
              </button>
              <h2 className="text-3xl font-black mb-1">Choose Your F4 Team</h2>
              <p className="text-slate-400 mb-8 text-sm">Your career begins here. Better cars give you a bigger advantage.</p>

              <div className="space-y-4">
                {getTeamsForCategory('F4').map((team, i) => (
                  <motion.button
                    key={team.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      const ai = generateAIDrivers('F4', team.id);
                      const newPlayer: PlayerSave = {
                        firstName: firstName.trim(),
                        lastName: lastName.trim(),
                        teamId: team.id,
                        category: 'F4',
                        season: 1,
                        raceIndex: 0,
                        points: 0,
                        wins: 0,
                        podiums: 0,
                        driverSkill: 45,
                        teamPerformanceBonus: 0,
                        aiDrivers: ai,
                        seasonResults: [],
                        careerHistory: [],
                      };
                      setPlayer(newPlayer);
                      setHasSave(true);
                      setScreen('hub');
                    }}
                    className="w-full text-left p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 rounded-2xl transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{team.name}</span>
                      <span
                        className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full"
                        style={{ background: team.color + '33', color: team.color }}
                      >
                        {team.performance}/100
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{team.description}</p>
                    <PerformanceBar value={team.performance} color={team.color} />
                    <div className="mt-2 flex justify-between text-xs">
                      <span className="text-slate-500">Car Performance</span>
                      <span style={{ color: team.color }}>
                        {team.performance >= 55 ? '★ Strong' : team.performance >= 48 ? '◆ Balanced' : '○ Developing'}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ======== HUB ======== */}
        {screen === 'hub' && player && (
          <motion.div
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen p-4 pt-6 pb-28"
          >
            <div className="max-w-lg mx-auto">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest">Season {player.season}</p>
                  <h2 className="text-2xl font-black leading-tight">{player.firstName} {player.lastName}</h2>
                </div>
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider"
                  style={{ background: (currentTeam?.color ?? '#fff') + '22', color: currentTeam?.color ?? '#fff', border: `1px solid ${(currentTeam?.color ?? '#fff')}44` }}
                >
                  {CATEGORY_LABELS[player.category]}
                </div>
              </div>

              {/* Season stats */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Points', value: player.points, emoji: '🏆' },
                  { label: 'Wins', value: player.wins, emoji: '🥇' },
                  { label: 'Podiums', value: player.podiums, emoji: '🏅' },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 rounded-2xl p-3 text-center">
                    <div className="text-lg">{s.emoji}</div>
                    <div className="text-xl font-black">{s.value}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Team card */}
              <div
                className="mb-5 p-4 rounded-2xl"
                style={{ background: (currentTeam?.color ?? '#fff') + '12', borderLeft: `3px solid ${currentTeam?.color ?? '#fff'}` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-slate-400">Current Team</p>
                    <p className="font-bold">{currentTeam?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Car Rating</p>
                    <p className="font-black text-xl" style={{ color: currentTeam?.color }}>
                      {(currentTeam?.performance ?? 0) + player.teamPerformanceBonus}
                    </p>
                  </div>
                </div>
                <PerformanceBar
                  value={Math.round(player.driverSkill)}
                  color="#f87171"
                  label="Driver Skill"
                />
              </div>

              {/* Next race */}
              <div className="mb-5 p-4 bg-white/5 rounded-2xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Next Race</p>
                  <p className="text-xs text-slate-500">Race {player.raceIndex + 1} / {totalRaces}</p>
                </div>
                <p className="text-xl font-black">{currentCircuit}</p>
                <div className="mt-3 w-full bg-white/10 rounded-full h-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(player.raceIndex / totalRaces) * 100}%` }}
                    className="h-1 rounded-full bg-red-500"
                  />
                </div>
                <p className="text-right text-xs text-slate-600 mt-1">{player.raceIndex} done</p>
              </div>

              {/* Championship standings */}
              {standings.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs text-slate-400 uppercase tracking-widest mb-3">Championship</h3>
                  <StandingsList list={standings} limit={8} />
                  {standings.length > 8 && (
                    <p className="text-center text-xs text-slate-600 mt-2">+{standings.length - 8} more drivers</p>
                  )}
                </div>
              )}

              {/* Career history */}
              {player.careerHistory.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs text-slate-400 uppercase tracking-widest mb-3">Career History</h3>
                  <div className="space-y-1">
                    {player.careerHistory.map((h, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg text-xs">
                        <span className="text-slate-400">Season {h.season} · {CATEGORY_LABELS[h.category]}</span>
                        <span className={`font-bold ${h.position <= 3 ? 'text-yellow-400' : 'text-slate-300'}`}>P{h.position}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom action bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-950/95 backdrop-blur-xl border-t border-white/10">
              <div className="max-w-lg mx-auto flex gap-3">
                <button
                  onClick={() => setScreen('welcome')}
                  className="py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl font-medium text-sm transition-all ring-1 ring-white/10"
                >
                  💾 Save & Exit
                </button>
                <button
                  onClick={() => setScreen('pre-race')}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-500/30"
                >
                  🏎️ Race Weekend →
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======== PRE-RACE ======== */}
        {screen === 'pre-race' && player && (
          <motion.div
            key="pre-race"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <div className="w-full max-w-sm">
              <button onClick={() => setScreen('hub')} className="text-slate-400 mb-8 flex items-center gap-2 hover:text-white transition-colors text-sm">
                ← Back to Hub
              </button>

              <div className="text-center mb-8">
                <p className="text-xs text-slate-500 uppercase tracking-widest">
                  Race {player.raceIndex + 1} of {totalRaces} · {CATEGORY_LABELS[player.category]}
                </p>
                <h2 className="text-4xl font-black mt-2">{currentCircuit}</h2>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 mb-5 space-y-3">
                {[
                  { label: 'Team', value: currentTeam?.name ?? '—' },
                  { label: 'Car Rating', value: `${(currentTeam?.performance ?? 0) + player.teamPerformanceBonus}/100` },
                  { label: 'Driver Skill', value: `${Math.round(player.driverSkill)}/100` },
                  { label: 'Championship', value: playerStanding ? `P${playerStanding.position} · ${player.points} pts` : 'N/A' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="font-bold">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-8">
                <p className="text-yellow-400 font-bold text-sm">⚡ Starting Lights Challenge</p>
                <p className="text-slate-400 text-sm mt-1">
                  Watch the five red lights. Tap <strong className="text-white">GO!</strong> the instant they extinguish—
                  your reaction time directly affects your starting position.
                </p>
              </div>

              <button
                onClick={() => setScreen('lights-out')}
                className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-xl transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-red-500/30"
              >
                🚦 Start Race
              </button>
            </div>
          </motion.div>
        )}

        {/* ======== LIGHTS OUT ======== */}
        {screen === 'lights-out' && player && (
          <motion.div
            key="lights-out"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen bg-black p-6"
          >
            <div className="w-full max-w-sm text-center">
              {/* Phase label */}
              <motion.p
                key={lightsPhase}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-slate-500 text-sm uppercase tracking-[0.3em] mb-10 h-5"
              >
                {lightsPhase === 'building' ? 'Get ready...' : lightsPhase === 'go' ? '' : ''}
              </motion.p>

              {/* 5 Red Lights */}
              <div className="flex justify-center gap-3 sm:gap-4 mb-14">
                {[1, 2, 3, 4, 5].map(i => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: lightsOn >= i ? [1, 1.15, 1] : 1,
                    }}
                    transition={{ duration: 0.15 }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-100 ${
                      lightsOn >= i
                        ? 'bg-red-500 border-red-400'
                        : 'bg-slate-900 border-slate-700'
                    }`}
                    style={lightsOn >= i ? { boxShadow: '0 0 20px #ef4444, 0 0 40px #ef444450' } : {}}
                  />
                ))}
              </div>

              {/* Reaction result overlay */}
              <AnimatePresence>
                {lightsPhase === 'done' && reactionMs !== null && (() => {
                  const rating = getReactionRating(reactionMs);
                  return (
                    <motion.div
                      key="result"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="mb-10"
                    >
                      <p className="text-5xl font-black mb-2" style={{ color: rating.color }}>
                        {rating.label}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {reactionMs < 0
                          ? 'You jumped the start!'
                          : `${reactionMs}ms reaction time`}
                      </p>
                      <p
                        className="text-sm font-bold mt-2"
                        style={{ color: rating.bonus > 0 ? '#10B981' : rating.bonus < 0 ? '#EF4444' : '#64748B' }}
                      >
                        {rating.bonus > 0
                          ? `+${rating.bonus} position bonus`
                          : rating.bonus < 0
                            ? `${Math.abs(rating.bonus)} position penalty`
                            : 'No position change'}
                      </p>
                      <p className="text-slate-600 text-xs mt-3">Simulating race...</p>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>

              {/* React button */}
              {lightsPhase !== 'done' && (
                <motion.button
                  animate={canReact ? { scale: [1, 1.04, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.4 }}
                  onClick={handleReactionClick}
                  className={`w-full py-8 rounded-3xl font-black text-2xl transition-all duration-100 select-none ${
                    canReact
                      ? 'bg-green-500 hover:bg-green-400 shadow-2xl shadow-green-500/50'
                      : 'bg-white/5 text-slate-600 cursor-default'
                  }`}
                >
                  {canReact ? '🟢 GO!' : 'WAIT...'}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}

        {/* ======== RACE RESULT ======== */}
        {screen === 'race-result' && player && lastRaceResult && (
          <motion.div
            key="race-result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center min-h-screen p-6 pt-10 pb-32"
          >
            <div className="w-full max-w-sm">
              {/* Trophy / position header */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                className="text-center mb-8"
              >
                {lastRaceResult.playerPosition === 1 ? (
                  <>
                    <div className="text-6xl mb-3">🏆</div>
                    <h2 className="text-4xl font-black text-yellow-400">VICTORY!</h2>
                  </>
                ) : lastRaceResult.playerPosition <= 3 ? (
                  <>
                    <div className="text-6xl mb-3">{lastRaceResult.playerPosition === 2 ? '🥈' : '🥉'}</div>
                    <h2 className="text-4xl font-black text-slate-200">PODIUM!</h2>
                  </>
                ) : lastRaceResult.playerPosition <= 10 ? (
                  <>
                    <div className="text-5xl mb-3">🏁</div>
                    <h2 className="text-3xl font-black">Points Finish</h2>
                  </>
                ) : (
                  <>
                    <div className="text-5xl mb-3">🏎️</div>
                    <h2 className="text-3xl font-black text-slate-400">Race Complete</h2>
                  </>
                )}
              </motion.div>

              {/* Position + Points */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">Finish</p>
                  <p className={`text-4xl font-black ${
                    lastRaceResult.playerPosition === 1 ? 'text-yellow-400' :
                    lastRaceResult.playerPosition <= 3 ? 'text-slate-200' : 'text-white'
                  }`}>P{lastRaceResult.playerPosition}</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-400 mb-1">Points</p>
                  <p className="text-4xl font-black text-red-400">+{lastRaceResult.playerPoints}</p>
                </div>
              </div>

              {/* Reaction badge */}
              {(() => {
                const r = getReactionRating(lastRaceResult.reactionMs);
                return (
                  <div className="mb-5 flex items-center justify-between px-4 py-2.5 bg-white/5 rounded-xl">
                    <span className="text-slate-400 text-sm">Reaction</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ color: r.color }}>{r.label}</span>
                      {lastRaceResult.reactionMs >= 0 && (
                        <span className="text-slate-500 text-xs">({lastRaceResult.reactionMs}ms)</span>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Top 10 race results */}
              <h3 className="text-xs text-slate-400 uppercase tracking-widest mb-3">Race Results — Top 10</h3>
              <div className="space-y-1 mb-8">
                {lastRaceResult.allResults.slice(0, 10).map(r => (
                  <div
                    key={`${r.name}-${r.position}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                      r.isPlayer
                        ? 'bg-red-500/20 text-red-200 font-bold ring-1 ring-red-500/40'
                        : 'bg-white/5 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-5 text-center font-bold text-xs ${r.position <= 3 ? 'text-yellow-400' : 'text-slate-500'}`}>
                        {r.position}
                      </span>
                      {r.isPlayer ? '🏎️ ' : ''}{r.name}
                    </span>
                    <span className="tabular-nums">{r.points > 0 ? `+${r.points}` : '—'}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleContinueFromRaceResult}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/30"
              >
                Continue →
              </button>
            </div>
          </motion.div>
        )}

        {/* ======== CAREER EVENT ======== */}
        {screen === 'career-event' && currentEvent && player && (
          <motion.div
            key="career-event"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-6"
          >
            <div className="w-full max-w-sm">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="text-6xl mb-4"
                >
                  {currentEvent.emoji}
                </motion.div>
                <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Career Event</p>
                <h2 className="text-3xl font-black">{currentEvent.title}</h2>
              </div>

              <div className="bg-white/5 rounded-2xl p-5 mb-6">
                <p className="text-slate-300 leading-relaxed">{currentEvent.description}</p>
                {currentEvent.effect !== 'none' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`mt-4 p-3 rounded-xl text-sm font-bold flex items-center gap-2 ${
                      currentEvent.effect === 'performance_penalty'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    <span>{currentEvent.effect === 'performance_penalty' ? '▼' : '▲'}</span>
                    {currentEvent.effect === 'skill_boost' && `+${currentEvent.value} Driver Skill`}
                    {currentEvent.effect === 'performance_boost' && `+${currentEvent.value} Car Performance`}
                    {currentEvent.effect === 'performance_penalty' && `-${currentEvent.value} Car Performance`}
                  </motion.div>
                )}
              </div>

              <button
                onClick={handleCareerEventContinue}
                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95"
              >
                Understood →
              </button>
            </div>
          </motion.div>
        )}

        {/* ======== SEASON END ======== */}
        {screen === 'season-end' && player && (
          <motion.div
            key="season-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center min-h-screen p-6 pt-10 pb-32"
          >
            <div className="w-full max-w-sm">
              <div className="text-center mb-8">
                <p className="text-xs text-slate-400 uppercase tracking-widest">Season {player.season} Complete</p>
                <h2 className="text-2xl font-black mt-1">{CATEGORY_LABELS[player.category]}</h2>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className={`mt-4 inline-block px-5 py-2 rounded-full font-black text-2xl ${
                    finalChampionshipPosition === 1
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : finalChampionshipPosition <= 3
                        ? 'bg-slate-400/20 text-slate-200'
                        : 'bg-white/10 text-white'
                  }`}
                >
                  {finalChampionshipPosition === 1 ? '🏆 Champion!' :
                    finalChampionshipPosition === 2 ? '🥈 Runner-Up' :
                    finalChampionshipPosition === 3 ? '🥉 P3' :
                    `P${finalChampionshipPosition}`}
                </motion.div>

                <AnimatePresence>
                  {isPromotionPending && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-4 p-3 bg-green-500/15 border border-green-500/40 rounded-2xl"
                    >
                      <p className="text-green-400 font-bold text-sm">🎉 Promotion Eligible</p>
                      <p className="text-slate-400 text-xs mt-0.5">You can advance to {CATEGORY_LABELS[promotionCategory!]}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Season stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Points', value: player.points },
                  { label: 'Wins', value: player.wins },
                  { label: 'Podiums', value: player.podiums },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 rounded-2xl p-3 text-center">
                    <div className="text-xl font-black text-red-400">{s.value}</div>
                    <div className="text-xs text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>

              <h3 className="text-xs text-slate-400 uppercase tracking-widest mb-3">Final Championship</h3>
              <StandingsList list={finalStandings} limit={14} />

              <button
                onClick={() => setScreen('team-offers')}
                className="w-full mt-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/30"
              >
                View Team Offers →
              </button>
            </div>
          </motion.div>
        )}

        {/* ======== TEAM OFFERS ======== */}
        {screen === 'team-offers' && player && (
          <motion.div
            key="team-offers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center min-h-screen p-6 pt-10 pb-16"
          >
            <div className="w-full max-w-lg">
              <div className="text-center mb-8">
                <p className="text-xs text-slate-400 uppercase tracking-widest">Off-Season</p>
                <h2 className="text-3xl font-black mt-1">Team Offers</h2>
                <p className="text-slate-400 text-sm mt-2">
                  {isPromotionPending
                    ? `Choose your ${CATEGORY_LABELS[promotionCategory!]} team for next season.`
                    : 'Select your team for next season.'}
                </p>
              </div>

              <div className="space-y-4">
                {teamOffers.map((team, i) => {
                  const isNextCat = team.category !== player.category;
                  return (
                    <motion.button
                      key={team.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSelectTeamOffer(team.id)}
                      className="w-full text-left p-5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-2xl transition-all relative"
                    >
                      {isNextCat && (
                        <div className="absolute top-3 right-3 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                          ↑ {CATEGORY_LABELS[team.category]}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mb-2 pr-20">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: team.color }} />
                        <span className="font-bold text-lg leading-tight">{team.name}</span>
                      </div>
                      <p className="text-slate-400 text-sm mb-3">{team.description}</p>
                      <PerformanceBar value={team.performance} color={team.color} />
                      <div className="mt-2 flex justify-between text-xs">
                        <span className="text-slate-500">Car Performance</span>
                        <span style={{ color: team.color }} className="font-bold">{team.performance}/100</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ======== PROMOTION ======== */}
        {screen === 'promotion' && player && (
          <motion.div
            key="promotion"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-yellow-500/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="text-7xl mb-6"
            >
              🎉
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">Promotion</p>
              <h2 className="text-4xl font-black mb-3">
                Welcome to<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                  {CATEGORY_LABELS[player.category]}!
                </span>
              </h2>
              <p className="text-slate-400 max-w-xs mx-auto">
                You've proven yourself and earned your place at the next level. 
                Now the real challenge begins.
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={() => setScreen('hub')}
              className="mt-10 px-10 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-500/30"
            >
              Begin Season {player.season} →
            </motion.button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default F1CareerGame;
