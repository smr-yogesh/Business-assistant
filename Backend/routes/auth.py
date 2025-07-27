from flask import jsonify, request, Blueprint, render_template, url_for, redirect
from flask_jwt_extended import (
    jwt_required,
    create_access_token,
    get_jwt_identity,
    verify_jwt_in_request,
)
from routes.validator import validate_password
from model.user import User
from utils.extensions import db

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/signup")
def signup():
    verify_jwt_in_request(optional=True)
    if get_jwt_identity() is not None:
        return redirect(url_for("dash.dashboard"))
    return render_template("signup.html")


@auth_bp.route("/signin")
def signin():
    verify_jwt_in_request(optional=True)
    if get_jwt_identity() is not None:
        return redirect(url_for("dash.dashboard"))
    return render_template("signin.html")
