'use strict';

//noinspection JSUnusedLocalSymbols
let { log, indent } = require('./utils.js');

module.exports = (pluginContext, PluginDir) => {
	let localStorage = pluginContext.localStorage;

	class RecentItems {
		constructor(name) {
			this.LocalStorageName = `PSL_${name}_RecentItems`;

			this.items = localStorage.getItemSync(this.LocalStorageName) || [];
		}

		get length() { return this.items.length; }

		shift() {
			this.saveDeferred();
			return this.items.shift();
		}
		unshift(item) {
			const idx = this.items.indexOf(item);
			if(idx >= 0)
				this.items.splice(idx, 1);

			this.items.unshift(item);
			if(this.items.length > 50)
				this.items.pop();

			this.saveDeferred();
		}

		indexOf(item) {
			return this.items.indexOf(item);
		}

		saveDeferred() {
			if(this.SaveTimeoutID)
				clearTimeout(this.SaveTimeoutID);
			this.SaveTimeoutID = setTimeout(() => {
				delete this.SaveTimeoutID;
				localStorage.setItemSync(this.LocalStorageName, this.items);
			}, 500);
		}
	}

	return RecentItems;
};
