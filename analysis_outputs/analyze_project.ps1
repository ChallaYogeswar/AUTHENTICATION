<#
analyze_project.ps1
Windows PowerShell project audit script.
Save in project root and run: .\analyze_project.ps1
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

$ProjectRoot = (Get-Location).Path
$OutDir = Join-Path $ProjectRoot "analysis_outputs"
$Report = Join-Path $ProjectRoot "PROJECT_AUDIT_REPORT.md"
$TimeStamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ssZ")

# Create dirs
New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

# Start report
@"
# Project Audit Report

Generated: $TimeStamp (UTC)

## User requirements / expected behaviour (FILL THIS IN)

_Please describe how you expect the project to behave, target platform, runtime versions, start commands, external services, and constraints._

-----
"@ | Out-File -FilePath $Report -Encoding utf8

Add-Content -Path $Report -Value "## 1) Quick environment checks`n"

$envInfo = @()
$envInfo += "Project root: $ProjectRoot"
$envInfo += "User: $env:USERNAME | Machine: $env:COMPUTERNAME"
$envInfo += "PowerShell version: $($PSVersionTable.PSVersion.ToString())"
$envInfo += "Path contains: $(($env:Path -split ';' | Select-Object -First 5) -join ';')"
$envInfo | Out-File -Append -FilePath $Report -Encoding utf8

# Helper: write tree up to depth 4 (exclude common folders)
$TreeFile = Join-Path $OutDir "tree.txt"
if (Test-Path $TreeFile) { Remove-Item $TreeFile -Force }
function Write-Tree {
    param($Path, $Depth, $Prefix)
    if ($Depth -lt 0) { return }
    try {
        $entries = Get-ChildItem -LiteralPath $Path -Force -ErrorAction Stop | Where-Object {
            $_.Name -notmatch '^(node_modules|\.git|venv|\.venv|__pycache__|analysis_outputs)$'
        } | Sort-Object -Property PSIsContainer, Name
        foreach ($e in $entries) {
            "$Prefix$($e.Name)" | Out-File -FilePath $TreeFile -Append -Encoding utf8
            if ($e.PSIsContainer) {
                Write-Tree -Path $e.FullName -Depth ($Depth - 1) -Prefix ("$Prefix`t")
            }
        }
    } catch {
        # ignore access errors
    }
}
Write-Tree -Path $ProjectRoot -Depth 4 -Prefix ""
Get-Content $TreeFile | Out-File -Append -FilePath $Report -Encoding utf8

Add-Content -Path $Report -Value "`n## 2) Detected languages & important files`n"

$pyCount = (Get-ChildItem -Recurse -Include *.py -File -ErrorAction SilentlyContinue | Measure-Object).Count
$jsCount = (Get-ChildItem -Recurse -Include *.js -File -ErrorAction SilentlyContinue | Measure-Object).Count
$tsCount = (Get-ChildItem -Recurse -Include *.ts -File -ErrorAction SilentlyContinue | Measure-Object).Count
$javaCount = (Get-ChildItem -Recurse -Include *.java -File -ErrorAction SilentlyContinue | Measure-Object).Count
$ktCount = (Get-ChildItem -Recurse -Include *.kt -File -ErrorAction SilentlyContinue | Measure-Object).Count
$androidDetected = (Test-Path "build.gradle" -or Test-Path "settings.gradle" -or Test-Path "gradlew")

@"
python files: $pyCount
javascript files: $jsCount
typescript files: $tsCount
java files: $javaCount
kotlin files: $ktCount
android gradle project detected: $androidDetected
"@ | Out-File -Append -FilePath $Report -Encoding utf8

# Dependencies snippets
Add-Content -Path $Report -Value "`n## 3) Dependency manifests (top-level)`n"
$manifests = @("package.json","requirements.txt","pyproject.toml","Pipfile","setup.py","pom.xml","build.gradle")
foreach ($m in $manifests) {
    $mPath = Join-Path $ProjectRoot $m
    if (Test-Path $mPath) {
        Add-Content -Path $Report -Value "### $m`n"
        Get-Content -Path $mPath -TotalCount 120 | Out-File -FilePath (Join-Path $OutDir ("$($m).snippet")) -Encoding utf8
        Get-Content (Join-Path $OutDir ("$($m).snippet")) | Out-File -Append -FilePath $Report -Encoding utf8
        Add-Content -Path $Report -Value "`n"
    }
}

