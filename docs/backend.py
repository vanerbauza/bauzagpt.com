from flask import Flask, request, jsonify
import subprocess, os

app = Flask(__name__)
os.environ["XAI_API_KEY"] = "c0428e37-929d-4828-9f93-660f96fe3fc1"

@app.route("/grok", methods=["POST"])
def grok():
    query = request.json.get("query", "darenavelazquez01@gmail.com")
    script = '''
$apiKey = $env:XAI_API_KEY
$endpoint = "https://api.x.ai/v1/chat/completions"
$body = @{
    model = "grok-3"
    messages = @(
        @{ role = "system"; content = "Eres OSINT ético MX. Solo datos públicos." }
        @{ role = "user";   content = "Analiza: {0}. Genera 3 dorks + pasos legales." }
    )
    max_tokens = 400
} | ConvertTo-Json -Depth 4
$headers = @{ "Authorization" = "Bearer $apiKey"; "Content-Type" = "application/json" }
try {{
    $res = Invoke-RestMethod $endpoint -Method Post -Headers $headers -Body $body
    Write-Output $res.choices[0].message.content
}} catch {{ Write-Error $_.Exception.Message }}
'''.format(query)
    result = subprocess.run(["powershell", "-Command", script], capture_output=True, text=True)
    return jsonify({"response": result.stdout.strip()})

if __name__ == "__main__":
    app.run(port=5000, debug=True)
