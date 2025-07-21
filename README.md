Geyserwala Connect - Node-RED Integration <!-- omit in toc -->
===

***Automate your Geyserwala Connect from Node-RED***

## Usage

Use these nodes to integrate with your Geyserwala Connect to automate your Geyserwise system from Node-RED. For more detail see the [Integration](https://www.thingwala.com/geyserwala/connect/integration) section in the manual.


# Tools

## Device Discovery using mDNS

The Geyserwala Connect advertises its presence on the network using mDNS, allowing its IP address to be resolved via `<hostname>.local`. Additionally, you can scan for all devices advertising the `_geyserwala._tcp` service.

This [geyserwala-scan.js](./tools/geyserwala-scan.js) script lists all Geyserwala Connect devices found on your network. To run it:
```
wget https://raw.githubusercontent.com/thingwala/node-red-contrib-geyserwala-connect/refs/heads/main/tools/geyserwala-scan.js
npm install dnssd
node ./geyserwala-scan.js
```

# Contribution

Yes please! We want our Geyserwala integration with Node-RED to be the best it can be for everyone. If you have Node-RED development experience or have just noticed a niggly bug, feel free to fork this repo and submit a pull request. Here are the [Node-RED docs](https://nodered.org/docs/).

# License

In the spirit of the Hackers of the [Tech Model Railroad Club](https://en.wikipedia.org/wiki/Tech_Model_Railroad_Club) from the [Massachusetts Institute of Technology](https://en.wikipedia.org/wiki/Massachusetts_Institute_of_Technology), who gave us all so very much to play with. The license is [MIT](./LICENSE).
