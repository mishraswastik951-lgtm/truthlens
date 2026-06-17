# ============================================================
#   TruthLens - Complete Training Script (All-in-One)
#   No external imports needed - everything is here!
# ============================================================

import os
import re
import string
import pandas as pd
import numpy as np
import joblib
import nltk

from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier 
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    classification_report,
    accuracy_score,
    roc_auc_score,
    confusion_matrix
)

# ─────────────────────────────────────────────────────────────
# STEP 0 : Download NLTK data
# ─────────────────────────────────────────────────────────────
print("=" * 60)
print("  TruthLens - Fake News Detection Model Training")
print("=" * 60)

print("\n[0/5] Downloading NLTK data...")
nltk.download('stopwords',              quiet=True)
nltk.download('punkt',                  quiet=True)
nltk.download('punkt_tab',              quiet=True)
nltk.download('wordnet',                quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)
print("      NLTK data ready!")

# ─────────────────────────────────────────────────────────────
# STEP 1 : Text Cleaning Function
# ─────────────────────────────────────────────────────────────
lemmatizer = WordNetLemmatizer()
stop_words  = set(stopwords.words('english'))


def clean_text(text):
    """Full NLP cleaning pipeline."""
    if pd.isna(text) or str(text).strip() == '':
        return ''

    text = str(text).lower()

    # Remove URLs
    text = re.sub(r'http\S+|www\S+|https\S+', '', text)

    # Remove HTML tags
    text = re.sub(r'<.*?>', '', text)

    # Remove email addresses
    text = re.sub(r'\S+@\S+', '', text)

    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))

    # Remove digits
    text = re.sub(r'\d+', '', text)

    # Collapse whitespace
    text = re.sub(r'\s+', ' ', text).strip()

    # Tokenise
    try:
        tokens = word_tokenize(text)
    except Exception:
        tokens = text.split()

    # Remove stopwords + lemmatise (keep words longer than 2 chars)
    tokens = [
        lemmatizer.lemmatize(tok)
        for tok in tokens
        if tok not in stop_words and len(tok) > 2
    ]

    return ' '.join(tokens)


# ─────────────────────────────────────────────────────────────
# STEP 2 : Load & Clean Dataset
# ─────────────────────────────────────────────────────────────
FAKE_CSV = 'data/Fake.csv'
TRUE_CSV  = 'data/True.csv'

print("\n[1/5] Checking dataset files...")

# ── Guard: make sure CSV files exist ────────────────────────
if not os.path.exists(FAKE_CSV):
    print(f"\n  ERROR : '{FAKE_CSV}' not found!")
    print("  Please download the dataset from:")
    print("  https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset")
    print("  Then place Fake.csv and True.csv inside the 'data/' folder.")
    raise SystemExit(1)

if not os.path.exists(TRUE_CSV):
    print(f"\n  ERROR : '{TRUE_CSV}' not found!")
    print("  Please place True.csv inside the 'data/' folder.")
    raise SystemExit(1)

print("  Both CSV files found!")

print("\n[2/5] Loading and cleaning data...")

fake_df = pd.read_csv(FAKE_CSV)
true_df = pd.read_csv(TRUE_CSV)

print(f"  Fake articles loaded : {len(fake_df):,}")
print(f"  Real articles loaded : {len(true_df):,}")

# Add labels
fake_df['label'] = 0   # 0 = Fake
true_df['label'] = 1   # 1 = Real

# Combine
df = pd.concat([fake_df, true_df], ignore_index=True)
print(f"  Combined total       : {len(df):,}")

# Fill missing values
df['title'] = df['title'].fillna('')
df['text']  = df['text'].fillna('')

if 'subject' in df.columns:
    df['subject'] = df['subject'].fillna('Unknown')

# Merge title + text for richer signal
df['content'] = df['title'] + ' ' + df['text']

# Remove duplicates
before = len(df)
df = df.drop_duplicates(subset=['content'])
print(f"  Duplicates removed   : {before - len(df):,}")

# Remove very short articles
before = len(df)
df = df[df['content'].str.len() > 50].reset_index(drop=True)
print(f"  Short articles removed: {before - len(df):,}")

# ── NLP cleaning (show progress every 2 000 rows) ───────────
print(f"\n  Cleaning {len(df):,} articles with NLP pipeline...")
print("  (This takes 5-15 minutes — please wait)\n")

