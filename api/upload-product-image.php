<?php
// Abilita logging degli errori
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', 'upload_errors.log');

// Forza output JSON anche in caso di errori
function sendJsonResponse($data, $httpCode = 200) {
    http_response_code($httpCode);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    echo json_encode($data);
    exit();
}

// Gestione errori personalizzata per restituire sempre JSON
function handleError($message, $httpCode = 500) {
    error_log("ERROR: " . $message);
    sendJsonResponse(['success' => false, 'message' => $message], $httpCode);
}

// Set error handler
set_error_handler(function($severity, $message, $file, $line) {
    handleError("PHP Error: $message in $file:$line");
});

// Set exception handler
set_exception_handler(function($exception) {
    handleError("PHP Exception: " . $exception->getMessage());
});

// Log della richiesta
error_log("=== UPLOAD REQUEST START ===");
error_log("Method: " . $_SERVER['REQUEST_METHOD']);
error_log("URI: " . $_SERVER['REQUEST_URI']);
error_log("Headers: " . json_encode(getallheaders()));


// Gestisci richieste OPTIONS per CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    error_log("OPTIONS request handled");
    sendJsonResponse(['message' => 'CORS preflight handled']);
}

// Verifica che sia una richiesta POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log("Invalid method: " . $_SERVER['REQUEST_METHOD']);
    handleError('Metodo non consentito', 405);
}

error_log("POST request processing...");

// Configurazione
$uploadDir = '../assets/img/products/';
$maxFileSize = 5 * 1024 * 1024; // 5MB
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
$allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

error_log("Upload directory: " . $uploadDir);
error_log("Max file size: " . $maxFileSize);

// Verifica che la cartella di destinazione esista
if (!is_dir($uploadDir)) {
    error_log("Creating upload directory: " . $uploadDir);
    if (!mkdir($uploadDir, 0755, true)) {
        error_log("Failed to create upload directory");
        handleError('Impossibile creare la cartella di destinazione');
    }
}

// Log dei dati POST e FILES
error_log("POST data: " . json_encode($_POST));
error_log("FILES data: " . json_encode($_FILES));

// Verifica che sia stato caricato un file
if (!isset($_FILES['productImage']) || $_FILES['productImage']['error'] !== UPLOAD_ERR_OK) {
    $errorMessage = 'Errore nel caricamento del file';
    
    if (isset($_FILES['productImage']['error'])) {
        error_log("Upload error code: " . $_FILES['productImage']['error']);
        switch ($_FILES['productImage']['error']) {
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                $errorMessage = 'File troppo grande';
                break;
            case UPLOAD_ERR_PARTIAL:
                $errorMessage = 'Caricamento parziale del file';
                break;
            case UPLOAD_ERR_NO_FILE:
                $errorMessage = 'Nessun file selezionato';
                break;
            case UPLOAD_ERR_NO_TMP_DIR:
                $errorMessage = 'Cartella temporanea mancante';
                break;
            case UPLOAD_ERR_CANT_WRITE:
                $errorMessage = 'Impossibile scrivere il file';
                break;
        }
    } else {
        error_log("No productImage in FILES array");
    }
    
    error_log("Upload error: " . $errorMessage);
    handleError($errorMessage);
}

$file = $_FILES['productImage'];
error_log("File info - Name: " . $file['name'] . ", Size: " . $file['size'] . ", Type: " . $file['type']);

// Verifica dimensione file
if ($file['size'] > $maxFileSize) {
    error_log("File too large: " . $file['size'] . " > " . $maxFileSize);
    handleError('File troppo grande. Massimo 5MB consentiti');
}

// Verifica tipo MIME
if (!in_array($file['type'], $allowedTypes)) {
    error_log("Invalid MIME type: " . $file['type']);
    handleError('Tipo di file non consentito. Usa JPG, PNG, GIF o WebP');
}

// Ottieni informazioni sul file
$fileInfo = pathinfo($file['name']);
$extension = strtolower($fileInfo['extension']);
error_log("File extension: " . $extension);

// Verifica estensione
if (!in_array($extension, $allowedExtensions)) {
    error_log("Invalid extension: " . $extension);
    handleError('Estensione file non consentita');
}

// Genera nome file sicuro
$productId = isset($_POST['productId']) ? preg_replace('/[^a-z0-9\-_]/', '', strtolower($_POST['productId'])) : '';
if (empty($productId)) {
    error_log("Missing or invalid productId");
    handleError('ID prodotto mancante o non valido');
}

