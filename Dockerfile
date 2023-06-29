FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json .
COPY tsconfig.json .
COPY .yarnrc.yml .
COPY yarn.lock .
COPY .yarn ./.yarn
COPY .pnp.cjs .
COPY src ./src

RUN yarn
RUN yarn tsc

EXPOSE 1300
CMD [ "yarn", "node", "." ]
