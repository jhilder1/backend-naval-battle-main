from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

DB_FILE = "database/scores.json"
COUNTRY_FILE = "database/countries.json"

def load_countries():
    if os.path.exists(COUNTRY_FILE):
        with open(COUNTRY_FILE, "r", encoding="utf-8") as file:
            return json.load(file)
    return []

def load_scores():
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r") as file:
            return json.load(file)
    return {}


def save_scores(scores):
    with open(DB_FILE, "w") as file:
        json.dump(scores, file, indent=4)


@app.route("/score-recorder", methods=["POST"])
def score_recorder():
    data = request.json
    if not all(k in data for k in ["nick_name", "score", "country_code"]):
        return jsonify({"error": "Missing required fields"}), 400

    scores = load_scores()
    nick = data["nick_name"]

    if nick in scores:
        scores[nick]["score"] += data["score"]
    else:
        scores[nick] = {"score": data["score"], "country_code": data["country_code"]}

    save_scores(scores)
    return jsonify({"message": "Score recorded successfully"})


@app.route("/ranking", methods=["GET"])
def ranking():
    scores = load_scores()
    ranking_list = sorted(scores.items(), key=lambda x: x[1]["score"], reverse=True)
    return jsonify([{"nick_name": nick, "score": info["score"], "country_code": info["country_code"]} for nick, info in
                    ranking_list])

@app.route("/countries", methods=["GET"])
def get_countries():
    countries = load_countries()
    return jsonify(countries)


if __name__ == "__main__":
    app.run(debug=True)