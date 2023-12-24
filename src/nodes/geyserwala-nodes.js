module.exports = function (RED) {
    function createNode (nodeKey) {
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

            const valueKey = config.valueKey
            const valueType = {
                "": Number,
                "Boolean": Boolean,
                "Number": Number,
                "String": String,
            }[config.valueType]

            this.api.subscribe(valueKey, valueType, (payload) => {
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

            this.on('input', function (message) {
                try {
                    this.api.send(valueKey, message.payload)
                } catch (error) {
                    RED.log.error(`{Geyserwala Connect} Sending: ${error.message}`);
                }
            })
            this.on('close', function () {
                this.api.unregister(this);
            });
        }

        RED.nodes.registerType(`geyserwala-connect-${nodeKey}`, Node);
    }

    createNode('status');
    createNode('mode');

    createNode('tank-temp');
    createNode('element-demand');

    createNode('external-setpoint');
    createNode('external-demand');
    createNode('external-disable');

    createNode('setpoint');
    createNode('boost-demand');

    createNode('collector-temp');
    createNode('pump-status');

    createNode('custom-io');
}
