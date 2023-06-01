## [1.14.1](https://github.com/Salable/cli/compare/v1.14.0...v1.14.1) (2023-06-01)


### Bug Fixes

* auth command failing ([aa91c2e](https://github.com/Salable/cli/commit/aa91c2e80d7a436a391fb86f418b73b0caf41eda))

# [1.14.0](https://github.com/Salable/cli/compare/v1.13.0...v1.14.0) (2023-04-24)


### Features

* added cancel and list subscription commands ([7291f74](https://github.com/Salable/cli/commit/7291f7451d1e16ee44f9adbc3e109d8ec0269d6b))
* updated auth flow to not use web ui ([3ff3c4c](https://github.com/Salable/cli/commit/3ff3c4c0e1247c7a0942be99ff45670cca9637f7))
* updated auth flow to work with preview deployments ([3dd9d2f](https://github.com/Salable/cli/commit/3dd9d2fb1600bd179d72236c2cef1fe57cea0d12))

# [1.13.0](https://github.com/Salable/cli/compare/v1.12.0...v1.13.0) (2023-04-21)

### Features

- added cancel and list subscription commands ([19f1d58](https://github.com/Salable/cli/commit/19f1d5834760e8ebef0bde280b5d1b249f31fae5))

# [1.12.0](https://github.com/Salable/cli/compare/v1.11.0...v1.12.0) (2023-02-21)

### Features

- sign in response page design updates ([d8379d5](https://github.com/Salable/cli/commit/d8379d55dbaea56a3604a1d0157ad126e1b0bd19))

# [1.11.0](https://github.com/Salable/cli/compare/v1.10.0...v1.11.0) (2023-02-21)

### Features

- updated generated trello template ([030919a](https://github.com/Salable/cli/commit/030919ab33398f49310c81502dbf4f3a1f61b97f))

# [1.10.0](https://github.com/Salable/cli/compare/v1.9.0...v1.10.0) (2023-01-11)

### Features

- **#12:** added create license command ([4ab3783](https://github.com/Salable/cli/commit/4ab378399cfea7809dd3064d32be5e230981a2a5)), closes [#12](https://github.com/Salable/cli/issues/12)
- **#12:** added list licenses command ([918e0f4](https://github.com/Salable/cli/commit/918e0f4b5ce7312ee60c8cba304fa33e45c6f8be)), closes [#12](https://github.com/Salable/cli/issues/12)
- **#12:** added suspend license command ([71962d5](https://github.com/Salable/cli/commit/71962d5e92c90c900636706be12c6dee5e81f0e8)), closes [#12](https://github.com/Salable/cli/issues/12)
- **#12:** added update license command ([75d4200](https://github.com/Salable/cli/commit/75d4200be52b5ed119d6b39b58d35e0e3506bebd)), closes [#12](https://github.com/Salable/cli/issues/12)

# [1.9.0](https://github.com/Salable/cli/compare/v1.8.0...v1.9.0) (2023-01-09)

### Bug Fixes

- **#13:** fixed issues with refreshing token ([0477a24](https://github.com/Salable/cli/commit/0477a24bfd6f9fa22c225fe36b91515c5d879408))
- **#13:** resolved issue with update plan command ([b315a17](https://github.com/Salable/cli/commit/b315a170d29d700849c4e741ce88aa1c48d725f9))

### Features

- **#13:** added create plan command ([efa43f3](https://github.com/Salable/cli/commit/efa43f344c969bf0277f28890685669f07d82797)), closes [#13](https://github.com/Salable/cli/issues/13)
- **#13:** added deprecate plan command ([a7f3e44](https://github.com/Salable/cli/commit/a7f3e447a17e3012a9034d5dc3636640be4ff1fd)), closes [#13](https://github.com/Salable/cli/issues/13)
- **#13:** added update plan command ([ceff187](https://github.com/Salable/cli/commit/ceff18710483cee3a589773d7af97cacc80ee542)), closes [#13](https://github.com/Salable/cli/issues/13)

# [1.8.0](https://github.com/Salable/cli/compare/v1.7.0...v1.8.0) (2023-01-03)

### Bug Fixes

- **#14:** fixed help menu not displaying ([4b07523](https://github.com/Salable/cli/commit/4b07523be8698aa16961c780cbeb9c0cc9c8b44d))
- **#14:** fixed looping plan skips commands issue ([209d046](https://github.com/Salable/cli/commit/209d04606920b9e92ea5d3e7ded4fcc6aaf4cf40))
- **#14:** updated refresh token logic ([dcaa652](https://github.com/Salable/cli/commit/dcaa65274887fd74fffaaa3595e58a27b2c26d45)), closes [#14](https://github.com/Salable/cli/issues/14)

### Features

- **#14:** added ability to add features to existing plans ([8af2b19](https://github.com/Salable/cli/commit/8af2b19739b4ddeeaca32641c135bd7ce75f84aa)), closes [#14](https://github.com/Salable/cli/issues/14)
- **#14:** added create feature command ([28bd4e9](https://github.com/Salable/cli/commit/28bd4e9e7c00a399bfd98febe5a4d08a3155d1e4)), closes [#14](https://github.com/Salable/cli/issues/14)
- **#14:** added list plans command ([2894119](https://github.com/Salable/cli/commit/2894119b80a96a6376852756676a646c42e28b5a)), closes [#14](https://github.com/Salable/cli/issues/14)
- **#14:** added list/features command ([346682f](https://github.com/Salable/cli/commit/346682f9009ab7da389d2d238efeb9c66539bb6c)), closes [#14](https://github.com/Salable/cli/issues/14)
- **#14:** added update feature command ([a70a9ce](https://github.com/Salable/cli/commit/a70a9cebb7bc0c990e16bd163dccbdfdcaf716c1)), closes [#14](https://github.com/Salable/cli/issues/14)
- **#14:** added validation to questions where appropriate ([b8cf6fd](https://github.com/Salable/cli/commit/b8cf6fd95520d4083dff67cc0939d1013d27e811)), closes [#14](https://github.com/Salable/cli/issues/14)
- **#14:** updated builder for create feature ([4c0a271](https://github.com/Salable/cli/commit/4c0a27127fde041fb3a6d5be4549aa4e9ebc6da6)), closes [#14](https://github.com/Salable/cli/issues/14)

# [1.7.0](https://github.com/Salable/cli/compare/v1.6.0...v1.7.0) (2022-12-13)

### Features

- **#14:** added capability commands and refactor ([802a32c](https://github.com/Salable/cli/commit/802a32c5a1089d05534d447ae96c625dc9ae2fdf)), closes [#14](https://github.com/Salable/cli/issues/14)

# [1.6.0](https://github.com/Salable/cli/compare/v1.5.1...v1.6.0) (2022-12-05)

### Features

- added create, list, deprecate api-key commands ([88e75fb](https://github.com/Salable/cli/commit/88e75fb00346d7b2c79bfab1f735c5d2cc4e7aed))
- added logic to install packages in generated apps ([a788418](https://github.com/Salable/cli/commit/a78841846d8f8fbe794a8516ceb53e09090234c6))

## [1.5.1](https://github.com/Salable/cli/compare/v1.5.0...v1.5.1) (2022-11-30)

### Bug Fixes

- retry command on invalid token not returning data ([d5e6239](https://github.com/Salable/cli/commit/d5e6239d02b64573202f36b20c6da254f6bed72f))

# [1.5.0](https://github.com/Salable/cli/compare/v1.4.0...v1.5.0) (2022-11-18)

### Features

- added the deprecate-product command ([4b7e9a1](https://github.com/Salable/cli/commit/4b7e9a16de235fc80b553d32e4493b80ba4910a0))

# [1.4.0](https://github.com/Salable/cli/compare/v1.3.0...v1.4.0) (2022-11-18)

### Features

- added create-product command ([ae367d4](https://github.com/Salable/cli/commit/ae367d407b9775b0d934af4b7286d42247a5d406))
- added showDeprecated flag to list-products command ([3ad8a9c](https://github.com/Salable/cli/commit/3ad8a9c8a70f7198a24b7afc2d816ab82767d32f))

# [1.3.0](https://github.com/Salable/cli/compare/v1.2.0...v1.3.0) (2022-11-16)

### Features

- added list-products command ([0a8af06](https://github.com/Salable/cli/commit/0a8af06db6267d4881f02aa058338bbf3ab5ad64))

# [1.2.0](https://github.com/Salable/cli/compare/v1.1.2...v1.2.0) (2022-11-16)

### Features

- added auth command and reorganised cli structure ([549eee1](https://github.com/Salable/cli/commit/549eee1c3d3867234354c8816398272ab02d474c))
- refactored auth command and added auth validation ([bb79f15](https://github.com/Salable/cli/commit/bb79f15fbcadc579ab1f52edb06168e9bf5600f5))

## [1.1.2](https://github.com/Salable/cli/compare/v1.1.1...v1.1.2) (2022-11-09)

### Bug Fixes

- added templates into files property ([4daabcd](https://github.com/Salable/cli/commit/4daabcd90eb979589012932d0e61a698b27830f2))

## [1.1.1](https://github.com/Salable/cli/compare/v1.1.0...v1.1.1) (2022-11-09)

### Bug Fixes

- updated scripts to build prior to version ([0af7fb3](https://github.com/Salable/cli/commit/0af7fb39af53d2b818d8e2e407a01675de87ce90))

# [1.1.0](https://github.com/Salable/cli/compare/v1.0.0...v1.1.0) (2022-11-09)

### Features

- added the salable global cli command ([02f1835](https://github.com/Salable/cli/commit/02f1835a0dad8acad741071026999257f9f7f96d))

# 1.0.0 (2022-11-03)

### Features

- initial commit ([dc50ac5](https://github.com/Salable/cli/commit/dc50ac5903808481fdec3b88348f5dc9a912e2f7))
