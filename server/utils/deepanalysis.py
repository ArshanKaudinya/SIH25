import os
import base64
from typing import List, Optional

from openai import OpenAI, APIStatusError, APIConnectionError, RateLimitError

DEFAULT_MODEL = os.getenv("OPENAI_VISION_MODEL", "gpt-4o")
DEFAULT_PROMPT = (
    "You are a strict but fair movement coach. Analyze the provided frames as one short set. "
    "Do not count reps. Provide 4–6 concise bullet points focused only on: posture, joint alignment, "
    "range of motion, depth, tempo, and safety. "
    "Judge consistency across frames, not single glitches. "
    "If camera angle or lighting prevents certainty, say so and suggest a fix. "
    "Never mention weight, fitness level, or training prescriptions. "
    "Plain text only, no emojis, no hype."
)

_MAX_FRAMES = int(os.getenv("DEEPANALYSIS_MAX_FRAMES", "30"))

_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def _as_data_url(b64: str, mime_hint: Optional[str] = None) -> str:
    b64 = b64.strip()
    if b64.startswith("data:"):
        return b64
    if mime_hint is None:
        try:
            first = base64.b64decode(b64[:8] + "==", validate=False)[:1]
        except Exception:
            first = b""
        if first == b"\xFF":
            mime_hint = "image/jpeg"
        elif first == b"\x89":
            mime_hint = "image/png"
        else:
            mime_hint = "image/jpeg"
    return f"data:{mime_hint};base64,{b64}"

def analyze_frames(
    frames_base64: List[str],
    prompt: str,
    model: Optional[str] = None,
    max_output_tokens: int = 400,
    temperature: float = 0.2,
) -> str:
    if not frames_base64:
        raise ValueError("no frames provided")

    frames = frames_base64[-_MAX_FRAMES:]

    content = [{"type": "input_text", "text": prompt}]
    for b64 in frames:
        content.append({"type": "input_image", "image_url": _as_data_url(b64)})

    model = model or DEFAULT_MODEL
    last_err = None
    for _ in range(3):
        try:
            resp = _client.responses.create(
                model=model,
                input=[{"role": "user", "content": content}],
                max_output_tokens=max_output_tokens,
                temperature=temperature,
            )
            try:
                return resp.output_text.strip()
            except Exception:
                # robust fallback for SDK variations
                return (
                    resp.output[0].content[0].text.strip()  # type: ignore[attr-defined]
                )
        except (RateLimitError, APIConnectionError, APIStatusError) as e:
            last_err = e
    raise RuntimeError(f"vision analysis failed: {last_err}")
