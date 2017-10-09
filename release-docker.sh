#!/usr/bin/env bash
docker build . -f ./docker/notary-package.Dockerfile --build-arg package_directory=packages/notary-ci \
    --build-arg exposed_ports="3030 3039" -t notaryio/notary-ci:v0.5.0
docker push notaryio/notary-ci:v0.5.0

docker build . -f ./docker/notary-package.Dockerfile --build-arg package_directory=packages/notary-core \
    --build-arg exposed_ports="3000 3009" -t notaryio/notary-core:v0.5.0
docker push notaryio/notary-core:v0.5.0

docker build . -f ./docker/notary-directory.Dockerfile -t notaryio/notary-directory:v0.5.0
docker push notaryio/notary-directory:v0.5.0

docker build . -f ./docker/notary-package.Dockerfile --build-arg package_directory=packages/notary-rest \
    --build-arg exposed_ports="3010 3019" -t notaryio/notary-rest:v0.5.0
docker push notaryio/notary-rest:v0.5.0

docker build . -f ./docker/notary-package.Dockerfile --build-arg package_directory=packages/notary-schema \
    --build-arg exposed_ports="3020 3029" -t notaryio/notary-schema:v0.5.0
docker push notaryio/notary-schema:v0.5.0