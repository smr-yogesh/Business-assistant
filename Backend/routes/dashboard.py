from flask import jsonify, request, Blueprint, render_template
from flask_jwt_extended import jwt_required

dash_bp = Blueprint("dash", __name__)


@dash_bp.route("/welcome")
@jwt_required()
def welcome():
    return render_template("welcome.html")


@dash_bp.route("/dashboard")
@jwt_required()
def dashboard():
    return render_template("dashboard.html")
