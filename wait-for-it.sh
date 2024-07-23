#!/bin/bash

# Function to wait for a single service
wait_for_service() {
    local HOST=$(echo $1 | cut -d : -f 1)
    local PORT=$(echo $1 | cut -d : -f 2)

    until nc -z $HOST $PORT; do
        echo "Waiting for $HOST:$PORT to be available..."
        sleep 3 # wait for 3 seconds before check again
    done

    echo "$HOST:$PORT is available."
}

# Main script logic

# Process each host:port argument
while [ $# -gt 0 ]
do
    case "$1" in
        --)
            shift
            break
            ;;
        *)
            wait_for_service $1
            shift
            ;;
    esac
done

# Execute the command if provided
if [ -n "$1" ]; then
    exec "$@"
fi
