import pyaudio
import wave
import os
import requests
import json
from datetime import datetime
import numpy as np

class SarvamLiveTranscriber:
    def __init__(self, api_key, target_language='en', translation_target='hi-IN'):
        self.api_key = api_key
        self.chunk = 1024
        self.format = pyaudio.paInt16
        self.channels = 1
        self.rate = 16000
        self.record_seconds = 10
        self.target_language = target_language  # Default translation language
        self.translation_target = translation_target
        
        # API endpoints
        self.stt_url = "https://api.sarvam.ai/speech-to-text-translate"
        self.translation_url = "https://api.sarvam.ai/translate"
        
        # Create temp directory
        self.temp_dir = os.path.join(os.getcwd(), "temp_audio")
        os.makedirs(self.temp_dir, exist_ok=True)

    def record_audio(self):
        """Record audio from microphone"""
        try:
            p = pyaudio.PyAudio()
            stream = p.open(format=self.format,
                            channels=self.channels,
                            rate=self.rate,
                            input=True,
                            frames_per_buffer=self.chunk)

            frames = []
            for _ in range(0, int(self.rate / self.chunk * self.record_seconds)):
                data = stream.read(self.chunk, exception_on_overflow=False)
                frames.append(np.frombuffer(data, dtype=np.int16))

            stream.stop_stream()
            stream.close()
            p.terminate()

            return np.concatenate(frames)
        except Exception as e:
            print(f"Error during recording: {e}")
            return None

    def save_audio(self, audio_data):
        """Save recorded audio as WAV file"""
        if audio_data is None:
            return None

        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"recorded_{timestamp}.wav"
            filepath = os.path.join(self.temp_dir, filename)

            with wave.open(filepath, 'wb') as wf:
                wf.setnchannels(self.channels)
                wf.setsampwidth(pyaudio.get_sample_size(self.format))
                wf.setframerate(self.rate)
                wf.writeframes(audio_data.tobytes())

            return filepath
        except Exception as e:
            print(f"Error saving audio file: {e}")
            return None

    def transcribe_audio(self, audio_file):
        """Send audio to Sarvam AI API for transcription"""
        if not os.path.exists(audio_file):
            return None
        
        try:
            with open(audio_file, 'rb') as file:
                files = {'file': ('audio.wav', file, 'audio/wav')}
                payload = {
                    'model': 'saaras:v2',
                    'with_diarization': 'false',
                    'target_language': self.target_language
                }
                headers = {'api-subscription-key': self.api_key}
                
                response = requests.post(self.stt_url, headers=headers, data=payload, files=files)
                if response.status_code == 200:
                    return response.json().get('transcript', '')
                else:
                    print(f"API Error {response.status_code}: {response.text}")
                    return None
        except Exception as e:
            print(f"Error in API request: {e}")
            return None

    def translate_text(self, text):
        """Translate transcribed text using Sarvam AI"""
        if not text:
            return None
        
        try:
            payload = {
                "input": text,
                "source_language_code": "en-IN",
                "target_language_code": self.translation_target,
                "speaker_gender": "Male",
                "mode": "formal",
                "model": "mayura:v1"
            }
            headers = {
                "api-subscription-key": self.api_key,
                "Content-Type": "application/json"
            }
            
            response = requests.post(self.translation_url, json=payload, headers=headers)
            if response.status_code == 200:
                return response.json().get('translated_text', '')
            else:
                print(f"Translation API Error {response.status_code}: {response.text}")
                return None
        except Exception as e:
            print(f"Error in translation request: {e}")
            return None

    def transcribe_and_translate(self):
        """Main process to transcribe and translate"""
        try:
            while True:
                print("Recording audio...")
                audio_data = self.record_audio()
                if audio_data is None:
                    continue

                audio_file = self.save_audio(audio_data)
                if audio_file is None:
                    continue

                transcript = self.transcribe_audio(audio_file)
                if transcript:
                    print(f"Transcription: {transcript}")
                    translation = self.translate_text(transcript)
                    if translation:
                        print(f"Translation: {translation}")
                
                if os.path.exists(audio_file):
                    os.remove(audio_file)
        except KeyboardInterrupt:
            print("Transcription stopped by user.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    API_KEY = "05fb22a5-db3f-478a-8669-de63cf46fda5"
    transcriber = SarvamLiveTranscriber(API_KEY)
    transcriber.transcribe_and_translate()
