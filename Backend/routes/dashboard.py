from flask import jsonify, request, Blueprint, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from model.user import User

dash_bp = Blueprint("dash", __name__)


@dash_bp.route("/welcome")
@jwt_required()
def welcome():
    return render_template("welcome.html")


@dash_bp.route("/dashboard")
@jwt_required()
def dashboard():
    user = User.query.get(get_jwt_identity())
    return render_template("dashboard.html", user=user)
