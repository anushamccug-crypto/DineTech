import React, { useState, useEffect } from "react";

const theme = {
  bg: "#FDF8F2", // Matches your Dashboard Cream
  primary: "#5D534A", // Dark Brown
  accent: "#D4A373", // Gold/Tan
  soft: "#F1E9E0", // Light Sand
  card: "#ffffff",
  text: "#5D534A",
};

/* ================= MAIN HUB ================= */

function GamesHub({ onGameOver }) {
  const [activeGame, setActiveGame] = useState(null);

  const handleFinalScore = (score) => {
    if (onGameOver) onGameOver(score);
    setActiveGame(null);
  };

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px", boxSizing: "border-box" }}>
      <div style={{ width: "100%", maxWidth: "480px", background: theme.bg, borderRadius: "30px", padding: "25px", display: "flex", flexDirection: "column", alignItems: "center", border: `2px solid ${theme.soft}` }}>
        {!activeGame ? (
          <div style={{ width: "100%" }}>
            <h1 style={{ textAlign: "center", fontFamily: "serif", fontStyle: "italic", color: theme.primary, marginBottom: "5px" }}>🎮 Play & Win</h1>
            <p style={{ textAlign: "center", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", color: "#AAA", marginBottom: "25px" }}>
              Reach 500 points for a <span style={{ color: theme.accent }}>FREE Ice-Cream!</span> 🍦
            </p>
            <GameCard title="🧠 Memory Match" onClick={() => setActiveGame("memory")} />
            <GameCard title="🧩 Sliding Puzzle" onClick={() => setActiveGame("puzzle")} />
            <GameCard title="🍕 Food Trivia" onClick={() => setActiveGame("quiz")} />
            <GameCard title="🎯 Reaction Challenge" onClick={() => setActiveGame("reaction")} />
            <GameCard title="🔤 Word Builder" onClick={() => setActiveGame("word")} />
          </div>
        ) : (
          <div style={{ width: "100%" }}>
            {activeGame === "memory" && <MemoryGame onWin={(s) => handleFinalScore(s * 50)} goBack={() => setActiveGame(null)} />}
            {activeGame === "puzzle" && <SlidingPuzzle onWin={(s) => handleFinalScore(150)} goBack={() => setActiveGame(null)} />}
            {activeGame === "quiz" && <FoodQuiz onWin={(s) => handleFinalScore(s * 25)} goBack={() => setActiveGame(null)} />}
            {activeGame === "reaction" && <ReactionGame onWin={(s) => handleFinalScore(s * 10)} goBack={() => setActiveGame(null)} />}
            {activeGame === "word" && <WordBuilder onWin={(s) => handleFinalScore(s * 30)} goBack={() => setActiveGame(null)} />}
          </div>
        )}
      </div>
    </div>
  );
}

function GameCard({ title, onClick }) {
  return (
    <div 
      onClick={onClick} 
      style={{ background: "white", padding: "18px", borderRadius: "20px", marginBottom: "12px", border: `2px solid ${theme.soft}`, cursor: "pointer", transition: "all 0.2s", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.accent}
      onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.soft}
    >
      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "800", color: theme.primary, textTransform: "uppercase", letterSpacing: "1px" }}>{title}</h4>
      <span style={{ fontSize: "18px" }}>→</span>
    </div>
  );
}

