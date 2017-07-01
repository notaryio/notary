
<h1 align="center">
  <br>
  <img src="https://raw.githubusercontent.com/notaryio/notary/master/docs/visual-assets/logo.svg" alt="notary" width="200">
  <br>
</h1>

<h4 align="center">A contracts broker that provides a declarative way of sharing, validating & discovering contracts between multiple projects.</h4>

<p align="center">
  <a href="https://github.com/notaryio/notary/releases/latest"><img src="https://img.shields.io/github/release/notaryio/notary.svg?style=flat-square" title="GitHub release"/></a>
  <a href="https://travis-ci.org/notaryio/notary"><img src="https://img.shields.io/travis/notaryio/notary.svg?style=flat-square" title="Travis"/></a>
  <a href="https://codecov.io/gh/notaryio/notary"><img src="https://img.shields.io/codecov/c/github/notaryio/notary.svg?style=flat-square" title="Codecov"/></a>
  <a href="https://gitter.im/notaryio/Lobby"><img src="https://img.shields.io/gitter/room/nwjs/nw.js.svg?style=flat-square" title="Gitter"/></a>
  <a href="https://github.com/notaryio/notary/issues"><img src="https://img.shields.io/github/issues/notaryio/notary.svg?style=flat-square" title="GitHub issues"/></a>
  <a href="https://github.com/notaryio/notary/blob/master/LICENSE"><img src="https://img.shields.io/github/license/notaryio/notary.svg?style=flat-square" title="license"/></a>
</p>
<br> 

Beside contracts validation, sharing & discovery, notary also allows you to generate all sort of extra artifacts out of those contracts like Client libraries, Stubbed endpoints, Dependency Graphs & much more. 

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
