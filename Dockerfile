FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm build && \
    pnpm deploy --filter=api --prod /prod/api && \
    pnpm deploy --filter=apollo --prod /prod/apollo

FROM base AS api
COPY --from=build /prod/api /prod/api
WORKDIR /prod/api
ARG MODE=production
ENV MODE=$MODE
EXPOSE 4001
CMD [ "npm", "start" ]

FROM base AS apollo
COPY --from=build /prod/apollo /prod/apollo
WORKDIR /prod/apollo
ARG MODE=production
ENV MODE=$MODE
EXPOSE 4000
CMD [ "npm", "start" ]

FROM ubuntu:latest AS cronjob
RUN apt-get update && \
    apt-get -y install python3 python3-pip python3-requests cron && \
    ln -s /usr/bin/python3 /usr/bin/python
COPY cronjob /cronjob
RUN crontab /cronjob/crontab
RUN rm -rf /etc/crontabs/root
RUN mkdir -p /cronjob/logs
RUN touch /var/log/cron.log
RUN chmod +x /cronjob/jobs/*.py
CMD ["sh", "-c", "cron && tail -f /var/log/cron.log"]
