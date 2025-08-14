<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        // Ambil pengaturan target
        try {
            $stmt = $pdo->prepare("SELECT setting_value FROM settings WHERE setting_key = 'target_amount'");
            $stmt->execute();
            $result = $stmt->fetch();
            
            $target = $result ? $result['setting_value'] : '50000000';
            
            echo json_encode([
                'success' => true,
                'target' => floatval($target)
            ]);
        } catch(PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching target: ' . $e->getMessage()
            ]);
        }
        break;
        
    case 'POST':
        // Update target tabungan
        if (!$input || !isset($input['target'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Target amount required'
            ]);
            break;
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES ('target_amount', ?) ON DUPLICATE KEY UPDATE setting_value = ?");
            $stmt->execute([$input['target'], $input['target']]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Target updated successfully'
            ]);
        } catch(PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error updating target: ' . $e->getMessage()
            ]);
        }
        break;
        
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
        break;
}
?>
