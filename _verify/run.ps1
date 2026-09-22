# 归舟·1955 渲染取证：批量截图各交互终态。
# 需要可访问命名管道的权限（无头 Edge 的 mojo IPC）。
# 用法：powershell -NoProfile -ExecutionPolicy Bypass -File .\_verify\run.ps1
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
Write-Host "浏览器：$edge" -ForegroundColor Cyan

function To-FileUrl([string]$p){
  return (New-Object System.Uri((Resolve-Path -LiteralPath $p).Path)).AbsoluteUri
}

# 装订脚本：只做 DOM 状态切换，不滚动（虚拟时间下滚动截图不可靠，改用 CSS 分区隔离）
$setups = [ordered]@{
  'none'     = "/* 不改变状态 */"
  'tl'       = "var it=document.querySelectorAll('.tl-item'); it[5].classList.add('open'); it[10].classList.add('open');"
  'roles'    = "var c=document.querySelectorAll('.role-card'); c[0].classList.add('open'); c[5].classList.add('open');"
  'veil'     = "var v=document.querySelector('.role-card--veil'); v.classList.add('open');"
  'veilSolo' = "var v=document.querySelector('.role-card--veil'); v.classList.add('open'); Array.prototype.forEach.call(document.querySelectorAll('.role-card'), function(c){ if(c!==v) c.style.display='none'; }); Array.prototype.forEach.call(document.querySelectorAll('.role-grid'), function(g){ g.style.gridTemplateColumns='minmax(0,420px)'; });"
  'dark'     = "document.getElementById('tab-dark').click();"
  'heroMove' = "var st=document.getElementById('heroStage'); if(st){ st.style.setProperty('--lx','28px'); st.style.setProperty('--ly','-18px'); }"
}

$cases = @(
  @{ name='01-hero';         setup='heroMove'; only='';          size='1600,1000' },
  @{ name='02-about';        setup='none';     only='about';     size='1600,1150' },
  @{ name='03-timeline';     setup='tl';       only='timeline';  size='1600,1250' },
  @{ name='04-roles';        setup='roles';    only='roles';     size='1600,1250' },
  @{ name='05-villain';      setup='veilSolo'; only='roles';     size='1500,760'  },
  @{ name='06-endings';      setup='none';     only='endings';   size='1600,900'  },
  @{ name='07-endings-dark'; setup='dark';     only='endings';   size='1600,900'  },
  @{ name='08-highlights';   setup='none';     only='highlights';size='1600,1050' },
  @{ name='09-quotes';       setup='none';     only='quotes';    size='1600,1050' },
  @{ name='10-showcase';     setup='none';     only='showcase';  size='1600,1150' },
  @{ name='11-mobile-hero';  setup='none';     only='';          size='420,880'   },
  @{ name='12-mobile-tl';    setup='tl';       only='timeline';  size='420,900'   }
)

foreach ($k in $setups.Keys) {
  Set-Content -LiteralPath (Join-Path $out "setup-$k.js") -Value $setups[$k] -Encoding UTF8
}

$i = 0
foreach ($c in $cases) {
  $i++
  $page = Join-Path $out ("page-" + $c.name + ".html")
  if ($c.only) {
    node (Join-Path $vdir 'mkpage.js') (Join-Path $out ("setup-" + $c.setup + ".js")) $page $c.only | Out-Null
  } else {
    node (Join-Path $vdir 'mkpage.js') (Join-Path $out ("setup-" + $c.setup + ".js")) $page | Out-Null
  }
  $png = Join-Path $out ($c.name + ".png")
  if (Test-Path $png) { Remove-Item $png -Force }
  & $edge --headless=new --disable-gpu --no-sandbox --hide-scrollbars `
          --window-size=$($c.size) --virtual-time-budget=12000 `
          --screenshot="$png" (To-FileUrl $page) 2>$null | Out-Null
  if (Test-Path $png) {
    Write-Host ("[{0}/{1}] {2,-18} {3,6} KB" -f $i,$cases.Count,$c.name,[math]::Round((Get-Item $png).Length/1KB)) -ForegroundColor Green
  } else {
    Write-Host ("[{0}/{1}] {2,-18} FAILED" -f $i,$cases.Count,$c.name) -ForegroundColor Red
  }
}

Write-Host "`n分区截图完成。" -ForegroundColor Cyan

# ---- 整页长图（超高视口一次拍完，用于看整体节奏） ----
foreach ($fp in @(
  @{ name='00-fullpage-desktop'; size='1440,13800' },
  @{ name='00-fullpage-mobile';  size='520,21000'  }
)) {
  $page = Join-Path $out ($fp.name + '.html')
  node (Join-Path $vdir 'mkpage.js') '-' $page | Out-Null
  $png = Join-Path $out ($fp.name + '.png')
  if (Test-Path $png) { Remove-Item $png -Force }
  & $edge --headless=new --disable-gpu --no-sandbox --hide-scrollbars `
          --window-size=$($fp.size) --virtual-time-budget=16000 `
          --screenshot="$png" (To-FileUrl $page) 2>$null | Out-Null
  if (Test-Path $png) {
    Write-Host ("整页长图 {0,-20} {1,7} KB" -f $fp.name,[math]::Round((Get-Item $png).Length/1KB)) -ForegroundColor Green
  } else {
    Write-Host ("整页长图 {0,-20} FAILED" -f $fp.name) -ForegroundColor Red
  }
}

Write-Host "`n产物在 $out" -ForegroundColor Cyan
