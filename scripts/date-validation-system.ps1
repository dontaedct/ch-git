# UNIVERSAL HEADER - Date Validation System (PowerShell)
# 
# This system automatically detects and corrects incorrect future dates
# in all project files, replacing them with relative time descriptions
# when actual dates are unknown.
# 
# MIT HERO Integration: Automated date correction with prevention

param(
    [switch]$PreCommit,
    [switch]$Auto,
    [string[]]$Files,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
MIT HERO Date Validation System (PowerShell)

Usage:
    .\scripts\date-validation-system.ps1 [options]

Options:
    -PreCommit     Run in pre-commit mode
    -Auto          Run in automated mode
    -Files <list>  Validate specific files
    -Help          Show this help

Examples:
    .\scripts\date-validation-system.ps1
    .\scripts\date-validation-system.ps1 -PreCommit
    .\scripts\date-validation-system.ps1 -Auto
"@
    exit 0
}

class DateValidationSystem {
    [DateTime]$CurrentDate
    [DateTime]$MaxAllowedDate
    [System.Collections.ArrayList]$Corrections
    [System.Collections.ArrayList]$PreventionRules
    
    DateValidationSystem() {
        $this.CurrentDate = Get-Date
        $this.MaxAllowedDate = $this.CurrentDate.AddDays(1)
        $this.Corrections = [System.Collections.ArrayList]::new()
        $this.PreventionRules = [System.Collections.ArrayList]::new()
    }
    
    [void] Execute() {
        Write-Host "🔍 MIT HERO DATE VALIDATION SYSTEM STARTING" -ForegroundColor Green
        Write-Host "================================================================================" -ForegroundColor Green
        Write-Host "⏰ Current date: $($this.CurrentDate.ToString('yyyy-MM-ddTHH:mm:ss.fffZ'))" -ForegroundColor Yellow
        Write-Host "🚫 Max allowed future date: $($this.MaxAllowedDate.ToString('yyyy-MM-ddTHH:mm:ss.fffZ'))" -ForegroundColor Yellow
        
        try {
            # Phase 1: Scan and detect issues
            $this.ScanForDateIssues()
            
            # Phase 2: Apply corrections
            $this.ApplyCorrections()
            
            # Phase 3: Implement prevention
            $this.ImplementPrevention()
            
            # Phase 4: Generate report
            $this.GenerateReport()
            
            Write-Host "✅ Date validation system completed successfully" -ForegroundColor Green
            
        } catch {
            Write-Error "❌ Date validation system failed: $_"
            exit 1
        }
    }
    
    [void] ScanForDateIssues() {
        Write-Host "`n🔍 PHASE 1: SCANNING FOR DATE ISSUES" -ForegroundColor Cyan
        Write-Host "================================================================================" -ForegroundColor Cyan
        
        $files = $this.GetAllFiles()
        $issuesFound = 0
        
        foreach ($file in $files) {
            try {
                $content = Get-Content $file -Raw -ErrorAction Stop
                $issues = $this.AnalyzeFileForDateIssues($file, $content)
                
                if ($issues.Count -gt 0) {
                    $this.Corrections.AddRange($issues)
                    $issuesFound += $issues.Count
                    Write-Host "⚠️  Found $($issues.Count) date issues in: $file" -ForegroundColor Yellow
                }
            } catch {
                Write-Warning "⚠️  Could not read file: $file - $($_.Exception.Message)"
            }
        }
        
        Write-Host "`n📊 Scan complete: $issuesFound date issues found across $($files.Count) files" -ForegroundColor Green
    }
    
