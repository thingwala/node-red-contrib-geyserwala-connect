

const dnssd = require('dnssd');

console.log('🔍 Scanning for _geyserwala._tcp services...');

const browser = new dnssd.Browser(dnssd.tcp('geyserwala'));

browser.on('serviceUp', service => {
  console.log(`\n📡 Service: ${service.name}`);
  console.log(`  Host   : ${service.host}`);
  console.log(`  Port   : ${service.port}`);
  console.log(`  IPs    : ${service.addresses.join(', ')}`);
  console.log(`  TXT    :`, service.txt || {});
});

browser.on('error', err => {
  console.error('❌ Error:', err);
});

browser.start();
