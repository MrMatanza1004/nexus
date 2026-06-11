#!/usr/bin/env bash

# ----------------------------------------------------------
# setup-openwa.sh – Simple helper to launch the OpenWA sidecar
# ----------------------------------------------------------
# This script is intended for local development / provisioning of the
# OpenWA Docker container that powers the WhatsApp gateway.
#
# What it does:
#   1. Ensures an OPENWA_MASTER_KEY exists (generates one if missing).
#   2. Pulls the OpenWA Docker image (v4.76.0 – stable release).
#   3. Starts the container via docker‑compose (exposes port 3000).
#   4. Waits for the health‑check endpoint to become healthy.
#   5. Prints a short guide for the initial QR login.
# ----------------------------------------------------------

set -euo pipefail

# -----------------------------------------------------------------
# 1️⃣ Ensure we have a master key – needed for every request to the API.
# -----------------------------------------------------------------
if [[ -z "${OPENWA_MASTER_KEY:-}" ]]; then
  echo "OPENWA_MASTER_KEY not set – generating a secure random key…"
  # 32‑hex characters = 128‑bit secret, sufficient for X‑Master‑Key.
  OPENWA_MASTER_KEY=$(openssl rand -hex 16)
  # Persist for future runs (add to a .env file in project root).
  echo "export OPENWA_MASTER_KEY=$OPENWA_MASTER_KEY" >> .env
  echo "Generated key and appended to .env (in project root)."
else
  echo "Using existing OPENWA_MASTER_KEY from environment."
fi

# -----------------------------------------------------------------
# 2️⃣ Pull the Docker image (stable v4.76.0) – explicit tag prevents
#    accidental upgrades to an alpha version.
# -----------------------------------------------------------------
docker compose pull openwa

# -----------------------------------------------------------------
# 3️⃣ Start the container in detached mode.
# -----------------------------------------------------------------
docker compose up -d openwa

# -----------------------------------------------------------------
# 4️⃣ Wait for the health‑check to succeed.
# -----------------------------------------------------------------
echo "Waiting for OpenWA API to become healthy…"
while ! curl -s http://localhost:3000/api-docs > /dev/null; do
  sleep 5
  echo -n "."
  # Show a max of 12 attempts (≈1 minute) before giving up.
  ((i++))
  if (( i >= 12 )); then
    echo "\nTimed out waiting for OpenWA. Check container logs with 'docker compose logs openwa'."
    exit 1
  fi
done

echo "\n✅ OpenWA is up and reachable at http://localhost:3000"

# -----------------------------------------------------------------
# 5️⃣ First‑time QR login (only needed once per session).
# -----------------------------------------------------------------
# The Easy API exposes a Swagger UI at /api-docs where you can scan the
# QR code shown in the terminal (or download the image from the UI).
# If the session is already authenticated, the endpoint will immediately
# return status "connected".

echo "\nIf this is the first run, open the following URL in a browser to scan the QR code and log in to WhatsApp:"
echo "   http://localhost:3000/api-docs"

echo "\nAfter successful login the API will report status 'connected'."

echo "\nYou can now use the NEXUS dashboard (https://ionexus.pro) – make sure to set the following env vars in Vercel:"
echo "   OPENWA_BASE_URL=https://<your‑vps‑ip-or‑domain>:3000"
echo "   OPENWA_MASTER_KEY=$OPENWA_MASTER_KEY"

echo "\nHappy hacking!"
