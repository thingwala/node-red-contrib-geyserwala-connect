const value = require('./value.js');

module.exports = function (RED) {
    value.registerType(RED, 'boost demand', 'boost-demand', Boolean, true)
}
