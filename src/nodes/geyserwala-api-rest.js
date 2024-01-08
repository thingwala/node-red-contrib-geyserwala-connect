const http = require('http');

class GeyserwalaConnectorRest {
    constructor(RED, host, port, user, password, pollInterval) {
        this.RED = RED
        this.closed = false
        this.host = host
        this.port = port
        this.user = user
        this.password = password
        this.req = null;
        this.pollInterval = pollInterval
        this.pollTimer = null;
        this.subscriptions = {}
        this.nodes = []
        this.values = {}
        this.backoff = 0
        this.authToken = null;

        this.startPollingWithBackoff();
    }
    hookNode(node) {
        this.nodes.push(node)
        this.updateSubscriptions()
    }
    unhookAllNodes() {
        for (const node of this.nodes) {
            node.status({ fill: "grey", shape: "ring", text: "disconnected" });
            this.nodes = []
            this.subscriptions = {}
        }
    }
    updateSubscriptions() {
        this.subscriptions = {}
        for (const node of this.nodes) {
            const key = node.valueKey
            if (this.subscriptions[key] === undefined) {
                this.subscriptions[key] = []
            }
            this.subscriptions[key].push(node)
        }
    }
    status(blob) {
        for (const node of this.nodes) {
            node.status(blob);
        }
    }
    statusOnline(msg) {
        this.status({ fill: "green", shape: "dot", text: msg || "online" });
    }
    statusOffline(msg) {
        this.status({ fill: "red", shape: "ring", text: msg || "offline" });
    }
    updateValues(blob) {
        for (const key in blob) {
            if (this.values[key] != blob[key]) {
                this.values[key] = blob[key];
                if (!this.subscriptions[key]) {
                    continue
                }
                for (const node of this.subscriptions[key]) {
                    try {
                        node.onValue(blob[key])
                    } catch (error) {
                        this.RED.log.error(`{Geyserwala Connect} Handling messsage: ${error.message} [${key}] "${blob[key]}"`);
                    }
                }
            }
        }
    }
    startPolling(interval) {
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
        }
        this.pollTimer = setTimeout(
            () => {
                if (this.password && !this.authToken) {
                    this.auth();
                }
                else {
                    this.poll();
                }
            },
            interval * 1000
        );
    }
    startPollingAfterSuccess() {
        this.backoff = 0;
        this.startPolling(this.pollInterval);
    }
    startPollingWithBackoff() {
        this.backoff ++;
        let interval = Math.min(this.pollInterval * this.backoff, 60);
        this.startPolling(interval);
    }
    stopPolling() {
        if (this.req) {
            this.req.destroy();
            this.req = null;
        }
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = null;
        }
    }
    auth() {
        this.stopPolling()
        let blob = {username: this.user, password: this.password}
        this.request(
            'POST',
            '/api/session',
            blob,
            (status, blob) => {
                if (status == 200 && blob.success) {
                    this.authToken = blob.token;
                    this.statusOnline('auth success');
                    this.startPollingAfterSuccess();
                    return;
                }
                this.statusOffline('auth failed');
                this.startPollingWithBackoff();
            },
            (error) => {
                this.requestError('Authing', error.message);
            }
        )
    }
    poll() {
        this.stopPolling()
        if (!Object.keys(this.subscriptions).length) {
            return
        }
        this.request(
            'GET',
            '/api/value?f=' + Object.keys(this.subscriptions).join(','),
            undefined,
            (status, blob) => {
                if (status == 200) {
                    this.updateValues(blob);
                    this.statusOnline()
                    this.startPollingAfterSuccess();
                    return;
                } else if (status == 401){
                    this.authToken = null;
                    this.statusOffline('access denied')
                }
                else {
                    this.statusOffline()
                }
                this.startPollingWithBackoff();    
            },
            (error) => {
                this.requestError('Polling', error.message);
            }
        )
    }
    send(key, value) {
        this.stopPolling()
        this.request('PATCH',
            '/api/value',
            { [key]: value },
            (status, blob) => {
                if (status == 200) {
                    this.updateValues(blob)
                    this.statusOnline()
                    this.startPollingAfterSuccess();
                    return
                }
                this.statusOffline()
                this.startPollingWithBackoff();
            },
            (error) => {
                this.requestError(`Patching "${key}"`, error.message);
            }
        )
    }
    request(method, path, blob, success, fail) {
        const http = require('http');

        let requestBody = ''
        if (blob) {
            requestBody = JSON.stringify(blob)
        }

        const options = {
            hostname: this.host,
            port: this.port,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': requestBody.length
            }
        };
        if (this.authToken) {
            options.headers['Authorization'] = `Bearer ${this.authToken}`
        }

        this.req = http.request(options, (res) => {
            let responseBody = [];

            res.on('data', (chunk) => {
                responseBody.push(chunk);
            });

            res.on('end', () => {
                try {
                    let blob = JSON.parse(Buffer.concat(responseBody).toString());
                    this.req = null
                    success(res.statusCode, blob)
                }
                catch(error) {
                    this.RED.log.error(`{Geyserwala Connect} Request failed: ${error.message}`)
                    fail(error);
                }
            });
        });
        this.req.setTimeout(10000, () => {
            this.req.abort();
            fail({message: "Request timed out"});
        });
        this.req.on('abort', () => {
            // console.debug('Request aborted.');
        });
        this.req.on('error', (error) => {
            this.req = null;
            fail(error);
        });

        this.req.write(requestBody);
        this.req.end();
    }
    requestError(action, message) {
        if (this.closed) {
            return
        }
        this.RED.log.error(`{Geyserwala Connect} ${action}: ${message}`);
        this.statusOffline(message);
        this.startPollingWithBackoff();
    }

    close() {
        this.closed = true
        this.stopPolling()
        this.unhookAllNodes();
    }
}

module.exports = GeyserwalaConnectorRest;
