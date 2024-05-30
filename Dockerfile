FROM oven/bun:latest as frontend-build
WORKDIR /app
COPY ./frontend .
RUN bun install
ENV VITE_API_URL=/api
RUN bun run build

FROM golang:alpine as backend-build
WORKDIR /app
COPY ./backend .
RUN go mod download && go mod verify
RUN go build -v -o ./build/app .

FROM alpine as final
WORKDIR /app
ENV GIN_MODE=release
COPY --from=frontend-build /app/dist/ ./www
COPY --from=backend-build /app/build/app .
CMD ["./app"]


