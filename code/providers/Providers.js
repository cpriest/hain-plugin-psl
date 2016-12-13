'use strict';

//noinspection JSUnusedLocalSymbols
let { log, indent } = require('../utils');

let Providers = new Map();

module.exports = (pluginContext, PluginDir) => {

	class Provider {
		/**
		 * @constructor
		 * @param {ProviderDefinitions} def
		 */
		constructor(def) {
			this.def = def;
			this.id  = this.def.name;

			this.Replacables = [];
		}

		/**
		 * @param {string} query    A pattern match value to query against this provider
		 * @returns {MatchDefinition[]}
		 */
		matches(query) {
			throw new Error("Provider.matches() must be over-ridden.");
		}
	}

	/**
	 * Provides for generic regular expression matching of a query against a predefined "match list"
	 * The this.Matchlist should be a Map who's keys are the list to match the query against.  The returned
	 * results of the matches() function will be the values for all keys that matched the query.
	 */
	class MatchlistProvider extends Provider {

		/**
		 * @constructor
		 * @param {ProviderDefinitions} def
		 */
		constructor(def) {
			super(def);
			this.Matchlist = new Map();
		}

		/**
		 * @param {string} query    A pattern match value to query against this provider
		 * @returns {MatchDefinition[]}
		 */
		matches(query) {
			let matches = Array.from(this.Matchlist.keys()),
				re;

			for(let part of query.split(/\s+/i)) {
				if(part.substr(0, 1) == '-') {
					part = part.substr(1);
					if(part.length) {
						re = new RegExp(part, 'i');

						let subMatches = matches.filter(re.test, re);
						matches        = matches.filter((item) => {
							return subMatches.indexOf(item) == -1;
						})
					}
				} else {
					re      = new RegExp(part, 'i');
					matches = matches.filter(re.test, re);
				}
			}

			let MaxMatches = (this.def.options && this.def.options.MaxMatches) || Providers.DefaultMaxMatches;

			return matches
				.reduce((acc, item) => {
					if(acc.length < MaxMatches)
						acc.push(item);
					return acc;
				}, [])
				.map((match) =>
					this.Matchlist.get(match)
				);
		}
	}
	Providers.Provider          = Provider;
	Providers.MatchlistProvider = MatchlistProvider;

	Providers.DefaultMaxMatches = 10;

	return Providers;
};
