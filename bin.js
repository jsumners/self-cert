#!/usr/bin/env node
'use strict'

const fs = require('fs')
const path = require('path')
const { default: edtf } = require('edtf')
const sade = require('sade')

const pkg = require('./package.json')
const selfCert = require('./index')
const prog = sade('self-cert')

prog
  .version(pkg.version)

prog
  .command('generate <name> [dest]')
  .describe('Generate a self-signed x.509 certificate and keys.')
  .option('--debug -d', 'Verbose output', false)
  .option('--strength -b', 'Cipher strength in bits', 2048)
  .option('--commonname -n', 'Common name', 'OS hostname')
  .option('--country -c', 'Country name', 'US')
  .option('--state -s', 'State or province name', 'Georgia')
  .option('--locality -l', 'Locality name', 'Atlanta')
  .option('--organization -o', 'Organization name', 'None')
  .option('--ou -u', 'Organization unit', 'example')
  .option('--expires -e', 'ISO-8601 format date (default is 5 years)', undefined)

prog
  .action(generate)

prog.parse(process.argv)

function generate (name, dest, opts) {
  const logger = (opts.debug)
    ? require('pino')({ level: 'trace', prettyPrint: true })
    : Object.create(require('abstract-logging'))
  if (!logger.child) {
    logger.child = () => logger
  }

  logger.debug(opts, 'parsed options')

  const _dest = dest ? path.resolve(dest) : process.cwd()
  logger.debug('output destination: %s', _dest)

  let expires
  if (opts.expires) {
    try {
      expires = edtf(opts.expires)
    } catch (e) {
      logger.error(e)
      console.error('Could not parse specified date (%s): %s', opts.expires, e.message)
      process.exit(1)
    }
  }
  logger.debug('parsed expires date: %j', expires)

  console.log('Generating certificate ...')
  const cert = selfCert({
    logger,
    expires,
    bits: opts.b,
    attrs: {
      commonName: opts.n,
      countryName: opts.c,
      stateName: opts.s,
      locality: opts.l,
      orgName: opts.o,
      shortName: opts.u
    }
  })

  logger.debug(cert, 'certificate')

  const certFile = path.join(_dest, `${name}.cert`)
  const privKeyFile = path.join(_dest, `${name}.key`)
  const pubKeyFile = path.join(_dest, `${name}.pub`)

  const files = [
    { file: certFile, data: cert.certificate },
    { file: privKeyFile, data: cert.privateKey },
    { file: pubKeyFile, data: cert.publicKey }
  ]

  files.forEach((obj) => {
    try {
      fs.writeFileSync(obj.file, obj.data)
      console.log('Wrote file: %s', obj.file)
    } catch (e) {
      logger.error(e)
      console.error('Could not write file %s: %s', obj.file, e.message)
      process.exit(1)
    }
  })
}
