<?php
// ─── HORIZON OOH — Database (PDO wrapper) ────────────────────────────────

declare(strict_types=1);

class Database
{
    private static ?PDO $instance = null;

    /**
     * Returns a singleton PDO connection.
     * Call Database::connect($cfg) before the first use.
     */
    public static function connect(array $cfg): PDO
    {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $dsn = sprintf(
            'mysql:host=%s;port=%d;dbname=%s;charset=%s',
            $cfg['host'],
            $cfg['port'],
            $cfg['name'],
            $cfg['charset']
        );

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        self::$instance = new PDO($dsn, $cfg['user'], $cfg['pass'], $options);
        return self::$instance;
    }

    public static function get(): PDO
    {
        if (self::$instance === null) {
            throw new \RuntimeException('Database not connected. Call Database::connect() first.');
        }
        return self::$instance;
    }
}
