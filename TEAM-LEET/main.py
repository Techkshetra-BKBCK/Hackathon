from flask import Flask, redirect, url_for
from flask_login import LoginManager
from models import db, User

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config["SECRET_KEY"] = "mY-sUp3r-s3cr37-k3y"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.sqlite"
app.config["SESSION_COOKIE_NAME"] = "session"
app.config["SESSION_COOKIE_HTTPONLY"] = True
app.config["SESSION_COOKIE_SECURE"] = True
app.config["SESSION_COOKIE_SAMESITE"] = "Strict"
app.config["SESSION_COOKIE_ENCODING"] = "utf-8"

login_manager = LoginManager()
login_manager.init_app(app)
db.init_app(app)

from routes.routes import main_bp

app.register_blueprint(main_bp)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized():
    return redirect(url_for("main.login"))

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(host="0.0.0.0", port=5000, debug=True)
