module.exports = function (RED) {
    function createNode (valueKey, type, input) {
        function Node(config) {
            RED.nodes.createNode(this, config);

            var geyserwalaApi = RED.nodes.getNode(config.geyserwalaApi)
            if (!geyserwalaApi) {
                this.error('Connector not configured')
                return
            }
            this.api = geyserwalaApi.api;
            if (!geyserwalaApi.api) {
                this.error('Invalid Connector')
                return
            }

            this.api.registerNode(this)

            this.api.subscribe(valueKey, type, (payload) => {
                try {
                    this.send({ topic: valueKey, payload: payload })
                } catch (error) {
                    RED.log.error(`{Geyserwala Connect} Outputing: ${error.message}`);
                }
            });
            this.on('close', () => {
                this.api.unsubscribe(valueKey);
                this.api.unregister(this);
            });

            if (input) {
                this.on('input', function (message) {
                    try {
                        this.api.send(valueKey, message.payload)
                    } catch (error) {
                        RED.log.error(`{Geyserwala Connect} Sending: ${error.message}`);
                    }
                })
            }
            this.on('close', function () {
                this.api.unregister(this);
            });
        }

        RED.nodes.registerType(`geyserwala-connect-${valueKey}`, Node);
    }

    createNode('tank-temp', Number, false);
    createNode('element-demand', Boolean, false);

    createNode('lowpower-enable', Boolean, true);
    createNode('external-demand', Boolean, true);
    createNode('external-setpoint', Number, true);

    createNode('status', String, false);
    createNode('mode', String, true);
    createNode('setpoint', Number, true);
    createNode('boost-demand', Boolean, true);

    createNode('collector-temp', Number, false);
    createNode('pump-status', Boolean, false);
}
