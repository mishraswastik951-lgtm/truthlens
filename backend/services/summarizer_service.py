# backend/services/summarizer_service.py
"""
Extractive text summarization service.
No external API needed — pure Python.
"""
import re
from collections import Counter
from utils.text_cleaner import clean_text


class SummarizerService:

    def summarize(self, text: str, n_sentences: int = 3) -> str:
        """
        Extractive summarization:
        1. Split into sentences
        2. Score by word frequency
        3. Return top N sentences in original order
        """
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        sentences = [s.strip() for s in sentences if len(s.split()) > 5]

        if len(sentences) <= n_sentences:
            return ' '.join(sentences)

        # Word frequency map
        words   = clean_text(text).split()
        freq    = Counter(words)
        max_f   = max(freq.values()) if freq else 1

        def score(s):
            ws = clean_text(s).split()
            return sum(freq.get(w, 0) / max_f for w in ws)

        scored       = sorted(enumerate(sentences), key=lambda x: score(x[1]), reverse=True)
        top_indices  = sorted(i for i, _ in scored[:n_sentences])
        result       = ' '.join(sentences[i] for i in top_indices)
        return result or sentences[0]

    def key_points(self, text: str) -> list:
        """
        Extract top key bullet points from text.
        """
        sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        sentences = [s.strip() for s in sentences if len(s.split()) > 5]

        words  = clean_text(text).split()
        freq   = Counter(words)
        max_f  = max(freq.values()) if freq else 1

        def score(s):
            ws = clean_text(s).split()
            return sum(freq.get(w, 0) / max_f for w in ws)

        scored = sorted(sentences, key=score, reverse=True)
        return scored[:5]


summarizer_service = SummarizerService()