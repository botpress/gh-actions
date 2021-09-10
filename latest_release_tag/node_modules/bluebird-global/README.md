# bluebird-global

Micromodule. Patches `global.Promise` to use the [bluebird library][bluebird-lib] which has [better than native performance for Promises][bluebird-is-faster].

Simply install any version of `bluebird` that you wish the library to use (`bluebird` is a peer dependency) and call:

```js
import bluebird from 'bluebird-global'
```

or

```js
const bluebird = require('bluebird-global')
```

All extra functions that bluebird provides but isn't defined in the ES spec should called like `bluebird.map` instead of like `Promise.map` so that TypeScript and Flow don't complain.

You can simply call `import 'bluebird-global'` or `require('bluebird-global')` if you won't use any bluebird-specific functions.

[bluebird-lib]: https://www.npmjs.com/package/bluebird
[bluebird-is-faster]: https://softwareengineering.stackexchange.com/questions/278778/why-are-native-es6-promises-slower-and-more-memory-intensive-than-bluebird

## License

MIT © [kaatt](https://github.com/kaatt)
