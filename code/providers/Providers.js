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
				if(e.code === 'MODULE_NOT_FOUND' && e.message.includes(def.type))
					throw new Error(`Unable to find provider module named '${def.type}' specified as type parameter for ${def.type} provider`);
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
	 *
	 * @property {MatchlistProviderDefinition} def
	 */
	class MatchlistProvider extends Provider {
		/**
		 * @constructor
		 * @param {MatchlistProviderDefinition} def
		 */
		constructor(def) {
			super(def);

			this.Rebuild();
			setInterval(x => this.Rebuild(), ((this.def.options && this.def.options.refresh) || 15) * 60 * 1000);
		}

		/**
		 * Called to rebuild the result set and populate the hain indexer with the results
		 */
		Rebuild() {
			this.BuildMatchlist()
				.then((AllItems) => {
					if(this.def.log && this.def.log.results && AllItems.length > 0)
						psl.log(AllItems);

					let [IncludedItems, ExcludedItems] = this.FilterResultsWithRules(AllItems, this.def.rules || []);

					let IncludedHainItems = this.TransformItems(IncludedItems);

					if(this.def.log) {
						if(this.def.log.included) {
							psl.log(`Included Items (${this.def.name}):\n${indent(
								IncludedHainItems.pluck('primaryText')
									.sort()
									.join('\n'))}`);
						}
						if(this.def.log.excluded) {
							let ExcludedHainItems = this.TransformItems(ExcludedItems);
							psl.log(`Excluded Items (${this.def.name}):\n${indent(
								ExcludedHainItems.pluck('primaryText')
									.sort()
									.join('\n'))}`);
						}
					}
					psl.indexer.set(this.def.name, IncludedHainItems);
					psl.log(`Included ${IncludedItems.length}/${AllItems.length} items for ${this.def.name}`);
				}).catch((err) => {
					if(err instanceof Error) {
						psl.log(err.stack);
					} else {
						psl.log(err);
					}
					psl.toast.enqueue(`Failed building resultset for ${this.constructor.name}.`);
				});

		}

		/**
		 * @param Results {object[]}
		 * @param rules {PropertyFilterRule[]}
		 *
		 * @returns {[object[],object[]]}
		 */
		FilterResultsWithRules(Results, rules) {
			let included = [],
				excluded = [];

			if(rules.length === 0)
				return [Results, excluded];

			for(let item of Results) {
				let include = true;

				for(let rule of rules) {
					if(rule.exclude) {
						if(this.RuleMatches(rule.exclude, item))
							include = false;
					} else if(rule.include) {
						if(this.RuleMatches(rule.include, item))
							include = true;
					}
				}
				(include
					? included
					: excluded).push(item);
			}
			return [included, excluded];
		}

		/**
		 * Returns true if the given rule matches the item
		 * @param {object} rule
		 * @param {object} item
		 */
		RuleMatches(rule, item) {
			for(let key of Object.keys(rule)) {
				if(item[key] === undefined)
					continue;

				if(typeof item[key] === 'string') {
					if(!(new RegExp(rule[key], 'i')).test(item[key]))
						return false;
				} else {
					if(item[key] !== rule[key])
						return false;
				}
			}
			return true;
		}

		/**
		 *
		 * @param items {object[]}
		 * @returns {hain.IndexedResult[]}
		 */
		TransformItems(items) {
			return items.
				map((item) => {
					let cmd = ResolveLiteral(this.def.result.cmd, item);

					return {
						id           : cmd,
						primaryText  : ResolveLiteral(this.def.result.title, item),
						secondaryText: ResolveLiteral(this.def.result.desc, item),
						icon         : this.def.result.icon ? ResolveLiteral(this.def.result.icon, item) : ResolveIcon(cmd),
						group        : 'Providers',
					};
				});
		}

		/**
		 * Called to build the matchlist
		 *
		 * @returns {Promise<object[]>}
		 */
		BuildMatchlist() {
			throw new Error("MatchlistProvider.BuildMatchlist() must be over-ridden.");
		}
	}

	return { Providers, Provider, MatchlistProvider };
})();
