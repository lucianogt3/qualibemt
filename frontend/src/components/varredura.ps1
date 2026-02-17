# varredura.ps1 - Script de varredura do projeto QUALI-BENT

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   VARREDURA DO PROJETO QUALI-BENT    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Define o diretório raiz (onde o script está)
$rootDir = Get-Location

# Função para listar arquivos de forma amigável
function List-Files {
    param (
        [string]$Path,
        [int]$Level = 0
    )
    $items = Get-ChildItem -Path $Path
    $indent = "  " * $Level
    foreach ($item in $items) {
        if ($item.PSIsContainer) {
            Write-Host "$indent📁 $($item.Name)" -ForegroundColor Yellow
            List-Files -Path $item.FullName -Level ($Level + 1)
        } else {
            Write-Host "$indent📄 $($item.Name)" -ForegroundColor Gray
        }
    }
}

# Exibe a árvore do projeto
Write-Host "📂 ESTRUTURA DO PROJETO" -ForegroundColor Green
List-Files -Path $rootDir -Level 0
Write-Host ""

# Contagem de arquivos por extensão
Write-Host "📊 CONTAGEM POR TIPO DE ARQUIVO" -ForegroundColor Green
$files = Get-ChildItem -Path $rootDir -Recurse -File
$groups = $files | Group-Object Extension | Sort-Object Count -Descending
$groups | ForEach-Object {
    $ext = if ($_.Name) { $_.Name } else { "(sem extensão)" }
    Write-Host ("{0,-10} : {1} arquivo(s)" -f $ext, $_.Count)
}
Write-Host ("Total de arquivos: {0}" -f $files.Count) -ForegroundColor Yellow
Write-Host ""

# Verificação de TODOs e FIXMEs
Write-Host "🔍 VERIFICANDO COMENTÁRIOS PENDENTES (TODO/FIXME)" -ForegroundColor Green
$todoFiles = Get-ChildItem -Path $rootDir -Recurse -Include *.js, *.jsx, *.ts, *.tsx, *.py, *.html, *.css
$foundTodos = $false
foreach ($file in $todoFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "TODO|FIXME") {
        Write-Host "⚠️  $($file.FullName.Replace($rootDir.Path, ''))" -ForegroundColor Magenta
        $foundTodos = $true
    }
}
if (-not $foundTodos) {
    Write-Host "✅ Nenhum TODO ou FIXME encontrado!" -ForegroundColor Green
}
Write-Host ""

# Tamanho total do projeto
Write-Host "📦 TAMANHO TOTAL DO PROJETO" -ForegroundColor Green
$totalSize = ($files | Measure-Object -Property Length -Sum).Sum
if ($totalSize -gt 1GB) {
    $sizeStr = "{0:N2} GB" -f ($totalSize / 1GB)
} elseif ($totalSize -gt 1MB) {
    $sizeStr = "{0:N2} MB" -f ($totalSize / 1MB)
} else {
    $sizeStr = "{0:N2} KB" -f ($totalSize / 1KB)
}
Write-Host "O projeto ocupa aproximadamente $sizeStr" -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   VARREDURA CONCLUÍDA   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan