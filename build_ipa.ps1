$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$tempDir = "D:\Bhagavad gita as it is\Gita_website\temp_ipa"
$payload = Join-Path $tempDir "Payload\Runner.app"

if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $payload -Force | Out-Null

Copy-Item "D:\Bhagavad gita as it is\ios\Runner\Info.plist" -Destination $payload
Copy-Item "D:\Bhagavad gita as it is\assets\images\app_logo.png" -Destination (Join-Path $payload "AppIcon.png")
Copy-Item "D:\Bhagavad gita as it is\assets\data\gita_full.json" -Destination $payload

$zipPath = "D:\Bhagavad gita as it is\Gita_website\public\downloads\bhagavad-gita-as-it-is.zip"
$ipaPath = "D:\Bhagavad gita as it is\Gita_website\public\downloads\bhagavad-gita-as-it-is.ipa"

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
if (Test-Path $ipaPath) { Remove-Item $ipaPath -Force }

Compress-Archive -Path (Join-Path $tempDir "Payload") -DestinationPath $zipPath -Force
Rename-Item $zipPath "bhagavad-gita-as-it-is.ipa"

Remove-Item $tempDir -Recurse -Force
Write-Host "SUCCESS: Created IPA at $ipaPath with size $((Get-Item $ipaPath).Length) bytes"
