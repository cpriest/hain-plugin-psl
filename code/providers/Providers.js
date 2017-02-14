'use strict';

//noinspection JSUnusedLocalSymbols
let { indent, reQuery, ResolveLiteral } = require('../utils.js');
let ResolveIcon = require('../util/IconResolver');

let Providers;

module.exports = (() => {
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

		/**
		 * @param {ProviderDefinition} def
		 * @returns {Provider}
		 */
		Create(def) {
			try {
				let ProviderClass = require('./' + def.type);
				let objProvider   = new ProviderClass(def);
				this.set(objProvider.id, objProvider);
				return objProvider;
			} catch(e) {
				if(e.code === 'MODULE_NOT_FOUND')
					e.message = `Unable to find provider module named '${def.type}' specified as type parameter for @${name} provider`;
				throw e;
			}
		}
	}

	if(!Providers)
		Providers = new ProvidersMap();

	class Provider {
		/**
		 * @constructor
		 * @param {ProviderDefinition} def
		 */
		constructor(def) {
			this.def = def;
			this.id  = this.def.name;
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
		 * @param {ProviderDefinition} def
		 */
		constructor(def) {
			super(def);
			this.Matchlist = new Map();

			this.BuildMatchlist();
		}

		/**
		 * Called by the Provider when the dataset has been prepared/collected and is ready for matching
		 */
		IndexingCompleted() {
			psl.indexer.set(this.id,
				[...this.Matchlist]
					.map(([title, item]) => {
						let cmd = ResolveLiteral(this.def.result.cmd, item);

						return {
							id           : cmd,
							primaryText  : ResolveLiteral(this.def.result.title, item),
							secondaryText: ResolveLiteral(this.def.result.desc, item),
							icon         : this.def.result.icon ? ResolveLiteral(this.def.result.icon, item) : ResolveIcon(cmd),
							group        : 'Providers',
						};
					})
			);
		}

		/**
		 * Called to build the matchlist
		 *
		 * @returns {Map}
		 */
		BuildMatchlist() {
			throw new Error("MatchlistProvider.BuildMatchlist() must be over-ridden.");
		}
	}

	Providers.DefaultMaxMatches = 10;

	return { Providers, Provider, MatchlistProvider };
})();
