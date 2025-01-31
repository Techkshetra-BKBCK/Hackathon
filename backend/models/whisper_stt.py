import whisper

model = whisper.load_model("base")

def speech_to_text(audio_bytes, lang="en"):
    with open("temp.wav", "wb") as f:
        f.write(audio_bytes)
    result = model.transcribe("temp.wav", language=lang)
    return result["text"]
