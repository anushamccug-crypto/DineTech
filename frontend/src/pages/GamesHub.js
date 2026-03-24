import React, { useState, useEffect } from "react";

/* ================= REFINED THEME ================= */

const theme = {
  bg: "linear-gradient(135deg, #fff6e5, #fde2e4)",
  primary: "#8e7dbe",
  accent: "#ff8fab",
  soft: "#f3f0ff",
  card: "#ffffff",
  text: "#2f2f2f",
};

/* ================= MAIN HUB ================= */

function GamesHub() {
  const [activeGame, setActiveGame] = useState(null);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "480px", minHeight: "540px", background: theme.bg, borderRadius: "20px", padding: "25px", boxSizing: "border-box", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: "100%" }}>
          {!activeGame && (
            <>
              <h1 style={{ textAlign: "center", marginBottom: "20px" }}>🎮 While You Wait</h1>
              <GameCard title="🧠 Memory Match" onClick={() => setActiveGame("memory")} />
              <GameCard title="🧩 Sliding Puzzle" onClick={() => setActiveGame("puzzle")} />
              <GameCard title="🍕 Food Trivia" onClick={() => setActiveGame("quiz")} />
              <GameCard title="🎯 Reaction Challenge" onClick={() => setActiveGame("reaction")} />
              <GameCard title="🔤 Word Builder" onClick={() => setActiveGame("word")} />
            </>
          )}

          {activeGame === "memory" && <MemoryGame goBack={() => setActiveGame(null)} />}
          {activeGame === "puzzle" && <SlidingPuzzle goBack={() => setActiveGame(null)} />}
          {activeGame === "quiz" && <FoodQuiz goBack={() => setActiveGame(null)} />}
          {activeGame === "reaction" && <ReactionGame goBack={() => setActiveGame(null)} />}
          {activeGame === "word" && <WordBuilder goBack={() => setActiveGame(null)} />}
        </div>
      </div>
    </div>
  );
}

/* ================= GAME CARD ================= */

function GameCard({ title, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: theme.soft,
        padding: "14px 18px",
        borderRadius: "14px",
        marginBottom: "10px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.07)",
        cursor: "pointer",
      }}
    >
      <h4 style={{ margin: 0 }}>{title}</h4>
    </div>
  );
}

/* ================= WRAPPER ================= */

