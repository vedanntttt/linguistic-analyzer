from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
from spacy import displacy
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
import textstat
from collections import Counter
import re
from pypdf import PdfReader
import io
import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Download required NLTK data
nltk.download('stopwords', quiet=True)
nltk.download('punkt', quiet=True)

app = Flask(__name__)
CORS(app)

# Groq client — loaded once at startup
_groq_client = Groq(api_key=os.getenv('GROQ_API_KEY'))

# Load spaCy English model
nlp = spacy.load("en_core_web_sm")


# ─────────────────────────────────────────────
# 1. EXTRACTIVE SUMMARIZATION (Word Frequency)
# ─────────────────────────────────────────────
def extractive_summary(doc, n=3):
    sentences = list(doc.sents)
    if len(sentences) <= n:
        return [s.text.strip() for s in sentences]

    # Build word frequency (skip stopwords & punctuation)
    word_freq = Counter()
    for token in doc:
        if not token.is_stop and not token.is_punct and token.text.strip():
            word_freq[token.text.lower()] += 1

    # Normalize by max frequency
    max_freq = max(word_freq.values()) if word_freq else 1
    for word in word_freq:
        word_freq[word] /= max_freq

    # Score each sentence
    sentence_scores = {}
    for sent in sentences:
        score = sum(word_freq.get(token.text.lower(), 0) for token in sent)
        sentence_scores[sent] = score / len(sent) if len(sent) > 0 else 0

    # Pick top-n, restore original order
    top = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:n]
    top = sorted(top, key=lambda s: s.start)
    return [s.text.strip() for s in top]


# ─────────────────────────────────────────────
# 2. NAMED ENTITY RECOGNITION
# ─────────────────────────────────────────────
LABEL_DESCRIPTIONS = {
    'PERSON': 'Person',
    'ORG': 'Organization',
    'GPE': 'Location (Country/City)',
    'LOC': 'Location',
    'DATE': 'Date',
    'TIME': 'Time',
    'MONEY': 'Money',
    'PRODUCT': 'Product',
    'EVENT': 'Event',
    'WORK_OF_ART': 'Work of Art',
    'LAW': 'Law',
    'LANGUAGE': 'Language',
    'NORP': 'Nationality/Group',
    'FAC': 'Facility',
    'CARDINAL': 'Number',
    'PERCENT': 'Percentage',
    'QUANTITY': 'Quantity',
    'ORDINAL': 'Ordinal',
}

def extract_entities(doc):
    seen = set()
    entities = []
    for ent in doc.ents:
        key = (ent.text.strip(), ent.label_)
        if key not in seen:
            seen.add(key)
            entities.append({
                'text': ent.text.strip(),
                'label': ent.label_,
                'description': LABEL_DESCRIPTIONS.get(ent.label_, ent.label_),
            })
    return entities


# ─────────────────────────────────────────────
# 3. POS TAG DISTRIBUTION (Morphological)
# ─────────────────────────────────────────────
POS_MAP = {
    'NOUN':  'Noun',
    'PROPN': 'Proper Noun',
    'VERB':  'Verb',
    'ADJ':   'Adjective',
    'ADV':   'Adverb',
    'PRON':  'Pronoun',
    'DET':   'Determiner',
    'ADP':   'Preposition',
    'CCONJ': 'Coord. Conj.',
    'SCONJ': 'Sub. Conj.',
    'NUM':   'Number',
    'PUNCT': 'Punctuation',
}

def get_pos_distribution(doc):
    counts = Counter()
    for token in doc:
        if token.pos_ in POS_MAP:
            counts[POS_MAP[token.pos_]] += 1
    return dict(sorted(counts.items(), key=lambda x: x[1], reverse=True))


