import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [hits, setHits] = useState(0);
  const [gameState, setGameState] = useState('normal');
  const [activeChat, setActiveChat] = useState(null);
  const [timer, setTimer] = useState(10);
  const [userInput, setUserInput] = useState("");
  const [message, setMessage] = useState("Punch me for good vibes! 🧸");
  const [particles, setParticles] = useState([]);
  const [lane, setLane] = useState(1); // 0: Top, 1: Middle, 2: Bottom
  const [obstacles, setObstacles] = useState([]);
  const [isShuttingDown, setIsShuttingDown] = useState(false);
  const [callStatus, setCallStatus] = useState("DIALING...");
  const [bearPos, setBearPos] = useState({ x: 0, y: 0 });

  const sirenRef = useRef(null);
  const rotate = useMotionValue(0);
  const scaleY = useMotionValue(1);
  const scaleX = useMotionValue(1);
  const springRotate = useSpring(rotate, { stiffness: 120, damping: 20 });
  const springScaleY = useSpring(scaleY, { stiffness: 100, damping: 12 });
  const springScaleX = useSpring(scaleX, { stiffness: 100, damping: 12 });

  const vibeHigh = () => { if (navigator.vibrate) navigator.vibrate([500, 110, 500, 110, 800]); };

  const createParticles = useCallback(() => {
    const newParticles = Array.from({ length: 12 }).map(() => ({
      id: Math.random(),
      x: (Math.random() - 0.5) * 150,
      y: (Math.random() - 0.5) * 150,
      size: Math.random() * 40 + 20,
      drift: (Math.random() - 0.5) * 150,
      rotate: Math.random() * 360
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => setParticles((prev) => prev.slice(12)), 800);
  }, []);

  const handlePunch = () => {
    if (gameState !== 'normal') return;
    const newHits = hits + 1;
    setHits(newHits);
    createParticles();
    setBearPos({ x: (Math.random() - 0.5) * 220, y: (Math.random() - 0.5) * 250 });

    scaleY.set(0.5);
    scaleX.set(1.4);
    rotate.set((Math.random() - 0.5) * 50);
    setTimeout(() => { scaleY.set(1); scaleX.set(1); rotate.set(0); }, 200);

    // EXACT TEXT MESSAGES UNCHANGED
    if (newHits === 10) setMessage("Max is gonna hit you more! 📱🥊");
    else if (newHits === 15) setMessage("MAXXXXXX!!! SOS! 🆘");
    else if (newHits === 21) {
      setGameState('calling-max-declined');
      setCallStatus("DIALING...");
      setTimeout(() => setCallStatus("DECLINED"), 2000);
      setTimeout(() => {
        setGameState('normal');
        setMessage("Max is busy... abb aap meri orr G maaroge cya😭💅");
      }, 4500);
    }
    else if (newHits === 26) setGameState('calling-max-incoming');
    else if (newHits === 33) {
      setGameState('calling-police');
      setTimeout(() => setGameState('interrogation'), 4000);
    }
    else {
      const shortLines = [
        "Stop it, Namrata! 🛑", "That actually hurt! 🤕", "My fluff! Nooo! ☁️",
        "Police is coming! 🚨", "Max, save me! 🆘", "Bully detected! 🚩",
        "Ab bas bhi karo! ✋", "Gndi baat Namrata! 🙅‍♀️", "Cotton leak alert! ⚠️"
      ];
      setMessage(shortLines[Math.floor(Math.random() * shortLines.length)]);
    }
  };

  const startMaxChat = async () => {
    setGameState('chat');
    const dialogue = [
      { s: "Teddy", t: "Ur friend is hitting me too much sarr! 😭" },
      { s: "Max", t: "Namrata, please don't hit him! Ask him nicely." },
      { s: "Teddy", t: "She won't listen to anyone sarrr!! 🙄" },
      { s: "Max", t: "cyaa beww namrata cyu maar rhii h usko..." },
      { s: "Max", t: "Last warning! Stop or the cops are coming. 🚔" }
    ];
    for (const d of dialogue) {
      setActiveChat({ sender: d.s, text: d.t });
      await new Promise(r => setTimeout(r, 3500));
    }
    setActiveChat(null);
    setGameState('normal');
  };

  useEffect(() => {
    if (gameState === 'interrogation' && timer === 0) {
      vibeHigh();
      setGameState('warrant');
    }
    if (gameState === 'interrogation' && timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, gameState]);

  useEffect(() => {
    if (gameState === 'chasing') {
      const interval = setInterval(() => {
        setObstacles(prev => {
          const moved = prev.map(o => ({ ...o, x: o.x - 6 })).filter(o => o.x > -10);
          if (Math.random() > 0.88) moved.push({ x: 100, lane: Math.floor(Math.random() * 3) });
          // Collision check
          const collision = moved.find(o => o.x < 12 && o.x > 2 && o.lane === lane);
          if (collision) setGameState('jail');
          return moved;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [gameState, lane]);

  useEffect(() => {
    if (gameState === 'jail') {
      vibeHigh();
      try { sirenRef.current.play(); } catch (e) { }
      setTimeout(() => setIsShuttingDown(true), 8000);
      setTimeout(() => window.location.reload(), 13000);
    }
  }, [gameState]);

  useEffect(() => { setTimeout(() => setLoading(false), 2000); }, []);

  if (loading) return (
    <div className="fixed inset-0 bg-[#FFD1DC] flex flex-col items-center justify-center">
      <div className="text-8xl animate-bounce">🧸</div>
      <h1 className="text-white font-black text-2xl tracking-[0.5em] mt-4 uppercase font-sans">NAMUU.OS</h1>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center overflow-hidden touch-none select-none relative font-sans">
      <audio ref={sirenRef} src="/siren.mp3" />

      <AnimatePresence>
        {gameState === 'calling-max-declined' && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-0 z-[200] bg-slate-900 text-white flex flex-col items-center justify-center p-10">
            <div className="w-32 h-32 bg-slate-700 rounded-full mb-6 flex items-center justify-center text-6xl shadow-xl">😴</div>
            <h2 className="text-4xl font-black italic mb-2">Max</h2>
            <p className={`font-black uppercase text-2xl ${callStatus === 'DECLINED' ? 'text-red-500' : 'text-slate-400 animate-pulse'}`}>{callStatus}</p>
          </motion.div>
        )}

        {gameState === 'calling-police' && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} className="fixed inset-0 z-[200] bg-slate-950 text-white flex flex-col items-center justify-center">
            <div className="text-8xl mb-4 animate-bounce">🚨</div>
            <h2 className="text-3xl font-black uppercase italic tracking-widest">POLICE HQ</h2>
            <p className="text-red-600 animate-pulse font-bold mt-2 font-mono">TRACING LOCATION...</p>
          </motion.div>
        )}

        {gameState === 'calling-max-incoming' && (
          <motion.div initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="fixed inset-0 z-[200] bg-slate-900 text-white flex flex-col items-center justify-around py-20">
            <div className="text-center">
              <div className="w-24 h-24 bg-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl shadow-2xl">📱</div>
              <h2 className="text-3xl font-black italic">Max</h2>
              <p className="text-green-500 font-black animate-pulse uppercase">Incoming Call</p>
            </div>
            <div className="flex gap-12">
              <button onClick={() => setGameState('normal')} className="w-20 h-20 bg-red-600 rounded-full text-3xl">📵</button>
              <button onClick={startMaxChat} className="w-20 h-20 bg-green-500 rounded-full text-3xl animate-bounce">📞</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="pt-10 text-center"><h1 className="text-3xl font-black text-pink-500 italic uppercase">Namuu.OS</h1></header>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative">
        <AnimatePresence>
          {activeChat && (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-4 bg-white p-5 rounded-3xl shadow-2xl border-l-[10px] border-pink-500 z-[100] w-[85%] max-w-xs">
              <p className="text-[10px] font-black text-pink-500 uppercase">{activeChat.sender}</p>
              <p className="text-sm font-bold text-gray-800">{activeChat.text}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div animate={{ x: bearPos.x, y: bearPos.y }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="relative">
          <div className="absolute inset-0 pointer-events-none z-50">
            {particles.map((p) => (
              <motion.div key={p.id} initial={{ x: 0, y: 0, opacity: 1, scale: 0 }} animate={{ x: p.x + p.drift, y: p.y + 120, opacity: 0, scale: 1.5, rotate: p.rotate }} className="absolute left-1/2 top-1/2 bg-white rounded-full blur-[10px]" style={{ width: p.size, height: p.size }} />
            ))}
          </div>
          <motion.div style={{ rotate: springRotate, scaleY: springScaleY, scaleX: springScaleX, originY: 1 }} onPointerDown={handlePunch} className="relative z-10">
            <motion.div key={message} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white px-5 py-2 rounded-2xl shadow-xl border-2 border-pink-100 whitespace-nowrap z-50">
              <p className="text-[12px] font-black italic text-pink-500 uppercase">{message}</p>
            </motion.div>
            <div className="text-[12rem] drop-shadow-2xl">🧸</div>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-10 text-center bg-white p-4 px-10 rounded-3xl shadow-2xl"><p className="text-6xl font-black text-gray-800">{hits}</p></div>
      </div>

      {/* INTERROGATION */}
      {gameState === 'interrogation' && (
        <div className="fixed inset-0 z-[250] bg-black text-white flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-red-600 font-black text-4xl italic uppercase">Interrogation</h2>
          <div className="text-9xl font-black text-white/10 absolute">{timer}</div>
          <div className="z-10 mt-10 w-full max-w-xs">
            <input autoFocus className="bg-transparent border-b-2 border-red-600 p-4 w-full text-center text-white text-lg font-bold" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Type apology..." />
            <button onClick={() => setTimer(0)} className="mt-8 bg-red-600 w-full py-4 rounded-full font-black uppercase italic tracking-tighter">Submit Confession</button>
          </div>
        </div>
      )}

      {/* WARRANT */}
      {gameState === 'warrant' && (
        <div onClick={() => setGameState('chasing')} className="fixed inset-0 z-[300] bg-neutral-900/95 flex items-center justify-center p-6 cursor-pointer">
          <div className="bg-white text-black p-8 w-full max-w-sm border-4 border-black shadow-[10px_10px_0_0_red] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-2 font-bold uppercase">Urgent</div>
            <h1 className="text-2xl font-black uppercase italic border-b-4 border-black mb-4">WARRANT FOR ARREST</h1>
            <p className="font-mono text-[11px] mb-2 font-bold uppercase">Name: NAMRATA</p>
            <p className="font-mono text-[11px] mb-2 font-bold uppercase">Crime: FIRST DEGREE TEDDY ASSAULT</p>
            <p className="font-mono text-[11px] text-gray-600 italic">"Suspect is dangerous and highly violent. Do not approach without backup."</p>
            <div className="bg-black text-white py-4 mt-6 font-black animate-pulse text-center uppercase tracking-widest">TAP TO RUN FOR YOUR LIFE!</div>
          </div>
        </div>
      )}

      {/* 3-LANE CHASE GAME */}
      {gameState === 'chasing' && (
        <div className="fixed inset-0 z-[400] bg-gray-950 flex flex-col items-center justify-center">
          <h2 className="text-white font-black text-3xl italic mb-10 tracking-tighter uppercase">Escape the Law! 🚓</h2>
          <div className="relative w-full h-80 bg-[#111] border-y-8 border-gray-800 overflow-hidden">
            {/* LANES INDICATORS */}
            <div className="absolute inset-0 flex flex-col pointer-events-none opacity-20">
              <div className="flex-1 border-b border-dashed border-gray-600"></div>
              <div className="flex-1 border-b border-dashed border-gray-600"></div>
              <div className="flex-1"></div>
            </div>

            {/* PLAYER (NAMRATA RUNNING) */}
            <motion.div
              animate={{ y: lane * 33 + '%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute left-10 text-6xl z-50 h-1/3 flex items-center"
            >
              🏃‍♀️
            </motion.div>

            {/* OBSTACLES */}
            {obstacles.map((obs, i) => (
              <div key={i} className="absolute text-5xl h-1/3 flex items-center" style={{ left: `${obs.x}%`, top: `${obs.lane * 33.3}%` }}>
                🚔
              </div>
            ))}
          </div>

          {/* CONTROLS */}
          <div className="mt-12 flex flex-col gap-4">
            <button onPointerDown={() => setLane(Math.max(0, lane - 1))} className="w-48 py-4 bg-white/10 rounded-xl border-4 border-white text-xl font-black text-white active:scale-95">MOVE UP</button>
            <button onPointerDown={() => setLane(Math.min(2, lane + 1))} className="w-48 py-4 bg-white/10 rounded-xl border-4 border-white text-xl font-black text-white active:scale-95">MOVE DOWN</button>
          </div>
        </div>
      )}

      {/* CINEMATIC ARREST ENDING */}
      {gameState === 'jail' && (
        <div className="fixed inset-0 z-[500] bg-black text-white flex flex-col items-center justify-center overflow-hidden">
          {/* Flashing Police Lights Effect */}
          <div className="absolute inset-0 bg-red-900/20 animate-pulse mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-blue-900/20 animate-[pulse_1.5s_infinite] mix-blend-overlay"></div>

          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="z-10 flex flex-col items-center p-4">
            <div className="relative mb-6">
              <div className="text-[10rem] grayscale brightness-50">👧</div>
              <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-80">⛓️</div>
            </div>

            <motion.h1
              initial={{ x: -1000 }}
              animate={{ x: 0 }}
              className="text-8xl font-black text-red-600 italic uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,0,0,1)]"
            >
              NAMRATA
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-red-600 text-black px-6 py-1 font-black text-2xl uppercase mt-2 mb-6"
            >
              CONVICTED: FIRST DEGREE MURDER
            </motion.div>

            <p className="text-gray-400 font-mono text-sm max-w-xs text-center border-t border-gray-800 pt-4">
              "Subject apprehended after high-speed pursuit. Found guilty of catastrophic violence against civilian plushies."
            </p>
          </motion.div>

          {/* Falling Jail Bars */}
          <div className="absolute inset-0 flex justify-around pointer-events-none px-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <motion.div
                key={i}
                initial={{ y: -1200 }}
                animate={{ y: 0 }}
                transition={{ delay: 1.5 + (i * 0.1), type: 'spring', stiffness: 100 }}
                className="w-4 h-full bg-gradient-to-b from-gray-700 via-gray-900 to-black shadow-[0_0_20px_black]"
              />
            ))}
          </div>
        </div>
      )}

      {isShuttingDown && (
        <div className="fixed inset-0 z-[1000] bg-black text-red-600 p-10 font-mono text-xs uppercase leading-loose">
          <p className="animate-pulse mb-2 font-black">[!] CRITICAL CRIME DETECTED</p>
          <p>Criminal: NAMRATA</p>
          <p>Sentence: LIFE IMPRISONMENT</p>
          <p className="text-white mt-10">REBOOTING FOR NEXT INMATE...</p>
        </div>
      )}
    </div>
  );
}
