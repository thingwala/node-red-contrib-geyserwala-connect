module.exports = function (RED) {
    function _registerNode (node) {
        class GeyserwalaConnectNode {
            constructor (config) {
                RED.nodes.createNode(this, config);

                this.valueKey = node.type ? node.key :  config.valueKey
                this.valueType = node.type ? node.type : {
                    "": String,
                    "Boolean": Boolean,
                    "Number": Number,
                    "String": String,
                }[config.valueType]

                this.status({fill:"grey", shape:"ring", text:"initialising ..."});

                var geyserwalaApi = RED.nodes.getNode(config.geyserwalaApi)
                if (!geyserwalaApi) {
                    setTimeout(()=>{
                        this.status({fill:"grey", shape:"ring", text:"no api connector"});
                    }, 0);
                    return
                }
                this.api = geyserwalaApi.api;
                if (!geyserwalaApi.api) {
                    setTimeout(()=>{
                        this.status({fill:"grey", shape:"ring", text:"invalid api connector"});
                    }, 0);
                    return
                }

                this.on('input', function (message) {
                    try {
                        this.api.send(this.valueKey, message.payload)
                    } catch (error) {
                        this.error(`Sending "${this.valueKey}": ${error.message}`);
                    }
                })

                this.on('close', (done) => {
                    this.api.unhookNode(this);
                    this.api.unsubscribe(node.valueKey);
                    this.api.unregister(this);
                    done()
                });

                this.api.hookNode(this)
            }
            onValue(payload) {
                try {
                    this.send({ topic: this.valueKey, payload: payload })
                } catch (error) {
                    this.error(`Receiving "${valueKey}": ${error.message}`);
                }
            }
        }

        RED.nodes.registerType(`geyserwala-connect-${node.key}`, GeyserwalaConnectNode);
    }

    function registerNode(key, name, type, icon, input) {
        _registerNode({key: key, name: name, type: type, icon: icon, input: input})
    }

    // Icons: https://fontawesome.com/v4/icons/
    registerNode("status", "Status", String, "font-awesome/fa-envelope-o", false)
    registerNode("mode", "Mode", String, "font-awesome/fa-sliders", true)
    registerNode("tank-temp", "Tank Temp", Number, "font-awesome/fa-thermometer-half", false)
    registerNode("element-demand", "Element Demand", Boolean, "font-awesome/fa-fire", false)
    registerNode("external-setpoint", "External Setpoint", Number, "inject.png", true)
    registerNode("external-demand", "External Demand", Number, "serial.png", true)
    registerNode("external-disable", "External Disable", Number, "font-awesome/fa-stop-circle-o", true)
    registerNode("setpoint", "Setpoint", Number, "inject.png", true)
    registerNode("boost-demand", "Boost Demand", Boolean, "font-awesome/fa-power-off", true)
    registerNode("collector-temp", "Collector Temp", Number, "font-awesome/fa-thermometer-half", false)
    registerNode("pump-status", "Pump Status", Boolean, "font-awesome/fa-recycle", false)
    registerNode("custom-io", "Custom", null, "font-awesome/fa-cogs", true)
}
