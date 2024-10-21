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
