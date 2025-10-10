curl -X POST https://api.nilcc.nillion.network/api/v1/workloads/create \
  -H "x-api-key: 03f68656e53ecffc21fb6ac3d52c5be2" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "hello-world-api",
    "dockerCompose": "services:\n  web:\n    image: caddy:2\n    command: |\n      caddy respond --listen :8080 --body '\''{\"hello\":\"trisolaris\"}'\'' --header \"Content-Type: application/json\"",
    "serviceToExpose": "web",
    "servicePortToExpose": 8080,
    "cpus": YOUR_CPUS,
    "memory": YOUR_MEMORY,
    "disk": YOUR_DISK,
    "gpus": YOUR_GPUS,
    "artifactsVersion": LATEST_ARTIFACTS_VERSION
  }'