# TODO/FIXME scan
Add-Content -Path $Report -Value "## 4) Quick grep for TODO/FIXME and likely secrets`n"
$todoFile = Join-Path $OutDir "todos.txt"
Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch 'node_modules|\.git|venv|\.venv|__pycache__|analysis_outputs'
} | ForEach-Object {
    Select-String -Path $_.FullName -Pattern "TODO|FIXME" -SimpleMatch -ErrorAction SilentlyContinue | ForEach-Object {
        "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" | Out-File -FilePath $todoFile -Append -Encoding utf8
    }
}
if (Test-Path $todoFile -and (Get-Item $todoFile).Length -gt 0) {
    Get-Content $todoFile | Out-File -Append -FilePath $Report -Encoding utf8
} else {
    Add-Content -Path $Report -Value "No TODO/FIXME found (or none matched in readable files).`n"
}

# Secret pattern scan
Add-Content -Path $Report -Value "`n## 5) Simple secret pattern scan`n"
$secretPatterns = @(
    "AWS_SECRET_ACCESS_KEY",
    "AWS_ACCESS_KEY_ID",
    "BEGIN RSA PRIVATE KEY",
    "BEGIN PRIVATE KEY",
    "ghp_[A-Za-z0-9]{36}",
    "password\s*=",
    "api_key",
    "secret_key",
    "client_secret"
)
$secretsFile = Join-Path $OutDir "secrets.txt"
if (Test-Path $secretsFile) { Remove-Item $secretsFile -Force }
Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch 'node_modules|\.git|venv|\.venv|__pycache__|analysis_outputs'
} | ForEach-Object {
    foreach ($p in $secretPatterns) {
        try {
            Select-String -Path $_.FullName -Pattern $p -AllMatches -ErrorAction SilentlyContinue | ForEach-Object {
                "$($_.Path):$($_.LineNumber): $($_.Line.Trim())" | Out-File -FilePath $secretsFile -Append -Encoding utf8
            }
        } catch {}
    }
}
if (Test-Path $secretsFile -and (Get-Item $secretsFile).Length -gt 0) {
    Add-Content -Path $Report -Value "### POSSIBLE SECRET PATTERNS (review manually!)`n"
    Get-Content $secretsFile | Out-File -Append -FilePath $Report -Encoding utf8
} else {
    Add-Content -Path $Report -Value "No obvious secret patterns matched (still review manually).`n"
}

# Language-specific static analysis
Add-Content -Path $Report -Value "`n## 6) Language-specific static analysis and tests`n"

