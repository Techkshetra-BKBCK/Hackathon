from flask import jsonify

def make_response(success, message, data=None, status_code=200):
    response = {
        "success": success,
        "message": message
    }
    if data:
        response["data"] = data
    return jsonify(response), status_code

def handle_error(message, status_code=400):
    return make_response(False, message, status_code=status_code)