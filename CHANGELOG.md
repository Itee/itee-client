# [7.2.0](https://github.com/Itee/itee-client/compare/v7.1.4...v7.2.0) (2020-12-18)


### Bug Fixes

* **abstractwebapi:** add unreachable flag on origin that cannot be reached ([011872b](https://github.com/Itee/itee-client/commit/011872beec8647e626c22b1829fa694e31882453))
* **abstractwebapi:** move some members before internal setters to avoid bad initialization ([75f4681](https://github.com/Itee/itee-client/commit/75f468171f2c56578e9caa51c51865dfe9892be5))
* **abstractwebapi:** test if response exist before trying to access his members ([6ceb1ea](https://github.com/Itee/itee-client/commit/6ceb1ea809ef6b2444fd0d4fd321de1cfefb979d))
* **eslint:** fix eslint error ([ef75cd6](https://github.com/Itee/itee-client/commit/ef75cd685ba157e85c9cdf94614c27684b28ce95))
* **package:** add missing package-lock ([dbf87bf](https://github.com/Itee/itee-client/commit/dbf87bf088b33b53a26050cafe546911654e86e7))


### Features

* **webapi:** add webapi support and abstract class ([9c206ae](https://github.com/Itee/itee-client/commit/9c206aefbd028948d5ec15243fbdf8bff78702a2))
* **worker:** add worker support and abstract classes ([c869fc6](https://github.com/Itee/itee-client/commit/c869fc67966b45fbb1299936e503f88a77465691))

## [7.1.4](https://github.com/Itee/itee-client/compare/v7.1.3...v7.1.4) (2020-07-21)


### Bug Fixes

* **package:** upgrade all deps to their latest version ([69636a7](https://github.com/Itee/itee-client/commit/69636a70ea7523f410fc4cc565a8b846b862ab72))

## [7.1.3](https://github.com/Itee/itee-client/compare/v7.1.2...v7.1.3) (2020-06-15)


### Bug Fixes

* **tbinaryreader:** fix wrong function call witout parenthesis ([1ca24f9](https://github.com/Itee/itee-client/commit/1ca24f9fc1cb25e4057cd3657dda350e955a0b82))

## [7.1.2](https://github.com/Itee/itee-client/compare/v7.1.1...v7.1.2) (2020-02-17)


### Bug Fixes

* **package:** update package lock ([5714cac](https://github.com/Itee/itee-client/commit/5714caca52084c36897d108a84430967bfd41f47)), closes [#23](https://github.com/Itee/itee-client/issues/23)

## [7.1.1](https://github.com/Itee/itee-client/compare/v7.1.0...v7.1.1) (2019-08-14)


### Bug Fixes

* **tdatabasemanager:** comment responsetype check due to enum rollback that throw ([85e758b](https://github.com/Itee/itee-client/commit/85e758b))

# [7.1.0](https://github.com/Itee/itee-client/compare/v7.0.0...v7.1.0) (2019-08-12)


### Features

* **docs:** add docs to github ([7e1dcce](https://github.com/Itee/itee-client/commit/7e1dcce))

# [7.0.0](https://github.com/Itee/itee-client/compare/v6.6.6...v7.0.0) (2019-08-05)


### Bug Fixes

* **karmatestconfig:** use firefox browser for deployment ([ccd42fa](https://github.com/Itee/itee-client/commit/ccd42fa))


### Code Refactoring

* **builds:** remove support for amd and umd modules, rename itee-client.es to itee-client.esm ([1645262](https://github.com/Itee/itee-client/commit/1645262))
* **controllers:** move three controllers into itee-mongodb-three package ([9748de2](https://github.com/Itee/itee-client/commit/9748de2))
* **databasemanagers:** remove database managers that are now include in itee-mongodb-three ([263e76f](https://github.com/Itee/itee-client/commit/263e76f))
* **global:** update intermediary exporter files ([5baf30e](https://github.com/Itee/itee-client/commit/5baf30e))
* **loaders:** move three loader in their related package itee-mongodb-three ([95c0199](https://github.com/Itee/itee-client/commit/95c0199))
* **objects3d:** remove three objects3d in their own package ([75bb4da](https://github.com/Itee/itee-client/commit/75bb4da))
* **uis:** remove uis folder ([ad833ae](https://github.com/Itee/itee-client/commit/ad833ae))


### BREAKING CHANGES

* **builds:** remove amd and umd support
* **global:** UI is now in itee-ui, three stuff is now in itee-mongodb-three
* **objects3d:** remove three objects
* **loaders:** remove three loaders
* **controllers:** remove three controllers
* **databasemanagers:** remove database managers in favor of itee-mondogb-three
* **uis:** all uis are removed from client in favor of itee-ui
