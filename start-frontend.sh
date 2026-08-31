#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/gym-saas-frontend"

echo "=========================================================="
echo " Starting PulseGym Angular 22 Frontend Dev Server...     "
echo " URL: http://localhost:4200                              "
echo " API Proxy: http://localhost:8080                        "
echo "=========================================================="

npm start
