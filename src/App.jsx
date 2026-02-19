import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, Sun, Heart, Coffee, Camera, Share2, 
  AlertCircle, X, ChevronRight, RotateCcw, 
  CheckCircle2, Hand, Music, BookOpen 
} from 'lucide-react';

// --- CONFIGURATION & MOCK DATA ---
const QUOTES = [
  "Lelahmu akan hilang, pahalanya insyaAllah kekal.",
  "Jadikan sabar dan sholat sebagai penolongmu.",
  "Puasa bukan cuma nahan lapar, tapi nahan jempol juga.",
  "Allah loves you more than you can imagine.",
  "Sudahkah bersyukur hari ini?"
];

const PANIC_DEEDS = [
  "Chat Ibu/Ayah: 'Makasih ya udah jadi orang tua hebat'",
  "Transfer 10rb ke teman yang lagi susah",
  "Baca Al-Ikhlas 3x (setara khatam Quran)",
  "Senyum ke orang sebelah (atau kaca)",
  "Istighfar 33x sekarang juga"
];

// --- COMPONENTS ---

// 1. Digital Tasbih Component
const TasbihModal = ({ isOpen, onClose, target = 33, title, onComplete }) => {
  const [count, setCount] = useState(0);

  if (!isOpen) return null;

  const handleTap = () => {
    const newCount = count + 1;
    setCount(newCount);
    // Haptic feedback if available (mobile)
    if (navigator.vibrate) navigator.vibrate(50);
    
    if (newCount >= target) {
      onComplete();
      setCount(0);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-xs p-6 text-center relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-sm mb-6">Target: {target}x</p>
        
        <button 
          onClick={handleTap}
          className="w-48 h-48 rounded-full bg-gradient-to-br from-lilac-400 to-purple-600 shadow-2xl shadow-purple-500/30 flex items-center justify-center mx-auto active:scale-95 transition-transform"
        >
          <div className="text-white text-5xl font-mono font-bold">
            {count}
          </div>
        </button>
        <p className="mt-6 text-gray-400 text-sm">Tap lingkaran untuk menghitung</p>
      </div>
    </div>
  );
};

// 2. Story Recap Component (For Screenshot)
const StoryRecap = ({ data, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
      <div className="relative w-full max-w-[380px] aspect-[9/16] bg-[#FDFBF7] rounded-3xl overflow-hidden shadow-2xl flex flex-col p-8 text-center border-4 border-white">
        
        <button onClick={onClose} className="absolute top-4 right-4 z-10 bg-black/10 p-2 rounded-full">
          <X className="w-5 h-5 text-gray-700" />
        </button>

        {/* Decor */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-100 to-transparent opacity-50"></div>
        
        <div className="relative z-10 flex-1 flex flex-col items-center">
          <h2 className="text-3xl font-serif font-bold text-purple-900 mb-2">Ramadhan Day {data.day}</h2>
          <div className="w-16 h-1 bg-purple-300 rounded-full mb-6"></div>

          {/* Polaroid */}
          {data.image && (
            <div className="bg-white p-3 pb-8 shadow-lg rotate-2 mb-6 w-full max-w-[240px]">
              <img src={data.image} alt="Daily" className="w-full aspect-square object-cover bg-gray-100" />
              <p className="text-gray-400 font-handwriting text-center mt-3 text-sm">My View Today</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 w-full mb-6">
            <div className="bg-purple-50 p-4 rounded-2xl">
              <span className="block text-2xl font-bold text-purple-600">{data.hearts}/3</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Jaga Lisan</span>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl">
              <span className="block text-2xl font-bold text-purple-600">{data.tilawah ? "Done" : "-"}</span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Tilawah</span>
            </div>
          </div>

          {/* Mood */}
          <div className="bg-white border-2 border-dashed border-purple-200 w-full p-4 rounded-2xl mb-auto">
            <p className="text-sm text-gray-500 mb-1">Mood Tracker</p>
            <div className="text-4xl">{data.mood || "😐"}</div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-400 font-mono">@ramadhan.raya • #RamadhanBloom</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  // --- STATE ---
  const [currentDay, setCurrentDay] = useState(1); // Harusnya auto date, tapi manual dulu buat demo
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('ramadhanBloomData');
    return saved ? JSON.parse(saved) : {};
  });
  
  // UI States
  const [showTasbih, setShowTasbih] = useState(false);
  const [tasbihType, setTasbihType] = useState('zikr'); // 'zikr' or 'shalawat'
  const [showStory, setShowStory] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [quote, setQuote] = useState(QUOTES[0]);

  // Current Day Data Helper
  const todayData = data[currentDay] || {
    fasting: true,
    sholat: { subuh: false, zuhur: false, ashar: false, maghrib: false, isya: false, tarawih: false },
    hearts: 3, // Jaga Lisan (3 Nyawa)
    tilawah: false,
    zikr: false,
    shalawat: false,
    sedekah: false,
    mood: "😐",
    menu: "",
    note: "",
    image: null
  };

  // --- EFFECTS ---
  
  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('ramadhanBloomData', JSON.stringify(data));
  }, [data]);

  // Dark Mode based on time (Simplified)
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 5) setDarkMode(true);
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  // --- HANDLERS ---

  const updateData = (field, value) => {
    setData(prev => ({
      ...prev,
      [currentDay]: { ...todayData, [field]: value }
    }));
  };

  const updateSholat = (prayer) => {
    updateData('sholat', { ...todayData.sholat, [prayer]: !todayData.sholat[prayer] });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) { // Limit 500kb
        alert("Gambarnya kegedean bestie! Maks 500KB ya biar gak lemot.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => updateData('image', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const breakHeart = () => {
    if (todayData.hearts > 0) updateData('hearts', todayData.hearts - 1);
  };

  const triggerPanic = () => {
    const randomDeed = PANIC_DEEDS[Math.floor(Math.random() * PANIC_DEEDS.length)];
    alert(`🚨 AMAL DARURAT:\n\n${randomDeed}`);
  };

  // --- RENDER HELPERS ---
  
  const moodEmoji = ["😡", "😞", "😐", "🙂", "🥰"];
  
  // Custom Color Palette (Tailwind approximation)
  // Cream: bg-[#FDFBF7]
  // Lilac: text-[#A78BFA] / bg-[#A78BFA]
  // Dark Grey: text-[#374151]

  return (
    <div className={`min-h-screen transition-colors duration-700 font-sans ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#FDFBF7] text-gray-800'}`}>
      
      {/* --- HEADER --- */}
      <header className="px-6 pt-8 pb-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-tight">
              Ramadhan <span className="text-purple-500">Day {currentDay}</span>
            </h1>
            <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Depok, Indonesia • {new Date().toLocaleDateString()}
            </p>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-full ${darkMode ? 'bg-slate-800 text-yellow-300' : 'bg-white shadow-sm text-gray-600'}`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Fading Quote */}
        <div className="overflow-hidden h-6 relative">
          <p className="text-sm italic text-purple-500 animate-pulse">{quote}</p>
        </div>
      </header>

      <main className="px-4 pb-24 space-y-6">
        
        {/* --- 1. JAGA LISAN (TRAFFIC LIGHT) --- */}
        <section className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-purple-100 shadow-sm'}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-purple-500" />
              Jaga Lisan Tracker
            </h3>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              {todayData.hearts > 1 ? "Keep it up!" : "Danger Zone"}
            </span>
          </div>
          <div className="flex justify-center gap-4 py-2">
            {[1, 2, 3].map((h) => (
              <button 
                key={h}
                onClick={breakHeart}
                disabled={h > todayData.hearts}
                className={`transition-all duration-300 transform ${h <= todayData.hearts ? 'hover:scale-110 active:scale-90' : 'opacity-20 grayscale'}`}
              >
                <Heart 
                  className={`w-12 h-12 ${h <= todayData.hearts ? 'fill-pink-500 text-pink-500' : 'fill-gray-300 text-gray-300'}`} 
                />
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Klik hati kalau kamu ngomong kasar/gibah hari ini.
          </p>
        </section>

        {/* --- 2. SAT-SET TOGGLES --- */}
        <section className="grid grid-cols-2 gap-3">
          {/* Puasa Toggle */}
          <div 
            onClick={() => updateData('fasting', !todayData.fasting)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              todayData.fasting 
                ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/20' 
                : `${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold">Puasa</span>
              {todayData.fasting && <CheckCircle2 className="w-5 h-5" />}
            </div>
            <p className="text-xs opacity-80">{todayData.fasting ? "Alhamdulillah lancar" : "Belum / Skip"}</p>
          </div>

          {/* Sedekah Toggle */}
          <div 
            onClick={() => updateData('sedekah', !todayData.sedekah)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              todayData.sedekah 
                ? 'bg-yellow-400 border-yellow-400 text-yellow-900 shadow-lg shadow-yellow-500/20' 
                : `${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold">Sedekah</span>
              <div className="bg-white/30 p-1 rounded-full"><RotateCcw className="w-3 h-3" /></div>
            </div>
            <p className="text-xs opacity-80">{todayData.sedekah ? "Cring! ✨" : "Klik untuk sedekah"}</p>
          </div>
        </section>

        {/* --- 3. IBADAH COUNTER (TASBIH) --- */}
        <section className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-purple-100 shadow-sm'}`}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Hand className="w-4 h-4 text-purple-500" /> Digital Tasbih
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => { setTasbihType('zikr'); setShowTasbih(true); }}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${todayData.zikr ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
            >
              <span>Zikir Pagi/Petang</span>
              {todayData.zikr ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <button 
              onClick={() => { setTasbihType('shalawat'); setShowTasbih(true); }}
              className={`py-3 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${todayData.shalawat ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
            >
              <span>Shalawat 100x</span>
              {todayData.shalawat ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </section>

        {/* --- 4. SHOLAT TRACKER --- */}
        <section>
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 ml-1">Sholat Tracker</h3>
          <div className="space-y-2">
            {Object.keys(todayData.sholat).map((prayer) => (
              <div 
                key={prayer}
                onClick={() => updateSholat(prayer)}
                className={`
                  flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border
                  ${todayData.sholat[prayer] 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 border-transparent text-white shadow-md' 
                    : `${darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-gray-100 hover:bg-gray-50'}`}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${todayData.sholat[prayer] ? 'bg-white' : 'bg-gray-300'}`}></div>
                  <span className="capitalize font-medium">{prayer}</span>
                </div>
                {todayData.sholat[prayer] && <CheckCircle2 className="w-5 h-5" />}
              </div>
            ))}
          </div>
        </section>

        {/* --- 5. LIFESTYLE & MOOD --- */}
        <section className={`p-5 rounded-3xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-purple-100 shadow-sm'}`}>
          <h3 className="font-semibold mb-4">Mood Hari Ini</h3>
          <div className="flex justify-between text-2xl">
            {moodEmoji.map((emoji) => (
              <button 
                key={emoji}
                onClick={() => updateData('mood', emoji)}
                className={`p-2 rounded-xl transition-transform hover:scale-125 ${todayData.mood === emoji ? 'bg-purple-100 ring-2 ring-purple-300' : ''}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Menu Buka/Sahur</label>
              <input 
                type="text" 
                value={todayData.menu}
                onChange={(e) => updateData('menu', e.target.value)}
                placeholder="Makan apa hari ini?"
                className={`w-full p-3 rounded-xl bg-transparent border focus:outline-none focus:ring-2 focus:ring-purple-400 ${darkMode ? 'border-slate-600' : 'border-gray-200'}`}
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Pict of The Day</label>
              <div className="relative group">
                {todayData.image ? (
                  <div className="relative aspect-video rounded-xl overflow-hidden shadow-md">
                    <img src={todayData.image} alt="Daily" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => updateData('image', null)}
                      className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-purple-50 transition-colors ${darkMode ? 'border-slate-600 hover:bg-slate-800' : 'border-gray-300'}`}>
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-400">Upload Foto (Max 500kb)</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* --- FLOATING ACTION BUTTONS --- */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
        <button 
          onClick={triggerPanic}
          className="bg-red-500 text-white p-3 rounded-full shadow-lg shadow-red-500/30 hover:scale-110 transition-transform"
          title="Panic Button"
        >
          <AlertCircle className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setShowStory(true)}
          className="bg-gradient-to-tr from-purple-600 to-pink-500 text-white p-4 rounded-full shadow-xl shadow-purple-500/30 hover:scale-110 transition-transform"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {/* --- MODALS --- */}
      <TasbihModal 
        isOpen={showTasbih} 
        onClose={() => setShowTasbih(false)}
        title={tasbihType === 'zikr' ? "Zikir Counter" : "Sholawat Counter"}
        target={tasbihType === 'zikr' ? 33 : 100}
        onComplete={() => updateData(tasbihType, true)}
      />

      {showStory && (
        <StoryRecap 
          data={{ ...todayData, day: currentDay }} 
          onClose={() => setShowStory(false)} 
        />
      )}

    </div>
  );
}


