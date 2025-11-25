# 🦠 Micro.io - Game Bakteri Multiplayer

<div align="center">

![Micro.io](https://img.shields.io/badge/Micro.io-v2.0-00f0ff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiMwMGYwZmYiLz48L3N2Zz4=)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io)
![License](https://img.shields.io/badge/License-MIT-ff00aa?style=for-the-badge)

**Game multiplayer real-time bertema mikroba dengan visual modern dan animasi smooth**

</div>

---

## 📋 Overview

**Micro.io** adalah game kompetitif multiplayer dimana pemain berperan sebagai mikroba yang bertahan hidup dengan memakan mikroba lain dan partikel makanan untuk tumbuh lebih besar dan mendominasi arena. Dilengkapi dengan **Modern UI**, **animasi GSAP**, dan **dark neon theme** yang memukau!

## 🎮 Game Theme

| Aspek | Detail |
|-------|--------|
| **Tema** | Mikroba memakan mikroba di dunia mikroskopis |
| **Genre** | Competitive Multiplayer |
| **Target Audience** | Semua Umur |
| **Bahasa** | Bahasa Indonesia |
| **Platform** | Web Browser |
| **Visual Style** | Dark Neon Theme dengan Cyan & Magenta |

## 🚀 Fitur yang Sudah Diimplementasikan

### Core Gameplay
- ✅ **Multiplayer Real-time** dengan Socket.io
- ✅ **NPC AI** dengan pathfinding dan decision making
- ✅ **Duplicate/Split Character** - Tekan SPACE untuk membelah diri
- ✅ **Physics Collision Detection** (player vs food, player vs NPC)
- ✅ **Sistem Pertumbuhan** - Makan mikroba kecil untuk tumbuh
- ✅ **Highscore System** - Menyimpan top 10 skor tertinggi
- ✅ **Leaderboard Real-time** (top 10 players termasuk NPC)
- ✅ **Camera Smooth Follow** dengan interpolasi

### Modern UI & Visual
- ✅ **Dark Neon Theme** - Warna cyan (#00f0ff) dan magenta (#ff00aa)
- ✅ **Loading Screen** dengan animasi mikroba dan progress bar
- ✅ **Hero Section** dengan floating microbes background
- ✅ **Animated Titles** dengan efek glitch dan gradient
- ✅ **Modern Play Section** dengan preview karakter dan makanan
- ✅ **Game Over Popup** dengan statistik dan animasi
- ✅ **Scrollable Menu** dengan scroll indicator

### Sprite Assets
- ✅ **Player Sprite** - Mikroba hijau dengan detail
- ✅ **NPC Virus** - Virus merah dengan spike
- ✅ **NPC Bacillus** - Bakteri batang biru
- ✅ **Food Sprites** - Air (biru), Enzim (pink), Daun (hijau)

### In-Game Animations
- ✅ **Pulse Effect** - Sprite berdetak seperti sel hidup
- ✅ **Rotation Effect** - NPC dan food berputar pelan
- ✅ **Float Effect** - Makanan mengambang naik-turun
- ✅ **Glow Effect** - Cahaya neon di sekitar sprite
- ✅ **Danger/Safe Indicator** - Garis merah/hijau berkedip pada NPC

### UX Features
- ✅ **GSAP Animations** - Transisi smooth di seluruh UI
- ✅ **Mobile-friendly Controls** (touch support)
- ✅ **Responsive Design** - Adaptif di berbagai ukuran layar
- ✅ **UI Bahasa Indonesia** lengkap

## 🛠️ Stack Teknologi

### Frontend
| Teknologi | Kegunaan |
|-----------|----------|
| **HTML5 Canvas** | Rendering game yang smooth |
| **Vanilla JavaScript** | Game client logic |
| **CSS3 + Animations** | Modern styling dengan dark neon theme |
| **GSAP** | Animasi UI yang smooth dan profesional |
| **Socket.io Client** | Real-time communication dengan server |
| **Google Fonts** | Orbitron & Rajdhani untuk typography |

### Backend
| Teknologi | Kegunaan |
|-----------|----------|
| **Node.js** | Runtime server |
| **Express.js** | HTTP server framework |
| **Socket.io** | WebSocket untuk real-time multiplayer |
| **In-Memory Storage** | Highscore system |

## 📦 Cara Menjalankan

### 1. Clone Repository
```bash
git clone https://github.com/username/micro-io.git
cd micro-io
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Jalankan Server
```bash
# Development mode (auto restart)
npm run dev

# Production mode
npm start
```

### 4. Buka di Browser
```
http://localhost:3000
```

## 🎯 Cara Bermain

### Kontrol
| Input | Aksi |
|-------|------|
| **Mouse** | Gerakkan mikroba |
| **SPACE** | Membelah diri (split) |
| **Touch** | Kontrol mobile |

### Gameplay
1. 🎬 Tunggu loading screen selesai
2. 📜 Scroll ke bawah untuk melihat form start
3. ✏️ Masukkan nama mikroba Anda
4. 🎮 Klik **"MULAI BERMAIN"**
5. 🍽️ Makan makanan (air, enzim, daun) untuk tumbuh
6. ⚔️ Makan NPC/player yang **lebih kecil** (indikator hijau)
7. 🏃 Hindari NPC/player yang **lebih besar** (indikator merah)
8. 🏆 Raih skor tertinggi dan dominasi arena!

## 🧠 NPC AI System

NPC dalam game ini memiliki AI canggih:

| Behavior | Deskripsi |
|----------|-----------|
| **Food Seeking** | Mengejar makanan terdekat untuk tumbuh |
| **Hunting** | Mengejar player/NPC yang lebih kecil |
| **Fleeing** | Menghindar dari ancaman yang lebih besar |
| **Split Decision** | Membelah diri untuk menyerang atau kabur |
| **Competition** | Berpartisipasi aktif dalam leaderboard |

## ⚡ Fitur Split/Duplicate

| Aspek | Detail |
|-------|--------|
| **Trigger** | Tekan SPACE |
| **Minimum Size** | 30px radius |
| **Merge Time** | 30 detik otomatis merge |
| **Kegunaan** | Menyerang atau menghindar |

## 🎨 Visual Theme

### Color Palette
| Warna | Hex | Kegunaan |
|-------|-----|----------|
| **Cyan** | `#00f0ff` | Primary accent, glow effects |
| **Magenta** | `#ff00aa` | Secondary accent, buttons |
| **Dark BG** | `#0d1117` | Background utama |
| **Dark Surface** | `#161b22` | Cards, panels |

### Typography
- **Orbitron** - Judul dan heading (futuristic)
- **Rajdhani** - Body text dan UI elements

## 📁 Struktur Project

```
micro-io/
├── client/
│   ├── index.html          # HTML dengan modern UI layout
│   ├── style.css           # Dark neon theme styling
│   ├── game.js             # Game client dengan animasi
│   └── assets/
│       ├── player.png      # Player sprite
│       ├── npc-virus.png   # NPC virus sprite
│       ├── npc-bacillus.png# NPC bacillus sprite
│       ├── food-air.png    # Food air sprite
│       ├── food-enzim.png  # Food enzim sprite
│       └── food-daun.png   # Food daun sprite
├── server/
│   └── index.js            # Game server dengan NPC AI
├── package.json            # Dependencies
├── .gitignore              # Git ignore file
└── README.md               # Dokumentasi ini
```

## 📊 Highscore System

| Fitur | Detail |
|-------|--------|
| **Kapasitas** | Top 10 skor tertinggi |
| **Storage** | In-memory (upgradable ke database) |
| **Display** | Start screen & real-time update |
| **Persistence** | Reset saat server restart |

## 🖼️ Screenshots

### Loading Screen
- Animasi mikroba floating
- Progress bar dengan efek glow
- Dark neon theme

### Main Menu
- Hero section dengan judul animasi
- Floating microbes background
- Preview karakter dan makanan
- Scrollable content

### In-Game
- Dark background dengan cyan grid
- Animated sprites (pulse, rotate, float, glow)
- Danger/safe indicator pada NPC
- Real-time leaderboard

### Game Over
- Popup dengan statistik
- Animasi entrance
- Tombol Play Again & Home

## 🔮 Pengembangan Lebih Lanjut

### Planned Features
- [ ] Database untuk highscore permanen
- [ ] Multiple game rooms/arena
- [ ] Power-ups (speed boost, shield, dll)
- [ ] Chat system antar player
- [ ] Spectator mode
- [ ] Team mode
- [ ] Sound effects & background music
- [ ] More sprite variations
- [ ] Particle effects

### Completed Features
- [x] Modern UI redesign
- [x] GSAP animations
- [x] Loading screen
- [x] Sprite assets
- [x] In-game animations
- [x] Dark neon theme
- [x] Danger/safe indicators

## 🐛 Known Issues

- Game loop hanya berjalan saat ada player aktif
- Highscore reset saat server restart
- Mobile touch controls masih basic

## 📝 License

MIT License - Feel free to use and modify!

## 👨‍💻 Kontribusi

Game ini dibuat sebagai proyek pembelajaran game multiplayer dengan:
- Real-time networking (Socket.io)
- Modern UI/UX design
- Canvas game development
- GSAP animations

Silakan fork dan kembangkan sesuai kebutuhan!

## 🙏 Credits

- **GSAP** - Animation library
- **Socket.io** - Real-time communication
- **Google Fonts** - Orbitron & Rajdhani

---

<div align="center">

**🦠 Selamat Bermain Micro.io! 🦠**

Made with 💚 and ☕

</div>
