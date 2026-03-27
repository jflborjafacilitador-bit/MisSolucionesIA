Add-Type -AssemblyName System.Drawing
$imgPath = "public\icons\icon-512.png"
$img = [System.Drawing.Image]::FromFile((Resolve-Path $imgPath).Path)
$bmp = new-object System.Drawing.Bitmap($img)
$colors = @{}
for($x=0; $x -lt $bmp.Width; $x+=5){
    for($y=0; $y -lt $bmp.Height; $y+=5){
        $c = $bmp.GetPixel($x,$y)
        $brightness = (0.299 * $c.R + 0.587 * $c.G + 0.114 * $c.B)
        if ($c.A -gt 50 -and $brightness -gt 40 -and $brightness -lt 250) { 
            $r = [int]([Math]::Round($c.R / 10.0) * 10)
            $g = [int]([Math]::Round($c.G / 10.0) * 10)
            $b = [int]([Math]::Round($c.B / 10.0) * 10)
            if ($r -gt 255) { $r = 255 }
            if ($g -gt 255) { $g = 255 }
            if ($b -gt 255) { $b = 255 }
            $hex = "#{0:X2}{1:X2}{2:X2}" -f $r, $g, $b
            if (-not $colors.ContainsKey($hex)) {
                $colors[$hex] = 0
            }
            $colors[$hex]++
        }
    }
}
$img.Dispose()
$bmp.Dispose()
$colors.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 15 | Format-Table -AutoSize
