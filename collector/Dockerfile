# OpenTelemetry Collector Dockerfile
FROM otel/opentelemetry-collector-contrib:0.88.0

# Copy the collector configuration
COPY otel-collector.yaml /etc/otelcol-contrib/otel-collector.yaml

# Set the configuration file
ENV OTEL_CONFIG_FILE=/etc/otelcol-contrib/otel-collector.yaml

# Expose ports
EXPOSE 4317 4318 8888 8889

# Run the collector
CMD ["/otelcol-contrib", "--config=/etc/otelcol-contrib/otel-collector.yaml"]
