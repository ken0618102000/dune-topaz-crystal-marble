# 羽排 Windows 一鍵啟動。由 repo 根目錄的「一鍵啟動.bat」呼叫。
# 給現場非工程師：套件沒變就不安裝、伺服器真的起來才開瀏覽器、場次放在使用者資料夾。
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
try {
  chcp 65001 | Out-Null
} catch {}

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $Root
$global:YupaiServerPid = $null

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

function Invoke-Native {
  param([scriptblock]$Command)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    & $Command
    return $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $prev
  }
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
  $code = Invoke-Native {
    & winget install --id OpenJS.NodeJS.LTS -e --silent --source winget --accept-package-agreements --accept-source-agreements
  }
  if ($code -ne 0) {
    $code = Invoke-Native {
      & winget install --id OpenJS.NodeJS.LTS -e --silent --accept-package-agreements --accept-source-agreements
    }
  }
  if ($code -ne 0) {
    throw "Node 安裝失敗。請到 https://nodejs.org 安裝 22 版後再雙擊一次。"
  }
  Refresh-Path
  $major = Get-NodeMajor
  if ($null -eq $major) {
    throw "Node 裝完了，但這個視窗還看不到。請關掉視窗，再雙擊一次「一鍵啟動」。"
  }
}

function Get-LanIPv4 {
  try {
    $route = Get-NetRoute -DestinationPrefix "0.0.0.0/0" -ErrorAction SilentlyContinue |
      Sort-Object RouteMetric |
      Select-Object -First 1
    if ($route) {
      $ip = Get-NetIPAddress -InterfaceIndex $route.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue |
        Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
        Select-Object -First 1 -ExpandProperty IPAddress
      if ($ip) { return @($ip) }
    }
  } catch {}

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
  return @($ips | Select-Object -Unique)
}

function Test-PortOpen([int]$Port) {
  $client = $null
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $iar = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
    $ok = $iar.AsyncWaitHandle.WaitOne(400, $false)
    if ($ok -and $client.Connected) {
      $client.EndConnect($iar)
      return $true
    }
    return $false
  } catch {
    return $false
  } finally {
    if ($client) { $client.Close() }
  }
}

function Test-IsYupai([int]$Port) {
  try {
    $resp = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/" -TimeoutSec 3 -UseBasicParsing
    return ($resp.Content -match "羽排|YUPAI")
  } catch {
    return $false
  }
}

function Get-ListenPids([int]$Port) {
  $found = @()
  try {
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $conns) {
      if ($conn.OwningProcess -and $conn.OwningProcess -gt 4) { $found += [int]$conn.OwningProcess }
    }
  } catch {}
  if ($found.Count -eq 0) {
    $lines = & netstat.exe -ano -p tcp | Select-String (":{0}\s" -f $Port)
    foreach ($line in $lines) {
      if ($line.Line -match "LISTENING\s+(\d+)\s*$") {
        $procId = [int]$Matches[1]
        if ($procId -gt 4) { $found += $procId }
      }
    }
  }
  return @($found | Select-Object -Unique)
}

function Stop-PortOwner([int]$Port) {
  foreach ($procId in (Get-ListenPids $Port)) {
    Invoke-Native { & taskkill.exe /T /F /PID $procId } | Out-Null
  }
}

function Stop-ServerTree {
  if ($global:YupaiServerPid) {
    Invoke-Native { & taskkill.exe /T /F /PID $global:YupaiServerPid } | Out-Null
    $global:YupaiServerPid = $null
  }
}

