FROM node:8.6-slim

ARG package_directory
# get dependencies
ADD ${package_directory}/package.json /tmp/app-dev/package.json
RUN cd /tmp/app-dev && npm install --only=dev
RUN mkdir /tmp/app && cp /tmp/app-dev/package.json /tmp/app/ && \
  cd /tmp/app && npm install --only=production

# build
ADD ${package_directory}/src /tmp/app-dev/src
ADD ${package_directory}/.babelrc /tmp/app-dev/.babelrc
RUN /tmp/app-dev/node_modules/.bin/babel /tmp/app-dev/src/ -d /tmp/app/dist --copy-files && \
  rm /tmp/app/package-lock.json

FROM node:8.6-slim

ARG exposed_ports
EXPOSE ${exposed_ports}
WORKDIR /opt/app

ENV NPM_CONFIG_LOGLEVEL warn

COPY --from=0 /tmp/app/ /opt/app

CMD npm start