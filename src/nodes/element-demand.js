const value = require('./value.js');

module.exports = function (RED) {
    value.createNode(RED, 'element-demand', Boolean, false)
}
