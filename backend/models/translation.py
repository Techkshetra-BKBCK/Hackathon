from transformers import pipeline

translator = pipeline("translation", model="Helsinki-NLP/opus-mt-en-de")

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
