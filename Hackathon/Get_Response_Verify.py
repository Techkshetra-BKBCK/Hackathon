
import google.generativeai as genai
key="AIzaSyDdyDb0WR7cJBwT6Zj4Kbu9mV_f80Fy-zA"
genai.configure(api_key=key)

# Create the model
generation_config = {
  "temperature": 1,
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 8192,
  "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
  model_name="gemini-2.0-flash-exp",
  generation_config=generation_config,
)

chat_session = model.start_chat(
  history=[
  ]
)

while True:
    user=input("User: ")
    if(user.lower() in ['bye','quit','exit']):
        break
    extra="""You are a health specialist ai provide user with medicaal advice , provide and concise output for better results"""
    response = chat_session.send_message(user,)
    
    print(response.text)

    