function Ensure-Dependencies {
  $lock = Join-Path $Root "package-lock.json"
  if (-not (Test-Path $lock)) {
    throw "找不到 package-lock.json。請重新下載完整專案。"
  }
  $stamp = Join-Path $Root "node_modules\.yupai-lock-hash"
  $hash = (Get-FileHash $lock -Algorithm SHA256).Hash
  $saved = ""
  if (Test-Path $stamp) { $saved = (Get-Content $stamp -Raw).Trim() }
  if ((Test-Path (Join-Path $Root "node_modules")) -and $saved -eq $hash) {
    Write-Host "  套件沒變，略過安裝。"
    return
  }
  Write-Host "  安裝套件（第一次或程式更新後會久一點）…"
  $code = Invoke-Native { & npm ci --no-fund --no-audit --prefer-offline }
  if ($code -ne 0) {
    Write-Host "  離線安裝失敗，改連線再試一次…" -ForegroundColor Yellow
    $code = Invoke-Native { & npm ci --no-fund --no-audit }
  }
  if ($code -ne 0) { throw "npm ci 失敗。請接上網路後再開一次。" }
  New-Item -ItemType Directory -Force -Path (Join-Path $Root "node_modules") | Out-Null
  Set-Content -Path $stamp -Value $hash -Encoding ascii
}

function Initialize-DataDir([bool]$Migrate) {
  $store = Join-Path $env:LOCALAPPDATA "yupai"
  $dataDir = Join-Path $store "data"
  $backupDir = Join-Path $store "backups"
  New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
  New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

  $legacy = Join-Path $Root "data"
  $destEmpty = -not (Get-ChildItem $dataDir -Force -ErrorAction SilentlyContinue)
  $legacyItems = @()
  if (Test-Path $legacy) {
    $legacyItems = @(Get-ChildItem $legacy -Force -ErrorAction SilentlyContinue)
  }
  if ($Migrate -and $legacyItems.Count -gt 0 -and $destEmpty) {
    Write-Host "  把專案裡的舊場次搬到使用者資料夾…"
    foreach ($item in $legacyItems) {
      Move-Item -LiteralPath $item.FullName -Destination $dataDir -Force
    }
  } elseif ($legacyItems.Count -gt 0 -and $destEmpty) {
    Write-Host "  現有看板還在用專案裡的 data\。要改存到使用者資料夾，請選重新啟動。" -ForegroundColor Yellow
  } elseif ($legacyItems.Count -gt 0) {
    Write-Host "  專案裡還有舊的 data\，沒有覆蓋。現在用的是：$dataDir" -ForegroundColor Yellow
  }

  if ($Migrate) {
    $hasData = Get-ChildItem $dataDir -Force -ErrorAction SilentlyContinue
    if ($hasData) {
      try {
        $zip = Join-Path $backupDir ((Get-Date -Format "yyyyMMdd-HHmm") + ".zip")
        Compress-Archive -Path (Join-Path $dataDir "*") -DestinationPath $zip -Force
        Get-ChildItem $backupDir -Filter "*.zip" |
          Sort-Object LastWriteTime -Descending |
          Select-Object -Skip 7 |
          Remove-Item -Force -ErrorAction SilentlyContinue
      } catch {
        Write-Host "  這次沒做成備份，看板仍會啟動。" -ForegroundColor Yellow
      }
    }
  }
  return $dataDir
}

function Write-NetworkHints([int]$Port) {
  try {
    $profiles = @(Get-NetConnectionProfile -ErrorAction SilentlyContinue)
    foreach ($profile in $profiles) {
      if ($profile.NetworkCategory -eq "Public") {
        Write-Host "  網卡是「公用網路」，手機常常連不進來。請到 Windows 設定改成私人網路。" -ForegroundColor Yellow
        break
      }
    }
  } catch {}

  $isAdmin = $false
  try {
    $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
      [Security.Principal.WindowsBuiltInRole]::Administrator
    )
  } catch {}
  $rule = $null
  try { $rule = Get-NetFirewallRule -DisplayName "YUPAI" -ErrorAction SilentlyContinue } catch {}
  if (-not $rule) {
    if ($isAdmin) {
      Invoke-Native {
        & netsh.exe advfirewall firewall add rule name=YUPAI dir=in action=allow protocol=TCP localport=$Port
      } | Out-Null
      Write-Host "  已允許防火牆放行連接埠 $Port。"
    } else {
      Write-Host "  若 Windows 跳出「允許存取」，請按允許。手機才連得到。"
    }
  }
}