total   = len(df)
cleaned = []

for i, text in enumerate(df['content']):
    cleaned.append(clean_text(text))
    if (i + 1) % 2000 == 0 or (i + 1) == total:
        pct = (i + 1) / total * 100
        bar = '█' * int(pct // 5) + '░' * (20 - int(pct // 5))
        print(f"  [{bar}] {pct:5.1f}%  ({i+1:,}/{total:,})", end='\r')

print()   # newline after progress bar

df['cleaned_content'] = cleaned

# Drop articles that became empty after cleaning
before = len(df)
df = df[df['cleaned_content'].str.len() > 10].reset_index(drop=True)
print(f"\n  Empty after cleaning : {before - len(df):,} removed")
print(f"  Final dataset size   : {len(df):,}")
print(f"  Fake : {len(df[df.label==0]):,} | Real : {len(df[df.label==1]):,}")


# ─────────────────────────────────────────────────────────────
# STEP 3 : Train / Test Split
# ─────────────────────────────────────────────────────────────
print("\n[3/5] Splitting dataset (80 % train / 20 % test)...")

X = df['cleaned_content']
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y          # keeps class balance in both splits
)

print(f"  Train samples : {len(X_train):,}")
print(f"  Test  samples : {len(X_test):,}")


# ─────────────────────────────────────────────────────────────
# STEP 4 : Train Multiple Models
# ─────────────────────────────────────────────────────────────
print("\n[4/5] Training models...\n")


def make_pipeline(clf):
    """Wrap any classifier with a TF-IDF vectoriser."""
    return Pipeline([
        ('tfidf', TfidfVectorizer(
            max_features=50000,
            ngram_range=(1, 2),   # unigrams + bigrams
            min_df=2,
            max_df=0.95,
            sublinear_tf=True     # log-scale TF
        )),
        ('clf', clf)
    ])


candidates = {
    'Logistic Regression': LogisticRegression(
        max_iter=1000, C=1.0, random_state=42, n_jobs=-1
    ),
    'Naive Bayes': MultinomialNB(alpha=0.1),
    'Random Forest': RandomForestClassifier(
        n_estimators=100, random_state=42, n_jobs=-1
    ),
}

best_accuracy = 0.0
best_name     = ''
best_pipeline = None
all_results   = {}

for name, clf in candidates.items():
    print(f"  Training : {name} ...")
    try:
        pipe = make_pipeline(clf)
        pipe.fit(X_train, y_train)

        y_pred = pipe.predict(X_test)
        y_prob = pipe.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_prob)
        cm  = confusion_matrix(y_test, y_pred)

        print(f"  Accuracy  : {acc * 100:.2f} %")
        print(f"  AUC Score : {auc:.4f}")
        print()
        print(classification_report(
            y_test, y_pred, target_names=['Fake', 'Real']
        ))
        print("-" * 50)

        all_results[name] = {
            'accuracy':         acc,
            'auc':              auc,
            'confusion_matrix': cm.tolist(),
        }

        if acc > best_accuracy:
            best_accuracy = acc
            best_name     = name
            best_pipeline = pipe

    except Exception as err:
        print(f"  ERROR training {name}: {err}\n")


# ─────────────────────────────────────────────────────────────
# STEP 5 : Save Best Model
# ─────────────────────────────────────────────────────────────
print("\n[5/5] Saving best model...")

os.makedirs('models', exist_ok=True)
MODEL_SAVE_PATH = 'models/best_model.pkl'

if best_pipeline is not None:
    joblib.dump(best_pipeline, MODEL_SAVE_PATH)

    print("\n" + "=" * 60)
    print(f"  BEST MODEL : {best_name}")
    print(f"  ACCURACY   : {best_accuracy * 100:.2f} %")
    print(f"  SAVED TO   : {MODEL_SAVE_PATH}")
    print("=" * 60)
    print("\n  All model results:")
    for name, res in all_results.items():
        marker = " <-- BEST" if name == best_name else ""
        print(f"    {name:25s} | Acc: {res['accuracy']*100:.2f}%"
              f" | AUC: {res['auc']:.4f}{marker}")

    print("\n  Training COMPLETE!")
    print("  Now run:  python app.py")
    print("=" * 60 + "\n")
else:
    print("\n  ERROR: No model was trained successfully!")
    print("  Check your data files and try again.")