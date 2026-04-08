import { useState, useEffect, useRef, KeyboardEvent, useMemo } from 'react';
import { 
  Terminal as TerminalIcon, 
  Server, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Cpu, 
  HardDrive, 
  ShieldAlert,
  Info,
  History,
  User,
  LogOut,
  Award,
  BookOpen,
  Zap,
  Network,
  Database,
  Lock,
  Search,
  Layout,
  Layers,
  Activity,
  Globe,
  ShieldCheck,
  Box,
  Calendar,
  BarChart3,
  Terminal,
  Settings,
  Cloud,
  Container,
  Monitor,
  Shield,
  Code,
  ChevronLeft,
  X,
  RefreshCw,
  Cpu as CpuIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- DATA ARCHITECTURE ---

interface AcademyDay {
  dayNumber: number;
  title: string;
  realWorldScenario: string;
  theRootCause: string;
  knowledgeBase: string;
  documentation: string;
  terminalTask: string;
  validation: (input: string) => boolean;
}

const academyData: AcademyDay[] = [
  {
    dayNumber: 1,
    title: "The Boot Sequence & Kernel Initialization",
    realWorldScenario: "The server is stuck at a blinking cursor after a power outage. The CEO is breathing down your neck because the main ERP system is offline. You need to understand what happens before the login prompt appears.",
    theRootCause: "Boot failures often occur because the bootloader (GRUB) cannot find the kernel image or the initramfs is corrupted. Without the kernel, the hardware is just expensive silicon; it cannot manage memory or CPU cycles.",
    knowledgeBase: "The boot process follows: BIOS/UEFI -> Bootloader (GRUB) -> Kernel -> Init (Systemd). The Kernel is the bridge between hardware and software. It initializes drivers and mounts the root filesystem.",
    documentation: "1. Check BIOS/UEFI boot order.\n2. Verify /boot partition exists.\n3. Use 'ls /boot' to see kernel versions.\n4. Manual: 'man bootparam'",
    terminalTask: "List the contents of the /boot directory to verify the kernel image exists.",
    validation: (input) => /^ls\s+\/boot\/?$/.test(input.trim())
  },
  {
    dayNumber: 2,
    title: "Kernel Space vs. User Space",
    realWorldScenario: "An application is crashing with 'Operation not permitted'. The developer claims their code is perfect. You suspect a syscall violation.",
    theRootCause: "Modern OSs use 'Protection Rings'. Kernel Space (Ring 0) has direct hardware access. User Space (Ring 3) is restricted. Applications must use 'System Calls' (syscalls) to ask the kernel for resources.",
    knowledgeBase: "This separation prevents a buggy web browser from crashing the entire server. When a program needs to write to disk, it triggers a 'trap' to the kernel, which performs the action on its behalf.",
    documentation: "1. Use 'strace' to track syscalls.\n2. Understand 'Privilege Escalation'.\n3. Manual: 'man syscalls'",
    terminalTask: "Run 'uname -a' to see the current kernel version managing your hardware.",
    validation: (input) => /^uname\s+-a$/.test(input.trim())
  },
  {
    dayNumber: 3,
    title: "The Filesystem Hierarchy Standard (FHS)",
    realWorldScenario: "A Junior admin installed a custom script in /etc and now the configuration management tool is throwing errors. You need to enforce order.",
    theRootCause: "Linux follows a strict hierarchy. /etc is for configuration, /bin for essential binaries, /var for variable data (logs), and /usr for user programs. Deviating from this causes 'Path Hell'.",
    knowledgeBase: "The FHS ensures that any Linux admin can walk into any server and know where the logs are (/var/log) and where the binaries live (/usr/bin). It's the 'map' of the system.",
    documentation: "1. /etc: System-wide config.\n2. /home: User data.\n3. /root: Admin data.\n4. Manual: 'man hier'",
    terminalTask: "Navigate to the system configuration directory (/etc).",
    validation: (input) => /^cd\s+\/etc\/?$/.test(input.trim())
  },
  {
    dayNumber: 4,
    title: "Inodes: The DNA of a File",
    realWorldScenario: "The disk reports 50% free space, but users get 'No space left on device' when trying to save files. The database is frozen.",
    theRootCause: "Filesystems have a limited number of 'Inodes'. Every file uses one Inode to store metadata (permissions, size, pointers to data blocks). If you have millions of tiny files, you run out of Inodes before you run out of bytes.",
    knowledgeBase: "An Inode does NOT store the filename; that's stored in the directory file. The Inode stores the 'what' and 'where' of the data on the physical platters or flash cells.",
    documentation: "1. Use 'df -i' to check inode usage.\n2. Use 'ls -i' to see a file's inode number.\n3. Manual: 'man 7 inode'",
    terminalTask: "Check the inode usage of the current filesystem.",
    validation: (input) => /^df\s+-i$/.test(input.trim())
  },
  {
    dayNumber: 5,
    title: "Process Lifecycle: Fork & Exec",
    realWorldScenario: "A 'Fork Bomb' is running on the dev server, spawning thousands of processes and locking the CPU. You need to understand how processes are born to kill them.",
    theRootCause: "In Linux, new processes are created via 'fork()' (cloning the parent) and then 'exec()' (replacing the clone with a new program). If fork() is called in an infinite loop, the system hits its PID limit.",
    knowledgeBase: "Every process has a Parent PID (PPID). The first process (PID 1) is the ancestor of all others. Understanding this tree is vital for troubleshooting 'Zombie' processes.",
    documentation: "1. Use 'ps -ef' to see the process tree.\n2. Use 'pstree' for a visual map.\n3. Manual: 'man 2 fork'",
    terminalTask: "Display the process tree to see parent-child relationships.",
    validation: (input) => /^pstree$/.test(input.trim())
  },
  {
    dayNumber: 6,
    title: "Standard Streams: Redirection Logic",
    realWorldScenario: "A cron job is filling up the root partition with error messages. You need to silence the noise while keeping the important data.",
    theRootCause: "Every process has three default file descriptors: 0 (Stdin), 1 (Stdout), and 2 (Stderr). By default, both 1 and 2 go to the screen. You must redirect them to separate files or /dev/null.",
    knowledgeBase: "Redirection (>, >>, 2>) allows you to chain logic. '2>&1' sends errors to the same place as standard output. This is the foundation of automated logging.",
    documentation: "1. > : Overwrite Stdout.\n2. >> : Append Stdout.\n3. 2> : Redirect Stderr.\n4. Manual: 'man bash' (Redirection section)",
    terminalTask: "Redirect the output of 'ls' to a file named 'filelist.txt'.",
    validation: (input) => /^ls\s+>\s+filelist\.txt$/.test(input.trim())
  },
  {
    dayNumber: 7,
    title: "Signal Handling: SIGTERM vs SIGKILL",
    realWorldScenario: "A database backup script is stuck. You tried to close it, but it's ignoring you. You're tempted to use the 'nuclear option'.",
    theRootCause: "Signals are software interrupts. SIGTERM (15) is a polite request to stop (allowing cleanup). SIGKILL (9) is an immediate kernel-level termination that leaves no room for cleanup, potentially corrupting data.",
    knowledgeBase: "Processes can 'catch' or 'ignore' SIGTERM, but SIGKILL is handled by the kernel and cannot be ignored. Always try 15 before 9.",
    documentation: "1. kill -15 [PID] : Polite.\n2. kill -9 [PID] : Forceful.\n3. Manual: 'man 7 signal'",
    terminalTask: "List all available signals the system can send to a process.",
    validation: (input) => /^kill\s+-l$/.test(input.trim())
  },
  {
    dayNumber: 8,
    title: "Shell Expansion & Globbing",
    realWorldScenario: "You need to delete 5,000 log files ending in '.old' but keep the ones ending in '.log'. Doing this manually would take hours.",
    theRootCause: "The shell performs 'Expansion' before executing a command. Wildcards like '*' and '?' are expanded by the shell, not the command itself. If you mess up the pattern, you delete the wrong data.",
    knowledgeBase: "Globbing is the shell's pattern matching. '*' matches any string, '?' matches one character. Braces {a,b} allow for complex string generation.",
    documentation: "1. * : Wildcard.\n2. ? : Single char.\n3. [a-z] : Range.\n4. Manual: 'man 7 glob'",
    terminalTask: "List all files in the current directory that end with '.txt' using a wildcard.",
    validation: (input) => /^ls\s+\*\.txt$/.test(input.trim())
  },
  {
    dayNumber: 9,
    title: "Environment Variables & Scope",
    realWorldScenario: "A script works when you run it manually, but fails when run by a service user. The 'API_KEY' is missing.",
    theRootCause: "Variables have 'Scope'. A local variable only exists in the current shell. An 'Exported' environment variable is inherited by child processes. Service users often have empty environments.",
    knowledgeBase: "The 'env' command shows inherited variables. 'export' promotes a local variable to an environment variable. This is critical for passing secrets and config to apps.",
    documentation: "1. VAR=val : Local.\n2. export VAR : Global.\n3. env : View all.\n4. Manual: 'man export'",
    terminalTask: "Display all current environment variables.",
    validation: (input) => /^env$/.test(input.trim())
  },
  {
    dayNumber: 10,
    title: "The PATH: How Commands are Found",
    realWorldScenario: "You installed a new version of Python, but the system keeps running the old one. You're getting 'Command not found' for your custom scripts.",
    theRootCause: "The PATH variable is a colon-separated list of directories. When you type 'ls', the shell searches these directories in order. If your directory isn't in the PATH, or is at the end, the wrong binary wins.",
    knowledgeBase: "The 'which' command tells you which binary the shell found. Modifying PATH is how you control the execution environment without using absolute paths.",
    documentation: "1. echo $PATH : View.\n2. which [cmd] : Locate.\n3. PATH=$PATH:/new/dir : Add.\n4. Manual: 'man which'",
    terminalTask: "Print the current value of your PATH variable.",
    validation: (input) => /^echo\s+\$PATH$/.test(input.trim())
  }
];

// Fill placeholders for 11-360
for (let i = 11; i <= 360; i++) {
  academyData.push({
    dayNumber: i,
    title: `Advanced Mastery - Day ${i}`,
    realWorldScenario: "A complex infrastructure challenge awaits.",
    theRootCause: "Deep system-level architectural complexity.",
    knowledgeBase: "Advanced theoretical concepts in systems administration.",
    documentation: "Refer to official man pages and architectural whitepapers.",
    terminalTask: "Execute the mastery command.",
    validation: (input) => input.trim() === 'mastery'
  });
}

// --- APP COMPONENT ---

export default function App() {
  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    const saved = localStorage.getItem('sysadmin_academy_progress');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentDayNumber, setCurrentDayNumber] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<{ text: string; type: 'input' | 'output' | 'error' | 'system' }[]>([]);
  const [terminalInput, setTerminalInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const currentDay = useMemo(() => 
    currentDayNumber ? academyData.find(d => d.dayNumber === currentDayNumber) : null
  , [currentDayNumber]);

  const xp = completedDays.length * 100;
  const level = Math.floor(xp / 1000) + 1;

  useEffect(() => {
    localStorage.setItem('sysadmin_academy_progress', JSON.stringify(completedDays));
  }, [completedDays]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalOutput]);

  const handleDayClick = (dayNum: number) => {
    setCurrentDayNumber(dayNum);
    setTerminalOutput([
      { text: `--- ACADEMY LAB: DAY ${dayNum} ---`, type: 'system' },
      { text: `TASK: ${academyData[dayNum - 1].terminalTask}`, type: 'output' },
    ]);
  };

  const processCommand = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setTerminalOutput(prev => [...prev, { text: `$ ${trimmed}`, type: 'input' }]);
    setHistory(prev => [trimmed, ...prev].slice(0, 50));
    setHistoryIndex(-1);

    if (trimmed === 'clear') {
      setTerminalOutput([]);
      return;
    }

    if (currentDay?.validation(trimmed)) {
      setTerminalOutput(prev => [
        ...prev,
        { text: "Command validated. System state updated.", type: 'output' },
        { text: "DAY COMPLETE! +100 XP", type: 'system' }
      ]);
      if (!completedDays.includes(currentDay.dayNumber)) {
        setCompletedDays(prev => [...prev, currentDay.dayNumber]);
      }
      setTimeout(() => {
        setShowSuccess(true);
      }, 1000);
    } else {
      setTerminalOutput(prev => [...prev, { text: `bash: ${trimmed.split(' ')[0]}: command failed or incorrect syntax for this lab.`, type: 'error' }]);
    }
  };

  const getRank = (lvl: number) => {
    if (lvl <= 5) return "Newbie";
    if (lvl <= 15) return "Junior Admin";
    if (lvl <= 30) return "SysAdmin";
    if (lvl <= 50) return "Senior Admin";
    return "Master Architect";
  };

  const getMonthTheme = (month: number) => {
    const themes = [
      "The Kernel & Shell", "The Kernel & Shell",
      "Identity & Access", "Identity & Access",
      "Advanced Networking", "Advanced Networking",
      "Services & Persistence", "Services & Persistence",
      "Automation & IaC", "Automation & IaC",
      "Cloud & Disaster Recovery", "Cloud & Disaster Recovery"
    ];
    return themes[month - 1];
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-200 font-sans flex flex-col overflow-hidden selection:bg-emerald-500 selection:text-black">
      {/* HEADER */}
      <header className="bg-slate-900/80 border-b border-slate-800 px-8 py-4 flex items-center justify-between backdrop-blur-xl shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CpuIcon className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tighter text-white italic">360-Day SysAdmin Deep-Dive</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold">Advanced Academy Framework</p>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="flex flex-col items-end">
            <div className="flex justify-between w-64 text-[10px] font-bold uppercase tracking-widest mb-2">
              <span className="text-slate-500">Academy Progress</span>
              <span className="text-emerald-500">{completedDays.length}/360 Days</span>
            </div>
            <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-0.5">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(completedDays.length / 360) * 100}%` }}
                className="h-full bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Level</p>
              <p className="text-xl font-black text-white">{level}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Award className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-bold">Rank</p>
            <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">{getRank(level)}</p>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {currentDayNumber === null ? (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full overflow-y-auto p-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950"
            >
              <div className="max-w-7xl mx-auto space-y-12">
                {Array.from({ length: 12 }, (_, m) => m + 1).map(month => (
                  <section key={month} className="space-y-6">
                    <div className="flex items-end justify-between border-b border-slate-800 pb-4">
                      <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Month {month}</h2>
                        <p className="text-xs text-emerald-500 font-bold uppercase tracking-[0.2em]">{getMonthTheme(month)}</p>
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        {completedDays.filter(d => d > (month-1)*30 && d <= month*30).length} / 30 Days
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3">
                      {Array.from({ length: 30 }, (_, d) => (month - 1) * 30 + d + 1).map(dayNum => {
                        const isCompleted = completedDays.includes(dayNum);
                        const isLocked = dayNum > completedDays.length + 1;
                        
                        return (
                          <button
                            key={dayNum}
                            disabled={isLocked}
                            onClick={() => handleDayClick(dayNum)}
                            className={`aspect-square rounded-xl border flex flex-col items-center justify-center transition-all relative group ${
                              isCompleted ? 'bg-emerald-500 border-emerald-500 text-black' : 
                              isLocked ? 'bg-slate-900/20 border-slate-800 text-slate-700 cursor-not-allowed opacity-50' :
                              'bg-slate-900 border-slate-800 text-slate-400 hover:border-emerald-500/50 hover:bg-slate-800'
                            }`}
                          >
                            <span className="text-xs font-black">{dayNum}</span>
                            {isCompleted && <CheckCircle2 className="absolute top-1 right-1 w-2.5 h-2.5" />}
                            {!isLocked && !isCompleted && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500/50" />}
                            
                            {/* Tooltip */}
                            {!isLocked && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 border border-slate-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                                <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">{academyData[dayNum-1].title}</p>
                                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                  <div className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-slate-700'} w-full`} />
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
              key="learning-center"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="h-full flex flex-col"
            >
              {/* Lab Header */}
              <div className="bg-slate-900 border-b border-slate-800 px-8 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => {
                      setCurrentDayNumber(null);
                      setShowSuccess(false);
                    }}
                    className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-slate-700 transition-all group"
                    title="Back to Dashboard"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">{currentDay?.title}</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Day {currentDay?.dayNumber} • {getMonthTheme(Math.ceil(currentDay!.dayNumber / 30))}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 flex items-center gap-3">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-white">100 XP</span>
                  </div>
                  <button 
                    onClick={() => {
                      setCurrentDayNumber(prev => (prev && prev < 360) ? prev + 1 : prev);
                      setShowSuccess(false);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Split Screen */}
              <div className="flex-1 flex overflow-hidden">
                {/* Left Side: Senior's Lecture */}
                <div className="w-1/2 border-r border-slate-800 overflow-y-auto p-10 space-y-10 scrollbar-thin scrollbar-thumb-slate-800">
                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Real-World Scenario
                    </h3>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 relative">
                      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <User className="w-6 h-6 text-slate-500" />
                      </div>
                      <p className="text-lg text-slate-200 italic leading-relaxed font-serif">
                        "{currentDay?.realWorldScenario}"
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Settings className="w-4 h-4" /> The Root Cause
                    </h3>
                    <div className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8">
                      <p className="text-slate-300 leading-relaxed">
                        {currentDay?.theRootCause}
                      </p>
                    </div>
                  </section>

                  <section className="space-y-4">
                    <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] flex items-center gap-2">
                      <Info className="w-4 h-4" /> Knowledge Base
                    </h3>
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-8">
                      <p className="text-slate-300 leading-relaxed">
                        {currentDay?.knowledgeBase}
                      </p>
                    </div>
                  </section>
                </div>

                {/* Right Side: Action Zone */}
                <div className="w-1/2 flex flex-col bg-slate-950">
                  {/* Documentation */}
                  <div className="p-10 border-b border-slate-800 shrink-0">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Lab Documentation
                    </h3>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                      <pre className="text-xs font-mono text-slate-400 whitespace-pre-wrap leading-relaxed">
                        {currentDay?.documentation}
                      </pre>
                    </div>
                  </div>

                  {/* Terminal Simulator */}
                  <div className="flex-1 flex flex-col p-10 overflow-hidden">
                    <div className="flex-1 bg-black rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
                      <div className="bg-slate-900/80 border-b border-slate-800 px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500/50" />
                          <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                          <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500">academy@deep-dive: ~</span>
                        <div className="w-12" />
                      </div>

                      <div className="flex-1 p-8 overflow-y-auto font-mono text-sm scrollbar-thin scrollbar-thumb-slate-800">
                        {terminalOutput.map((line, i) => (
                          <div 
                            key={i} 
                            className={`mb-2 whitespace-pre-wrap break-all ${
                              line.type === 'error' ? 'text-red-400' : 
                              line.type === 'system' ? 'text-emerald-500 font-bold' : 
                              line.type === 'input' ? 'text-white' : 'text-slate-400'
                            }`}
                          >
                            {line.text}
                          </div>
                        ))}
                        <div className="flex items-center gap-3 mt-6">
                          <span className="text-emerald-500 font-bold shrink-0">$</span>
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
                          />
                        </div>
                        <div ref={terminalEndRef} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Success Notification Overlay */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                    exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 p-10"
                  >
                    <motion.div 
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      className="bg-slate-900 border border-emerald-500/50 rounded-[3rem] p-16 text-center max-w-lg shadow-[0_0_100px_rgba(16,185,129,0.15)] relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
                      <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                      </div>
                      <h2 className="text-4xl font-black tracking-tighter uppercase italic mb-4 text-white">Day {currentDay?.dayNumber} Mastered</h2>
                      <p className="text-slate-500 text-sm mb-10 uppercase tracking-[0.3em] font-bold">Knowledge Verified • +100 XP Awarded</p>
                      
                      <div className="space-y-4">
                        <button 
                          onClick={() => {
                            setShowSuccess(false);
                            if (currentDayNumber && currentDayNumber < 360) {
                              handleDayClick(currentDayNumber + 1);
                            }
                          }}
                          className="w-full bg-emerald-500 text-black py-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                        >
                          Next Lesson <ChevronRight className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => {
                            setShowSuccess(false);
                            setCurrentDayNumber(null);
                          }}
                          className="w-full bg-slate-800 text-white py-5 rounded-2xl font-black uppercase tracking-[0.3em] hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
                        >
                          <Layout className="w-5 h-5" /> Back to Dashboard
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

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 px-8 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Academy Core Online</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="text-[10px] font-bold text-slate-500">
            <span className="text-emerald-500">360-DAY</span> DEEP-DIVE SYLLABUS LOADED
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Total XP:</span>
            <span className="text-sm font-black text-white">{xp}</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Rank:</span>
            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">{getRank(level)}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