$fileName = $productId . '.' . $extension;
$filePath = $uploadDir . $fileName;
error_log("Target file path: " . $filePath);

// Verifica che il file sia realmente un'immagine
$imageInfo = getimagesize($file['tmp_name']);
if ($imageInfo === false) {
    error_log("File is not a valid image");
    handleError('Il file non è un\'immagine valida');
}

error_log("Image info: " . json_encode($imageInfo));

// Sposta il file nella cartella di destinazione
if (move_uploaded_file($file['tmp_name'], $filePath)) {
    error_log("File moved successfully to: " . $filePath);
    
    // Ottimizza l'immagine se necessario
    $optimized = optimizeImage($filePath, $imageInfo[2]);
    error_log("Image optimization result: " . ($optimized ? 'true' : 'false'));
    
    $response = [
        'success' => true, 
        'message' => 'Immagine caricata con successo',
        'fileName' => $fileName,
        'filePath' => '../assets/img/products/' . $fileName,
        'optimized' => $optimized
    ];
    
    error_log("Success response: " . json_encode($response));
    sendJsonResponse($response);
} else {
    error_log("Failed to move uploaded file from " . $file['tmp_name'] . " to " . $filePath);
    handleError('Errore nel salvataggio del file');
}

error_log("=== UPLOAD REQUEST END ===");

/**
 * Ottimizza l'immagine riducendo la qualità se necessario
 */
function optimizeImage($filePath, $imageType) {
    $maxWidth = 800;
    $maxHeight = 600;
    $quality = 85;
    
    try {
        error_log("Starting image optimization for: " . $filePath);
        
        // Ottieni dimensioni originali
        list($width, $height) = getimagesize($filePath);
        error_log("Original dimensions: {$width}x{$height}");
        
        // Se l'immagine è già piccola, non fare nulla
        if ($width <= $maxWidth && $height <= $maxHeight) {
            error_log("Image already small enough, no optimization needed");
            return false;
        }
        
        // Calcola nuove dimensioni mantenendo le proporzioni
        $ratio = min($maxWidth / $width, $maxHeight / $height);
        $newWidth = intval($width * $ratio);
        $newHeight = intval($height * $ratio);
        error_log("New dimensions: {$newWidth}x{$newHeight}");
        
        // Crea immagine di origine
        switch ($imageType) {
            case IMAGETYPE_JPEG:
                $source = imagecreatefromjpeg($filePath);
                break;
            case IMAGETYPE_PNG:
                $source = imagecreatefrompng($filePath);
                break;
            case IMAGETYPE_GIF:
                $source = imagecreatefromgif($filePath);
                break;
            default:
                error_log("Unsupported image type for optimization: " . $imageType);
                return false;
        }
        
        if (!$source) {
            error_log("Failed to create source image");
            return false;
        }
        
        // Crea immagine di destinazione
        $destination = imagecreatetruecolor($newWidth, $newHeight);
        
        // Mantieni trasparenza per PNG e GIF
        if ($imageType == IMAGETYPE_PNG || $imageType == IMAGETYPE_GIF) {
            imagealphablending($destination, false);
            imagesavealpha($destination, true);
            $transparent = imagecolorallocatealpha($destination, 255, 255, 255, 127);
            imagefilledrectangle($destination, 0, 0, $newWidth, $newHeight, $transparent);
        }
        
        // Ridimensiona
        imagecopyresampled($destination, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
        
        // Salva immagine ottimizzata
        $saveResult = false;
        switch ($imageType) {
            case IMAGETYPE_JPEG:
                $saveResult = imagejpeg($destination, $filePath, $quality);
                break;
            case IMAGETYPE_PNG:
                $saveResult = imagepng($destination, $filePath, 9);
                break;
            case IMAGETYPE_GIF:
                $saveResult = imagegif($destination, $filePath);
                break;
        }
        
        // Pulisci memoria
        imagedestroy($source);
        imagedestroy($destination);
        
        error_log("Image optimization completed, save result: " . ($saveResult ? 'true' : 'false'));
        return $saveResult;
        
    } catch (Exception $e) {
        error_log('Errore ottimizzazione immagine: ' . $e->getMessage());
        return false;
    }
}
?>