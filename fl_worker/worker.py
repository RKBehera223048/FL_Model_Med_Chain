"""
MedChain-FL Worker Node — Simulates a local hospital FL training node.

This worker:
1. Registers with the global server
2. Polls for new training tasks
3. Simulates local model training
4. Reports mock metrics back
"""

import time
import random
import json
import os
import sys
from datetime import datetime

GLOBAL_SERVER_URL = os.getenv("GLOBAL_SERVER_URL", "http://global_server:8000")
HOSPITAL_CODE = os.getenv("HOSPITAL_CODE", "WORKER-001")
HOSPITAL_NAME = os.getenv("HOSPITAL_NAME", "FL Worker Node")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "30"))


def simulate_local_training(round_number: int) -> dict:
    """Simulate local model training on private hospital data."""
    print(f"[{HOSPITAL_CODE}] 🧠 Starting local training for Round #{round_number}...")

    # Simulate training time
    epochs = random.randint(3, 8)
    for epoch in range(1, epochs + 1):
        loss = random.uniform(0.05, 0.5) * (1 - epoch / (epochs + 1))
        acc = random.uniform(0.6, 0.95) * (1 + epoch / (epochs * 2))
        acc = min(acc, 0.98)
        print(f"  Epoch {epoch}/{epochs} — loss: {loss:.4f}, acc: {acc:.4f}")
        time.sleep(random.uniform(0.5, 1.5))

    # Generate mock model weights (in reality, these would be gradient updates)
    mock_weights = {
        "layer_1": [random.gauss(0, 0.1) for _ in range(10)],
        "layer_2": [random.gauss(0, 0.1) for _ in range(5)],
        "bias": [random.gauss(0, 0.01) for _ in range(5)],
    }

    metrics = {
        "hospital_code": HOSPITAL_CODE,
        "round_number": round_number,
        "epochs_trained": epochs,
        "final_loss": round(loss, 4),
        "final_accuracy": round(acc, 4),
        "samples_used": random.randint(200, 2000),
        "training_time_seconds": round(random.uniform(5, 30), 2),
        "timestamp": datetime.utcnow().isoformat(),
    }

    print(f"[{HOSPITAL_CODE}] ✅ Training complete! Accuracy: {acc:.4f}, Loss: {loss:.4f}")
    return metrics


def main():
    print("=" * 60)
    print(f"  MedChain-FL Worker Node: {HOSPITAL_NAME}")
    print(f"  Code: {HOSPITAL_CODE}")
    print(f"  Global Server: {GLOBAL_SERVER_URL}")
    print(f"  Poll Interval: {POLL_INTERVAL}s")
    print("=" * 60)

    round_counter = 0

    while True:
        try:
            round_counter += 1
            print(f"\n[{HOSPITAL_CODE}] 📡 Waiting for training task... (Round {round_counter})")

            # Simulate waiting for a task from the global server
            wait_time = random.uniform(POLL_INTERVAL * 0.5, POLL_INTERVAL * 1.5)
            time.sleep(wait_time)

            # Simulate receiving a training task
            print(f"[{HOSPITAL_CODE}] 📥 Received training task for Round #{round_counter}")

            # Run local training
            metrics = simulate_local_training(round_counter)

            # Simulate sending results back to global server
            print(f"[{HOSPITAL_CODE}] 📤 Sending model updates to global server...")
            time.sleep(random.uniform(1, 3))
            print(f"[{HOSPITAL_CODE}] ✓ Updates sent successfully")

            print(f"\n[{HOSPITAL_CODE}] 💤 Sleeping before next poll...")
            time.sleep(POLL_INTERVAL)

        except KeyboardInterrupt:
            print(f"\n[{HOSPITAL_CODE}] 🛑 Worker shutting down gracefully...")
            sys.exit(0)
        except Exception as e:
            print(f"[{HOSPITAL_CODE}] ❌ Error: {e}")
            time.sleep(10)


if __name__ == "__main__":
    main()
