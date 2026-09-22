# Выпуск новой версии: bump версии, сборка APK, коммит, релиз на GitHub с APK.
# Использование: powershell -File tools/release.ps1 1.4 "Что нового"
param([string]$Version, [string]$Notes = "Обновление")
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"; $env:ANDROID_HOME = "C:\Android\sdk"
$gradle = "android\app\build.gradle"
$g = [IO.File]::ReadAllText($gradle)
$code = [int][regex]::Match($g, 'versionCode (\d+)').Groups[1].Value + 1
$g = $g -replace 'versionCode \d+', "versionCode $code" -replace 'versionName "[^"]+"', "versionName `"$Version`""
[IO.File]::WriteAllText($gradle, $g, (New-Object Text.UTF8Encoding $false))
$v = [IO.File]::ReadAllText("www\js\version.js") -replace "version: '[^']+'", "version: '$Version'"
[IO.File]::WriteAllText("www\js\version.js", $v, (New-Object Text.UTF8Encoding $false))
npx cap sync android | Out-Null
Set-Location android; .\gradlew.bat assembleRelease --no-daemon -q; Set-Location $root
Copy-Item android\app\build\outputs\apk\release\app-release.apk "Чмогейм.apk" -Force
Copy-Item android\app\build\outputs\apk\release\app-release.apk "chmogame-$Version.apk" -Force
git add -A; git commit -m "v$Version - $Notes" | Out-Null
git push
& "C:\Program Files\GitHub CLI\gh.exe" release create "v$Version" "chmogame-$Version.apk" --title "Чмогейм v$Version" --notes $Notes
Remove-Item "chmogame-$Version.apk"
Write-Host "Готово: v$Version опубликована"
