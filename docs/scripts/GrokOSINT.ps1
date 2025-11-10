# docs/scripts/GrokOSINT.ps1
# Grok API para OSINT ÉTICO - bauzagpt.com

$apiKey = $env:XAI_API_KEY
if (-not $apiKey) { Write-Error "Falta XAI_API_KEY"; exit 1 }

$body = @{
    model = "grok-3"
    messages = @(
        @{ role = "system"; content = "Eres experto OSINT ético en México. Solo datos públicos." }
        @{ role = "user";   content = "Analiza: darenavelazquez01@gmail.com. Da 3 dorks + pasos legales." }
    )
    max_tokens = 600
} | ConvertTo-Json -Depth 4

$headers = @{ "Authorization" = "Bearer $apiKey"; "Content-Type" = "application/json" }

try {
    $res = Invoke-RestMethod "https://api.x.ai/v1/chat/completions" -Method Post -Headers $headers -Body $body
    Write-Host "`nGROK:" -ForegroundColor Green
    Write-Host $res.choices[0].message.content -ForegroundColor Cyan
} catch { Write-Error $_.Exception.Message }
