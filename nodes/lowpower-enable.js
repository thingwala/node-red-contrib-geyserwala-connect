const value = require('./value.js');

module.exports = function (RED) {
    value.registerType(RED, 'lowpower enable', 'lowpower-enable', Boolean, true)
}
