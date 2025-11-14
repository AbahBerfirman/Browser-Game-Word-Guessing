// Simple quiz engine
const QUESTIONS = [
  {q: "Ibukota Indonesia?", choices:["Jakarta","Bandung","Surabaya","Medan"], a:0},
  {q: "Planet ketiga dari Matahari?", choices:["Venus","Bumi","Mars","Merkurius"], a:1},
  {q: "HTML adalah singkatan dari?", choices:["Hyper Text Markup Language","High Transfer Markup Language","Hyperlinks Text Markup","Home Tool Markup"], a:0},
  {q: "Warna hasil gabungan merah + biru (seni) ?", choices:["Hijau","Ungu","Kuning","Cyan"], a:1},
  {q: "Bahasa pemrograman utama web client?", choices:["Python","C++","JavaScript","Go"], a:2},
  {q: "Satuan arus listrik?", choices:["Volt","Ohm","Ampere","Watt"], a:2},
  {q: "Gunung tertinggi di dunia?", choices:["K2","Everest","Kilimanjaro","Denali"], a:1},
  {q: "Format gambar raster umum web?", choices:["SVG","PNG","HTML","SQL"], a:1},
  {q: "Apa singkatan CSS?", choices:["Cascading Style Sheets","Computer Style System","Creative Style Sheets","Coded Style Syntax"], a:0},
  {q: "Sistem operasi open-source populer?", choices:["Windows","macOS","Linux","iOS"], a:2}
];

const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const endScreen = document.getElementById('end-screen');

const startBtn = document.getElementById('startBtn');
const playerNameInput = document.getElementById('playerName');
const numQsSelect = document.getElementById('numQs');

const playerDisplay = document.getElementById('playerDisplay');
const qIndexEl = document.getElementById('qIndex');
const qTotalEl = document.getElementById('qTotal');
const questionText = document.getElementById('questionText');
const answersDiv = document.getElementById('answers');
const feedback = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');

const nextBtn = document.getElementById('nextBtn');
const quitBtn = document.getElementById('quitBtn');

const finalScoreEl = document.getElementById('finalScore');
const summaryEl = document.getElementById('summary');
const restartBtn = document.getElementById('restartBtn');
const downloadResults = document.getElementById('downloadResults');

let shuffled = [];
let current = 0;
let score = 0;
let perQuestionTime = 15;
let timer = null;
let remaining = 0;
let results = [];

function shuffleArray(arr){
  return arr.slice().sort(()=>Math.random()-0.5);
}

function startQuiz(){
  const name = playerNameInput.value.trim() || "Pemain";
  const count = Number(numQsSelect.value) || 10;
  playerDisplay.textContent = name;
  shuffled = shuffleArray(QUESTIONS).slice(0, count);
  qTotalEl.textContent = shuffled.length;
  current = 0; score = 0; results = [];
  scoreEl.textContent = score;
  startScreen.classList.add('hidden');
  endScreen.classList.add('hidden');
  quizScreen.classList.remove('hidden');
  showQuestion();
}

function showQuestion(){
  clearTimeout(timer);
  feedback.textContent = '';
  nextBtn.classList.add('hidden');
  const item = shuffled[current];
  qIndexEl.textContent = current+1;
  questionText.textContent = item.q;
  answersDiv.innerHTML = '';
  item.choices.forEach((c,i)=>{
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.setAttribute('role','listitem');
    btn.setAttribute('data-index', i);
    btn.setAttribute('aria-pressed','false');
    btn.textContent = c;
    btn.addEventListener('click', onAnswer);
    answersDiv.appendChild(btn);
  });
  remaining = perQuestionTime;
  timerEl.textContent = remaining;
  timer = setInterval(()=>{
    remaining--;
    timerEl.textContent = remaining;
    if(remaining <= 0){
      clearInterval(timer);
      handleTimeout();
    }
  }, 1000);
}

function onAnswer(e){
  if(!e || !e.currentTarget) return;
  clearInterval(timer);
  const chosen = Number(e.currentTarget.getAttribute('data-index'));
  const correct = shuffled[current].a;
  const correctBtn = [...answersDiv.children].find(b => Number(b.getAttribute('data-index')) === correct);
  if(chosen === correct){
    e.currentTarget.classList.add('correct');
    feedback.textContent = 'Benar! +10';
    score += 10;
    results.push({q: shuffled[current].q, chosen: shuffled[current].choices[chosen], correct: shuffled[current].choices[correct], ok: true});
  } else {
    e.currentTarget.classList.add('wrong');
    if (correctBtn) correctBtn.classList.add('correct');
    feedback.textContent = 'Salah!';
    results.push({q: shuffled[current].q, chosen: shuffled[current].choices[chosen], correct: shuffled[current].choices[correct], ok: false});
  }
  scoreEl.textContent = score;
  // disable buttons
  [...answersDiv.children].forEach(b => b.disabled = true);
  nextBtn.classList.remove('hidden');
}

function handleTimeout(){
  feedback.textContent = 'Waktu habis!';
  const correct = shuffled[current].a;
  const correctBtn = [...answersDiv.children].find(b => Number(b.getAttribute('data-index')) === correct);
  if (correctBtn) correctBtn.classList.add('correct');
  results.push({q: shuffled[current].q, chosen: null, correct: shuffled[current].choices[correct], ok: false, timeout: true});
  [...answersDiv.children].forEach(b => b.disabled = true);
  nextBtn.classList.remove('hidden');
}

nextBtn.addEventListener('click', ()=>{
  current++;
  if(current >= shuffled.length){
    endQuiz();
  } else {
    showQuestion();
  }
});

quitBtn.addEventListener('click', ()=>{
  if(confirm('Yakin ingin keluar?')) {
    location.reload();
  }
});

function endQuiz(){
  clearInterval(timer);
  quizScreen.classList.add('hidden');
  endScreen.classList.remove('hidden');
  finalScoreEl.textContent = score;
  const name = playerDisplay.textContent || 'Pemain';
  summaryEl.textContent = `${name}, kamu mendapat ${score} poin dari ${shuffled.length} soal.`;
  // prepare download
  const lines = [`Nama: ${name}`, `Skor: ${score}`, `Soal yang dijawab:`];
  results.forEach((r,i)=>{
    lines.push(`${i+1}. ${r.q}`);
    lines.push(`   Jawaban: ${r.chosen ?? '[tidak menjawab]'}`);
    lines.push(`   Benar: ${r.correct}`);
  });
  const blob = new Blob([lines.join("\n")], {type:'text/plain'});
  const url = URL.createObjectURL(blob);
  downloadResults.href = url;
}

restartBtn.addEventListener('click', ()=>{
  location.reload();
});

startBtn.addEventListener('click', startQuiz);

// keyboard accessibility: pilih jawaban dengan angka 1..4
document.addEventListener('keydown', (e)=>{
  if(quizScreen.classList.contains('hidden')) return;
  const key = e.key;
  if(['1','2','3','4'].includes(key)){
    const idx = Number(key)-1;
    const btn = [...answersDiv.children][idx];
    if(btn && !btn.disabled) btn.click();
  }
});
