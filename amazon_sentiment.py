import time
import pandas as pd
import requests
import nltk
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from textblob import TextBlob

# Download VADER lexicon
nltk.download('vader_lexicon')

# Initialize Sentiment Analyzer
sentiments = SentimentIntensityAnalyzer()

# Function to scrape Amazon reviews
def scrape_reviews(product_url, max_reviews=10):
    options = Options()
    options.headless = True  # Run browser in background
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    driver.get(product_url)
    time.sleep(3)  # Allow page to load

    reviews = []
    try:
        for _ in range(max_reviews // 10):  # Each page usually has 10 reviews
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            review_elements = soup.find_all("span", {"data-hook": "review-body"})

            for review in review_elements:
                reviews.append(review.text.strip())

            # Click "Next" button to load more reviews
            next_button = driver.find_element(By.XPATH, '//li[@class="a-last"]/a')
            if next_button:
                next_button.click()
                time.sleep(3)
            else:
                break
    except Exception as e:
        print("Error while scraping:", e)

    driver.quit()
    return reviews

# Train a Sentiment Analysis Model
def train_sentiment_model():
    # Sample dataset (Replace with a real dataset)
    sample_data = pd.DataFrame({
        "review": [
            "This product is amazing!", "Worst purchase ever!", "I love it!", "Very bad quality!",
            "Absolutely fantastic!", "Not what I expected.", "Highly recommended!", "Terrible experience!"
        ],
        "sentiment": [1, 0, 1, 0, 1, 0, 1, 0]  # 1 = Positive, 0 = Negative
    })

    vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
    X = vectorizer.fit_transform(sample_data["review"])
    y = sample_data["sentiment"]

    model = LogisticRegression()
    model.fit(X, y)

    return model, vectorizer

# Function to analyze sentiment using TextBlob and VADER
def analyze_reviews(reviews, model, vectorizer):
    if not reviews:
        print("No reviews found.")
        return

    X_reviews = vectorizer.transform(reviews)
    predictions = model.predict(X_reviews)

    positive_count = sum(predictions)
    negative_count = len(predictions) - positive_count

    print("\n🔹 Sentiment Analysis Result (AI Model):")
    print(f"✅ Positive Reviews: {positive_count}")
    print(f"❌ Negative Reviews: {negative_count}")

    overall_sentiment_ai = "Positive 😊" if positive_count > negative_count else "Negative 😞"
    print(f"\n📝 Overall Product Sentiment (AI): {overall_sentiment_ai}")

    print("\n🔸 Sentiment Analysis Result (TextBlob & VADER):")
    positive_tb_vader = 0
    negative_tb_vader = 0
    neutral_tb_vader = 0
    for review in reviews:
        analysis = TextBlob(review)
        vader_score = sentiments.polarity_scores(review)['compound']

        tb_polarity = analysis.sentiment.polarity  # TextBlob polarity (-1 to 1)
        vader_polarity = 1 if vader_score > 0.05 else 0 if vader_score < -0.05 else 0.5  # VADER polarity (0, 0.5, 1)

        if tb_polarity > 0 and vader_polarity == 1:  # Both positive
            positive_tb_vader += 1
        elif tb_polarity < 0 and vader_polarity == 0:  # Both Negative
            negative_tb_vader += 1
        elif tb_polarity > 0 and vader_polarity == 0:  # TextBlob positive, VADER neutral
            positive_tb_vader += 1
        elif tb_polarity < 0 and vader_polarity == 1:  # TextBlob negative, VADER positive
            negative_tb_vader += 1
        elif tb_polarity < 0 and vader_polarity == 0.5:  # TextBlob negative, VADER neutral
            negative_tb_vader += 1
        elif tb_polarity > 0 and vader_polarity == 0.5:  # TextBlob positive, VADER neutral
            positive_tb_vader += 1
        elif tb_polarity == 0 and vader_polarity == 0.5: # TextBlob neutral, VADER neutral
            neutral_tb_vader += 1
        elif tb_polarity == 0 and vader_polarity == 1: # TextBlob neutral, VADER positive
            positive_tb_vader += 1
        elif tb_polarity == 0 and vader_polarity == 0: # TextBlob neutral, VADER negative
            negative_tb_vader += 1


    print(f"✅ Positive Reviews: {positive_tb_vader}")
    print(f"❌ Negative Reviews: {negative_tb_vader}")
    print(f"😐 Neutral Reviews: {neutral_tb_vader}")
    overall_sentiment_tb_vader = "Positive 😊" if positive_tb_vader > negative_tb_vader else "Negative 😞" if positive_tb_vader < negative_tb_vader else "Neutral 😐"
    print(f"\n📝 Overall Product Sentiment (TextBlob & VADER): {overall_sentiment_tb_vader}")


# Main function
if __name__ == "__main__":
    product_url = input("Enter the product URL: ")

    print("\n🔄 Scraping reviews...")
    reviews = scrape_reviews(product_url, max_reviews=20)

    print("\n📊 Training AI Model...")
    model, vectorizer = train_sentiment_model()

    print("\n🔍 Analyzing Sentiment...")
    analyze_reviews(reviews, model, vectorizer)