function GameWrapper({ title, children, goBack }) {
  return (
    <div style={{ width: "100%", background: "white", padding: "25px", borderRadius: "25px", border: `3px solid ${theme.primary}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: `1px solid ${theme.soft}`, paddingBottom: "10px" }}>
        <h3 style={{ margin: 0, fontFamily: "serif", fontStyle: "italic", color: theme.primary }}>{title}</h3>
        <button onClick={goBack} style={{ border: "none", background: theme.soft, padding: "5px 12px", borderRadius: "10px", cursor: "pointer", fontSize: "10px", fontWeight: "900" }}>EXIT</button>
      </div>
      <div style={{ textAlign: "center" }}>{children}</div>
    </div>
  );
}

/* ================= UPDATED SLIDING PUZZLE ================= */

function SlidingPuzzle({ onWin, goBack }) {
  const size = 3; 
  const [tiles, setTiles] = useState([]);

  useEffect(() => {
    let initialTiles = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
    initialTiles.push(null); 
    
    // Solvable Shuffle
    let shuffled = [...initialTiles];
    for (let i = 0; i < 100; i++) {
      const emptyIdx = shuffled.indexOf(null);
      const possibleMoves = [];
      if (emptyIdx % size > 0) possibleMoves.push(emptyIdx - 1);
      if (emptyIdx % size < size - 1) possibleMoves.push(emptyIdx + 1);
      if (emptyIdx >= size) possibleMoves.push(emptyIdx - size);
      if (emptyIdx < size * size - size) possibleMoves.push(emptyIdx + size);
      
      const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      [shuffled[emptyIdx], shuffled[move]] = [shuffled[move], shuffled[emptyIdx]];
    }
    setTiles(shuffled);
  }, []);

  const move = (i) => {
    const emptyIdx = tiles.indexOf(null);
    const isNeighbor = (i === emptyIdx - 1 && i % size !== size - 1) ||
                       (i === emptyIdx + 1 && i % size !== 0) ||
                       (i === emptyIdx - size) ||
                       (i === emptyIdx + size);

    if (isNeighbor) {
      const newTiles = [...tiles];
      [newTiles[i], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[i]];
      setTiles(newTiles);

      const win = newTiles.every((t, idx) => idx === size * size - 1 ? t === null : t === idx + 1);
      if (win) setTimeout(() => onWin(1), 500);
    }
  };

  return (
    <GameWrapper title="Sliding Puzzle" goBack={goBack}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", background: theme.soft, padding: "10px", borderRadius: "15px" }}>
        {tiles.map((t, i) => (
          <div key={i} onClick={() => t && move(i)} style={{ height: "70px", background: t ? theme.primary : "transparent", color: "white", display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "12px", cursor: "pointer", fontSize: "20px", fontWeight: "900", boxShadow: t ? `0 4px 0 ${theme.accent}` : "none" }}>
            {t}
          </div>
        ))}
      </div>
    </GameWrapper>
  );
}

/* ================= OTHER GAMES ================= */

function FoodQuiz({ onWin, goBack }) {
  const questions = [
    { q: "Capital of Italian pizza?", options: ["Rome","Naples","Milan","Venice"], answer: "Naples" },
    { q: "Main ingredient in sushi?", options: ["Rice","Bread","Cheese","Chicken"], answer: "Rice" },
    { q: "Famous Indian rice dish?", options: ["Fried Rice","Biryani","Risotto","Paella"], answer: "Biryani" }
  ];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  const next = () => {
    let newScore = score + (selected === questions[index].answer ? 1 : 0);
    setScore(newScore);
    if (index === questions.length - 1) onWin(newScore);
    else { setSelected(null); setIndex(index + 1); }
  };

  return (
    <GameWrapper title="Food Trivia" goBack={goBack}>
      <p style={{ fontSize: "10px", fontWeight: "900", color: theme.accent }}>QUESTION {index + 1}/{questions.length}</p>
      <div style={{ background: theme.soft, padding: "15px", borderRadius: "15px", margin: "10px 0", fontWeight: "700" }}>{questions[index].q}</div>
      <div style={{ display: "grid", gap: "10px" }}>
        {questions[index].options.map((opt, i) => (
          <button key={i} onClick={() => setSelected(opt)} style={{ padding: "12px", borderRadius: "12px", border: "none", background: selected === opt ? theme.primary : theme.soft, color: selected === opt ? "white" : theme.primary, cursor: "pointer", fontWeight: "700" }}>{opt}</button>
        ))}
      </div>
      {selected && <button onClick={next} style={{ marginTop: "20px", width: "100%", padding: "12px", background: theme.accent, color: "white", border: "none", borderRadius: "12px", fontWeight: "900" }}>NEXT</button>}
    </GameWrapper>
  );
}

function MemoryGame({ onWin, goBack }) {
  const emojis = ["🍕","🍔","🍟","🌮","🍣","🍩"];
  const [cards] = useState([...emojis, ...emojis].sort(() => 0.5 - Math.random()));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  useEffect(() => {
    if (flipped.length === 2) {
      if (cards[flipped[0]] === cards[flipped[1]]) setMatched([...matched, ...flipped]);
      setTimeout(() => setFlipped([]), 600);
    }
  }, [flipped]);

  useEffect(() => {
    if (matched.length === cards.length) onWin(6);
  }, [matched]);

  return (
    <GameWrapper title="Memory Match" goBack={goBack}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
        {cards.map((card, i) => (
          <div key={i} onClick={() => flipped.length < 2 && !flipped.includes(i) && !matched.includes(i) && setFlipped([...flipped, i])} style={{ height: "65px", background: flipped.includes(i) || matched.includes(i) ? "white" : theme.primary, border: `2px solid ${theme.primary}`, display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "15px", fontSize: "24px", cursor: "pointer" }}>
            {flipped.includes(i) || matched.includes(i) ? card : "?"}
          </div>
        ))}
      </div>
    </GameWrapper>
  );
}

function ReactionGame({ onWin, goBack }) {
  const [pos, setPos] = useState({ top: 50, left: 50 });
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    const move = setInterval(() => setPos({ top: Math.random() * 80, left: Math.random() * 80 }), 800);
    return () => { clearInterval(timer); clearInterval(move); };
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) onWin(score);
  }, [timeLeft]);

  return (
    <GameWrapper title="Reaction" goBack={goBack}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: "900", color: theme.accent, marginBottom: "10px" }}>
        <span>TIME: {timeLeft}s</span>
        <span>SCORE: {score}</span>
      </div>
      <div style={{ height: "220px", background: theme.soft, position: "relative", borderRadius: "15px", overflow: "hidden" }}>
        <div onClick={() => setScore(score + 1)} style={{ position: "absolute", top: pos.top + "%", left: pos.left + "%", fontSize: "40px", cursor: "pointer", transition: "0.2s" }}>🍎</div>
      </div>
    </GameWrapper>
  );
}

function WordBuilder({ onWin, goBack }) {
  const words = ["BURGER","PIZZA","TACO","PASTA","SUSHI","STEAK"];
  const [word, setWord] = useState(words[Math.floor(Math.random()*words.length)]);
  const [input, setInput] = useState("");
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);

  const check = () => {
    const isCorrect = input.toUpperCase() === word;
    const newScore = score + (isCorrect ? 1 : 0);
    setScore(newScore);
    if (round === 3) onWin(newScore);
    else { setRound(round + 1); setWord(words[Math.floor(Math.random()*words.length)]); setInput(""); }
  };

  return (
    <GameWrapper title="Word Builder" goBack={goBack}>
      <p style={{ fontSize: "10px", fontWeight: "900", color: theme.accent }}>ROUND {round}/3</p>
      <h2 style={{ letterSpacing: "8px", color: theme.primary, margin: "20px 0", fontSize: "28px" }}>{word.split("").sort(()=>0.5-Math.random()).join("")}</h2>
      <input value={input} onChange={(e)=>setInput(e.target.value)} style={{ padding: "15px", width: "100%", borderRadius: "15px", border: `2px solid ${theme.soft}`, textAlign: "center", fontSize: "18px", fontWeight: "700", boxSizing: "border-box" }} placeholder="UNSCRAMBLE..." />
      <button onClick={check} style={{ marginTop: "20px", padding: "15px", background: theme.primary, color: "white", border: "none", borderRadius: "15px", width: "100%", fontWeight: "900" }}>SUBMIT</button>
    </GameWrapper>
  );
}

export default GamesHub;