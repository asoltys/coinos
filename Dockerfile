FROM node:alpine

RUN apk add git
RUN git clone https://github.com/coinos/coinos-ui /coinos
WORKDIR /coinos
ENV SHELL /bin/bash

RUN yarn install
CMD ["yarn", "start"]
