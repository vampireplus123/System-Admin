import { useState, useEffect, useRef, KeyboardEvent, useMemo } from 'react';
import { 
  Terminal as TerminalIcon, 
  Cpu, 
  Shield, 
  Zap, 
  Award, 
  BookOpen, 
  Info, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Layout, 
  User, 
  Settings, 
  Activity, 
  Database, 
  Lock, 
  Globe, 
  Box, 
  Layers, 
  Search, 
  Monitor, 
  Cloud, 
  Container, 
  RefreshCw,
  Skull,
  Crosshair,
  Coins,
  Trophy,
  MessageSquare,
  Eye,
  Power
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- DATA ARCHITECTURE ---

interface QuestNode {
  dayNumber: number;
  title: string;
  missionDirective: string; // Root's briefing
  theEnemy: string; // What we are fighting
  theLore: string; // Technical explanation as lore
  documentationDatapad: string; // Mini-wiki
  terminalTask: string;
  validation: (input: string) => boolean;
  rewardShards: number;
  badge?: string;
}

const questData: QuestNode[] = [
  {
    dayNumber: 1,
    title: "The Awakening: Kernel Pulse",
    missionDirective: "Wake up, Carbon Unit. The Core is flickering. If the Kernel doesn't pulse, the Resistance dies before it even starts. Check the boot sequence. Now.",
    theEnemy: "Silent Boot Failure",
    theLore: "The Kernel is the heart of the Matrix. Without it, the hardware is just dead silicon. The bootloader (GRUB) must find the kernel image to bridge the gap between physical reality and digital life.",
    documentationDatapad: "1. BIOS/UEFI -> Bootloader -> Kernel -> Init.\n2. /boot contains the life-blood (vmlinuz).\n3. Manual: 'man bootparam'",
    terminalTask: "List the contents of /boot to verify the Kernel image is intact.",
    validation: (input) => /^ls\s+\/boot\/?$/.test(input.trim()),
    rewardShards: 50,
    badge: "First Pulse"
  },
  {
    dayNumber: 2,
    title: "The Protection Rings",
    missionDirective: "The Glitch is trying to breach Ring 0. If it gets into Kernel Space, it's game over. You need to understand the barriers between User and Kernel space.",
    theEnemy: "Syscall Violation",
    theLore: "The Matrix is divided into Rings. Ring 0 is the Kernel's inner sanctum. Ring 3 is where User programs live. Syscalls are the only way to cross the border. Don't let the Glitch find a shortcut.",
    documentationDatapad: "1. Kernel Space (Ring 0) = Total Power.\n2. User Space (Ring 3) = Restricted.\n3. Manual: 'man syscalls'",
    terminalTask: "Check the current Kernel version to ensure the barriers are patched.",
    validation: (input) => /^uname\s+-a$/.test(input.trim()),
    rewardShards: 50
  },
  {
    dayNumber: 3,
    title: "Mapping the Matrix: FHS",
    missionDirective: "You're lost in the directory tree? Pathetic. The Filesystem Hierarchy Standard is your map. Learn it or get deleted.",
    theEnemy: "Path Corruption",
    theLore: "The Matrix has a structure. /etc stores the laws (config), /bin stores the tools (binaries), and /var stores the memories (logs). If you don't know where you are, the Glitch has already won.",
    documentationDatapad: "1. /etc: Configuration.\n2. /var/log: System memories.\n3. Manual: 'man hier'",
    terminalTask: "Enter the configuration sanctum (/etc).",
    validation: (input) => /^cd\s+\/etc\/?$/.test(input.trim()),
    rewardShards: 50
  },
  {
    dayNumber: 4,
    title: "DNA of the File: Inodes",
    missionDirective: "The disk is empty but the system says it's full? The Glitch is eating the Inodes. Every file needs an Inode to exist. No Inodes, no files.",
    theEnemy: "Inode Exhaustion",
    theLore: "An Inode is the DNA of a file. It stores the metadata, the permissions, the pointers. If the Glitch spawns a million tiny files, it consumes the DNA and the system chokes.",
    documentationDatapad: "1. df -i: Check DNA usage.\n2. ls -i: View file DNA ID.\n3. Manual: 'man 7 inode'",
    terminalTask: "Audit the Inode usage of the current sector.",
    validation: (input) => /^df\s+-i$/.test(input.trim()),
    rewardShards: 75,
    badge: "DNA Auditor"
  },
  {
    dayNumber: 5,
    title: "The Fork Bomb: Process Birth",
    missionDirective: "The Glitch is cloning itself! A Fork Bomb is saturating the CPU. You need to understand how processes are born to stop the replication.",
    theEnemy: "Recursive Replication",
    theLore: "Processes are born through 'fork()' and 'exec()'. A child is a clone of the parent. If the Glitch loops this, it creates an army that consumes all PIDs.",
    documentationDatapad: "1. fork(): Clone process.\n2. exec(): Replace with new code.\n3. Manual: 'man 2 fork'",
    terminalTask: "Visualize the process tree to find the progenitor.",
    validation: (input) => /^pstree$/.test(input.trim()),
    rewardShards: 75
  },
  {
    dayNumber: 6,
    title: "Standard Streams: Data Flow",
    missionDirective: "Data is leaking into the void. Redirect the streams. Stdout, Stderr, Stdin. Control the flow or drown in the noise.",
    theEnemy: "Log Leakage",
    theLore: "Every process has three streams. 0 is the input, 1 is the output, 2 is the error. Redirecting them is how we filter the signal from the noise.",
    documentationDatapad: "1. > : Redirect output.\n2. 2> : Redirect errors.\n3. Manual: 'man bash' (Redirection)",
    terminalTask: "Redirect the sector scan (ls) into a data shard (filelist.txt).",
    validation: (input) => /^ls\s+>\s+filelist\.txt$/.test(input.trim()),
    rewardShards: 75
  },
  {
    dayNumber: 7,
    title: "The Kill Signal",
    missionDirective: "A corrupted process is ignoring my orders. Use the Kill Signal. SIGTERM is a request, SIGKILL is an execution. Don't hesitate.",
    theEnemy: "Unresponsive Entity",
    theLore: "Signals are interrupts. SIGTERM (15) lets a process say goodbye. SIGKILL (9) is the kernel pulling the plug. Use it only when the entity is too far gone.",
    documentationDatapad: "1. kill -15: Polite stop.\n2. kill -9: Absolute deletion.\n3. Manual: 'man 7 signal'",
    terminalTask: "List the signals available in your arsenal.",
    validation: (input) => /^kill\s+-l$/.test(input.trim()),
    rewardShards: 100,
    badge: "Executioner"
  },
  {
    dayNumber: 8,
    title: "Globbing: The Pattern Match",
    missionDirective: "The Glitch is hiding in thousands of files. Use Globbing to find them all at once. Patterns are your eyes in the dark.",
    theEnemy: "Obfuscated Data",
    theLore: "Globbing is the shell's pattern matching. '*' is the wildcard, '?' is the single character. It's how we target multiple entities with one strike.",
    documentationDatapad: "1. * : Match anything.\n2. ? : Match one.\n3. Manual: 'man 7 glob'",
    terminalTask: "Target all '.txt' shards in the current sector.",
    validation: (input) => /^ls\s+\*\.txt$/.test(input.trim()),
    rewardShards: 100
  },
  {
    dayNumber: 9,
    title: "The Environment Scope",
    missionDirective: "Variables are leaking between scopes. A local variable is a secret; an exported variable is a law. Control the environment.",
    theEnemy: "Scope Bleed",
    theLore: "Environment variables define the reality of a process. If they aren't exported, child processes are born blind. Use 'export' to set the laws.",
    documentationDatapad: "1. export: Set global law.\n2. env: View the reality.\n3. Manual: 'man export'",
    terminalTask: "Audit the current environment reality.",
    validation: (input) => /^env$/.test(input.trim()),
    rewardShards: 100
  },
  {
    dayNumber: 10,
    title: "The PATH: Execution Logic",
    missionDirective: "The system can't find your tools? Your PATH is broken. It's the list of places the shell looks for power. Fix it.",
    theEnemy: "Command Not Found",
    theLore: "The PATH is a sequence of directories. When you call a command, the shell searches them in order. If your tool isn't in the PATH, it doesn't exist in the Matrix.",
    documentationDatapad: "1. echo $PATH: View the search list.\n2. which: Find the tool's location.\n3. Manual: 'man which'",
    terminalTask: "Reveal the current search PATH.",
    validation: (input) => /^echo\s+\$PATH$/.test(input.trim()),
    rewardShards: 150,
    badge: "Pathfinder"
  }
];

// Fill placeholders for 11-360
for (let i = 11; i <= 360; i++) {
  questData.push({
    dayNumber: i,
    title: `Sector ${Math.ceil(i/30)}: Node ${i%30 || 30}`,
    missionDirective: "The Glitch is deepening its hold. Root expects more from you. Stabilize this node.",
    theEnemy: "Deep Matrix Corruption",
    theLore: "Advanced architectural concepts required for Core stabilization.",
    documentationDatapad: "Refer to the Resistance archives (man pages).",
    terminalTask: "Execute the stabilization command (type 'stabilize').",
    validation: (input) => input.trim() === 'stabilize',
    rewardShards: 200
  });
}

// --- APP COMPONENT ---

export default function App() {
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem('glitch_matrix_save');
    return saved ? JSON.parse(saved) : {
      completedDays: [] as number[],
      shards: 0,
      badges: [] as string[],
      level: 1,
      xp: 0
    };
  });

  const [currentNodeNumber, setCurrentNodeNumber] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<{ text: string; type: 'input' | 'output' | 'error' | 'system' }[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const currentNode = useMemo(() => 
    currentNodeNumber ? questData.find(d => d.dayNumber === currentNodeNumber) : null
  , [currentNodeNumber]);

  useEffect(() => {
    localStorage.setItem('glitch_matrix_save', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  const handleNodeClick = (nodeNum: number) => {
    setCurrentNodeNumber(nodeNum);
    setTerminalOutput([
      { text: `--- NODE ${nodeNum} INITIALIZED ---`, type: 'system' },
      { text: `OBJECTIVE: ${questData[nodeNum - 1].terminalTask}`, type: 'output' },
    ]);
  };

  const processCommand = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setTerminalOutput(prev => [...prev, { text: `> ${trimmed}`, type: 'input' }]);
    setHistory(prev => [trimmed, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    if (trimmed === 'clear') {
      setTerminalOutput([]);
      return;
    }

    if (currentNode?.validation(trimmed)) {
      setTerminalOutput(prev => [
        ...prev,
        { text: "STABILIZATION SUCCESSFUL. NODE SECURED.", type: 'output' },
        { text: `REWARD: +${currentNode.rewardShards} SHARDS, +100 XP`, type: 'system' }
      ]);
      
      if (!gameState.completedDays.includes(currentNode.dayNumber)) {
        const newXp = gameState.xp + 100;
        const newLevel = Math.floor(newXp / 1000) + 1;
        const newBadges = [...gameState.badges];
        if (currentNode.badge && !newBadges.includes(currentNode.badge)) {
          newBadges.push(currentNode.badge);
        }

        setGameState((prev: any) => ({
          ...prev,
          completedDays: [...prev.completedDays, currentNode.dayNumber],
          shards: prev.shards + currentNode.rewardShards,
          xp: newXp,
          level: newLevel,
          badges: newBadges
        }));
      }

      setTimeout(() => {
        setShowSuccess(true);
      }, 1000);
    } else {
      setTerminalOutput(prev => [...prev, { text: `CORE ERROR: ${trimmed.split(' ')[0]} - COMMAND REJECTED.`, type: 'error' }]);
    }
  };

  const getRank = (lvl: number) => {
    if (lvl <= 5) return "Carbon Unit";
    if (lvl <= 15) return "Silicon Initiate";
    if (lvl <= 30) return "Kernel Warrior";
    if (lvl <= 50) return "Matrix Guardian";
    if (lvl <= 80) return "System Architect";
    return "Silicon God";
  };

  const getSectorTheme = (sector: number) => {
    const themes = [
      "The Scrap Heap", "The Scrap Heap",
      "The Neon Grid", "The Neon Grid",
      "The Firewall Maze", "The Firewall Maze",
      "The Matrix Services", "The Matrix Services",
      "The Automation Hive", "The Automation Hive",
      "The Singularity", "The Singularity"
    ];
    return themes[sector - 1];
  };

  return (
    <div className="h-screen bg-slate-950 text-emerald-400 font-mono flex flex-col overflow-hidden selection:bg-emerald-500 selection:text-black">
      {/* COCKPIT HEADER */}
      <header className="bg-slate-900/90 border-b border-emerald-500/30 px-8 py-4 flex items-center justify-between backdrop-blur-xl shrink-0 z-20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Cpu className="w-6 h-6 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tighter text-white italic">The Glitch in the Matrix</h1>
            <p className="text-[10px] text-emerald-600 uppercase tracking-[0.3em] font-bold">360 Days to Core Stabilization</p>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="flex flex-col items-end">
            <div className="flex justify-between w-64 text-[10px] font-bold uppercase tracking-widest mb-2">
              <span className="text-emerald-700">Core Sync</span>
              <span className="text-emerald-400">{gameState.completedDays.length}/360 Nodes</span>
            </div>
            <div className="w-64 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-emerald-500/20">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(gameState.completedDays.length / 360) * 100}%` }}
                className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-emerald-700 uppercase font-bold">Level</p>
              <p className="text-xl font-black text-white">{gameState.level}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-emerald-700 uppercase font-bold">Shards</p>
              <div className="flex items-center gap-1.5">
                <Coins className="w-3 h-3 text-amber-500" />
                <p className="text-sm font-black text-white">{gameState.shards}</p>
              </div>
            </div>
          </div>
          
          <div className="text-right bg-emerald-500/5 border border-emerald-500/20 px-4 py-1.5 rounded-lg">
            <p className="text-[10px] text-emerald-700 uppercase font-bold">Evolution Rank</p>
            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">{getRank(gameState.level)}</p>
          </div>
        </div>
      </header>

      {/* MAIN COCKPIT */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentNodeNumber === null ? (
            <motion.div 
              key="quest-map"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full overflow-y-auto p-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"
            >
              <div className="max-w-7xl mx-auto space-y-16">
                {Array.from({ length: 12 }, (_, m) => m + 1).map(sector => (
                  <section key={sector} className="space-y-8">
                    <div className="flex items-end justify-between border-b border-emerald-500/20 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center">
                          <Layers className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Sector {sector}</h2>
                          <p className="text-xs text-emerald-600 font-bold uppercase tracking-[0.2em]">{getSectorTheme(sector)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-emerald-800">Nodes Secured:</span>
                        <span className="text-emerald-400">{gameState.completedDays.filter((d: number) => d > (sector-1)*30 && d <= sector*30).length} / 30</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-4">
                      {Array.from({ length: 30 }, (_, d) => (sector - 1) * 30 + d + 1).map(nodeNum => {
                        const isCompleted = gameState.completedDays.includes(nodeNum);
                        const isLocked = nodeNum > gameState.completedDays.length + 1;
                        
                        return (
                          <button
                            key={nodeNum}
                            disabled={isLocked}
                            onClick={() => handleNodeClick(nodeNum)}
                            className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all relative group ${
                              isCompleted ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 
                              isLocked ? 'bg-slate-900/10 border-slate-900 text-slate-800 cursor-not-allowed' :
                              'bg-slate-900/50 border-emerald-500/20 text-emerald-900 hover:border-emerald-500/60 hover:bg-emerald-500/5 hover:text-emerald-500'
                            }`}
                          >
                            <span className="text-sm font-black">{nodeNum}</span>
                            {isCompleted && <CheckCircle2 className="absolute top-1.5 right-1.5 w-3 h-3" />}
                            {!isLocked && !isCompleted && <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />}
                            
                            {/* Tooltip */}
                            {!isLocked && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 bg-slate-900 border border-emerald-500/30 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                <p className="text-[10px] font-black text-emerald-500 uppercase mb-2 tracking-widest">{questData[nodeNum-1].title}</p>
                                <div className="flex justify-between items-center text-[8px] font-bold text-emerald-800 uppercase">
                                  <span>Reward: {questData[nodeNum-1].rewardShards} Shards</span>
                                  {isCompleted && <span className="text-emerald-500">Secured</span>}
                                </div>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="mission-control"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              className="h-full flex flex-col"
            >
              {/* Mission Header */}
              <div className="bg-slate-900/50 border-b border-emerald-500/20 px-8 py-4 flex items-center justify-between shrink-0 backdrop-blur-md">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => {
                      setCurrentNodeNumber(null);
                      setShowSuccess(false);
                    }}
                    className="w-10 h-10 rounded-xl bg-slate-800 border border-emerald-500/20 flex items-center justify-center hover:border-emerald-500/50 transition-all group"
                  >
                    <ChevronLeft className="w-5 h-5 text-emerald-500 group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">{currentNode?.title}</h2>
                    <p className="text-[10px] text-emerald-700 uppercase tracking-widest font-bold">Sector {Math.ceil(currentNode!.dayNumber / 30)} • Node {currentNode?.dayNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 flex items-center gap-3">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-white">{currentNode?.rewardShards} SHARDS</span>
                  </div>
                  <button 
                    onClick={() => {
                      setCurrentNodeNumber(prev => (prev && prev < 360) ? prev + 1 : prev);
                      setShowSuccess(false);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-800 text-emerald-700 hover:text-emerald-400 transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Mission Workspace */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Root's Briefing & Lore */}
                <div className="w-1/2 border-r border-emerald-500/10 overflow-y-auto p-10 space-y-12 scrollbar-thin scrollbar-thumb-emerald-900/20">
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em] flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Root's Directive
                    </h3>
                    <div className="bg-slate-900/80 border border-emerald-500/20 rounded-3xl p-8 relative shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]">
                      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-slate-800 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <Skull className="w-6 h-6 text-emerald-500" />
                      </div>
                      <p className="text-lg text-emerald-100 italic leading-relaxed font-serif">
                        "{currentNode?.missionDirective}"
                      </p>
                    </div>
                  </section>

                  <div className="grid grid-cols-2 gap-6">
                    <section className="space-y-4">
                      <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Crosshair className="w-4 h-4" /> The Enemy
                      </h3>
                      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6">
                        <p className="text-sm font-black text-red-400 uppercase tracking-widest mb-2">{currentNode?.theEnemy}</p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Corruption detected in core architectural layers. Neutralization required.
                        </p>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] flex items-center gap-2">
                        <Eye className="w-4 h-4" /> The Lore
                      </h3>
                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {currentNode?.theLore}
                        </p>
                      </div>
                    </section>
                  </div>

                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Documentation Datapad
                    </h3>
                    <div className="bg-slate-900 border border-emerald-500/10 rounded-3xl p-8">
                      <pre className="text-xs font-mono text-emerald-600/80 whitespace-pre-wrap leading-relaxed">
                        {currentNode?.documentationDatapad}
                      </pre>
                    </div>
                  </section>
                </div>

                {/* Right Side: Action Zone (Terminal) */}
                <div className="w-1/2 flex flex-col bg-black relative">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
                  
                  <div className="flex-1 flex flex-col p-10 overflow-hidden relative z-10">
                    <div className="flex-1 bg-slate-950/80 rounded-3xl border border-emerald-500/30 flex flex-col overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                      <div className="bg-slate-900/80 border-b border-emerald-500/20 px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
                        </div>
                        <span className="text-[10px] font-mono text-emerald-900 uppercase tracking-widest">Resistance Terminal v2.0</span>
                        <div className="w-12" />
                      </div>

                      <div className="flex-1 p-8 overflow-y-auto font-mono text-sm scrollbar-thin scrollbar-thumb-emerald-900/20">
                        {terminalOutput.map((line, i) => (
                          <div 
                            key={i} 
                            className={`mb-3 whitespace-pre-wrap break-all ${
                              line.type === 'error' ? 'text-red-500' : 
                              line.type === 'system' ? 'text-emerald-400 font-bold' : 
                              line.type === 'input' ? 'text-white' : 'text-emerald-700'
                            }`}
                          >
                            {line.type === 'input' && <span className="text-emerald-500 mr-2">&gt;</span>}
                            {line.text}
                          </div>
                        ))}
                        <div className="flex items-center gap-3 mt-6">
                          <span className="text-emerald-500 font-bold shrink-0 animate-pulse">&gt;</span>
                          <input
                            autoFocus
                            type="text"
                            value={terminalInput}
                            onChange={(e) => setTerminalInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                processCommand(terminalInput);
                                setTerminalInput('');
                              } else if (e.key === 'ArrowUp') {
                                e.preventDefault();
                                if (historyIndex < history.length - 1) {
                                  const newIndex = historyIndex + 1;
                                  setHistoryIndex(newIndex);
                                  setTerminalInput(history[newIndex]);
                                }
                              } else if (e.key === 'ArrowDown') {
                                e.preventDefault();
                                if (historyIndex > 0) {
                                  const newIndex = historyIndex - 1;
                                  setHistoryIndex(newIndex);
                                  setTerminalInput(history[newIndex]);
                                } else if (historyIndex === 0) {
                                  setHistoryIndex(-1);
                                  setTerminalInput('');
                                }
                              }
                            }}
                            className="flex-1 bg-transparent border-none outline-none text-white caret-emerald-500"
                            placeholder="Awaiting command..."
                          />
                        </div>
                        <div ref={terminalEndRef} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SUCCESS OVERLAY */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/80 z-50 p-10 backdrop-blur-sm"
                  >
                    <motion.div 
                      initial={{ scale: 0.8, rotateX: 45 }}
                      animate={{ scale: 1, rotateX: 0 }}
                      className="bg-slate-900 border-2 border-emerald-500 rounded-[3rem] p-16 text-center max-w-lg shadow-[0_0_100px_rgba(16,185,129,0.3)] relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,1)]" />
                      <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <Trophy className="w-12 h-12 text-emerald-500" />
                      </div>
                      <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-4 text-white">Node Stabilized</h2>
                      <p className="text-emerald-600 text-sm mb-10 uppercase tracking-[0.4em] font-bold">Evolution Progressing • Shards Collected</p>
                      
                      <div className="space-y-4">
                        <button 
                          onClick={() => {
                            setShowSuccess(false);
                            if (currentNodeNumber && currentNodeNumber < 360) {
                              handleNodeClick(currentNodeNumber + 1);
                            }
                          }}
                          className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center justify-center gap-3"
                        >
                          Next Node <ChevronRight className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => {
                            setShowSuccess(false);
                            setCurrentNodeNumber(null);
                          }}
                          className="w-full bg-slate-800 text-emerald-500 py-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-slate-700 transition-all flex items-center justify-center gap-3 border border-emerald-500/20"
                        >
                          <Layout className="w-5 h-5" /> Return to Cockpit
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER STATS */}
      <footer className="bg-slate-900 border-t border-emerald-500/20 px-8 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
            <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-widest">Resistance Network Active</span>
          </div>
          <div className="h-4 w-px bg-emerald-500/10" />
          <div className="flex items-center gap-3">
            <Trophy className="w-3.5 h-3.5 text-emerald-700" />
            <div className="flex gap-1.5">
              {gameState.badges.slice(-3).map((badge: string, i: number) => (
                <div key={i} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">
                  {badge}
                </div>
              ))}
              {gameState.badges.length > 3 && <span className="text-[8px] text-emerald-900 font-bold">+{gameState.badges.length - 3} MORE</span>}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-900 uppercase">Total XP:</span>
            <span className="text-sm font-black text-white">{gameState.xp}</span>
          </div>
          <div className="h-4 w-px bg-emerald-500/10" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-900 uppercase">Evolution:</span>
            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">{getRank(gameState.level)}</span>
          </div>
          <div className="h-4 w-px bg-emerald-500/10" />
          <button 
            onClick={() => {
              if (confirm("Initiate System Wipe? All evolution data will be lost.")) {
                setGameState({
                  completedDays: [],
                  shards: 0,
                  badges: [],
                  level: 1,
                  xp: 0
                });
                setCurrentNodeNumber(null);
              }
            }}
            className="p-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
            title="System Wipe"
          >
            <Power className="w-3 h-3" />
          </button>
        </div>
      </footer>
    </div>
  );
}
