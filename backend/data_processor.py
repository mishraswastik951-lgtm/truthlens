import pandas as pd
import numpy as np
import nltk
import re
import string
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

print("Downloading NLTK data...")
nltk.download('stopwords', quiet=True)
nltk.download('punkt', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)
print("NLTK data downloaded!")


class DataPreprocessor:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))

    def clean_text(self, text):
        if pd.isna(text) or text == '':
            return ''

        # Step 1: Lowercase
        text = text.lower()

        # Step 2: Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text)

        # Step 3: Remove HTML tags
        text = re.sub(r'<.*?>', '', text)

        # Step 4: Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)

        # Step 5: Remove punctuation
        text = text.translate(
            str.maketrans('', '', string.punctuation)
        )

        # Step 6: Remove numbers
        text = re.sub(r'\d+', '', text)

        # Step 7: Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()

        # Step 8: Tokenize
        try:
            tokens = word_tokenize(text)
        except Exception:
            tokens = text.split()

        # Step 9: Remove stopwords and lemmatize
        tokens = [
            self.lemmatizer.lemmatize(token)
            for token in tokens
            if token not in self.stop_words and len(token) > 2
        ]

        return ' '.join(tokens)

    def load_and_prepare_data(self, fake_path, real_path):
        print("\n" + "="*50)
        print("STEP 1: Loading datasets...")
        print("="*50)

        # Load datasets
        fake_df = pd.read_csv(fake_path)
        real_df = pd.read_csv(real_path)

        print(f"Fake news articles loaded: {len(fake_df)}")
        print(f"Real news articles loaded: {len(real_df)}")
        print(f"\nFake columns: {fake_df.columns.tolist()}")
        print(f"Real columns: {real_df.columns.tolist()}")

        # Add labels (0=Fake, 1=Real)
        fake_df['label'] = 0
        real_df['label'] = 1

        print("\n" + "="*50)
        print("STEP 2: Data Cleaning...")
        print("="*50)

        # Combine datasets
        df = pd.concat([fake_df, real_df], ignore_index=True)
        print(f"Combined dataset size: {len(df)}")

        # Check missing values
        print(f"\nMissing values:\n{df.isnull().sum()}")

        # Remove duplicates
        before = len(df)
        df = df.drop_duplicates()
        print(f"\nRemoved {before - len(df)} duplicate rows")

        # Fill missing values
        df['title'] = df['title'].fillna('')
        df['text'] = df['text'].fillna('')

        if 'subject' in df.columns:
            df['subject'] = df['subject'].fillna('Unknown')

        # Combine title + text for richer features
        df['content'] = df['title'] + ' ' + df['text']

        # Remove very short articles
        before = len(df)
        df = df[df['content'].str.len() > 50]
        print(f"Removed {before - len(df)} very short articles")

        print(f"\nFinal size: {len(df)}")
        print(f"Fake articles: {len(df[df['label']==0])}")
        print(f"Real articles: {len(df[df['label']==1])}")

        print("\n" + "="*50)
        print("STEP 3: NLP Text Cleaning (takes 5-10 mins)...")
        print("="*50)

        # Apply cleaning (show progress)
        total = len(df)
        cleaned = []
        for i, text in enumerate(df['content']):
            cleaned.append(self.clean_text(text))
            if (i + 1) % 2000 == 0:
                print(f"  Processed {i+1}/{total} articles...")

        df['cleaned_content'] = cleaned

        # Remove empty results
        before = len(df)
        df = df[df['cleaned_content'].str.len() > 10]
        print(f"\nRemoved {before - len(df)} articles that became empty after cleaning")

        print(f"\n✅ Preprocessing complete! Final size: {len(df)}")
        return df

    def get_statistics(self, df):
        stats = {
            'total_articles': len(df),
            'fake_count': int(len(df[df['label'] == 0])),
            'real_count': int(len(df[df['label'] == 1])),
            'avg_text_length': float(df['content'].str.len().mean()),
        }
        if 'subject' in df.columns:
            stats['subjects'] = df['subject'].value_counts().to_dict()
        return stats