# ─────────────────────────────────────────────
# 4. TF-IDF KEYWORD EXTRACTION (Semantic)
#    Treat each sentence as a document so IDF
#    penalises words that appear in every sentence
# ─────────────────────────────────────────────
def extract_keywords(text, n=10):
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    sentences = [s.strip() for s in sentences if s.strip()]

    # Need at least 2 "documents" for IDF to make sense
    if len(sentences) < 2:
        words = text.split()
        chunk = max(10, len(words) // 5)
        sentences = [' '.join(words[i:i + chunk]) for i in range(0, len(words), chunk)]

    try:
        vec = TfidfVectorizer(stop_words='english', max_features=200, ngram_range=(1, 1))
        matrix = vec.fit_transform(sentences)
        names = vec.get_feature_names_out()
        avg_scores = matrix.mean(axis=0).A1
        top_idx = avg_scores.argsort()[::-1][:n]
        return [
            {'word': names[i], 'score': round(float(avg_scores[i]), 4)}
            for i in top_idx if avg_scores[i] > 0
        ]
    except Exception:
        return []


# ─────────────────────────────────────────────
# 5. DEPENDENCY PARSE TREE (Syntactic)
#    Render first 3 sentences only for readability
# ─────────────────────────────────────────────
def get_dependency_tree(doc):
    sentences = list(doc.sents)[:3]
    if not sentences:
        return ''
    try:
        html = displacy.render(
            sentences,
            style='dep',
            page=False,
            options={
                'compact': True,
                'color': '#4f46e5',
                'bg': '#f8fafc',
                'font': 'Arial',
                'distance': 110,
            },
        )
        return html
    except Exception as e:
        return f'<p style="color:red">Parse tree error: {e}</p>'


# ─────────────────────────────────────────────
# 6. READABILITY & DISCOURSE METRICS
#    Flesch, Kincaid, SMOG, TTR, avg sentence len
# ─────────────────────────────────────────────
def get_readability(text, doc):
    sentences = list(doc.sents)
    words = [t for t in doc if not t.is_punct and not t.is_space]
    unique_words = {t.text.lower() for t in words}

    word_count = len(words)
    sent_count = max(len(sentences), 1)
    ttr = round(len(unique_words) / word_count, 3) if word_count > 0 else 0

    return {
        'flesch_reading_ease': round(textstat.flesch_reading_ease(text), 1),
        'flesch_kincaid_grade': round(textstat.flesch_kincaid_grade(text), 1),
        'smog_index': round(textstat.smog_index(text), 1),
        'text_standard': textstat.text_standard(text),
        'word_count': word_count,
        'sentence_count': sent_count,
        'avg_sentence_length': round(word_count / sent_count, 1),
        'unique_words': len(unique_words),
        'type_token_ratio': ttr,
        'syllable_count': textstat.syllable_count(text),
    }


# ─────────────────────────────────────────────
# API ENDPOINT
# ─────────────────────────────────────────────
@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Expected JSON body'}), 400

    text = data.get('text', '').strip()
    if not text or len(text) < 20:
        return jsonify({'error': 'Please provide at least 20 characters of text.'}), 400

    doc = nlp(text)

    return jsonify({
        'summary':         extractive_summary(doc),
        'entities':        extract_entities(doc),
        'pos_distribution': get_pos_distribution(doc),
        'keywords':        extract_keywords(text),
        'dependency_tree': get_dependency_tree(doc),
        'readability':     get_readability(text, doc),
    })


@app.route('/extract-text', methods=['POST'])
def extract_text():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['file']
    filename = file.filename.lower()

    if not filename.endswith('.pdf'):
        return jsonify({'error': 'Only PDF files are supported on this endpoint'}), 400

    try:
        reader = PdfReader(io.BytesIO(file.read()))
        pages_text = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                pages_text.append(t.strip())
        text = '\n\n'.join(pages_text).strip()
        if not text:
            return jsonify({'error': 'Could not extract any text from this PDF. It may be image-based (scanned).'}), 422
        return jsonify({'text': text, 'pages': len(reader.pages)})
    except Exception as e:
        return jsonify({'error': f'Failed to read PDF: {str(e)}'}), 500


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


# ─────────────────────────────────────────────
# 7. LLM ANALYSIS via Groq + Llama 3
# ─────────────────────────────────────────────
def analyze_with_llm(text):
    # Truncate to ~3000 chars to stay well within token limits
    truncated = text[:3000] + ('…' if len(text) > 3000 else '')

    prompt = f"""You are an expert NLP analyst. Analyze the text below and return ONLY a valid JSON object — no markdown, no explanation outside the JSON.

JSON structure:
{{
  "abstractive_summary": "2-3 sentence summary written in your own words",
  "sentiment": "Positive | Negative | Neutral | Mixed",
  "sentiment_explanation": "One sentence explaining why",
  "tone": "Formal | Informal | Technical | Academic | Conversational",
  "key_themes": ["theme1", "theme2", "theme3", "theme4", "theme5"],
  "writing_style": "One sentence describing the writing style",
  "target_audience": "Who this text is written for (one short phrase)"
}}

Text:
{truncated}"""

    chat = _groq_client.chat.completions.create(
        model='llama-3.3-70b-versatile',
        messages=[{'role': 'user', 'content': prompt}],
        temperature=0.3,
        max_tokens=600,
    )

    raw = chat.choices[0].message.content.strip()

    # Strip markdown code fences if model wraps the JSON
    raw = re.sub(r'^```(?:json)?\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)

    return json.loads(raw)


@app.route('/analyze-llm', methods=['POST'])
def analyze_llm():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Expected JSON body'}), 400

    text = data.get('text', '').strip()
    if not text or len(text) < 20:
        return jsonify({'error': 'Please provide at least 20 characters of text.'}), 400

    try:
        result = analyze_with_llm(text)
        return jsonify(result)
    except json.JSONDecodeError:
        return jsonify({'error': 'LLM returned malformed JSON. Try again.'}), 502
    except Exception as e:
        return jsonify({'error': f'Groq API error: {str(e)}'}), 502


if __name__ == '__main__':
    app.run(debug=True, port=5001)
