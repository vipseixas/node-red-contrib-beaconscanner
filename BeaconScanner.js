module.exports = function (RED) {
	const BeaconScanner = require('node-beacon-scanner');
	const scanner = new BeaconScanner();

	let setStatus = (node, scanning, error) => {
		node.status({
			fill: scanning ? "blue" : error ? "red" : "gray",
			shape: "dot",
			text: scanning ? "scanning" : error ? "error: " + error : "stopped"
		});
	};

	let start = (node, scanner) => {
		scanner.startScan().then(() => {
			setStatus(node, true)
			console.log('Scanner started');
		}).catch((error) => {
			setStatus(node, false, error);
			console.error('Error starting scanner', error);
		});
	};

	let stop = (node, scanner) => {
		scanner.stopScan().then(() => {
			setStatus(node, false)
			console.log('Scanner stopped');
		}).catch((error) => {
			setStatus(node, false, error);
			console.error('Error stopping scanner', error);
		});
	}

	function BeaconScanner(n) {
		RED.nodes.createNode(this, n);

		var msg = {};
		var node = this;

		// Status icon
		this.status({
			fill: "grey",
			shape: "dot",
			text: "not scanning"
		});

		this.on("input", function (msg) {
			if (msg.payload === true || msg.payload === "on") {
				start(node, scanner);
			} else {
				stop(node, scanner);
			}
		});

		scanner.onadvertisement = (ad) => {
			msg = {};
			msg.topic = node.topic;
			msg.payload = JSON.stringify(ad);
			node.send(msg);

			console.log(JSON.stringify(ad, null, '  '));
		};

		this.on("close", function () {
			stop(node, scanner);
		});
	}

	// Register the node by name. This must be called before overriding any of the
	// Node functions.
	RED.nodes.registerType("BeaconScanner", BeaconScanner);
}
