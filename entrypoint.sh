#!/bin/sh

# Set the default value for ENVIRONMENT
ENVIRONMENT=${ENVIRONMENT:-production}

# Conditional logic to set the proxy_pass directive
if [ "$ENVIRONMENT" = "development" ]; then
  GRAPHQL_FORWARD='proxy_pass http://apollo:4000/graphql;'
else
  GRAPHQL_FORWARD='# GraphQL forwarding disabled in production'
fi

# Export the variable so it's available to envsubst
export GRAPHQL_FORWARD

# Substitute the variables in the nginx.conf.template and output to nginx.conf
envsubst '${GRAPHQL_FORWARD}' < /etc/nginx/conf.d/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Execute the original nginx entrypoint with any passed arguments
exec nginx -g 'daemon off;'
