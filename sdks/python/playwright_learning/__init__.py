"""
Playwright & Selenium Learning Platform API SDK for Python
"""

import requests
import hmac
import hashlib
import time
from typing import Optional, Dict, List, Any
from urllib.parse import urljoin


class PlaywrightLearningSDK:
    """Official Python SDK for the Playwright & Selenium Learning Platform API"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        access_token: Optional[str] = None,
        base_url: str = "https://api.playwright-learning.com/v1",
        timeout: int = 30,
        max_retries: int = 3,
    ):
        """
        Initialize the SDK

        Args:
            api_key: Your API key
            access_token: Your OAuth access token
            base_url: Base URL for the API
            timeout: Request timeout in seconds
            max_retries: Maximum number of retries for failed requests
        """
        if not api_key and not access_token:
            raise ValueError("Either api_key or access_token is required")

        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.max_retries = max_retries

        self.session = requests.Session()
        self.session.headers.update(
            {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key or access_token}",
            }
        )

    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        retries: int = 0,
    ) -> Dict[str, Any]:
        """Make an API request with retry logic"""
        url = urljoin(self.base_url + "/", endpoint.lstrip("/"))

        try:
            response = self.session.request(
                method=method,
                url=url,
                json=data,
                params=params,
                timeout=self.timeout,
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.RequestException as e:
            if retries < self.max_retries:
                time.sleep(1 * (retries + 1))  # Exponential backoff
                return self._request(method, endpoint, data, params, retries + 1)
            raise Exception(f"API request failed: {str(e)}")

    # User methods
    def get_current_user(self) -> Dict[str, Any]:
        """Get the current user's profile"""
        return self._request("GET", "/users/me")

    def update_current_user(
        self,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        avatar: Optional[str] = None,
        settings: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Update the current user's profile"""
        data = {}
        if first_name:
            data["firstName"] = first_name
        if last_name:
            data["lastName"] = last_name
        if avatar:
            data["avatar"] = avatar
        if settings:
            data["settings"] = settings

        return self._request("PATCH", "/users/me", data=data)

    def get_user_by_id(self, user_id: str) -> Dict[str, Any]:
        """Get a user by ID"""
        return self._request("GET", f"/users/{user_id}")

    # API Key methods
    def create_api_key(
        self,
        name: str,
        environment: str,
        scopes: Optional[List[str]] = None,
        rate_limit: Optional[int] = None,
        expires_at: Optional[str] = None,
        ip_whitelist: Optional[List[str]] = None,
        metadata: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Create a new API key"""
        data = {
            "name": name,
            "environment": environment,
        }
        if scopes:
            data["scopes"] = scopes
        if rate_limit:
            data["rateLimit"] = rate_limit
        if expires_at:
            data["expiresAt"] = expires_at
        if ip_whitelist:
            data["ipWhitelist"] = ip_whitelist
        if metadata:
            data["metadata"] = metadata

        return self._request("POST", "/api-keys", data=data)

    def list_api_keys(self) -> Dict[str, Any]:
        """List all API keys"""
        return self._request("GET", "/api-keys")

    def get_api_key(self, key_id: str) -> Dict[str, Any]:
        """Get an API key by ID"""
        return self._request("GET", f"/api-keys/{key_id}")

    def update_api_key(
        self,
        key_id: str,
        name: Optional[str] = None,
        scopes: Optional[List[str]] = None,
        rate_limit: Optional[int] = None,
        is_active: Optional[bool] = None,
        ip_whitelist: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Update an API key"""
        data = {}
        if name:
            data["name"] = name
        if scopes:
            data["scopes"] = scopes
        if rate_limit is not None:
            data["rateLimit"] = rate_limit
        if is_active is not None:
            data["isActive"] = is_active
        if ip_whitelist:
            data["ipWhitelist"] = ip_whitelist

        return self._request("PATCH", f"/api-keys/{key_id}", data=data)

    def revoke_api_key(self, key_id: str) -> Dict[str, Any]:
        """Revoke an API key"""
        return self._request("DELETE", f"/api-keys/{key_id}")

    def rotate_api_key(self, key_id: str) -> Dict[str, Any]:
        """Rotate an API key"""
        return self._request("POST", f"/api-keys/{key_id}/rotate")

    def get_api_key_usage(self, key_id: str) -> Dict[str, Any]:
        """Get API key usage statistics"""
        return self._request("GET", f"/api-keys/{key_id}/usage")

    # Webhook methods
    def create_webhook(
        self,
        url: str,
        events: List[str],
        description: Optional[str] = None,
        headers: Optional[Dict[str, str]] = None,
        retry_policy: Optional[Dict] = None,
    ) -> Dict[str, Any]:
        """Create a new webhook"""
        data = {
            "url": url,
            "events": events,
        }
        if description:
            data["description"] = description
        if headers:
            data["headers"] = headers
        if retry_policy:
            data["retryPolicy"] = retry_policy

        return self._request("POST", "/webhooks", data=data)

    def list_webhooks(self) -> Dict[str, Any]:
        """List all webhooks"""
        return self._request("GET", "/webhooks")

    def get_webhook(self, webhook_id: str) -> Dict[str, Any]:
        """Get a webhook by ID"""
        return self._request("GET", f"/webhooks/{webhook_id}")

    def update_webhook(
        self,
        webhook_id: str,
        url: Optional[str] = None,
        events: Optional[List[str]] = None,
        description: Optional[str] = None,
        is_active: Optional[bool] = None,
        headers: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """Update a webhook"""
        data = {}
        if url:
            data["url"] = url
        if events:
            data["events"] = events
        if description:
            data["description"] = description
        if is_active is not None:
            data["isActive"] = is_active
        if headers:
            data["headers"] = headers

        return self._request("PATCH", f"/webhooks/{webhook_id}", data=data)

    def delete_webhook(self, webhook_id: str) -> Dict[str, Any]:
        """Delete a webhook"""
        return self._request("DELETE", f"/webhooks/{webhook_id}")

    def test_webhook(self, webhook_id: str) -> Dict[str, Any]:
        """Test a webhook"""
        return self._request("POST", f"/webhooks/{webhook_id}/test")

    def list_webhook_events(
        self,
        webhook_id: str,
        status: Optional[str] = None,
        page: int = 1,
        limit: int = 50,
    ) -> Dict[str, Any]:
        """List webhook events"""
        params = {"page": page, "limit": limit}
        if status:
            params["status"] = status

        return self._request("GET", f"/webhooks/{webhook_id}/events", params=params)

    def get_webhook_stats(self, webhook_id: str) -> Dict[str, Any]:
        """Get webhook statistics"""
        return self._request("GET", f"/webhooks/{webhook_id}/stats")

    # OAuth methods
    def create_oauth_client(
        self,
        name: str,
        redirect_uris: List[str],
        description: Optional[str] = None,
        allowed_scopes: Optional[List[str]] = None,
        grant_types: Optional[List[str]] = None,
        is_public: bool = False,
    ) -> Dict[str, Any]:
        """Create a new OAuth client"""
        data = {
            "name": name,
            "redirectUris": redirect_uris,
            "isPublic": is_public,
        }
        if description:
            data["description"] = description
        if allowed_scopes:
            data["allowedScopes"] = allowed_scopes
        if grant_types:
            data["grantTypes"] = grant_types

        return self._request("POST", "/oauth/clients", data=data)

    def list_oauth_clients(self) -> Dict[str, Any]:
        """List all OAuth clients"""
        return self._request("GET", "/oauth/clients")

    def update_oauth_client(
        self, client_id: str, data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update an OAuth client"""
        return self._request("PATCH", f"/oauth/clients/{client_id}", data=data)

    def delete_oauth_client(self, client_id: str) -> Dict[str, Any]:
        """Delete an OAuth client"""
        return self._request("DELETE", f"/oauth/clients/{client_id}")

    @staticmethod
    def verify_webhook_signature(payload: str, signature: str, secret: str) -> bool:
        """
        Verify webhook signature

        Args:
            payload: The raw webhook payload as a string
            signature: The signature from the X-Webhook-Signature header
            secret: Your webhook secret

        Returns:
            True if signature is valid, False otherwise
        """
        expected_signature = hmac.new(
            secret.encode("utf-8"), payload.encode("utf-8"), hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(signature, expected_signature)


__all__ = ["PlaywrightLearningSDK"]
