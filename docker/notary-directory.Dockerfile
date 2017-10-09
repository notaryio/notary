FROM node:8.6-slim

# get dependencies
ADD packages/notary-directory/package.json /tmp/app-dev/package.json
RUN cd /tmp/app-dev && npm install --only=dev
RUN mkdir /tmp/app && cp /tmp/app-dev/package.json /tmp/app/ && \
  cd /tmp/app && npm install --only=production

# build
ADD packages/notary-directory/src /tmp/app-dev/src
ADD packages/notary-directory/.babelrc /tmp/app-dev/.babelrc
RUN /tmp/app-dev/node_modules/.bin/babel /tmp/app-dev/src/ -d /tmp/app/dist --copy-files --ignore public && \
  cp -r /tmp/app-dev/src/public /tmp/app/dist/public && \
  rm /tmp/app/package-lock.json

FROM node:8.6-slim

EXPOSE 3040 3049
WORKDIR /opt/app

ENV NPM_CONFIG_LOGLEVEL warn

COPY --from=0 /tmp/app/ /opt/app

CMD npm start