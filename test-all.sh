#!/bin/bash

set -e

echo "Starting memcached..."
docker-compose up -d memcached
sleep 2

NODE_VERSIONS=(12 14 16 18 20 22 24 25)
FAILED=()

for version in "${NODE_VERSIONS[@]}"; do
  echo ""
  echo "========================================="
  echo "Testing with Node $version"
  echo "========================================="

  if docker-compose run --rm test-node-$version; then
    echo "✓ Node $version: PASSED"
  else
    echo "✗ Node $version: FAILED"
    FAILED+=($version)
  fi
done

echo ""
echo "========================================="
echo "Test Summary"
echo "========================================="

if [ ${#FAILED[@]} -eq 0 ]; then
  echo "✓ All Node versions passed!"
  docker-compose down
  exit 0
else
  echo "✗ Failed Node versions: ${FAILED[*]}"
  docker-compose down
  exit 1
fi
