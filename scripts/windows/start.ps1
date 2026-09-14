# 羽排 Windows 一鍵啟動。由 repo 根目錄的「一鍵啟動.bat」呼叫。
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
try {
  chcp 65001 | Out-Null
} catch {}

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $Root

function Write-Banner {
  Write-Host ""
  Write-Host "  羽排 YUPAI" -ForegroundColor Green
  Write-Host "  Windows 一鍵啟動（同一區網的平板 / 手機可連進來）"
  Write-Host ""
}

function Refresh-Path {
  $machine = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $user = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machine;$user"
}

function Get-NodeMajor {
  try {
    $raw = (& node -v 2>$null)
    if (-not $raw) { return $null }
    if ($raw -match "v?(\d+)") { return [int]$Matches[1] }
    return $null
  } catch {
    return $null
  }
}

function Install-NodeJs {
  Write-Host "  找不到 Node.js，正在用 Windows 套件管理員安裝 LTS…" -ForegroundColor Yellow
  if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Start-Process "https://nodejs.org/en/download"
    throw "這台電腦沒有 winget。已打開 Node 官網，請安裝 22 版後再雙擊一次「一鍵啟動」。"
  }
  & winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
  Refresh-Path
  $major = Get-NodeMajor
  if ($null -eq $major) {
    throw "Node 裝完了，但這個視窗還看不到。請關掉視窗，再雙擊一次「一鍵啟動」。"
  }
}

function Get-LanIPv4 {
  $ips = @()
  try {
    $ips = @(
      Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object {
          $_.IPAddress -notlike "127.*" -and
          $_.IPAddress -notlike "169.254.*" -and
          $_.PrefixOrigin -ne "WellKnown"
        } |
        Select-Object -ExpandProperty IPAddress
    )
  } catch {}
  if ($ips.Count -eq 0) {
    $cfg = ipconfig 2>$null | Out-String
    foreach ($m in [regex]::Matches($cfg, "IPv4[\s\S]*?:\s*(\d+\.\d+\.\d+\.\d+)")) {
      $ip = $m.Groups[1].Value
      if ($ip -notlike "127.*" -and $ip -notlike "169.254.*") { $ips += $ip }
    }
  }
  return $ips | Select-Object -Unique
}

function Test-PortOpen([int]$Port) {
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $iar = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
    $ok = $iar.AsyncWaitHandle.WaitOne(200, $false)
    if ($ok -and $client.Connected) {
      $client.EndConnect($iar)
      $client.Close()
      return $true
    }
    $client.Close()
    return $false
  } catch {
    return $false
  }
}

Write-Banner

$nodeMajor = Get-NodeMajor
if ($null -eq $nodeMajor) {
  Install-NodeJs
  $nodeMajor = Get-NodeMajor
}
if ($nodeMajor -lt 20) {
  throw "目前 Node 是 v$nodeMajor，羽排需要 20 以上（建議 22）。請升級後再開一次。"
}
Write-Host ("  Node {0}" -f (& node -v))

if (-not (Test-Path (Join-Path $Root "package.json"))) {
  throw "找不到 package.json。請確認解壓後是整個專案資料夾，再點裡面的「一鍵啟動.bat」。"
}

Write-Host "  安裝套件（第一次會久一點，之後很快）…"
& npm install --no-fund --no-audit
if ($LASTEXITCODE -ne 0) { throw "npm install 失敗。" }

$dataDir = Join-Path $Root "data"
New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
$env:YUPAI_DATA_DIR = $dataDir
Write-Host "  場次資料會存在：$dataDir"

$lan = @(Get-LanIPv4)
Write-Host ""
Write-Host "  這台電腦（團主看板）:  http://127.0.0.1:8080"
if ($lan.Count -gt 0) {
  foreach ($ip in $lan) {
    Write-Host ("  同一 Wi-Fi 的手機 / 平板:  http://{0}:8080" -f $ip)
  }
} else {
  Write-Host "  找不到區網 IP。手機請連同一 Wi-Fi，再問這台電腦的 IPv4。"
}
Write-Host "  若手機連不上，Windows 防火牆請允許 Node 的 8080 連接埠。"
Write-Host "  關掉這個視窗就會停止看板。"
Write-Host ""

if (Test-PortOpen 8080) {
  Write-Host "  8080 已經有服務在跑，直接打開瀏覽器。" -ForegroundColor Yellow
  Start-Process "http://127.0.0.1:8080/"
  Write-Host "  按任意鍵結束（不會關掉已經在跑的看板）。"
  [void][System.Console]::ReadKey($true)
  exit 0
}

$opener = Start-Process -FilePath "powershell.exe" -WindowStyle Hidden -PassThru -ArgumentList @(
  "-NoProfile",
  "-Command",
  "Start-Sleep -Seconds 8; Start-Process 'http://127.0.0.1:8080/'"
)

try {
  & npm run dev
} finally {
  if ($opener -and -not $opener.HasExited) {
    Stop-Process -Id $opener.Id -Force -ErrorAction SilentlyContinue
  }
}
