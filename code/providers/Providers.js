'use strict';

module.exports = (() => {
	let Providers = new Map();

	class Provider {
		/**
		 * @constructor
		 * @param {ProviderDefinitions} def
		 */
		constructor(def) {
			this.def = def;
		}

		/**
		 * @param {string} query    A pattern match value to query against this provider
		 * @returns {MatchDefinition[]}
		 */
		matches(query) {
			throw new Error("Provider.matches() must be over-ridden.");
		}
	}
	Providers.Provider = Provider;

	return Providers;
})();
