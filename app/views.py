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

def about(request):
    return render(request, 'about.html')

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


from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import requests

LANGFLOW_URL = "https://api.langflow.astra.datastax.com/lf/33924fc4-c206-4c8b-9d46-36917ef56de0/api/v1/run/930ed97c-43f8-4a49-bdce-2d757858e3b0?stream=False"
LANGFLOW_TOKEN = "AstraCS:smRcHcXNOwdhzyZTeZpZvFqY:e05ba8a87acaee2f62b4986957ff139271c6b443dabc7437ff264dd2e3cc8d00"


@csrf_exempt
def send_to_chatbot(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user_message = data.get('message', '')

        # Prepare Langflow input
        langflow_input = prepare_langflow_input(user_message)

        # Call Langflow API
        langflow_output = call_langflow_api(langflow_input)
        if "error" in langflow_output:
            return JsonResponse({"error": langflow_output["error"]}, status=500)

        # Extract the response
        response_text = langflow_output.get("outputs", [])[0].get("outputs", [])[0].get("results", {}).get("message", {}).get("text", "")

        return JsonResponse({"response": response_text})
    return JsonResponse({"error": "Invalid request method"}, status=400)

def prepare_langflow_input(query):
    return query  # Modify this to prepare input as needed

def call_langflow_api(data):
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {LANGFLOW_TOKEN}'
    }
    payload = {
        "input_value": data,
        "output_type": "chat",
        "input_type": "chat",
    }
    try:
        response = requests.post(LANGFLOW_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error while calling LangFlow API: {e}")
        return {"error": "LangFlow API request failed."}