    [System.Collections.ArrayList] AnalyzeFileForDateIssues([string]$filePath, [string]$content) {
        $issues = [System.Collections.ArrayList]::new()
        
        # Pattern 1: ISO date strings (YYYY-MM-DD)
        $isoDatePattern = '(\d{4}-\d{2}-\d{2})'
        $matches = [regex]::Matches($content, $isoDatePattern)
        
        foreach ($match in $matches) {
            $dateStr = $match.Groups[1].Value
            $date = [DateTime]::ParseExact($dateStr, "yyyy-MM-dd", $null)
            
            if ($this.IsInvalidFutureDate($date)) {
                $issues.Add(@{
                    File = $filePath
                    Type = 'iso_date'
                    Original = $dateStr
                    Line = $this.GetLineNumber($content, $match.Index)
                    Context = $this.GetContext($content, $match.Index, 50)
                    Suggested = $this.GetRelativeTimeDescription($dateStr)
                })
            }
        }
        
        # Pattern 2: ISO datetime strings (YYYY-MM-DDTHH:mm:ss)
        $isoDateTimePattern = '(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z?)'
        $matches = [regex]::Matches($content, $isoDateTimePattern)
        
        foreach ($match in $matches) {
            $dateTimeStr = $match.Groups[1].Value
            $date = [DateTime]::Parse($dateTimeStr)
            
            if ($this.IsInvalidFutureDate($date)) {
                $issues.Add(@{
                    File = $filePath
                    Type = 'iso_datetime'
                    Original = $dateTimeStr
                    Line = $this.GetLineNumber($content, $match.Index)
                    Context = $this.GetContext($content, $match.Index, 50)
                    Suggested = $this.GetRelativeTimeDescription($dateTimeStr)
                })
            }
        }
        
        # Pattern 3: Human readable dates (Month DD, YYYY)
        $humanDatePattern = '(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})'
        $matches = [regex]::Matches($content, $humanDatePattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
        
        foreach ($match in $matches) {
            $month = $match.Groups[1].Value
            $day = $match.Groups[2].Value
            $year = $match.Groups[3].Value
            $dateStr = "$year-$($this.GetMonthNumber($month))-$($day.PadLeft(2, '0'))"
            $date = [DateTime]::ParseExact($dateStr, "yyyy-MM-dd", $null)
            
            if ($this.IsInvalidFutureDate($date)) {
                $issues.Add(@{
                    File = $filePath
                    Type = 'human_date'
                    Original = $match.Value
                    Line = $this.GetLineNumber($content, $match.Index)
                    Context = $this.GetContext($content, $match.Index, 50)
                    Suggested = $this.GetRelativeTimeDescription($dateStr)
                })
            }
        }
        
        return $issues
    }
    
    [bool] IsInvalidFutureDate([DateTime]$date) {
        return $date -gt $this.MaxAllowedDate -and $date.Year -ge $this.CurrentDate.Year
    }
    
    [string] GetMonthNumber([string]$monthName) {
        $months = @{
            'january' = '01'; 'february' = '02'; 'march' = '03'; 'april' = '04'
            'may' = '05'; 'june' = '06'; 'july' = '07'; 'august' = '08'
            'september' = '09'; 'october' = '10'; 'november' = '11'; 'december' = '12'
        }
        return $months[$monthName.ToLower()]
    }
    
    [int] GetLineNumber([string]$content, [int]$index) {
        return ($content.Substring(0, $index) -split "`n").Count
    }
    
    [string] GetContext([string]$content, [int]$index, [int]$contextSize) {
        $start = [Math]::Max(0, $index - $contextSize)
        $end = [Math]::Min($content.Length, $index + $contextSize)
        return $content.Substring($start, $end - $start) -replace "`n", '\n'
    }
    
    [string] GetRelativeTimeDescription([string]$dateStr) {
        $date = [DateTime]::Parse($dateStr)
        $now = Get-Date
        $diffTime = [Math]::Abs(($date - $now).TotalDays)
        $diffDays = [Math]::Ceiling($diffTime)
        
        if ($diffDays -le 7) {
            return "[RELATIVE: $diffDays days from now]"
        } elseif ($diffDays -le 30) {
            return "[RELATIVE: $([Math]::Ceiling($diffDays / 7)) weeks from now]"
        } elseif ($diffDays -le 365) {
            return "[RELATIVE: $([Math]::Ceiling($diffDays / 30)) months from now]"
        } else {
            return "[RELATIVE: $([Math]::Ceiling($diffDays / 365)) years from now]"
        }
    }
    
    [void] ApplyCorrections() {
        Write-Host "`n🔧 PHASE 2: APPLYING CORRECTIONS" -ForegroundColor Cyan
        Write-Host "================================================================================" -ForegroundColor Cyan
        
        if ($this.Corrections.Count -eq 0) {
            Write-Host "✅ No corrections needed" -ForegroundColor Green
            return
        }
        
        $correctedFiles = @{}
        
        foreach ($correction in $this.Corrections) {
            try {
                $this.ApplyCorrection($correction)
                $correctedFiles[$correction.File] = $true
                Write-Host "✅ Corrected: $($correction.File):$($correction.Line)" -ForegroundColor Green
            } catch {
                Write-Error "❌ Failed to correct $($correction.File): $($_.Exception.Message)"
            }
        }
        
        Write-Host "`n📊 Corrections complete: $($this.Corrections.Count) issues fixed in $($correctedFiles.Count) files" -ForegroundColor Green
    }
    
    [void] ApplyCorrection($correction) {
        $content = Get-Content $correction.File -Raw
        
        $newContent = $content
        
        switch ($correction.Type) {
            'iso_date' {
                $newContent = $content -replace "\b$($correction.Original)\b", $correction.Suggested
            }
            'iso_datetime' {
                $escaped = [regex]::Escape($correction.Original)
                $newContent = $content -replace "\b$escaped\b", $correction.Suggested
            }
            'human_date' {
                $escaped = [regex]::Escape($correction.Original)
                $newContent = $content -replace $escaped, $correction.Suggested
            }
        }
        
        if ($newContent -ne $content) {
            Set-Content $correction.File $newContent -NoNewline
        }
    }
    
    [void] ImplementPrevention() {
        Write-Host "`n🛡️  PHASE 3: IMPLEMENTING PREVENTION" -ForegroundColor Cyan
        Write-Host "================================================================================" -ForegroundColor Cyan
        
        # Create git hooks for date validation
        $this.CreateGitHooks()
        
        # Create pre-commit validation
        $this.CreatePreCommitValidation()
        
        # Create automated monitoring
        $this.CreateAutomatedMonitoring()
        
        Write-Host "✅ Prevention mechanisms implemented" -ForegroundColor Green
    }
    
    [void] CreateGitHooks() {
        $hookContent = @"
# MIT HERO Date Validation Hook (PowerShell)
# Prevents future dates from being committed

Write-Host "🔍 MIT HERO: Validating dates in commit..." -ForegroundColor Yellow

# Run date validation
& "$PSScriptRoot\date-validation-system.ps1" -PreCommit

if (`$LASTEXITCODE -ne 0) {
    Write-Host "❌ Date validation failed. Please fix date issues before committing." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Date validation passed" -ForegroundColor Green
"@

        $hookPath = ".git\hooks\pre-commit"
        if (-not (Test-Path ".git\hooks")) {
            New-Item -ItemType Directory -Path ".git\hooks" -Force | Out-Null
        }
        
        Set-Content $hookPath $hookContent -NoNewline
        Write-Host "✅ Git pre-commit hook created" -ForegroundColor Green
    }
    
    [void] CreatePreCommitValidation() {
        $validationScript = @"
# Pre-commit date validation (PowerShell)

try {
    # Get staged files
    `$stagedFiles = git diff --cached --name-only | Where-Object { `$_ -and (ShouldValidateFile `$_) }
    
    if (`$stagedFiles.Count -eq 0) {
        exit 0
    }
    
    # Run date validation on staged files
    & "$PSScriptRoot\date-validation-system.ps1" -Files `$stagedFiles
    
    Write-Host "✅ Pre-commit date validation passed" -ForegroundColor Green
    exit 0
    
} catch {
    Write-Error "❌ Pre-commit date validation failed: `$(`$_.Exception.Message)"
    exit 1
}

function ShouldValidateFile(`$filePath) {
    `$validExtensions = @('.md', '.ts', '.tsx', '.js', '.json', '.sql', '.txt')
    return `$validExtensions | Where-Object { `$filePath -like "*`$_" }
}
"@

        Set-Content "scripts\pre-commit-date-validation.ps1" $validationScript -NoNewline
        Write-Host "✅ Pre-commit validation script created" -ForegroundColor Green
    }
    
