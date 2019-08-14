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
