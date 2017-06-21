[![Travis](https://img.shields.io/travis/omarahm/notary.svg?style=flat-square)](https://travis-ci.org/omarahm/notary) [![Codecov](https://img.shields.io/codecov/c/github/omarahm/notary.svg?style=flat-square)](https://codecov.io/gh/omarahm/notary) 

Notary is a contracts broker. It provides a declarative way of sharing, validating and discovering contracts from all of your organization projects. Also, it allows you to generate all sort of extra artifacts out of those contracts like Client libraries, Stubbed endpoints, Dependency Graphs & much more.

Support for multiple popular integration patterns like REST APIs will be shipped out of the box, plus the ability to easily extend the project with "Integrations plugins" to support even more patterns.

## What is a *Contract*?
A contract is either a **Producer Promise** or a **Consumer Expectation**. In C7s, it's a meta-data describing how to use a specific shared integration point, e.g.: a Swagger file describing exposed REST API endpoint including API versioning, paths, supported methods, response entities, etc..

## How does the provider/consumer validation work?
To validate your contracts you need to issue a request to the [validation endpoint]. Ideally, this will be done automatically in your CI pipeline.

The validation process includes:
1. Syntactic validation
1. Check if all of the project's promises satisfy its consumers
1. Check if all of the project's expectations are honored by its upstream providers

## What integration patterns does the project support so far?
1. [REST APIs](src/contracts/integrations/rest/README.md): Define contracts for RESTful API endpoints using the [Swagger spec](http://swagger.io/specification/)
1. [Frontend LocalStorage](src/contracts/integrations/localstorage/README.md): Define contracts for shared objects in the end-customer's browser LocalStorage using a specified [JSON schema](http://json-schema.org/)