function Resolve-ListenPort {
  $port = 8080
  if ($env:YUPAI_PORT -match "^\d+$") { $port = [int]$env:YUPAI_PORT }
  if (-not (Test-PortOpen $port)) { return @{ Port = $port; Reuse = $false } }

  if (Test-IsYupai $port) {
    Write-Host ""
    Write-Host "  連接埠 $port 已經有羽排在跑。" -ForegroundColor Yellow
    Write-Host "  直接按 Enter = 打開現有看板（進行中的場次不會中斷）"
    Write-Host "  輸入 R 再按 Enter = 關掉舊的並重新啟動"
    $answer = Read-Host "  請選擇"
    if ($answer -match "^[Rr]$") {
      Stop-PortOwner $port
      Start-Sleep -Seconds 1
      return @{ Port = $port; Reuse = $false }
    }
    return @{ Port = $port; Reuse = $true }
  }

  Write-Host "  連接埠 $port 被其他程式佔用，改找下一個空的。" -ForegroundColor Yellow
  $next = $port + 1
  $last = $port + 5
  for ($candidate = $next; $candidate -le $last; $candidate++) {
    if (-not (Test-PortOpen $candidate)) { return @{ Port = $candidate; Reuse = $false } }
  }
  throw "連接埠 $port 到 $last 都被佔用。請關掉佔用的程式，或設定 YUPAI_PORT 再試。"
}

function Show-Urls([int]$Port) {
  $lan = @(Get-LanIPv4)
  Write-Host ""
  Write-Host ("  這台電腦（團主看板）:  http://127.0.0.1:{0}" -f $Port)
  if ($lan.Count -gt 0 -and $lan[0]) {
    Write-Host ("  同一 Wi-Fi 的手機 / 平板:  http://{0}:{1}" -f $lan[0], $Port)
  } else {
    Write-Host "  找不到區網 IP。手機請連同一 Wi-Fi，再看這台電腦的 IPv4。"
  }
  Write-Host "  關掉這個視窗就會停止看板。"
  Write-Host ""
}

function Wait-AndOpen([int]$Port, $Proc) {
  for ($i = 0; $i -lt 120; $i++) {
    if ($Proc.HasExited) {
      throw "看板程式已結束（代碼 $($Proc.ExitCode)）。請看上面的紅字。"
    }
    if (Test-PortOpen $Port) {
      Start-Process ("http://127.0.0.1:{0}/" -f $Port)
      return
    }
    Start-Sleep -Seconds 1
  }
  Write-Host "  等了兩分鐘還沒開好。視窗先留著，看上面有沒有錯誤。" -ForegroundColor Yellow
}

Write-Banner

$nodeMajor = Get-NodeMajor
if ($null -eq $nodeMajor) {
  Install-NodeJs
  $nodeMajor = Get-NodeMajor
}
if ($nodeMajor -lt 22) {
  throw "目前 Node 是 v$nodeMajor，羽排需要 22 以上。請到 https://nodejs.org 安裝後再開一次。"
}
Write-Host ("  Node {0}" -f (& node -v))

if (-not (Test-Path (Join-Path $Root "package.json"))) {
  throw "找不到 package.json。請確認解壓後是整個專案資料夾，再點裡面的「一鍵啟動.bat」。"
}

Ensure-Dependencies
$choice = Resolve-ListenPort
$dataDir = Initialize-DataDir (-not $choice.Reuse)
$env:YUPAI_DATA_DIR = $dataDir
$env:PORT = "$port"
Write-Host "  場次資料：$dataDir"
Write-Host "  備份：$env:LOCALAPPDATA\yupai\backups （保留最近 7 份）"
$port = [int]$choice.Port
Write-NetworkHints $port
Show-Urls $port

if ($choice.Reuse) {
  Start-Process ("http://127.0.0.1:{0}/" -f $port)
  Write-Host "  按任意鍵結束（不會關掉已經在跑的看板）。"
  [void][System.Console]::ReadKey($true)
  exit 0
}

$proc = Start-Process -FilePath "cmd.exe" -ArgumentList @("/c", "npm run dev") -WorkingDirectory $Root -PassThru -NoNewWindow
$global:YupaiServerPid = $proc.Id

try {
  Wait-AndOpen $port $proc
  Wait-Process -Id $proc.Id
} finally {
  Stop-ServerTree
}
