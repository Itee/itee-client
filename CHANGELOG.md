# [8.0.0](https://github.com/Itee/itee-client/compare/v7.4.4...v8.0.0) (2022-02-14)


### Bug Fixes

* **eslint:** add missing dev deps about @babel/core to be able to run eslint-parser ([88c6c8a](https://github.com/Itee/itee-client/commit/88c6c8ac75e606e578db968af40ebce33c65e10c))
* **package:** apply npm audit fix ([7a526a7](https://github.com/Itee/itee-client/commit/7a526a77ec10b0090e6b8af6779b5b657d6b016e))
* **package:** update dependencies to latest version ([4810e2b](https://github.com/Itee/itee-client/commit/4810e2b4be6ead4dffe965e2028f578f9348656a))
* **workermessageprogress:** fix nameof exported workermessageprogress ([5fc21b2](https://github.com/Itee/itee-client/commit/5fc21b269f65c93540da9b0378d35a0f121d2032))


### Code Refactoring

* **webapi:** refactor the usage of webapi and improve capability and perfs ([33c03eb](https://github.com/Itee/itee-client/commit/33c03eb2b9ac3166b044722787d9a3690c2a8649))


### BREAKING CHANGES

* **webapi:** the class abstractwebapi is now webapi. And WebApiMessageResponse is now
webAPIMessageResponse.
* **workermessageprogress:** workerprogressmessage become workermessageprogress

## [7.4.4](https://github.com/Itee/itee-client/compare/v7.4.3...v7.4.4) (2021-07-21)


### Bug Fixes

* **readme:** fix readme tag ([f30659f](https://github.com/Itee/itee-client/commit/f30659fdf12022dd1fb0965d4bd04ce059612659))

## [7.4.3](https://github.com/Itee/itee-client/compare/v7.4.2...v7.4.3) (2021-07-08)


### Bug Fixes

* **webapimessage:** fix uuidv4 import statement ([70c2fef](https://github.com/Itee/itee-client/commit/70c2fefd8a9785a9bff0cda5c9afb8d32d1685b7))

## [7.4.2](https://github.com/Itee/itee-client/compare/v7.4.1...v7.4.2) (2021-07-08)


### Bug Fixes

* **package:** apply dependencies fix ([d6f5b4a](https://github.com/Itee/itee-client/commit/d6f5b4a756a85daa817c503a6ee8721df3e02b1a))
* **package:** apply fix from dependencies ([ee04855](https://github.com/Itee/itee-client/commit/ee04855c4bc69f02afc26c9bb775940b374f0e8e))
* **releaserc:** fix missing dev maps ([bbae34a](https://github.com/Itee/itee-client/commit/bbae34abc3f67b312458e897de7d9813a43c4301))

## [7.4.1](https://github.com/Itee/itee-client/compare/v7.4.0...v7.4.1) (2021-07-05)


### Bug Fixes

* **package:** miss some dependencies ([35ecf43](https://github.com/Itee/itee-client/commit/35ecf434530984f482e265d3945ab8f51ded4ba1))

# [7.4.0](https://github.com/Itee/itee-client/compare/v7.3.0...v7.4.0) (2021-07-05)


### Bug Fixes

* **eslint:** fix eslint error ([c36537f](https://github.com/Itee/itee-client/commit/c36537f9c43aade0e830af39a0787b81ce7621e4))
* **package:** apply npm audit fix ([1f68193](https://github.com/Itee/itee-client/commit/1f68193d603a66882f0acb028ae39a22f3d04de8))
* **rollupconfig:** remove sourcemap in production ([893a513](https://github.com/Itee/itee-client/commit/893a513cd414ebf42fe116db7fc4fcdbc29d0293))


### Features

* **iteecore:** use TLogger from itee-core pacakge instead of local one ([f714873](https://github.com/Itee/itee-client/commit/f7148732f77f77b8984ebae4aabb1c59fe64ee19))

# [7.3.0](https://github.com/Itee/itee-client/compare/v7.2.0...v7.3.0) (2021-01-21)


### Bug Fixes

* **abstractwebapi:** fix response dispatch ([f7e219a](https://github.com/Itee/itee-client/commit/f7e219a0be396e4c2dc1551f4dd65986aeddebde))
* **abstractwebapi:** use correct origin uri in warning message ([ddfcc7d](https://github.com/Itee/itee-client/commit/ddfcc7d10ca0eec9a1d352cc3d82e523b8630485))


### Features

* **abstractwebapi:** add allow any origins notion to allow by default all origin and remove target ([010a871](https://github.com/Itee/itee-client/commit/010a871b15079c02d642cc50bfcbfa02ab45052f))

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
