<?php
// ─── HORIZON OOH — Input Validator ───────────────────────────────────────

declare(strict_types=1);

class Validator
{
    private array $errors = [];

    // ── Core validators ────────────────────────────────────────────────────

    public function required(string $field, mixed $value): self
    {
        if ($value === null || trim((string)$value) === '') {
            $this->errors[$field] = "{$field} is required.";
        }
        return $this;
    }

    public function email(string $field, mixed $value): self
    {
        if ($value !== null && trim((string)$value) !== '') {
            if (!filter_var(trim((string)$value), FILTER_VALIDATE_EMAIL)) {
                $this->errors[$field] = "{$field} must be a valid email address.";
            }
        }
        return $this;
    }

    public function minLength(string $field, mixed $value, int $min): self
    {
        if ($value !== null && mb_strlen(trim((string)$value)) < $min) {
            $this->errors[$field] = "{$field} must be at least {$min} characters.";
        }
        return $this;
    }

    public function maxLength(string $field, mixed $value, int $max): self
    {
        if ($value !== null && mb_strlen(trim((string)$value)) > $max) {
            $this->errors[$field] = "{$field} must be no more than {$max} characters.";
        }
        return $this;
    }

    public function phone(string $field, mixed $value): self
    {
        if ($value !== null && trim((string)$value) !== '') {
            $clean = preg_replace('/[\s\-\(\)\+]/', '', (string)$value);
            if (!preg_match('/^\d{7,15}$/', $clean)) {
                $this->errors[$field] = "{$field} must be a valid phone number.";
            }
        }
        return $this;
    }

    // ── Result ─────────────────────────────────────────────────────────────

    public function fails(): bool
    {
        return !empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }

    // ── Sanitise a raw string ──────────────────────────────────────────────

    public static function sanitize(mixed $value): string
    {
        return htmlspecialchars(strip_tags(trim((string)$value)), ENT_QUOTES, 'UTF-8');
    }
}
