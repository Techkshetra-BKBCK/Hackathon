from gtts import gTTS
import base64
from io import BytesIO

def text_to_speech(text, lang):
    tts = gTTS(text=text, lang=lang)
    audio_buffer = BytesIO()
    tts.write_to_fp(audio_buffer)
    audio_bytes = audio_buffer.getvalue()
    return base64.b64encode(audio_bytes).decode()
