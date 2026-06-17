# backend/utils/text_cleaner.py
"""
Text cleaning utilities for NLP pipeline.
Used by all services.
"""
import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize
from collections import Counter

# Download required NLTK data
nltk.download('stopwords',   quiet=True)
nltk.download('punkt',       quiet=True)
nltk.download('punkt_tab',   quiet=True)
nltk.download('wordnet',     quiet=True)

# Initialize once
_lemmatizer = WordNetLemmatizer()
_stop_words  = set(stopwords.words('english'))


def clean_text(text: str) -> str:
    """
    Full NLP cleaning pipeline:
    lowercase → remove URLs/HTML/email
    → remove punctuation/digits
    → tokenize → remove stopwords → lemmatize
    """
    if not text or not str(text).strip():
        return ''

    t = str(text).lower()

    # Remove URLs
    t = re.sub(r'http\S+|www\S+|https\S+', '', t)

    # Remove HTML tags
    t = re.sub(r'<.*?>', '', t)

    # Remove email addresses
    t = re.sub(r'\S+@\S+', '', t)

    # Remove punctuation
    t = t.translate(str.maketrans('', '', string.punctuation))

    # Remove digits
    t = re.sub(r'\d+', '', t)

    # Collapse whitespace
    t = re.sub(r'\s+', ' ', t).strip()

    # Tokenise
    try:
        tokens = word_tokenize(t)
    except Exception:
        tokens = t.split()

    # Remove stopwords + lemmatise
    tokens = [
        _lemmatizer.lemmatize(tok)
        for tok in tokens
        if tok not in _stop_words and len(tok) > 2
    ]

    return ' '.join(tokens)


def get_word_frequencies(text: str, top_n: int = 30) -> list:
    """Return top_n word frequency dicts from raw text."""
    cleaned = clean_text(text)
    words   = cleaned.split()
    if not words:
        return []
    counter = Counter(words)
    return [
        {"word": w, "count": c}
        for w, c in counter.most_common(top_n)
    ]


def get_text_stats(text: str) -> dict:
    """Return basic text statistics."""
    sentences = [s for s in re.split(r'[.!?]+', text) if s.strip()]
    words     = text.split()
    avg_chars = sum(len(w) for w in words) / max(len(words), 1)
    return {
        "word_count":     len(words),
        "char_count":     len(text),
        "sentence_count": len(sentences),
        "avg_word_len":   round(avg_chars, 1),
        "reading_time":   max(1, round(len(words) / 200)),
    }


def highlight_keywords(text: str, keywords: list) -> list:
    """Find positions of suspicious keywords in text."""
    text_lower = text.lower()
    found = []
    for word in keywords:
        if word in text_lower:
            idx = text_lower.find(word)
            found.append({
                "word":    word,
                "index":   idx,
                "context": text[max(0, idx-30): idx + len(word) + 30],
            })
    return found[:15]