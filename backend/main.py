from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
import base64
from io import BytesIO
from gtts import gTTS
from transformers import pipeline

app = Flask(__name__)
CORS(app)

# Load Whisper model
model = whisper.load_model("base")

def speech_to_text(audio_bytes, lang="en"):
    with open("temp.wav", "wb") as f:
        f.write(audio_bytes)
    result = model.transcribe("temp.wav", language=lang)
    return result["text"]

# Translation function
def translate_text(text, target_lang):
    if target_lang == "de":
        translator = pipeline("translation", model="Helsinki-NLP/opus-mt-en-de")
    elif target_lang == "zh":
        translator = pipeline("translation", model="Helsinki-NLP/opus-mt-en-zh")
    elif target_lang == "hi":
        translator = pipeline("translation", model="Helsinki-NLP/opus-mt-en-hi")
    else:
        return text
    return translator(text)[0]["translation_text"]

# Text-to-Speech function
def text_to_speech(text, lang):
    tts = gTTS(text=text, lang=lang)
    audio_buffer = BytesIO()
    tts.write_to_fp(audio_buffer)
    audio_bytes = audio_buffer.getvalue()
    return base64.b64encode(audio_bytes).decode()

@app.route("/speech-to-text", methods=["POST"])
def handle_speech_to_text():
    audio_data = request.files["audio"].read()
    lang = request.form.get("lang", "en")
    text = speech_to_text(audio_data, lang)
    return jsonify({"text": text})

@app.route("/translate", methods=["POST"])
def handle_translate():
    data = request.json
    translated_text = translate_text(data["text"], data["target_lang"])
    return jsonify({"translated_text": translated_text})

@app.route("/text-to-speech", methods=["POST"])
def handle_text_to_speech():
    data = request.json
    audio_base64 = text_to_speech(data["text"], data["lang"])
    return jsonify({"audio": audio_base64})

if __name__ == "__main__":
    app.run(debug=True)

