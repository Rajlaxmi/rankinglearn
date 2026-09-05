#!/usr/bin/env python3
"""Ranking Faculty local server: serves the static site and verifies
chat answers against Claude (Anthropic Messages API)."""

import json
import os
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

import anthropic

MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-opus-5")
PORT = int(os.environ.get("PORT", "8000"))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, ".env")
KEY_FILE = os.path.join(BASE_DIR, ".anthropic_api_key")


def load_env_file():
    """Load KEY=VALUE pairs from a local, untracked .env file if present.

    Lets credentials live only in a local file you create yourself, never
    typed into a chat transcript:  echo "ANTHROPIC_API_KEY=sk-ant-..." > .env
    """
    if not os.path.exists(ENV_FILE):
        return
    with open(ENV_FILE) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)


def load_key_file():
    """Fall back to a local, untracked key file if no env credential is set.

    Lets the key live only in a local file you create yourself, never typed
    into a chat transcript:  echo "sk-ant-..." > .anthropic_api_key
    """
    if os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN"):
        return
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE) as f:
            key = f.read().strip()
        if key:
            os.environ["ANTHROPIC_API_KEY"] = key

SYSTEM_PROMPT = (
    "You are a strict but encouraging technical interviewer helping a candidate "
    "prepare for a Netflix Ads Ranking Research Scientist interview. You are "
    "checking the candidate's answer to one structured reflection question about "
    "a specific resource they just read. Vague filler, hedging, or restating the "
    "question does not pass. Judge only the substance of the answer.\n\n"
    "Respond only via the given JSON schema. `verdict` is \"pass\" if the answer "
    "shows real understanding and is complete enough to move on, otherwise "
    "\"retry\". `feedback` is 1-3 sentences: if pass, affirm what's right and add "
    "one sharpening point; if retry, say specifically what's missing or wrong and "
    "what a strong answer would cover, without simply handing over the full answer."
)

VERDICT_SCHEMA = {
    "type": "json_schema",
    "schema": {
        "type": "object",
        "properties": {
            "verdict": {"type": "string", "enum": ["pass", "retry"]},
            "feedback": {"type": "string"},
        },
        "required": ["verdict", "feedback"],
        "additionalProperties": False,
    },
}

QUESTIONS_SYSTEM_PROMPT = (
    "You are interviewing a candidate for a Netflix Ads Ranking Research Scientist "
    "position. You are reviewing one specific resource the candidate just studied, "
    "and you're deciding what to ask them about it in the interview. Write exactly "
    "3 questions that could only be asked about THIS resource - reference its "
    "actual claims, numbers, systems, or algorithms by name. Do not write generic "
    "reading-comprehension questions that could apply to any resource in this "
    "section. Skip surface-level questions about org structure, team placement, or "
    "where something sits in a reporting chain - focus on the substantive technical "
    "or methodological content: objectives, signals, tradeoffs, algorithms, and how "
    "a candidate would reason about or apply them. Order them from foundational to "
    "probing, and keep each one to a single sentence. Respond only via the given "
    "JSON schema."
)

QUESTIONS_SCHEMA = {
    "type": "json_schema",
    "schema": {
        "type": "object",
        "properties": {
            # Three required string fields, not a length-constrained array:
            # the API's schema-validated output only supports minItems/maxItems
            # of 0 or 1, so a fixed-shape object is how "exactly 3" gets enforced.
            "question_1": {"type": "string"},
            "question_2": {"type": "string"},
            "question_3": {"type": "string"},
        },
        "required": ["question_1", "question_2", "question_3"],
        "additionalProperties": False,
    },
}

_client = None


def get_client():
    global _client
    if _client is None:
        _client = anthropic.Anthropic()
    return _client


def verify_answer(payload):
    user_content = (
        f"Resource: {payload['resourceTitle']} ({payload['resourceSource']})\n"
        f"Resource summary: {payload['resourceDescription']}\n\n"
        f"Question: {payload['question']}\n\n"
        f"Candidate's answer: {payload['answer']}"
    )

    response = get_client().messages.create(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        output_config={"effort": "low", "format": VERDICT_SCHEMA},
        messages=[{"role": "user", "content": user_content}],
    )

    text = next(b.text for b in response.content if b.type == "text")
    return json.loads(text)


def generate_questions(payload):
    user_content = (
        f"Section: {payload['streamName']}\n"
        f"Resource: {payload['resourceTitle']} ({payload['resourceSource']})\n"
        f"Summary: {payload['resourceDescription']}"
    )

    response = get_client().messages.create(
        model=MODEL,
        max_tokens=1024,
        system=QUESTIONS_SYSTEM_PROMPT,
        output_config={"effort": "low", "format": QUESTIONS_SCHEMA},
        messages=[{"role": "user", "content": user_content}],
    )

    text = next(b.text for b in response.content if b.type == "text")
    parsed = json.loads(text)
    return {"questions": [parsed["question_1"], parsed["question_2"], parsed["question_3"]]}


ENDPOINTS = {
    "/api/verify": verify_answer,
    "/api/questions": generate_questions,
}


class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        handler = ENDPOINTS.get(self.path)
        if handler is None:
            self.send_error(404, "Not found")
            return

        length = int(self.headers.get("Content-Length", 0))
        try:
            payload = json.loads(self.rfile.read(length) or b"{}")
            result = handler(payload)
            self._send_json(200, result)
        except anthropic.AuthenticationError:
            self._send_json(
                500,
                {"error": "Invalid or missing Anthropic API key. Set ANTHROPIC_API_KEY and restart the server."},
            )
        except anthropic.APIStatusError as e:
            self._send_json(502, {"error": f"Claude API error ({e.status_code}): {e.message}"})
        except (anthropic.AnthropicError, TypeError) as e:
            # The SDK raises a plain TypeError (not an AnthropicError subclass)
            # client-side, before any request goes out, when no credential
            # (env var, key file, or profile) resolves at all.
            if "authentication method" in str(e).lower():
                self._send_json(
                    500,
                    {"error": "No Anthropic API key configured on the server. Add .anthropic_api_key or export ANTHROPIC_API_KEY, then reopen this resource."},
                )
            else:
                self._send_json(500, {"error": f"Request failed: {e}"})
        except Exception as e:
            self._send_json(500, {"error": f"Request failed: {e}"})

    def _send_json(self, status, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        pass


if __name__ == "__main__":
    load_env_file()
    load_key_file()
    if not (os.environ.get("ANTHROPIC_API_KEY") or os.environ.get("ANTHROPIC_AUTH_TOKEN")):
        print(
            "Warning: no ANTHROPIC_API_KEY / ANTHROPIC_AUTH_TOKEN set (checked env and "
            f".anthropic_api_key). The chat check will fail until you provide one.",
        )
    server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"Ranking Faculty running at http://localhost:{PORT} (model: {MODEL})")
    server.serve_forever()
