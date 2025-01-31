import whisper
import pyaudio
import wave
import os
from datetime import datetime
import numpy as np
import time
from deep_translator import GoogleTranslator

class LiveTranscriber:
    def __init__(self, model_size="medium", language=None):
        print("Initializing Whisper model...")
        try:
            self.model_size = model_size
            self.model = whisper.load_model(model_size)
            print("Whisper model loaded successfully.")
        except Exception as e:
            print(f"Failed to load Whisper model: {e}")
            raise

        self.language = language
        self.chunk = 1024
        self.format = pyaudio.paInt16
        self.channels = 1
        self.rate = 16000
        self.record_seconds = 10

        # Create a fixed temp directory
        self.temp_dir = os.path.join(os.getcwd(), "temp_audio")
        os.makedirs(self.temp_dir, exist_ok=True)
        print(f"Temporary directory created at: {self.temp_dir}")

        print("LiveTranscriber initialized with the following settings:")
        print(f" - Model size: {model_size}")
        print(f" - Language: {language or 'auto-detect'}")
        print(f" - Sample rate: {self.rate} Hz")

    def record_audio(self):
        """Record audio from microphone"""
        try:
            p = pyaudio.PyAudio()
            stream = p.open(format=self.format,
                            channels=self.channels,
                            rate=self.rate,
                            input=True,
                            frames_per_buffer=self.chunk)

            print("\nRecording...")
            frames = []

            for _ in range(0, int(self.rate / self.chunk * self.record_seconds)):
                data = stream.read(self.chunk, exception_on_overflow=False)
                frames.append(np.frombuffer(data, dtype=np.int16))

            print("Recording complete.")

            stream.stop_stream()
            stream.close()
            p.terminate()

            return np.concatenate(frames)

        except Exception as e:
            print(f"Error during recording: {e}")
            return None

    def save_audio(self, audio_data):
        """Save audio data to a WAV file"""
        if audio_data is None:
            return None

        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"temp_audio_{timestamp}.wav"
            filepath = os.path.join(self.temp_dir, filename)

            with wave.open(filepath, 'wb') as wf:
                wf.setnchannels(self.channels)
                wf.setsampwidth(pyaudio.get_sample_size(self.format))
                wf.setframerate(self.rate)
                wf.writeframes(audio_data.tobytes())

            print(f"Audio saved to: {filepath}")
            return filepath

        except Exception as e:
            print(f"Error saving audio file: {e}")
            return None

    def transcribe_audio_file(self, audio_file):
        """Transcribe a saved WAV file."""
        if not os.path.exists(audio_file):
            print("Audio file does not exist!")
            return

        print("Transcribing audio...")
        try:
            result = self.model.transcribe(
                audio_file, language=self.language, task="transcribe"
            )

            timestamp = datetime.now().strftime("%H:%M:%S")
            if result.get("text", "").strip():
                transcription = result['text'].strip()
                print(f"[{timestamp}] {transcription}")
                if result.get("language") and not self.language:
                    print(f"Detected language: {result['language']}")

                # Translate the text
                translated_text = self.translate_text(transcription)
                print(f"Translated Text: {translated_text}")

        except Exception as e:
            print(f"Transcription failed: {e}")

    def translate_text(self, text, dest_language="hi"):
        try:
            translation = GoogleTranslator(source="auto", target=dest_language).translate(text)
            return translation
        except Exception as e:
            print(f"Translation failed: {e}")
        return ""

    def transcribe(self):
        """Start continuous transcription."""
        print(f"Starting transcription... (Press Ctrl+C to stop)")
        print(f"Model: {self.model_size}, Language: {self.language or 'auto-detect'}")

        try:
            while True:
                print("Recording audio segment...")
                audio_data = self.record_audio()
                if audio_data is None:
                    print("Failed to record audio. Retrying...")
                    continue

                audio_file = self.save_audio(audio_data)
                if audio_file is None:
                    print("Failed to save audio file. Retrying...")
                    continue

                print(f"Processing audio file: {audio_file}")

                if os.path.exists(audio_file):
                    print(f"File size: {os.path.getsize(audio_file)} bytes")

                try:
                    self.transcribe_audio_file(audio_file)

                except Exception as e:
                    print(f"Error during transcription: {e}")

                finally:
                    try:
                        if os.path.exists(audio_file):
                            os.remove(audio_file)
                            print(f"Removed temporary file: {audio_file}")
                    except Exception as e:
                        print(f"Error cleaning up temporary file: {e}")

        except KeyboardInterrupt:
            print("\nTranscription stopped by user.")
            self.clean_up()

    def clean_up(self):
        """Clean up temporary files and directory."""
        try:
            for file in os.listdir(self.temp_dir):
                file_path = os.path.join(self.temp_dir, file)
                if os.path.exists(file_path):
                    os.remove(file_path)
            os.rmdir(self.temp_dir)
            print("Temporary directory cleaned up.")
        except Exception as e:
            print(f"Error during cleanup: {e}")

if __name__ == "__main__":
    try:
        transcriber = LiveTranscriber(
            model_size="tiny",
            language="en"
        )
        transcriber.transcribe()
    except Exception as e:
        print(f"Error initializing transcriber: {e}")