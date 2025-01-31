from flask import Blueprint, request, jsonify, session, redirect, url_for
from flask_login import login_required, current_user, login_user, logout_user
from models import User, db
from helpers.response import make_response, handle_error
from werkzeug.security import check_password_hash

main_bp = Blueprint('main', __name__)

@main_bp.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.json.get("username", "")
        password = request.json.get("password", "")
        remember = request.json.get("remember", False)
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            login_user(user, remember=remember)
            return make_response("Successfully logged in.", 200)
        else:
            return handle_error("Invalid username or password.", 401)
    else:
        if current_user.is_authenticated:
            return make_response("Already logged in.", 200)
        return make_response("Login page.", 200)

@main_bp.route('/register', methods=['POST', 'GET'])
def register():
    if request.method == "POST":
        username = str(request.json["username"])
        password = str(request.json["password"])
        existing_user = User.query.filter_by(username=username).first()
        if existing_user is None:
            new_user = User(username=username)
            new_user.set_password(password)
            db.session.add(new_user)
            db.session.commit()
            login_user(new_user, remember=True)
            return make_response("Successfully registered.", 200)
        else:
            return make_response("Username already exists. Please choose a different one.", 400)
    else:
        if current_user.is_authenticated:
            return make_response("Already logged in.", 200)
        return make_response("Register page.", 200)
    
@main_bp.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("main.index"))