# Python analysis
if ($pyCount -gt 0) {
    Add-Content -Path $Report -Value "`n### Python analysis`n"
    $VenvDir = Join-Path $OutDir ".analysis_venv"
    if (-not (Test-Path $VenvDir)) {
        python -m venv $VenvDir 2>$null
    }
    $Activate = Join-Path $VenvDir "Scripts\Activate.ps1"
    if (Test-Path $Activate) {
        # Activate venv in current session
        . $Activate
        python -m pip install --upgrade pip > $null 2>&1
        if (Test-Path (Join-Path $ProjectRoot "requirements.txt")) {
            python -m pip install -r requirements.txt > $OutDir\pip_install_log.txt 2>&1
        }
        python -m pip install flake8 bandit pytest mypy > $OutDir\pip_tools_install_log.txt 2>&1
        # Run tools
        & flake8 . --max-line-length=120 --exit-zero > (Join-Path $OutDir "flake8.txt") 2>&1
        try { & bandit -r . -f txt -o (Join-Path $OutDir "bandit.txt") 2>$null } catch {}
        # Run pytest if tests present
        $testDirs = Get-ChildItem -Directory -Filter "tests" -Recurse -ErrorAction SilentlyContinue
        if ($testDirs) {
            & pytest -q --maxfail=1 > (Join-Path $OutDir "pytest.txt") 2>&1
        }
        & mypy . --ignore-missing-imports > (Join-Path $OutDir "mypy.txt") 2>&1
        # Deactivate venv (in PS, remove env changes by clearing PATH modifications is not straightforward; but leaving it is OK)
    } else {
        Add-Content -Path $Report -Value "Could not create/activate python venv. Ensure 'python' is on PATH.`n"
    }

    Add-Content -Path $Report -Value "#### flake8 (sample)`n"
    if (Test-Path (Join-Path $OutDir "flake8.txt")) {
        Get-Content (Join-Path $OutDir "flake8.txt") -TotalCount 120 | Out-File -Append -FilePath $Report -Encoding utf8
    } else {
        Add-Content -Path $Report -Value "No flake8 output.`n"
    }

    Add-Content -Path $Report -Value "`n#### bandit (sample)`n"
    if (Test-Path (Join-Path $OutDir "bandit.txt")) {
        Get-Content (Join-Path $OutDir "bandit.txt") -TotalCount 120 | Out-File -Append -FilePath $Report -Encoding utf8
    } else {
        Add-Content -Path $Report -Value "No bandit output (tool may not be installed or found).`n"
    }

    if (Test-Path (Join-Path $OutDir "pytest.txt")) {
        Add-Content -Path $Report -Value "`n#### pytest output`n"
        Get-Content (Join-Path $OutDir "pytest.txt") -TotalCount 200 | Out-File -Append -FilePath $Report -Encoding utf8
    }

    Add-Content -Path $Report -Value "`n#### mypy (sample)`n"
    if (Test-Path (Join-Path $OutDir "mypy.txt")) {
        Get-Content (Join-Path $OutDir "mypy.txt") -TotalCount 120 | Out-File -Append -FilePath $Report -Encoding utf8
    } else {
        Add-Content -Path $Report -Value "No mypy output.`n"
    }
}

# Node analysis
if (Test-Path (Join-Path $ProjectRoot "package.json")) {
    Add-Content -Path $Report -Value "`n### Node / JavaScript analysis`n"
    try {
        if (Get-Command npm -ErrorAction SilentlyContinue) {
            npm ci > (Join-Path $OutDir "npm_install.txt") 2>&1
        }
    } catch {}
    # ESLint via npx
    try {
        if (Get-Command npx -ErrorAction SilentlyContinue) {
            & npx eslint . --ext .js,.ts > (Join-Path $OutDir "eslint.txt") 2>&1
        }
    } catch {}
    # npm test
    $pkg = Get-Content package.json -Raw | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($pkg -and $pkg.scripts -and $pkg.scripts.test) {
        try { npm test --silent > (Join-Path $OutDir "npm_test.txt") 2>&1 } catch {}
    }
    Add-Content -Path $Report -Value "#### ESLint (sample)`n"
    if (Test-Path (Join-Path $OutDir "eslint.txt")) {
        Get-Content (Join-Path $OutDir "eslint.txt") -TotalCount 160 | Out-File -Append -FilePath $Report -Encoding utf8
    } else {
        Add-Content -Path $Report -Value "No eslint output or eslint not configured.`n"
    }
    if (Test-Path (Join-Path $OutDir "npm_test.txt")) {
        Add-Content -Path $Report -Value "`n#### npm test output`n"
        Get-Content (Join-Path $OutDir "npm_test.txt") -TotalCount 160 | Out-File -Append -FilePath $Report -Encoding utf8
    }
}

