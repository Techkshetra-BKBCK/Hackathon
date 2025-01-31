import requests

url = "http://127.0.0.1:8000/detect/"
data = {
    "ip_address": "192.168.1.100",
    "packet_size": 6000,
    "bytes_sent": 18000,
    "bytes_received": 19000,
    "latency": 500
}

response = requests.post(url, json=data)

# Print the response JSON
try:
    print(response.json())
except ValueError:
    print("Response content is not in JSON format:", response.text)


# import requests

# url = "http://127.0.0.1:8000/detect/"
# data = {
#     "ip_address": "192.168.1.100",
#     "packet_size": 1000,  # Normal packet size
#     "bytes_sent": 2000,   # Normal data sent
#     "bytes_received": 1500,  # Normal data received
#     "latency": 50  # Normal latency
# }

# response = requests.post(url, json=data)

# # Print the response JSON
# try:
#     print(response.json())
# except ValueError:
#     print("Response content is not in JSON format:", response.text)