function GameWrapper({ title, children, goBack }) {
  return (
    <div style={{ width: "100%", background: theme.card, padding: "20px", borderRadius: "18px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, color: theme.primary }}>{title}</h3>
        <button onClick={goBack}>Exit</button>
      </div>

      <div style={{ marginTop: "15px", textAlign: "center" }}>{children}</div>
    </div>
  );
}

/* ================= FOOD TRIVIA ================= */

function FoodQuiz({ goBack }) {
  const questions = [
    { q: "Capital of Italian pizza?", options: ["Rome","Naples","Milan","Venice"], answer: "Naples" },
    { q: "Main ingredient in sushi?", options: ["Rice","Bread","Cheese","Chicken"], answer: "Rice" },
    { q: "Famous Indian rice dish?", options: ["Fried Rice","Biryani","Risotto","Paella"], answer: "Biryani" },
    { q: "Which country is famous for tacos?", options: ["India","Mexico","Italy","Japan"], answer: "Mexico" },
{ q: "What is the main ingredient in guacamole?", options: ["Tomato","Avocado","Potato","Onion"], answer: "Avocado" },
{ q: "Which food is known as Italian flatbread?", options: ["Pizza","Burger","Pasta","Noodles"], answer: "Pizza" },
{ q: "What type of food is sushi?", options: ["Italian","Japanese","Indian","Mexican"], answer: "Japanese" },
{ q: "Which dessert is made from milk and sugar in India?", options: ["Gulab Jamun","Burger","Pizza","Pasta"], answer: "Gulab Jamun" },
{ q: "Which drink is made from coffee beans?", options: ["Tea","Juice","Coffee","Milkshake"], answer: "Coffee" },
{ q: "Which fast food item is typically made with a bun and patty?", options: ["Pizza","Burger","Taco","Pasta"], answer: "Burger" },
{ q: "Which country is famous for pasta?", options: ["France","Italy","China","India"], answer: "Italy" },
{ q: "Which food is wrapped in a tortilla?", options: ["Burger","Taco","Pizza","Pasta"], answer: "Taco" },
{ q: "What is the main ingredient in French fries?", options: ["Tomato","Potato","Rice","Cheese"], answer: "Potato" },
{ q: "Which dairy product is used on pizza?", options: ["Butter","Milk","Cheese","Curd"], answer: "Cheese" },
{ q: "Which meal is usually eaten in the morning?", options: ["Dinner","Lunch","Breakfast","Snack"], answer: "Breakfast" },
{ q: "Which fruit is commonly used in smoothies?", options: ["Banana","Onion","Potato","Garlic"], answer: "Banana" },
{ q: "Which spice makes food hot and spicy?", options: ["Sugar","Salt","Chili","Milk"], answer: "Chili" },
{ q: "Which Indian bread is cooked in a tandoor?", options: ["Naan","Idli","Dosa","Rice"], answer: "Naan" },
  ];

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);

  const current = questions[index];

  const next = () => {
    let newScore = score;
    if (selected === current.answer) {
      newScore++;
      setScore(newScore);
    }

    if (index === questions.length - 1) {
      setTimeout(() => {
        alert(`Game Over! Score: ${newScore}`);
        goBack();
      }, 500);
    } else {
      setSelected(null);
      setIndex(index + 1);
    }
  };

  return (
    <GameWrapper title="Food Trivia" goBack={goBack}>

      {/* HEADER: SCORE + PROGRESS */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "12px"
      }}>
        <span><b>Score:</b> {score}</span>
        <span><b>Q:</b> {index + 1}/{questions.length}</span>
      </div>

      {/* QUESTION CARD */}
      <div style={{
        background: theme.soft,
        padding: "15px",
        borderRadius: "12px",
        marginBottom: "15px",
        fontWeight: "500",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
      }}>
        {current.q}
      </div>

      {/* OPTIONS */}
      <div style={{ display: "grid", gap: "10px" }}>
        {current.options.map((opt, i) => {
          const isCorrect = opt === current.answer;
          const isSelected = selected === opt;

          let bg = theme.soft;

          if (selected) {
            if (isCorrect) bg = "#b8f2e6"; // green
            else if (isSelected) bg = "#ffccd5"; // red
          }

          return (
            <button
              key={i}
              onClick={() => setSelected(opt)}
              disabled={selected !== null}
              style={{
                padding: "10px",
                borderRadius: "10px",
                border: "none",
                background: bg,
                cursor: "pointer",
                fontWeight: "500",
                transition: "0.2s"
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* RESULT */}
      {selected && (
        <>
          <p
            style={{
              marginTop: "12px",
              fontWeight: "bold",
              color: selected === current.answer ? "green" : "red"
            }}
          >
            {selected === current.answer
              ? "🎉 Correct Answer!"
              : `❌ Correct: ${current.answer}`}
          </p>

          <button
            onClick={next}
            style={{
              marginTop: "10px",
              padding: "8px 18px",
              borderRadius: "10px",
              border: "none",
              background: theme.primary,
              color: "white",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Next →
          </button>
        </>
      )}
    </GameWrapper>
  );
}

/* ================= WORD BUILDER ================= */

function WordBuilder({ goBack }) {
  const words = [
  "BURGER","PIZZA","TACO","PASTA","SUSHI",

  "NOODLE","SAMOSA","DOSAS","IDLI","PANEER",
  "CHAPATI","PARATHA","BIRYANI","KABAB","CUTLET",

  "SANDWICH","FRIES","OMELET","PANCAKE","WAFFLE",
  "CHEESE","BUTTER","CREAM","MILKSHAKE",

  "DONUT","BISCUIT","CAKE","COOKIE","BROWNIE",
  "CUPCAKE","PASTRY","TOFFEE","CANDY",

  "APPLE","MANGO","BANANA","ORANGE","GRAPES",
  "PAPAYA","GUAVA","PEACH","CHERRY",

  "SOUP","SALAD","PICKLE","SAUCE","CHUTNEY",
  "SPICES","CURRY","DAL","RASAM",

  "POPCORN","NACHOS","MAGGI","UPMA","POHA"
];
  const getWord = () => words[Math.floor(Math.random() * words.length)];

  const [word, setWord] = useState(getWord());
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [count, setCount] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const scrambled = word.split("").sort(() => 0.5 - Math.random());

  const check = () => {
    setShowResult(true);

    let newScore = score;
    if (input.toUpperCase() === word) {
      newScore++;
      setScore(newScore);
    }

    const newCount = count + 1;
    setCount(newCount);

    if (newCount === 5) {
      setTimeout(() => {
        alert(`Score: ${newScore}`);
        goBack();
      }, 500);
    }
  };

  const nextWord = () => {
    setWord(getWord());
    setInput("");
    setShowResult(false);
  };

  return (
    <GameWrapper title="Word Builder" goBack={goBack}>
      
      {/* SCORE + ROUND */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
        <span><b>Score:</b> {score}</span>
        <span><b>Round:</b> {count + 1}/5</span>
      </div>

      {/* SCRAMBLED LETTERS */}
      <div style={{ marginBottom: "15px" }}>
        {scrambled.map((l, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              padding: "10px 12px",
              margin: "5px",
              background: theme.accent,
              color: "white",
              borderRadius: "10px",
              fontWeight: "bold",
              fontSize: "16px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
            }}
          >
            {l}
          </span>
        ))}
      </div>

      {/* INPUT */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your answer..."
        style={{
          padding: "10px",
          borderRadius: "10px",
          border: "1px solid #ddd",
          width: "90%",
          textAlign: "center",
          fontSize: "16px",
          outline: "none",
          marginBottom: "12px"
        }}
      />

      {/* BUTTONS */}
      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={check}
          style={{
            padding: "8px 16px",
            borderRadius: "10px",
            border: "none",
            background: theme.primary,
            color: "white",
            marginRight: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Check
        </button>

        <button
          onClick={nextWord}
          style={{
            padding: "8px 16px",
            borderRadius: "10px",
            border: "none",
            background: theme.accent,
            color: "white",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Next
        </button>
      </div>

      {/* RESULT */}
      {showResult && (
        <p
          style={{
            fontWeight: "bold",
            color: input.toUpperCase() === word ? "green" : "red",
            marginTop: "8px"
          }}
        >
          {input.toUpperCase() === word ? "🎉 Correct!" : `❌ Answer: ${word}`}
        </p>
      )}
    </GameWrapper>
  );
}

/* ================= MEMORY GAME ================= */

function MemoryGame({ goBack }) {
  const emojis = ["🍕","🍔","🍟","🌮"];
  const shuffled = [...emojis, ...emojis].sort(() => 0.5 - Math.random());

  const [cards] = useState(shuffled);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (flipped.length === 2) {
      if (cards[flipped[0]] === cards[flipped[1]]) {
        setMatched(prev => [...prev, ...flipped]);
        setScore(s => s + 1);
      }
      setTimeout(() => setFlipped([]), 600);
    }
  }, [flipped]);

  useEffect(() => {
    if (matched.length === cards.length) {
      setTimeout(() => {
        alert(`Completed! Score: ${score}`);
        goBack();
      }, 500);
    }
  }, [matched]);

  return (
    <GameWrapper title="Memory Match" goBack={goBack}>
      <p><b>Score:</b> {score}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,60px)", gap: "8px", justifyContent: "center" }}>
        {cards.map((card, i) => (
          <div
            key={i}
            onClick={() =>
              flipped.length < 2 &&
              !flipped.includes(i) &&
              !matched.includes(i) &&
              setFlipped([...flipped, i])
            }
            style={{
              height: "60px",
              background: theme.primary,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "10px",
              color: "white",
              fontSize: "22px",
              cursor: "pointer"
            }}
          >
            {flipped.includes(i) || matched.includes(i) ? card : "?"}
          </div>
        ))}
      </div>
    </GameWrapper>
  );
}

/* ================= SLIDING PUZZLE ================= */

function SlidingPuzzle({ goBack }) {
  const create = () => [...Array(15).keys()].map(n => n + 1).concat(null).sort(() => 0.5 - Math.random());
  const [tiles, setTiles] = useState(create());
  const [moves, setMoves] = useState(0);

  const move = (i) => {
    const empty = tiles.indexOf(null);
    const valid = [i - 1, i + 1, i - 4, i + 4];

    if (valid.includes(empty)) {
      const newTiles = [...tiles];
      [newTiles[i], newTiles[empty]] = [newTiles[empty], newTiles[i]];
      setTiles(newTiles);
      setMoves(moves + 1);
    }
  };

  useEffect(() => {
    const win = tiles.slice(0,15).every((n,i)=>n===i+1);
    if (win) {
      setTimeout(() => {
        alert(`Solved in ${moves} moves`);
        goBack();
      }, 500);
    }
  }, [tiles]);

  return (
    <GameWrapper title="Sliding Puzzle" goBack={goBack}>
      <p><b>Moves:</b> {moves}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,60px)", gap: "8px", justifyContent: "center" }}>
        {tiles.map((t,i)=>(
          <div
            key={i}
            onClick={()=>t && move(i)}
            style={{
              height:"60px",
              borderRadius:"10px",
              background: t ? theme.primary : "transparent",
              display:"flex",
              justifyContent:"center",
              alignItems:"center",
              color:"white",
              fontWeight:"bold",
              cursor: t ? "pointer" : "default"
            }}
          >
            {t}
          </div>
        ))}
      </div>
    </GameWrapper>
  );
}

/* ================= REACTION GAME ================= */

function ReactionGame({ goBack }) {
  const foods = ["🍕","🍔","🍩","🍟","🌮"];
  const [pos, setPos] = useState({top:80,left:80});
  const [emoji, setEmoji] = useState("🍕");
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(10);

  useEffect(()=>{
    const move=setInterval(()=>{
      setPos({top:Math.random()*220,left:Math.random()*220});
      setEmoji(foods[Math.floor(Math.random()*foods.length)]);
    },800);

    const timer=setInterval(()=>setTime(t=>t-1),1000);

    return ()=>{clearInterval(move);clearInterval(timer);}
  },[]);

  useEffect(()=>{
    if(time===0){
      setTimeout(()=>{
        alert(`Time Up! Score: ${score}`);
        goBack();
      },300);
    }
  },[time]);

  return (
    <GameWrapper title="Reaction Challenge" goBack={goBack}>
      <p><b>Score:</b> {score} | <b>Time:</b> {time}s</p>

      <div style={{ position:"relative", height:"260px", background:theme.soft, borderRadius:"12px" }}>
        <div
          onClick={()=>setScore(s=>s+1)}
          style={{ position:"absolute", top:pos.top, left:pos.left, fontSize:"30px", cursor:"pointer" }}
        >
          {emoji}
        </div>
      </div>
    </GameWrapper>
  );
}

export default GamesHub;