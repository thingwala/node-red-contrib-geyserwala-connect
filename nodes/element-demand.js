const value = require('./value.js');

module.exports = function (RED) {
    value.registerType(RED, 'element demand', 'element-demand', Boolean, false)
}