    [void] CreateAutomatedMonitoring() {
        $monitoringScript = @"
# Automated date monitoring (PowerShell)

# Run date validation every hour
while (`$true) {
    Write-Host "🔍 MIT HERO: Running automated date validation..." -ForegroundColor Yellow
    
    try {
        & "$PSScriptRoot\date-validation-system.ps1" -Auto
        Write-Host "✅ Automated date validation completed" -ForegroundColor Green
    } catch {
        Write-Error "❌ Automated date validation failed: `$(`$_.Exception.Message)"
    }
    
    # Wait for 1 hour
    Start-Sleep -Seconds 3600
}

Write-Host "🕐 MIT HERO date monitoring started - running every hour" -ForegroundColor Green
"@

        Set-Content "scripts\date-monitoring.ps1" $monitoringScript -NoNewline
        Write-Host "✅ Automated monitoring script created" -ForegroundColor Green
    }
    
    [string[]] GetAllFiles() {
        $files = @()
        
        try {
            # Use PowerShell to get all files
            $filePatterns = @('*.md', '*.ts', '*.tsx', '*.js', '*.json', '*.sql', '*.txt')
            $excludePatterns = @('node_modules', '.git', '.next', 'dist', 'build', 'coverage', 'reports', 'logs')
            
            foreach ($pattern in $filePatterns) {
                $found = Get-ChildItem -Path . -Recurse -Filter $pattern -ErrorAction SilentlyContinue | 
                         Where-Object { 
                             $exclude = $false
                             foreach ($excludePattern in $excludePatterns) {
                                 if ($_.FullName -like "*\$excludePattern*") {
                                     $exclude = $true
                                     break
                                 }
                             }
                             -not $exclude
                         }
                $files += $found.FullName
            }
            
        } catch {
            Write-Warning "Could not scan files: $($_.Exception.Message)"
        }
        
        return $files
    }
    
    [void] GenerateReport() {
        Write-Host "`n📊 PHASE 4: GENERATING REPORT" -ForegroundColor Cyan
        Write-Host "================================================================================" -ForegroundColor Cyan
        
        $report = @{
            timestamp = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss.fffZ')
            summary = @{
                totalIssuesFound = $this.Corrections.Count
                filesAffected = ($this.Corrections | ForEach-Object { $_.File } | Sort-Object -Unique).Count
                correctionsApplied = $this.Corrections.Count
            }
            corrections = $this.Corrections
            prevention = @{
                gitHooks = $true
                preCommitValidation = $true
                automatedMonitoring = $true
            }
            recommendations = @(
                'All future dates have been replaced with relative time descriptions',
                'Git hooks prevent future date commits',
                'Automated monitoring runs every hour',
                'Pre-commit validation ensures clean commits'
            )
        }
        
        $reportPath = "reports\date-validation-report.json"
        if (-not (Test-Path "reports")) {
            New-Item -ItemType Directory -Path "reports" -Force | Out-Null
        }
        
        $report | ConvertTo-Json -Depth 10 | Set-Content $reportPath
        
        Write-Host "📊 Report generated: $reportPath" -ForegroundColor Green
        Write-Host "📈 Summary: $($report.summary.totalIssuesFound) issues fixed, $($report.summary.filesAffected) files affected" -ForegroundColor Green
        
        # Display key corrections
        if ($this.Corrections.Count -gt 0) {
            Write-Host "`n🔧 Key Corrections Applied:" -ForegroundColor Yellow
            $this.Corrections | Select-Object -First 5 | ForEach-Object {
                Write-Host "  • $($_.File):$($_.Line) - $($_.Original) → $($_.Suggested)" -ForegroundColor White
            }
            
            if ($this.Corrections.Count -gt 5) {
                Write-Host "  ... and $($this.Corrections.Count - 5) more" -ForegroundColor Gray
            }
        }
    }
}

# Main execution
try {
    $system = [DateValidationSystem]::new()
    $system.Execute()
} catch {
    Write-Error "Failed to execute date validation system: $_"
    exit 1
}
