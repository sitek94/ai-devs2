#!/bin/bash

# Util for making requests to the local server that is exposed using ngrok

# Read the NGROK_DOMAIN environment variable
NGROK_DOMAIN=${NGROK_DOMAIN}

# Construct the base URL
URL="https://${NGROK_DOMAIN}"

# Check if the first argument starts with "/"
if [[ $1 == /* ]]; then
    # Append it to the URL
    URL="${URL}$1"
    shift
fi

# Pass the URL and any additional arguments to curl
curl "${URL}" "$@"