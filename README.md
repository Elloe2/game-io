# Micro.io - Game Bakteri Multiplayer

Game multiplayer real-time bertema bakteri memakan bakteri di dunia mikroskopis.

## 📋 Overview

**Micro.io** adalah game kompetitif multiplayer dimana pemain berperan sebagai bakteri/sel mikroskopis yang bertahan hidup dengan memakan bakteri lain dan partikel makanan untuk tumbuh lebih besar dan mendominasi arena.

## 🎮 Game Theme

_Tema:_ Bakteri memakan bakteri di dunia mikroskopis
_Genre:_ Competitive Multiplayer
_Target Audience:_ Semua Umur
_Bahasa:_ Bahasa Indonesia
_Platform:_ Web Browser

## 🚀 Fitur yang Sudah Diimplementasikan

- ✅ **Multiplayer Real-time** dengan Socket.io
- ✅ **NPC AI** dengan pathfinding dan decision making (mengejar makanan, menghindar dari ancaman)
- ✅ **Duplicate/Split Character** - Tekan SPACE untuk membelah diri
- ✅ **Physics Collision Detection** (player vs food, player vs NPC, player vs player)
- ✅ **Sistem Pertumbuhan** - Makan bakteri kecil untuk tumbuh
- ✅ **Highscore System** - Menyimpan top 10 skor tertinggi
- ✅ **Leaderboard Real-time** (top 10 players termasuk NPC)
- ✅ **Camera yang Mengikuti Player**
- ✅ **Visual Tema Bakteri** - Desain seperti bakteri/mikroskopis
- ✅ **Nama Bakteri** - Makanan memiliki nama seperti "Bacillus", "E. coli", dll
- ✅ **Mobile-friendly Controls** (touch support)
- ✅ **Game Over Screen** dengan skor akhir
- ✅ **UI Bahasa Indonesia** lengkap

## 🛠️ Stack Teknologi yang Digunakan

### Frontend

- **HTML5 Canvas** - Rendering game yang smooth
- **Vanilla JavaScript** - Game client logic
- **CSS3** - Modern styling dengan tema bakteri
- **Socket.io Client** - Real-time communication dengan server

### Backend

- **Node.js** - Runtime server
- **Express.js** - HTTP server framework
- **Socket.io** - WebSocket untuk real-time multiplayer
- **In-Memory Storage** - Highscore system (bisa di-upgrade ke database)

## 📦 Cara Menjalankan

### 1. Install Dependencies

```bash
npm install
```

### 2. Jalankan Server

```bash
# Development mode (auto restart)
npm run dev

# Production mode
npm start
```

### 3. Buka di Browser

Buka browser dan akses: `http://localhost:3000`

## 🎯 Cara Bermain

1. Masukkan nama bakteri Anda
2. Klik "Mulai Bermain"
3. **Gerakkan mouse** untuk menggerakkan bakteri Anda
4. **Makan bakteri kecil** (bulatan berwarna dengan nama) untuk tumbuh
5. **Tekan SPACE** untuk membelah diri (hanya jika ukuran cukup besar)
6. **Makan player/NPC yang lebih kecil** untuk tumbuh lebih cepat
7. **Hindari bakteri yang lebih besar** dari Anda!
8. **Cari skor tertinggi** dan dominasi arena!

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
