<?php
require_once '../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        // Ambil semua transaksi
        try {
            $stmt = $pdo->query("SELECT * FROM transactions ORDER BY transaction_date DESC, created_at DESC");
            $transactions = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $transactions
            ]);
        } catch(PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error fetching transactions: ' . $e->getMessage()
            ]);
        }
        break;
        
    case 'POST':
        // Tambah transaksi baru
        if (!$input || !isset($input['type']) || !isset($input['amount']) || !isset($input['description'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Missing required fields'
            ]);
            break;
        }
        
        try {
            $stmt = $pdo->prepare("INSERT INTO transactions (type, amount, description, transaction_date) VALUES (?, ?, ?, ?)");
            $date = isset($input['date']) ? $input['date'] : date('Y-m-d');
            
            $stmt->execute([
                $input['type'],
                $input['amount'],
                $input['description'],
                $date
            ]);
            
            $id = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Transaction added successfully',
                'id' => $id
            ]);
        } catch(PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error adding transaction: ' . $e->getMessage()
            ]);
        }
        break;
        
    case 'DELETE':
        // Hapus transaksi
        if (!isset($_GET['id'])) {
            echo json_encode([
                'success' => false,
                'message' => 'Transaction ID required'
            ]);
            break;
        }
        
        try {
            $stmt = $pdo->prepare("DELETE FROM transactions WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Transaction deleted successfully'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'Transaction not found'
                ]);
            }
        } catch(PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error deleting transaction: ' . $e->getMessage()
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
