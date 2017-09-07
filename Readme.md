# self-cert

This is a simple library for generating a self-signed x509 keypair and certificate.
I looked at [selfsign](https://npm.im/selfsign) before writing this
library, but it didn't seem to be well maintained and had a hard dependency
on an outdated version of [node-forge](https://npm.im/node-forge). This library
also depends on `node-forge`, but it does so with semver qualifiers such that
newer versions can be specified by the library user.

The keys and certs generated by this library are configured for usage in any
scenario. Also, the certificate Subject Alternate Names (SANs) are populated
with the IP addresses of the present network interfaces as returned by
`os.networkInterfaces()`.

## Example

```js
const selfCert = require('self-cert')
const certDetails = selfCert({
  attrs: {
    stateName: 'Georgia',
    locality: 'Atlanta',
    orgName: 'Acme Widgets',
    shortName: 'widget42'
  },
  expires: new Date('2030-12-31')
})

/* certDetails = {
  privateKey: 'pem formatted string',
  publicKey: 'pem formatted string',
  certificate: 'pem formatted string'
} */
```

## Options

```js
{
  attrs: {
    commonName: '', // Default: os.hostname()
    countryName: '', // Default: 'US'
    stateName: '', // Default: 'Georgia'
    locality: '', // Default: 'Atlanta'
    orgName: '', // Default: 'None'
    shortName: '' // Default: 'example'
  },
  bits: 2048, // Default: 2048
  expires: new Date(), // Default: 5 years
  logger: {}
}
```

Notes:

+ `commonName` is used for the first SAN.
+ `stateName` maps to `stateOrProvinceName`.
+ `logger` should be a Log4j compliant logger; [Pino](http://getpino.io/) is
recommended. This library logs some progress messages at the `debug` level.

## License

[MIT License](http://jsumners.mit-license.org/)
