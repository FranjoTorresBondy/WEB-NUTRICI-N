$port = if ($env:CLAUDE_PREVIEW_PORT) { $env:CLAUDE_PREVIEW_PORT } else { 8080 }
# Serve from Documents (parent of project) so ../FOTOS WEB VARIADAS/ paths resolve
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Serving $root on http://localhost:$port/"
while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    $localPath = [System.Uri]::UnescapeDataString($req.Url.LocalPath)
    $relPath = $localPath.TrimStart('/').Replace('/', '\')
    if ($relPath -eq '') { $relPath = 'WEB NUTRICION Y ENTRENAMIENTO\index.html' }
    $file = Join-Path $root $relPath
    if (Test-Path $file -PathType Leaf) {
        $ext = [System.IO.Path]::GetExtension($file).ToLower()
        $mime = switch ($ext) {
            '.html' { 'text/html; charset=utf-8' }
            '.css'  { 'text/css' }
            '.js'   { 'application/javascript' }
            '.png'  { 'image/png' }
            '.jpg'  { 'image/jpeg' }
            '.jpeg' { 'image/jpeg' }
            '.svg'  { 'image/svg+xml' }
            '.ico'  { 'image/x-icon' }
            default { 'application/octet-stream' }
        }
        $bytes = [System.IO.File]::ReadAllBytes($file)
        $res.ContentType = $mime
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $res.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $relPath")
        $res.ContentLength64 = $msg.Length
        $res.OutputStream.Write($msg, 0, $msg.Length)
    }
    $res.Close()
}