# Java / Gradle / Maven analysis
if (Test-Path (Join-Path $ProjectRoot "pom.xml") -or Test-Path (Join-Path $ProjectRoot "build.gradle") -or Test-Path (Join-Path $ProjectRoot "gradlew")) {
    Add-Content -Path $Report -Value "`n### Java / JVM analysis`n"
    if (Test-Path (Join-Path $ProjectRoot "pom.xml")) {
        if (Get-Command mvn -ErrorAction SilentlyContinue) {
            & mvn -q -DskipTests=false test > (Join-Path $OutDir "mvn_test.txt") 2>&1
            Get-Content (Join-Path $OutDir "mvn_test.txt") -TotalCount 200 | Out-File -Append -FilePath $Report -Encoding utf8
        } else {
            Add-Content -Path $Report -Value "mvn not found on PATH; skipping maven tests.`n"
        }
    }
    if ((Test-Path (Join-Path $ProjectRoot "gradlew")) -or (Test-Path (Join-Path $ProjectRoot "build.gradle"))) {
        if (Test-Path (Join-Path $ProjectRoot "gradlew")) {
            & .\gradlew test > (Join-Path $OutDir "gradle_test.txt") 2>&1
            Get-Content (Join-Path $OutDir "gradle_test.txt") -TotalCount 200 | Out-File -Append -FilePath $Report -Encoding utf8
        } elseif (Get-Command gradle -ErrorAction SilentlyContinue) {
            & gradle test > (Join-Path $OutDir "gradle_test.txt") 2>&1
            Get-Content (Join-Path $OutDir "gradle_test.txt") -TotalCount 200 | Out-File -Append -FilePath $Report -Encoding utf8
        } else {
            Add-Content -Path $Report -Value "gradle not found on PATH; skipping gradle tests.`n"
        }
    }
}

# Smoke runs of likely entry points using jobs with timeout
Add-Content -Path $Report -Value "`n## 7) Attempt short smoke runs of likely entrypoints (20s timeout each)`n"
$smokeLog = Join-Path $OutDir "smoke_runs.txt"
if (Test-Path $smokeLog) { Remove-Item $smokeLog -Force }
$pyEntrypoints = @("SafeHome.py","app.py","main.py","manage.py")
foreach ($f in $pyEntrypoints) {
    $fPath = Join-Path $ProjectRoot $f
    if (Test-Path $fPath) {
        Add-Content -Path $smokeLog -Value "Running python entrypoint: $f (timeout 20s)`n"
        $job = Start-Job -ScriptBlock { param($p) & python $p } -ArgumentList $fPath
        $wait = Wait-Job -Job $job -Timeout 20
        if ($wait -eq $null) {
            # timeout
            Stop-Job -Job $job -ErrorAction SilentlyContinue
            Add-Content -Path $smokeLog -Value "Timed out (stopped) after 20s.`n"
            $out = Receive-Job -Job $job -Keep -ErrorAction SilentlyContinue
        } else {
            $out = Receive-Job -Job $job -ErrorAction SilentlyContinue
        }
        if ($out) { $out | Out-File -FilePath (Join-Path $OutDir "$($f).runlog") -Encoding utf8 }
        if (Test-Path (Join-Path $OutDir "$($f).runlog")) {
            Get-Content (Join-Path $OutDir "$($f).runlog") -TotalCount 200 | Out-File -Append -FilePath $smokeLog -Encoding utf8
        }
        Add-Content -Path $smokeLog -Value "----`n"
    }
}

# npm start smoke run (20s)
if (Test-Path (Join-Path $ProjectRoot "package.json")) {
    $pkg = Get-Content package.json -Raw | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($pkg -and $pkg.scripts -and $pkg.scripts.start) {
        Add-Content -Path $smokeLog -Value "Running npm start (timeout 20s)`n"
        $job = Start-Job -ScriptBlock { & npm start } 
        $wait = Wait-Job -Job $job -Timeout 20
        if ($wait -eq $null) {
            Stop-Job -Job $job -ErrorAction SilentlyContinue
            Add-Content -Path $smokeLog -Value "npm start timed out after 20s.`n"
            $out = Receive-Job -Job $job -Keep -ErrorAction SilentlyContinue
        } else {
            $out = Receive-Job -Job $job -ErrorAction SilentlyContinue
        }
        if ($out) { $out | Out-File -FilePath (Join-Path $OutDir "npm_start.log") -Encoding utf8 }
        if (Test-Path (Join-Path $OutDir "npm_start.log")) {
            Get-Content (Join-Path $OutDir "npm_start.log") -TotalCount 200 | Out-File -Append -FilePath $smokeLog -Encoding utf8
        }
        Add-Content -Path $smokeLog -Value "----`n"
    }
}

