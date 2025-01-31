from datetime import datetime

def validate_user_input(data):
    errors = []
    if not data.get('name'):
        errors.append("Name is required")
    if not data.get('password'):
        errors.append("Password is required")
    return errors
