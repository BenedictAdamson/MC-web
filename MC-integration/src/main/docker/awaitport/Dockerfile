FROM alpine:3
RUN apk add --no-cache netcat-openbsd
COPY awaitport /bin
ENTRYPOINT [ "/bin/awaitport" ]