# Gradle assemble debug attempt (30s)
if (Test-Path (Join-Path $ProjectRoot "gradlew")) {
    Add-Content -Path $smokeLog -Value "Attempting short gradle assemble (timeout 30s)`n"
    $job = Start-Job -ScriptBlock { & .\gradlew assembleDebug } 
    $wait = Wait-Job -Job $job -Timeout 30
    if ($wait -eq $null) {
        Stop-Job -Job $job -ErrorAction SilentlyContinue
        Add-Content -Path $smokeLog -Value "gradlew assemble timed out after 30s.`n"
        $out = Receive-Job -Job $job -Keep -ErrorAction SilentlyContinue
    } else {
        $out = Receive-Job -Job $job -ErrorAction SilentlyContinue
    }
    if ($out) { $out | Out-File -FilePath (Join-Path $OutDir "gradle_assemble.log") -Encoding utf8 }
    if (Test-Path (Join-Path $OutDir "gradle_assemble.log")) {
        Get-Content (Join-Path $OutDir "gradle_assemble.log") -TotalCount 200 | Out-File -Append -FilePath $smokeLog -Encoding utf8
    }
    Add-Content -Path $smokeLog -Value "----`n"
}

# Append smoke logs to report
if (Test-Path $smokeLog) {
    Add-Content -Path $Report -Value "`n### Smoke run logs (first 200 lines each):`n"
    Get-Content $smokeLog -TotalCount 400 | Out-File -Append -FilePath $Report -Encoding utf8
}

# Findings summary
Add-Content -Path $Report -Value "`n## 8) Findings summary & critical issues`n"
if (Test-Path $secretsFile -and (Get-Item $secretsFile).Length -gt 0) {
    Add-Content -Path $Report -Value "- Potential hard-coded secrets found. Inspect immediately.`n"
}
if (Test-Path (Join-Path $OutDir "flake8.txt") -and (Get-Item (Join-Path $OutDir "flake8.txt")).Length -gt 0) {
    Add-Content -Path $Report -Value "- Flake8 reported issues; see analysis_outputs\flake8.txt.`n"
}
if (Test-Path (Join-Path $OutDir "bandit.txt") -and (Get-Item (Join-Path $OutDir "bandit.txt")).Length -gt 0) {
    Add-Content -Path $Report -Value "- Bandit reported security issues; see analysis_outputs\bandit.txt.`n"
}
if (Test-Path (Join-Path $OutDir "pytest.txt")) {
    $pt = Get-Content (Join-Path $OutDir "pytest.txt") -Raw
    if ($pt -match "failed|ERROR") {
        Add-Content -Path $Report -Value "- Some python tests failed or errored; see analysis_outputs\pytest.txt.`n"
    } else {
        Add-Content -Path $Report -Value "- Python tests (if present) ran (see analysis_outputs\pytest.txt).`n"
    }
}
if (Test-Path (Join-Path $OutDir "npm_test.txt")) {
    $nt = Get-Content (Join-Path $OutDir "npm_test.txt") -Raw
    if ($nt -match "failed|ERR!") {
        Add-Content -Path $Report -Value "- npm tests show failures/errors; see analysis_outputs\npm_test.txt.`n"
    } else {
        Add-Content -Path $Report -Value "- npm tests (if present) ran successfully.`n"
    }
}

Add-Content -Path $Report -Value "`n### Recommended next steps (short)`n"
$rec = @(
    "1. If secrets found, rotate them and add secrets to a secret manager. Add .gitignore rules.",
    "2. Fix critical security findings found by bandit/eslint first.",
    "3. Address failing tests; add CI to run lint + tests on PRs (GitHub Actions).",
    "4. Add README with run instructions and expected behavior (python/node/gradle start commands)."
)
$rec | Out-File -Append -FilePath $Report -Encoding utf8

Add-Content -Path $Report -Value "`n-----`nFull raw logs are in the 'analysis_outputs' directory.`n"
Add-Content -Path $Report -Value "`nScript complete. Summary:`n"
Add-Content -Path $Report -Value "Report path: $Report"
Add-Content -Path $Report -Value "Logs dir: $OutDir`n"

Write-Host "=== Analysis finished ==="
Write-Host "Report: $Report"
Write-Host "Logs: $OutDir"
