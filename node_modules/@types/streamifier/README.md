# Installation
> `npm install --save @types/streamifier`

# Summary
This package contains type definitions for streamifier (https://github.com/gagle/node-streamifier).

# Details
Files were exported from https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/streamifier.
## [index.d.ts](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/streamifier/index.d.ts)
````ts
/// <reference types="node" />

import { Readable, ReadableOptions } from "stream";

export function createReadStream(object: string | Buffer | Uint8Array, options?: ReadableOptions): Readable;

````

### Additional Details
 * Last updated: Tue, 07 Nov 2023 15:11:36 GMT
 * Dependencies: [@types/node](https://npmjs.com/package/@types/node)

# Credits
These definitions were written by [Idan Attias](https://github.com/idan-at).
