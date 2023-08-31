const value = require('./value.js');

module.exports = function (RED) {
    value.createNode(RED, 'boost-demand', Boolean, true)
}
