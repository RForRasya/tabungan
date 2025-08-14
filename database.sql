-- Database: rasya_citra_savings
-- Kompatibel dengan phpMyAdmin

-- Menambahkan charset dan collation untuk kompatibilitas phpMyAdmin
CREATE DATABASE IF NOT EXISTS rasya_citra_savings 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE rasya_citra_savings;

-- Menambahkan DROP TABLE IF EXISTS untuk menghindari error "Table already exists"
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS settings;

-- Memperbaiki struktur tabel transactions dengan charset yang tepat
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('income', 'expense') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_date (transaction_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Memperbaiki tabel settings dengan ENGINE dan charset
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(50) NOT NULL,
    setting_value VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_setting (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default target
INSERT INTO settings (setting_key, setting_value) VALUES ('target_amount', '50000000');

-- Contoh data untuk testing
INSERT INTO transactions (type, amount, description, transaction_date) VALUES
('income', 5000000, 'Gaji Rasya', '2024-01-01'),
('income', 3000000, 'Gaji Citra', '2024-01-01'),
('expense', 500000, 'Belanja bulanan', '2024-01-02'),
('expense', 200000, 'Makan di restoran', '2024-01-03');
