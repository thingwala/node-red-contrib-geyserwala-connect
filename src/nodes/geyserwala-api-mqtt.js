class GeyserwalaConnectorMqtt {
    constructor(RED, broker, pubQos, retain, template, mac, ip, hostname) {
        this.RED = RED
        this.broker = broker
        this.pubQos = pubQos
        this.retain = retain
        this.template = template.replace('%mac%', mac || 'MAC').replace('%ip%', ip || 'IP').replace('%hostname%', hostname || 'HOSTNAME')
        this.nodes = []
        this.subscriptions = {}

        if (this.broker && !this.broker.client) {
            this.broker.connect(() => {
                this.setupBrokerEvents()
            })
        } else {
            this.setupBrokerEvents();
        }
    }
    setupBrokerEvents() {
        if (!this.broker || !this.broker.client) {
            setTimeout(()=>{
                this.status({ fill: "grey", shape: "ring", text: "invalid mqtt broker" });
            }, 0);
            this.RED.log.error(`{Geyserwala Connect} No MQTT broker configuration found!`);
            return
        }

        this.status({ fill: "green", shape: "dot", text: "connected" });
        for (const topic in this.subscriptions) {
            this.subscribeTopic(topic)
        }

        this.broker.client.on("message", (topic, payload) => {
            if (!this.subscriptions[topic]) {
                return
            }
            const msg = payload.toString()
            for (const node of this.subscriptions[topic]) {
                try {
                    let value
                    if (node.valueType === Number) {
                        value = parseInt(msg)
                    } else if (node.valueType === Boolean) {
                        value = msg == 'ON'
                    } else {
                        value = String(msg)
                    }
                    node.onValue(value)
                } catch (error) {
                    this.RED.log.error(`{Geyserwala Connect} Handling messsage: ${error.message} [${topic}] "${msg}"`);
                }
            }
        });

        this.broker.client.on("reconnect", () => {
            this.status({ fill: "yellow", shape: "ring", text: "reconnecting" });
        });

        this.broker.client.on("offline", () => {
            this.status({ fill: "red", shape: "ring", text: "offline" });
        });

        this.broker.client.on("close", () => {
            this.status({ fill: "red", shape: "ring", text: "disconnected" });
        });

        this.broker.client.on("error", (error) => {
            this.status({ fill: "red", shape: "ring", text: "error" });
            this.RED.log.error(`{Geyserwala Connect} MQTT error: ${error}`);
        });
    }
    subTopic(key) {
        return this.template.replace('%prefix%', 'stat') + `/${key}`;
    }
    pubTopic(key) {
        return this.template.replace('%prefix%', 'cmnd') + `/${key}`;
    }
    subscribeTopic(topic) {
        this.broker.client.subscribe(topic, (err) => {
            if (err) {
                this.RED.log.error(`{Geyserwala Connect} Subscribing to topic: ${topic}: ${err}`);
            }
        });
    }
    unsubscribeTopic(topic) {
        this.broker.client.unsubscribe(topic)
    }
    hookNode(node) {
        this.nodes.push(node)
        this.updateSubscriptions()
    }
    unhookAllNodes() {
        for (const node in this.nodes) {
            node.status({ fill: "grey", shape: "ring", text: "disconnected" });
            this.nodes = []
            for(const topic in this.subscriptions) {
                this.unsubscribe(topic)
            }
            this.subscriptions = {}
        }
    }
    updateSubscriptions() {
        this.subscriptions = {}
        for (const node of this.nodes) {
            const topic = this.subTopic(node.valueKey)
            if (this.subscriptions[topic] === undefined) {
                this.subscriptions[topic] = []
            }
            this.subscriptions[topic].push(node)
        }
    }
    status(blob) {
        for (const node of this.nodes) {
            node.status(blob)
        }
    }
    send(key, value) {
        let payload
        if (typeof value === 'boolean') {
            payload = value ? "ON" : "OFF"
        } else {
            payload = String(value)
        }
        const options = {
            qos: this.pubQos,
            retain: this.retain,
        };
        this.broker.client.publish(this.pubTopic(key), payload, options, (err) => {
            if (err) {
                this.RED.log.error(`{Geyserwala Connect} Publishing to MQTT: ${err}`);
            }
        });
    }
    close() {
        this.unhookAllNodes()
        this.broker = null
    }
}

module.exports = GeyserwalaConnectorMqtt;
