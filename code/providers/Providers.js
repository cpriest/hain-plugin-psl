'use strict';

//noinspection JSUnusedLocalSymbols
let { indent, reQuery } = require('../utils.js');

class ProvidersMap extends Map {
	constructor(i) {
		super(i);
		this.Resolvers = new Map();
	}
	get(key) {
		if(this.has(key))
			return super.get(key);

		let p = new Promise((resolve, reject) => {
			this.Resolvers.set(key, resolve);
		});
		super.set(key, p);

		return p;
	}

	/**
	 * Resolves the promise return by get()
	 * @param {Provider} objProvider
	 */
	ResolvePromise(objProvider) {
		this.Resolvers.get(objProvider.id)(objProvider);
	}
}

let Providers = new ProvidersMap();

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

		/**
		 * Called by the Provider when the dataset has been prepared/collected and is ready for matching
		 * 	This fulfills the promise created by the {ProvidersMap} class
		 */
		IndexingCompleted() {
			Providers.ResolvePromise(this);
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

			this.BuildMatchlist();
		}

		/**
		 * @param {string} query    A pattern match value to query against this provider
		 * @returns {MatchDefinition[]}
		 */
		matches(query) {
			/** @type {string[]} */
			let matches = reQuery(query, Array.from(this.Matchlist.keys()));

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


		IndexingCompleted() {
			if(this.Matchlist.size > 0 && this.Replacables.length === 0) {
				this.Replacables = Object.keys(
					this.Matchlist.values()
						.next().value
				);
			}

			return super.IndexingCompleted();
		}

		/**
		 * Called to build the matchlist
		 * @returns {Map}
		 */
		BuildMatchlist() {
			throw new Error("MatchlistProvider.BuildMatchlist() must be over-ridden.");
		}
	}
	Providers.Provider          = Provider;
	Providers.MatchlistProvider = MatchlistProvider;

	Providers.DefaultMaxMatches = 10;

	return Providers;
};
