'use strict'

const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const { mkdtempSync, readFileSync, rmSync } = require('node:fs')
const { tmpdir } = require('node:os')
const { join } = require('node:path')
const { test } = require('node:test')

test('generate --debug logs progress without logging the private key', (t) => {
  const dest = mkdtempSync(join(tmpdir(), 'self-cert-'))
  t.after(() => rmSync(dest, { recursive: true, force: true }))

  const bin = join(__dirname, '..', 'bin.js')
  const output = execFileSync(process.execPath, [bin, 'generate', 'example', dest, '--debug', '--strength', '2048'], { encoding: 'utf8' })

  assert.match(output, /"msg":"certificate generated"/)
  assert.doesNotMatch(output, /-----BEGIN (?:RSA )?PRIVATE KEY-----/)
  assert.match(readFileSync(join(dest, 'example.cert'), 'utf8'), /-----BEGIN CERTIFICATE-----/)
  assert.match(readFileSync(join(dest, 'example.key'), 'utf8'), /-----BEGIN RSA PRIVATE KEY-----/)
  assert.match(readFileSync(join(dest, 'example.pub'), 'utf8'), /-----BEGIN PUBLIC KEY-----/)
})
