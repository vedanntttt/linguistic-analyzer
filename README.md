# Linguistic Analyzer

A full-stack NLP web app that performs in-depth linguistic analysis on plain text or uploaded PDFs. Classical NLP and LLM-powered analysis run in parallel and are displayed as interactive cards.

## Features

- **Extractive Summary** — top sentences ranked by word frequency
- **Named Entity Recognition** — persons, orgs, locations, dates, and more via spaCy
- **POS Distribution** — part-of-speech breakdown rendered as a chart
- **TF-IDF Keywords** — top keywords scored by term frequency–inverse document frequency
- **Dependency Parse Tree** — visual syntactic tree for the first 3 sentences
- **Readability Metrics** — Flesch, Kincaid, SMOG, TTR, word/sentence counts
- **LLM Analysis** — abstractive summary, sentiment, tone, themes, and target audience via Groq (Llama 3.3 70B)
- **PDF Upload** — extract text from PDFs before analysis

## Tech Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Frontend | React 18, Vite, Tailwind CSS, Chart.js    |
| Backend  | Python, Flask, spaCy, NLTK, scikit-learn  |
| LLM      | Groq API (llama-3.3-70b-versatile)        |

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- A [Groq API key](https://console.groq.com/)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

Create a `.env` file in the `backend/` folder:

```
GROQ_API_KEY=your_groq_api_key_here
```

Start the server:

```bash
python app.py
```

The API runs on `http://localhost:5001`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## API Endpoints

| Method | Endpoint        | Description                        |
|--------|-----------------|------------------------------------|
| POST   | `/analyze`      | Classical NLP analysis (JSON body: `{ "text": "..." }`) |
| POST   | `/analyze-llm`  | LLM analysis via Groq              |
| POST   | `/extract-text` | Extract text from a PDF upload     |
| GET    | `/health`       | Health check                       |
