module.exports = function (RED) {
	const BS = require('node-beacon-scanner');
	const scanner = new BS();

	let setStatus = (node, scanning, error) => {
		node.status({
			fill: scanning ? "blue" : error ? "red" : "grey",
			shape: scanning ? "dot" : "ring",
			text: scanning ? "scanning" : error ? "error" : "stopped"
		});

		node.scanning = scanning;
	};

	let start = (node, scanner) => {
		if (node.scanning) return;

		scanner.startScan().then(() => {
			setStatus(node, true)
			node.log('Scanner started');
		}).catch((error) => {
			setStatus(node, false, error);
			node.error('Error starting scanner', { payload: {}, error: error });
		});
	};

	let stop = (node, scanner) => {
		if (!node.scanning) return;

		scanner.stopScan();
		setStatus(node, false)
		node.log('Scanner stopped');
	}

	function BeaconScanner(config) {
		RED.nodes.createNode(this, config);

		let node = this;

		// Initial status
		setStatus(node, false);

		// Read input
		node.on("input", function (msg) {
			if (msg.payload === true || msg.payload === 1 || msg.payload === "on") {
				start(node, scanner);
			} else {
				stop(node, scanner);
			}
		});

		// Send message when receive an advertisement
		scanner.onadvertisement = (data) => {
			msg = {};
			msg.topic = node.topic;
			msg.payload = JSON.stringify(data);
			node.send(msg);
			node.trace('Sending message payload', msg.payload);
		};

		// Stop scanning on close
		node.on("close", function () {
			stop(node, scanner);
		});
	}

	RED.nodes.registerType("BeaconScanner", BeaconScanner);
}
