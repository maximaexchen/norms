<?php
error_reporting(E_ERROR | E_PARSE);

if (!defined('DOCROOT')) {
    define('DOCROOT', __DIR__ . '/');
}
define('TEMPDIR', 'D:\\Temp');
define('PROGRAM_GHOSTSCRIPT', 'D:\\web_software\\gs\\bin\\gswin64c.exe');
define('PROGRAM_PDFTK', 'C:\\web_software\\PDFtk\\bin\\pdftk.exe');
define('PROGRAM_IMAGEMAGICK_CONVERT', 'C:\\web_software\\ImageMagick\\convert.exe');
define('PROGRAM_IMAGEMAGICK_IDENTIFY', 'C:\\web_software\\ImageMagick\\identify.exe');

$file = normenWatermark($_FILES['file']['tmp_name'], '1', 'WATERMARK', 26);

$fsize = filesize($file);

function normenMeasurePDF($file)
{
    $pages = array();
    $tmpfolder = TEMPDIR.'\\'.time().'_'.str_pad(rand(1, 1000), 4, '0', STR_PAD_LEFT);

    if (is_file($file)) {
        if (!is_dir($tmpfolder)) {
            mkdir($tmpfolder);
        }
        if (is_dir($tmpfolder)) {
            $f = pathinfo($file);
            copy($file, $tmpfolder.'\\'.$f['basename']);
            if (is_file($tmpfolder.'\\'.$f['basename'])) {
                $file = $tmpfolder.'\\'.$f['basename'];
                chdir($tmpfolder);

                $cmd = PROGRAM_PDFTK.' "'.$file.'" burst output ./pg_%04d.pdf 2> fail.txt';
                shell_exec($cmd);

                $files = array();
                if ($dh = opendir($tmpfolder)) {
                    while (($file = readdir($dh)) !== false) {
                        if (is_file($file) && substr($file, 0, 3) == 'pg_') {
                            $files[] = $file;
                        }
                    }
                }
                closedir($dh);

                if (is_array($files) && count($files)) {
                    sort($files);
                    foreach ($files as $f) {
                        $_f = realpath($tmpfolder.'/'.$f);
                        $cmd_identify = PROGRAM_IMAGEMAGICK_IDENTIFY.' -define pdf:size=64x64 "'.$_f.'"';
                        $output_identify = shell_exec($cmd_identify);
                        preg_match('/ ([\d]{1,5})x([\d]{1,5}) /', $output_identify, $pagesizematches);
                        $width = (float)$pagesizematches[1];
                        $height = (float)$pagesizematches[2];

                        $pages[] = array('width' => $width, 'height' => $height);
                    }
                }
            }
        }
    }

    return $pages;
}

function normenWatermark($file, $id, $text, $fontScale = 26)
{
    $pages = normenMeasurePDF($file);

    if (is_array($pages) && count($pages))
    {
        include_once(DOCROOT.'/3rdparty/tcpdf_6_2_8/tcpdf.php');

        class MYPDF extends TCPDF
        {
            function Header()
            {
            }

            function Footer()
            {
            }
        }

        $pdf = new MYPDF('', 'mm');
        $pdf->SetPrintHeader(false);
        $pdf->SetPrintFooter(false);
        $pdf->SetAutoPageBreak(false);

        $ppt = 0.352777778;
        $page = 1;

        foreach ($pages as $pageinfo)
        {
            $orientation = $pageinfo['height'] >= $pageinfo['width'] ? 'P' : 'L';
            $pdf->AddPage($orientation, array($pageinfo['width'] * $ppt, $pageinfo['height'] * $ppt));

            $fontSize = $pageinfo['width'] / $fontScale;
            $pdf->SetFont("helvetica", "B", (int)$fontSize);

            $breite = $pdf->GetStringWidth($text);
            $hoehe = $pdf->GetStringHeight($breite, $text);

            $position = array(
                'x' => $pageinfo['width'] / 2 * $ppt - $breite / 2,
                'y' => $pageinfo['height'] / 2 * $ppt - $hoehe / 2,
            );

            $pdf->SetAlpha(0.20);
            $pdf->SetTextColor(255, 0, 0);
            $pdf->Text($position['x'], $position['y'], $text);
            $pdf->SetAlpha(1.0);

            $page++;
        }

        $tmp_filename = TEMPDIR.'\\normen_watermark_'.$id.'.pdf';

        $pdf->Output($tmp_filename, 'F');

        if (is_file($tmp_filename))
        {
            $tmp_filename2 = TEMPDIR.'\\normen_watermark_'.$id.'_stamped.pdf';

            $run = PROGRAM_PDFTK." \"".$file."\" multistamp \"".$tmp_filename."\" output \"".$tmp_filename2."\" dont_ask";

            shell_exec($run);

            if (is_file($tmp_filename2))
            {
                $file = $tmp_filename2;

                return $file;
            }
        }
    }

    return $file;
}
// Quick check to verify that the file exists
if( !file_exists($file) ) die("File not found");

// Force the download
header("Pragma: no-cache");
header("Content-type: application/pdf", true);
//header("Accept-Ranges: bytes");
header("Content-Disposition: attachment; filename=norm.pdf");
//header("Content-Length: " . filesize($file));
//header("Content-Type: application/octet-stream;");
ob_clean();   // discard any data in the output buffer (if possible)
flush();      // flush headers (if pos
readfile($file);
