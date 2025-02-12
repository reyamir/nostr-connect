import browser from "webextension-polyfill";

const EXTENSION = "nostrconnect";

// inject the script that will provide window.nostr
const script = document.createElement("script");
script.setAttribute("async", "false");
script.setAttribute("type", "text/javascript");
script.setAttribute("src", browser.runtime.getURL("nostr-provider.js"));
document.head.appendChild(script);

// listen for messages from that script
window.addEventListener("message", async (message) => {
	if (message.source !== window) return;
	if (!message.data) return;
	if (!message.data.params) return;
	if (message.data.ext !== EXTENSION) return;

	// pass on to background
	let response;

	try {
		response = await browser.runtime.sendMessage({
			type: message.data.type,
			params: message.data.params,
			host: location.host,
		});
	} catch (error) {
		response = { error };
	}

	// return response
	window.postMessage(
		{ id: message.data.id, ext: EXTENSION, response },
		message.origin,
	);
});
