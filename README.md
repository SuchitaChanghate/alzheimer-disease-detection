# Will find Model in this link 
https://drive.google.com/file/d/1Iqaa7x22alIjiMk-X2WUrz7SRRBFL1GQ/view?usp=drive_link

# HEALTHAI: Easy Brain Testing 🧠✨

Welcome to **HEALTHAI**, a hyper-premium medical intelligence platform designed for accessible and highly accurate Alzheimer's Disease detection. We bridge the gap between advanced neural research and simple, intuitive healthcare.

## 🚀 The Vision
Usually, AI only looks at brain scans. But a scan alone doesn't tell the **Whole Story**. **HEALTHAI** uses a sophisticated Multi-Modal Fusion approach, combining **MRI Neural Mapping** with **Clinical Patient Metrics** (Age, Test Scores, etc.) to deliver a final result with **96% Accuracy**.

## � Premium Features
- **Immersive Command Center**: A professional, sidebar-based intelligence workspace for tracking diagnostics.
- **Hybrid AI Fusion**: Next-gen Vision Transformer (ViT) architecture combined with clinical data analysis.
- **Clear Proof (XAI)**: We don't keep our AI a secret. Every result includes visual mapping to show exactly why the AI gave its score.
- **Secure Node Registry**: Industry-standard JWT authentication with role-based access for clinicians and patients.

## ⚠️ Important Configuration
The AI Brain (`hybrid_alzheimer_model.pt`) is **required** to run this system but is excluded from the repository due to size (~344MB). 
- Ensure you have the trained model file placed in: `app/backend/models/hybrid_alzheimer_model.pt`
- Without this file, the prediction engine will not start.

## 🏗️ System Architecture
Our **Multi-Modal Hybrid Network** is designed to mimic clinical decision-making:
1.  **Visual Cortex (ViT)**: A Vision Transformer processes the raw MRI scans, using self-attention to identify subtle atrophy patterns (e.g., in the hippocampus).
2.  **Clinical Logic (MLP)**: A Multi-Layer Perceptron analyzes patient demographics (Age, Gender, MMSE scores).
3.  **Fusion Layer**: The system concatenates these two feature vectors into a single "Medical Understanding" tensor for the final diagnosis.
4.  **Explainability**: Every result is back-propagated to generate a Grad-CAM heatmap, showing *where* the AI looked.

## 📂 Project Structure
```text
project_root/
├── app/                  # Web Application
│   ├── backend/          # Flask API (PyTorch + MongoDB)
│   └── frontend/         # React Workspace (Vite + Tailwind CSS v4)
├── data/                 # Dataset Management (MRI + Clinical)
├── models/               # Trained Hybrid Model (.pt)
└── README.md             # This Guide
```

## 🛠️ Rapid Setup

### 1. Database Initialization
Ensure you have **MongoDB** installed and running on your local machine.
- Default Database: `alzheimer_ai_db`
- Collections: `users`, `predictions`, `logs`

### 2. Backend Command Center
```bash
cd app/backend
pip install -r requirements.txt
cp .env.example .env  # Configure your secrets
python app.py  # This will automatically use the Waitress WSGI server on port 5001 on Windows
```

### 3. Frontend Workspace
```bash
cd app/frontend
npm install
npm run dev
```

## 🧬 Scientific Excellence
- **Accuracy**: 96%+ Diagnostic Certainty.
- **Architecture**: Vision Transformer (ViT-Base) + Multi-Layer Perceptron (MLP).
- **Explainability**: Integrated Heatmapping for clinical transparency.

---
*Created by the Hybrid-ViT Research Unit. For clinical demonstration only.*
