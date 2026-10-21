$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$installedNode = Get-Command node -ErrorAction SilentlyContinue
$runtimeNode = Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe'
if ($installedNode) { $pipelineNode = $installedNode.Source }
elseif (Test-Path -LiteralPath $runtimeNode) { $pipelineNode = $runtimeNode }
else { throw 'Install Node.js 24 or newer, then run this launcher again.' }
$version = & $pipelineNode -p 'process.versions.node.split(".")[0]'
if ([int]$version -lt 24) { throw 'DealSignal needs Node.js 24 or newer.' }
if (-not (Test-Path -LiteralPath 'node_modules\next\dist\bin\next')) { throw 'Install dependencies first: pnpm install --store-dir .cache/pnpm --node-linker hoisted --package-import-method copy --ignore-scripts' }
$env:NEXT_TELEMETRY_DISABLED = '1'
Write-Host 'DealSignal: http://127.0.0.1:3000'
Write-Host 'Keep this terminal open. Press Ctrl+C to stop.'
& $pipelineNode 'node_modules\next\dist\bin\next' dev --hostname 127.0.0.1
