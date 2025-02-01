from django.shortcuts import render, redirect
import openai
import requests

def home(request):
    return render(request, 'home.html')

def insight(request):
    return render(request, 'insight.html')

import requests
from django.shortcuts import render

def generateimage(request):
    image_url = None
    if request.method == 'POST':
        user_prompt = request.POST.get('prompt', '')
        custom_prefix = "Create advertisement with inside content:"
        final_prompt = f"{custom_prefix}{user_prompt}"
        
        api_url = f"https://image.pollinations.ai/prompt/{final_prompt}"
        response = requests.get(api_url)

        if response.status_code == 200:
            image_url = api_url
        else:
            image_url = None

    return render(request, 'generate_ad.html', {'image_url': image_url})



def generatetext(request):
    generated_text = None
    if request.method == 'POST':
        user_prompt = request.POST.get('prompt', '')
        custom_prompt = "Give me advertisment with catchy tagline on:"
        api_url = f"https://text.pollinations.ai/{custom_prompt}{user_prompt}"
        
        # Fetch text from Pollination API
        response = requests.get(api_url)
        
        if response.status_code == 200:
            generated_text = response.text
        else:
            generated_text = "Error: Unable to fetch text from the API."

    return render(request, 'generate_text.html', {'generated_text': generated_text})