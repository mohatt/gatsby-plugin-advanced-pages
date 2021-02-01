# [2.0.0](https://github.com/mohatt/gatsby-plugin-advanced-pages/compare/v1.4.1...v1.5.0) (2021-02-01)


### BREAKING CHANGES

* The new version introduces a new better api for defining pages and routes, the old api is no longer supported.
* The schema for the types defined by the plugin has been changed, old GraphQL queries will not work.
* The Route GraphQL type has been removed.

### Features

* **plugin:** Removed Markdown/Mdx transformer dependency, the plugin can now function without them. ([1964adb](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/1964adbcc4591eca55c53f8dc1c6934833eaa39f))
* **plugin:** Implemented "pluginOptionsSchema" node api for validating plugin options and pages config. ([1964adb](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/1964adbcc4591eca55c53f8dc1c6934833eaa39f#diff-6cabc69a3475b0063d7a0820d49494a8685ce8bb0915f4e84fc91d5fa65e08b6))
* **plugin:** Added lookupPath() for validating paths within plugin ([de49bab](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/de49bab545e68e81e745c197b659fda95c234f2c))

### Performance Improvements

* **plugin:** added error reporter ([318b26e](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/434c4c81c9d15682fb52ec83ebaabdf8d5e2aadc))

## [1.4.1](https://github.com/mohatt/gatsby-plugin-advanced-pages/compare/v1.4.0...v1.4.1) (2021-01-11)


### Performance Improvements

* **deps:** updated babel and pathToRegexp versions ([318b26e](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/318b26edc79121a51efd04434766e27a36f7cc0f))

# [1.4.0](https://github.com/mohatt/gatsby-plugin-advanced-pages/compare/v1.3.5...v1.4.0) (2020-10-08)


### Features

* **plugin:** bump node min version to 10.13.0 ([470e7ac](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/470e7ac9bcee1d097a6b8e115b6180fbab5d04a6))

## [1.3.5](https://github.com/mohatt/gatsby-plugin-advanced-pages/compare/v1.3.4...v1.3.5) (2019-08-23)


### Bug Fixes

* **Link:** Link component now accepts regular paths as well as route names ([e21e851](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/e21e851))

## [1.3.4](https://github.com/mohatt/gatsby-plugin-advanced-pages/compare/v1.3.3...v1.3.4) (2019-08-20)


### Bug Fixes

* **package:** include types in package json ([f44b4c7](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/f44b4c7))

## [1.3.3](https://github.com/mohatt/gatsby-plugin-advanced-pages/compare/v1.3.2...v1.3.3) (2019-08-15)


### Bug Fixes

* **node:** allow passing extra pages context to `createAdvancedPage()` ([ca367d9](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/ca367d9))

## [1.3.2](https://github.com/mohatt/gatsby-plugin-advanced-pages/compare/v1.3.1...v1.3.2) (2019-08-14)


### Bug Fixes

* **node:** add `childOf` to type `Route` to support gatsby v3 ([ec1fc4f](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/ec1fc4f))

## [1.3.1](https://github.com/mohatt/gatsby-plugin-advanced-pages/compare/v1.3.0...v1.3.1) (2019-08-14)


### Bug Fixes

* **node:** rewrote create-pages tests, added some docs to readme ([50cc29a](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/50cc29a))

# [1.3.0](https://github.com/mohatt/gatsby-plugin-advanced-pages/compare/v1.2.1...v1.3.0) (2019-08-14)


### Features

* **api:** Implemented getActivatedRoute(), isActivatedRoute() and getMatchingRoute() ([3d4b95b](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/3d4b95b))

## [1.2.1](https://github.com/mohatt/gatsby-plugin-advanced-pages/compare/v1.2.0...v1.2.1) (2019-08-12)


### Bug Fixes

* **node:** catch graphql errors thrown by page helpers ([0a783ff](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/0a783ff))

# [1.2.0](https://github.com/mohatt/gatsby-plugin-advanced-pages/compare/v1.1.2...v1.2.0) (2019-08-12)


### Bug Fixes

* **node:** add plugin basePath to generated route map ([8f0cbb9](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/8f0cbb9))


### Features

* **api:** added `navigate()` function that extends gatsby's navigate to allow route names ([757d734](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/757d734))

## [1.1.2](https://github.com/mohatt/gatsby-plugin-advanced-pages/compare/v1.1.1...v1.1.2) (2019-08-12)


### Bug Fixes

* **api:** respect Gatsby's pathPrefix when generating paths ([a2e9f43](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/a2e9f43))

## [1.1.1](https://github.com/mohatt/gatsby-plugin-advanced-pages/compare/v1.1.0...v1.1.1) (2019-08-10)


### Bug Fixes

* **pagination:** removed 'paging-algorithm', added function to calc pages range ([fc710fb](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/fc710fb))

# [1.1.0](https://github.com/mohatt/gatsby-plugin-advanced-pages/compare/v1.0.1...v1.1.0) (2019-08-10)


### Features

* expose compilePath to public api ([2a0e993](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/2a0e993))

## [1.0.1](https://github.com/mohatt/gatsby-plugin-advanced-pages/compare/v1.0.0...v1.0.1) (2019-08-09)


### Bug Fixes

* fixed build and lint scripts ([6e5c2f1](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/6e5c2f1))

# 1.0.0 (2019-08-09)


### Features

* added semantic-release ([bb03b50](https://github.com/mohatt/gatsby-plugin-advanced-pages/commit/bb03b50))
