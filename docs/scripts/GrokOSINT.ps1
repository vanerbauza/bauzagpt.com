# docs/scripts/GrokOSINT.ps1
# Grok API para OSINT ÉTICO - bauzagpt.com

$apiKey = $env:XAI_API_KEY
if (-not $apiKey) { Write-Error "Falta XAI_API_KEY"; exit 1 }

$endpoint = "https://api.x.ai/v1/chat/completions"
$body = @{
    model = "grok-3"
    messages = @(
        @{ role = "system"; content = "Eres experto OSINT ético en México. Solo datos públicos." }
        @{ role = "user";   content = "Analiza: darenavelazquez01@gmail.com. Genera 3 Google Dorks éticos + próximos pasos." }
    )
    max_tokens = 400
    temperature = 0.7
} | ConvertTo-Json -Depth 4

$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type"  = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri $endpoint -Method Post -Headers $headers -Body $body -TimeoutSec 30
    Write-Host "`nGROK RESPUESTA:" -ForegroundColor Green
    Write-Host $response.choices[0].message.content -ForegroundColor Cyan
    Write-Host "`nTokens usados: $($response.usage.total_tokens)" -ForegroundColor Yellow
} catch {
    Write-Error "ERROR API: $($_.Exception.Message)"
}
