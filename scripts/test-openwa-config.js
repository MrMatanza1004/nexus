#!/usr/bin/env node

// test-openwa-config.js – quick sanity check that the OpenWA client can be built.
// Run with:  node scripts/test-openwa-config.js

const path = require('path')
const modulePath = path.resolve(__dirname, '..', 'src', 'integrations', 'openwa.js')

// Dynamically import the module (supports both CommonJS & ESM transpilation)
let getOpenwaClient
try {
  const mod = require(modulePath)
  getOpenwaClient = mod.getOpenwaClient
} catch (e) {
  console.error('Failed to load OpenWA integration module:', e.message)
  process.exit(1)
}

const client = getOpenwaClient()
if (!client) {
  console.error('OpenWA client not configured – check OPENWA_BASE_URL and OPENWA_MASTER_KEY')
  process.exit(1)
}

console.log('✅ OpenWA client configured')
console.log('   baseUrl   :', client.baseUrl)
console.log('   masterKey :', client.masterKey.replace(/./g, '*')) // mask key

process.exit(0)
