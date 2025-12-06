# ⭐ Synth

**Synth** is an advanced AI-powered audio visualization and blockchain-enabled IP registration platform.  
It transforms any audio file into:

- **Dynamic 3D visualizations** powered by Three.js  
- **Accurate AI-generated lyrics**  
- **A full music-video-like experience**  
- **Blockchain-registered IP assets** on the Story Protocol  

The platform includes a powerful web interface and scalable API backend.

---

## 📝 Overview

Synth merges **AI**, **WebGL**, **audio analysis**, and **blockchain IP ownership** into one seamless experience.

---

## 🔊 Audio Processing & Analysis  
Users can upload audio files (mp3). The backend extracts metadata, analyzes frequencies, and generates lyrics using **OpenAI Whisper + GPT**.

🔗 Demo UI (Slideshow):  
https://v0-slideshow-ui-design.vercel.app/

---

## 🎨 Real-time 3D Visualizers

The frontend includes **40+ modular visualizers**, each built with **Three.js + custom GLSL effects**.  
Visuals react to:

- Frequency bands  
- Waveform amplitude  
- User-selected patterns  
- Motion presets  

📄 See docs:  
`frontend/docs/audio-visualizer.md`

---

## 🧬 Custom IP Ownership System

Every final music visualization video becomes an **IP asset** registered on the **Story Protocol**.  
Users can:

- Mint licenses  
- Set rules  
- Track ownership  

📄 See docs:  
`frontend/docs/story-ip-system.md`

---

## 📘 Backend Documentation

📄 Full backend documentation:  
`backend/docs/backend-api.md`

---

## 🎥 Video Rendering

Synth can **record the visualization canvas** and generate a final exportable video. Each video is:

- Stored on **Pinata/IPFS**  
- Linked inside **Story Protocol metadata**  
- Displayed in user dashboards  

---

## 🔗 Blockchain Integration

Synth integrates the **Story Protocol (testnet)** to support:

- IP registration  
- License minting  
- Ownership verification  
- Wallet-based access controls (dynamics wallet) 

---

# ✨ Features

## 🌐 Frontend (Web App)

- 40+ customizable 3D visualizers  
- Audio-reactive effects  
- Real-time video recording  
- IP licensing dashboard  
- Wallet integration  
- Video gallery & playback  
- Advanced canvas controls (camera, lighting, effects, e.t.c)

---

## 🚀 Backend (API Server)

- Audio upload + frequency analysis  
- Whisper lyrics auto-generation  
- Video metadata storage  
- Pinata/IPFS integration  
- Swagger API documentation  
- User & video record management  
- Story Protocol: IP registration + licensing  

---

# 📚 Full Documentation

Frontend documentation:

- `frontend/docs/audio-visualizer.md`  
- `frontend/docs/story-ip-system.md`

Backend documentation is included in:

- `backend/docs/backend-api.md`

---

# 🛠️ Tech Stack

## Frontend
- React + TypeScript  
- Three.js  
- GSAP  
- TanStack Query  
- Vite  
- Story Protocol SDK  
- Pinata SDK  

## Backend
- Express.js  
- TypeScript  
- Multer  
- Mongoose  
- OpenAI  
- Swagger  
- Pinata (IPFS)  
- music-metadata  

---

# 📦 Key Dependencies


axios: ^1.13.2
cors: ^2.8.5
dotenv: ^17.2.3
express: ^5.1.0
form-data: ^4.0.4
formdata-node: ^6.0.3
helmet: ^8.1.0
mongoose: ^8.19.3
morgan: ^1.10.1
multer: ^2.0.2
music-metadata: ^11.10.0
openai: ^6.8.1
pako: ^2.1.0
swagger-jsdoc: ^6.2.8
swagger-ui-express: ^5.0.1


---

# 🚀 Run Commands

## Backend
npm run dev
## Frontend
npm run dev

---

# 📁 Project Structure

---

# 📚 Frontend Documentation Details

### 📘 `frontend/docs/audio-visualizer.md`
Covers:
- Three.js architecture  
- Visualizer creation pipeline  
- Animators vs creators  
- Audio-reactive logic  
- Shader-based visualizations  
- SceneRecorder video export  

### 📗 `frontend/docs/story-ip-system.md`
Covers:
- Story Protocol integration  
- IP registration workflow  
- License minting  
- Metadata linking  
- Wallet authentication  

---

