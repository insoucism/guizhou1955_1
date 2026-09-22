# 首屏版式终态截图：关掉过渡/动画后拍，用于核对垂直节奏。
# 用法：powershell -NoProfile -ExecutionPolicy Bypass -File .\_verify\shot-hero.ps1
$ErrorActionPreference = 'Continue'
$vdir = $PSScriptRoot
$out  = Join-Path $vdir 'out'
New-Item -ItemType Directory -Force $out | Out-Null

$edge = @(
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw "未找到 Edge / Chrome" }

$page = Join-Path $out 'hero-settled.html'
node (Join-Path $vdir 'mksettled.js') $page | Out-Null
$uri = (New-Object System.Uri((Resolve-Path -LiteralPath $page).Path)).AbsoluteUri

$sizes = @(
  @{ name='hero-1566x903';  size='1600,1000' },   # 常规桌面
  @{ name='hero-1406x763';  size='1440,860'  },   # 外接屏 1080p 缩放
  @{ name='hero-1280x723';  size='1314,820'  },   # 分屏宽窗
  @{ name='hero-1082x603';  size='1116,700'  },   # 用户反馈的矮宽屏
  @{ name='hero-1082x523';  size='1116,620'  },   # 更矮
  @{ name='hero-1180x1000'; size='1214,1097' },   # 窄而高（平板竖屏附近）
  @{ name='hero-518x803';   size='552,900'   }    # 手机
)
foreach ($s in $sizes) {
  $png = Join-Path $out ($s.name + '.png')
  if (Test-Path $png) { Remove-Item $png -Force }
  & $edge --headless=new --disable-gpu --no-sandbox --hide-scrollbars `
          --window-size=$($s.size) --virtual-time-budget=10000 `
          --screenshot="$png" $uri 2>$null | Out-Null
  if (Test-Path $png) {
    Write-Host ("{0,-16} {1,6} KB" -f $s.name, [math]::Round((Get-Item $png).Length/1KB)) -ForegroundColor Green
  } else {
    Write-Host ("{0,-16} FAILED" -f $s.name) -ForegroundColor Red
  }
}
