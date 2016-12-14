'use strict';

//noinspection JSUnusedLocalSymbols
let { log, indent } = require('./utils.js');

module.exports = (pluginContext, PluginDir) => {
	let localStorage = pluginContext.localStorage;

	class RecentItems {
		constructor(name) {
			this.LocalStorageName = `PSL_${name}_RecentItems`;

			// log(`RecentItems(${this.LocalStorageName}) construct`);
			this.items = localStorage.getItemSync(this.LocalStorageName) || [];
		}

		get length() { return this.items.length; }

		shift() {
			// log(`RecentItems(${this.LocalStorageName}).shift()`);
			this.saveDeferred();
			return this.items.shift();
		}
		unshift(item) {
			// log(`RecentItems(${this.LocalStorageName}).unshift()`);

			const idx = this.items.indexOf(item);
			if(idx >= 0)
				this.items.splice(idx, 1);

			this.items.unshift(item);
			if(this.items.length > 50)
				this.items.pop();

			this.saveDeferred();
		}

		saveDeferred() {
			if(this.SaveTimeoutID)
				clearTimeout(this.SaveTimeoutID);
			this.SaveTimeoutID = setTimeout(() => {
				log(`RecentItems(${this.LocalStorageName}).save()ing...`);
				log(this.items);
				delete this.SaveTimeoutID;
				localStorage.setItemSync(this.LocalStorageName, this.items);
			}, 500);
		}
	}

	return RecentItems;
};
