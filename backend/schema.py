from pydantic import BaseModel, Field
import re

# Validate IP Address Format
def validate_ip(ip: str):
    ip_pattern = re.compile(r"^(?:\d{1,3}\.){3}\d{1,3}$")
    if not ip_pattern.match(ip):
        raise ValueError("Invalid IP address format")
    return ip

class TrafficData(BaseModel):
    ip_address: str = Field(..., description="IPv4 Address", example="192.168.1.1")
    packet_size: int = Field(..., gt=0, description="Packet size in bytes")
    bytes_sent: int = Field(..., gt=0, description="Total bytes sent")
    bytes_received: int = Field(..., gt=0, description="Total bytes received")
    latency: int = Field(..., ge=0, description="Latency in milliseconds")
