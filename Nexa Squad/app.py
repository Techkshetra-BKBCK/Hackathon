import tkinter as tk
from tkinter import filedialog, messagebox
import cv2
import numpy as np
import requests

# import libary here , which libary you want you can import from here

# UI Desgin Start From Here
class DeepFakeDetectionApp:
    def _init_(self, root):
        self.root = root
        self.root.title("Deepfake Detection Tool")
        self.root.geometry("500x300")
        self.root.configure(bg="#f0f0f5")

        # Title Label
        title_label = tk.Label(
            root, 
            text="Upload a video or image to check for deepfake detection", 
            font=("Arial", 12, "bold"), 
            bg="#f0f0f5"
        )
        title_label.pack(pady=20)

        # Frame for Buttons
        button_frame = tk.Frame(root, bg="#f0f0f5")
        button_frame.pack(expand=True)

        # Upload Button
        upload_button = tk.Button(
            button_frame, 
            text="Upload", 
            font=("Arial", 10), 
            bg="#0078d4", 
            fg="white", 
            padx=20, 
            pady=5, 
            command=self.upload_file
        )
        upload_button.grid(row=0, column=0, padx=20, pady=10)

        # Submit Button
        submit_button = tk.Button(
            button_frame, 
            text="Submit", 
            font=("Arial", 10), 
            bg="#28a745", 
            fg="white", 
            padx=20, 
            pady=5, 
            command=self.submit_file
        )
        submit_button.grid(row=0, column=1, padx=20, pady=10)

        # Reset Button
        reset_button = tk.Button(
            root, 
            text="Reset", 
            font=("Arial", 10), 
            bg="#dc3545", 
            fg="white", 
            padx=20, 
            pady=5, 
            command=self.reset_app
        )
        reset_button.pack(pady=10)

        # File Path Display
        self.file_path_label = tk.Label(
            root, 
            text="No file selected", 
            font=("Arial", 10), 
            bg="#f0f0f5"
        )
        # UI Desgin Start From Here

        self.file_path_label.pack(pady=5)

        self.selected_file = None

    def upload_file(self):
        file_path = filedialog.askopenfilename(
            title="Select File", 
            filetypes=[("Media Files", "*.mp4 *.jpg *.png *.jpeg")]
        )
        if file_path:
            self.file_path_label.config(text=f"Selected: {file_path}")
            self.selected_file = file_path
        else:
            self.file_path_label.config(text="No file selected")

    def submit_file(self):
        try:
            if hasattr(self, 'selected_file') and self.selected_file:
                messagebox.showinfo("Processing", f"Submitting {self.selected_file} for detection")
                result = self.detect_deepfake(self.selected_file)
                self.display_result(result)
            else:
                messagebox.showwarning("No File", "Please upload a file first.")
        except Exception as e:
            messagebox.showerror("Error", str(e))

    def detect_deepfake(self, file_path):
        # Check file type and process accordingly
        if file_path.lower().endswith(('.png', '.jpg', '.jpeg')):
            image = cv2.imread(file_path)
            data = self.prepare_image(image)
            response = self.send_request(data, 'image')
        elif file_path.lower().endswith(('.mp4', '.mov')):
            video = cv2.VideoCapture(file_path)
            ret, frame = video.read()
            if ret:
                data = self.prepare_image(frame)
                response = self.send_request(data, 'video')
            video.release()
        else:
            return {"success": False, "message": "Unsupported file format."}

        return response

    def prepare_image(self, image):
        # Preprocess the image for the model
        image = cv2.resize(image, (224, 224))  # Resize to model input size
        image = image.astype('float32') / 255.0  # Normalize
        image = np.expand_dims(image, axis=0)  # Add batch dimension
        return image
       # API integreation done here,  api key integreation code here 
    def send_request(self, data, media_type):
        # Send the image or video data to the deepfake detection API
        url = "Replace This With YOur API Key"  # Replace with your API endpoint
        files = {'file': data}
        response = requests.post(url, files=files, data={'type': media_type})
        return response.json() # to use json function you have to import json package

    def display_result(self, response):
        # Display the result from the API
        # get method ka jo response ayega wah yaha pe likha taki result show ho 
        if response.get('success'):
            probability = response.get('probability', 0)
            messagebox.showinfo("Result", f"Deepfake Probability: {probability:.2f}")
        else:
            messagebox.showerror("Error", response.get('message', "Error in detection."))

    def reset_app(self):
        self.file_path_label.config(text="No file selected")
        self.selected_file = None
        messagebox.showinfo("Reset", "Application reset successfully")

if _name_ == "_main_":
    root = tk.Tk()
    app = DeepFakeDetectionApp(root)
    root.mainloop()
