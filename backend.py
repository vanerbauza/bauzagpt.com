from flask import Flask, request, jsonify
import subprocess, os

app = Flask(__name__)
os.environ["XAI_API_KEY"] = "xai-0m5gNQ95WNIkX6szUtxl6vnR6b2z2jMC3RoBW3D4hV4T33Fa9UrLJ4tdWIkv9kTO4u8EbqnUfhMqwhr3"

@app.route("/grok", methods=["POST"])
def grok():
    result = subprocess.run(["powershell", "-File", "docs/scripts/GrokOSINT.ps1"], capture_output=True, text=True)
    return jsonify({"response": result.stdout})

app.run(port=5000, debug=True)
