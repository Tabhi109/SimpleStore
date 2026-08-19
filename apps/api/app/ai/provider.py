"""Sarvam AI Provider client with timeout and fallback protection."""

import logging

import httpx

from app.core.config import settings

logger = logging.getLogger("simplestore.ai")


class SarvamAIProvider:
    """Client for interacting with Sarvam AI API."""

    def __init__(self):
        self.api_key = settings.SARVAM_API_KEY
        self.api_url = settings.SARVAM_API_URL
        self.model = settings.SARVAM_MODEL
        self.timeout_seconds = 8.0

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_key.strip())

    async def generate_chat_completion(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> str | None:
        """Send prompt to Sarvam AI and return response content."""
        if not self.is_configured:
            logger.warning("Sarvam AI API key is not configured. Falling back to local template.")
            return None

        headers = {
            "Content-Type": "application/json",
            "api-subscription-key": self.api_key,
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                response = await client.post(
                    f"{self.api_url}/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )
                if response.status_code == 200:
                    data = response.json()
                    choices = data.get("choices", [])
                    if choices and len(choices) > 0:
                        return choices[0].get("message", {}).get("content", "").strip()
                logger.error(
                    f"Sarvam AI API error status: {response.status_code}, body: {response.text}"
                )
                return None
        except httpx.TimeoutException:
            logger.warning("Sarvam AI request timed out.")
            return None
        except Exception as e:
            logger.error(f"Sarvam AI request failed with error: {str(e)}")
            return None


ai_provider = SarvamAIProvider()
