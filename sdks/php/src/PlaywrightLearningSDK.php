<?php

namespace PlaywrightLearning\SDK;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

/**
 * Playwright & Selenium Learning Platform API SDK for PHP
 */
class PlaywrightLearningSDK
{
    private Client $client;
    private int $maxRetries;

    /**
     * Initialize the SDK
     *
     * @param string|null $apiKey Your API key
     * @param string|null $accessToken Your OAuth access token
     * @param string $baseUrl Base URL for the API
     * @param int $timeout Request timeout in seconds
     * @param int $maxRetries Maximum number of retries
     */
    public function __construct(
        ?string $apiKey = null,
        ?string $accessToken = null,
        string $baseUrl = 'https://api.playwright-learning.com/v1',
        int $timeout = 30,
        int $maxRetries = 3
    ) {
        if (!$apiKey && !$accessToken) {
            throw new \InvalidArgumentException('Either apiKey or accessToken is required');
        }

        $this->maxRetries = $maxRetries;

        $this->client = new Client([
            'base_uri' => rtrim($baseUrl, '/') . '/',
            'timeout' => $timeout,
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . ($apiKey ?? $accessToken),
            ],
        ]);
    }

    /**
     * Make an API request with retry logic
     */
    private function request(
        string $method,
        string $endpoint,
        ?array $data = null,
        ?array $params = null,
        int $retries = 0
    ): array {
        try {
            $options = [];
            if ($data !== null) {
                $options['json'] = $data;
            }
            if ($params !== null) {
                $options['query'] = $params;
            }

            $response = $this->client->request($method, ltrim($endpoint, '/'), $options);
            return json_decode($response->getBody()->getContents(), true);
        } catch (RequestException $e) {
            if ($retries < $this->maxRetries) {
                sleep(1 * ($retries + 1)); // Exponential backoff
                return $this->request($method, $endpoint, $data, $params, $retries + 1);
            }
            throw new \Exception('API request failed: ' . $e->getMessage());
        }
    }

    // User methods
    public function getCurrentUser(): array
    {
        return $this->request('GET', '/users/me');
    }

    public function updateCurrentUser(array $data): array
    {
        return $this->request('PATCH', '/users/me', $data);
    }

    public function getUserById(string $userId): array
    {
        return $this->request('GET', "/users/{$userId}");
    }

    // API Key methods
    public function createApiKey(array $data): array
    {
        return $this->request('POST', '/api-keys', $data);
    }

    public function listApiKeys(): array
    {
        return $this->request('GET', '/api-keys');
    }

    public function getApiKey(string $keyId): array
    {
        return $this->request('GET', "/api-keys/{$keyId}");
    }

    public function updateApiKey(string $keyId, array $data): array
    {
        return $this->request('PATCH', "/api-keys/{$keyId}", $data);
    }

    public function revokeApiKey(string $keyId): array
    {
        return $this->request('DELETE', "/api-keys/{$keyId}");
    }

    public function rotateApiKey(string $keyId): array
    {
        return $this->request('POST', "/api-keys/{$keyId}/rotate");
    }

    public function getApiKeyUsage(string $keyId): array
    {
        return $this->request('GET', "/api-keys/{$keyId}/usage");
    }

    // Webhook methods
    public function createWebhook(array $data): array
    {
        return $this->request('POST', '/webhooks', $data);
    }

    public function listWebhooks(): array
    {
        return $this->request('GET', '/webhooks');
    }

    public function getWebhook(string $webhookId): array
    {
        return $this->request('GET', "/webhooks/{$webhookId}");
    }

    public function updateWebhook(string $webhookId, array $data): array
    {
        return $this->request('PATCH', "/webhooks/{$webhookId}", $data);
    }

    public function deleteWebhook(string $webhookId): array
    {
        return $this->request('DELETE', "/webhooks/{$webhookId}");
    }

    public function testWebhook(string $webhookId): array
    {
        return $this->request('POST', "/webhooks/{$webhookId}/test");
    }

    public function listWebhookEvents(
        string $webhookId,
        ?string $status = null,
        int $page = 1,
        int $limit = 50
    ): array {
        $params = ['page' => $page, 'limit' => $limit];
        if ($status !== null) {
            $params['status'] = $status;
        }
        return $this->request('GET', "/webhooks/{$webhookId}/events", null, $params);
    }

    public function getWebhookStats(string $webhookId): array
    {
        return $this->request('GET', "/webhooks/{$webhookId}/stats");
    }

    // OAuth methods
    public function createOAuthClient(array $data): array
    {
        return $this->request('POST', '/oauth/clients', $data);
    }

    public function listOAuthClients(): array
    {
        return $this->request('GET', '/oauth/clients');
    }

    public function updateOAuthClient(string $clientId, array $data): array
    {
        return $this->request('PATCH', "/oauth/clients/{$clientId}", $data);
    }

    public function deleteOAuthClient(string $clientId): array
    {
        return $this->request('DELETE', "/oauth/clients/{$clientId}");
    }

    /**
     * Verify webhook signature
     *
     * @param string $payload The raw webhook payload
     * @param string $signature The signature from X-Webhook-Signature header
     * @param string $secret Your webhook secret
     * @return bool True if signature is valid
     */
    public static function verifyWebhookSignature(
        string $payload,
        string $signature,
        string $secret
    ): bool {
        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        return hash_equals($signature, $expectedSignature);
    }
}
