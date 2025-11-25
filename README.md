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

NPC dalam game ini memiliki AI yang:

- **Mengejar makanan** terdekat untuk tumbuh
- **Mengejar player kecil** untuk dimakan
- **Menghindar dari ancaman** (player yang lebih besar)
- **Berpartisipasi aktif** dalam kompetisi

## ⚡ Fitur Split/Duplicate

- Tekan **SPACE** untuk membelah diri menjadi 2 bagian
- Hanya bisa dilakukan jika ukuran minimal 30px
- Sel yang terbelah akan otomatis merge kembali setelah 30 detik
- Berguna untuk menghindar atau menyerang!

## 📁 Struktur Project

```
micro-io/
├── client/
│   ├── index.html      # HTML utama dengan UI Bahasa Indonesia
│   ├── style.css       # Styling tema bakteri/mikroskopis
│   └── game.js         # Game client logic dengan visual bakteri
├── server/
│   └── index.js        # Game server dengan NPC AI dan split mechanics
├── package.json        # Dependencies
├── .gitignore          # Git ignore file
└── README.md           # Dokumentasi ini
```

## 🎨 Visual & Theme

Game menggunakan tema mikroskopis dengan:

- Background biru gelap seperti slide mikroskop
- Grid pattern untuk efek mikroskopis
- Bakteri dengan gradient dan shadow untuk efek 3D
- Warna hijau (#4CAF50) sebagai tema utama
- NPC ditandai dengan indicator khusus

## 📊 Highscore System

- Menyimpan top 10 skor tertinggi
- Tersimpan di memory (bisa di-upgrade ke database)
- Ditampilkan di start screen dan update real-time

## 🔮 Pengembangan Lebih Lanjut

Ide untuk fitur tambahan:

- [ ] Database untuk menyimpan highscore secara permanen
- [ ] Sistem room/arena (multiple game rooms)
- [ ] Power-ups (speed boost, shield, dll)
- [ ] Chat system antar player
- [ ] Spectator mode
- [ ] Team mode (bermain dalam tim)
- [ ] Variasi bakteri dengan kemampuan khusus
- [ ] Skin/customization untuk bakteri
- [ ] Sound effects dan background music scientist vibe

## 📝 License

MIT License

## 👨‍💻 Kontribusi

Game ini dibuat sebagai proyek pembelajaran game multiplayer dengan real-time networking. Silakan fork dan kembangkan sesuai kebutuhan!

---

**Selamat Bermain Micro.io! 🦠💚**
