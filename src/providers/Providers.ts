'use strict';

//noinspection JSUnusedLocalSymbols
let { indent, reQuery } = require('../utils.ts');

type ProviderResolver = PromiseResolver<Provider | MatchlistProvider>;
type ProviderPromise = Promise< Provider | MatchlistProvider >;

class ProvidersMap extends Map<string, Provider |MatchlistProvider | ProviderPromise > {
	Resolvers: Map<string, ProviderResolver >;
	DefaultMaxMatches: number;

	constructor(i?) {
		super(i);
		this.Resolvers = new Map();
	}

	get(key:string): ProviderPromise | Provider | MatchlistProvider {
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
	 */
	ResolvePromise(objProvider:Provider) {
		this.Resolvers.get(objProvider.id)(objProvider);
	}
}

export let Providers = new ProvidersMap();

export class Provider {
	def: ProviderDefinitions;
	id: string;

	constructor(def:ProviderDefinitions) {
		this.def = def;
		this.id  = this.def.name;
	}

	matches(query:string):MatchDefinition {
		throw new Error("Provider.matches() must be over-ridden.");
	}

	/**
	 * Called by the Provider when the dataset has been prepared/collected and is ready for matching
	 * 	This fulfills the promise created by the {ProvidersMap} class
	 */
	IndexingCompleted():void {
		Providers.ResolvePromise(this);
	}
}

/**
 * Provides for generic regular expression matching of a query against a predefined "match list"
 * The this.Matchlist should be a Map who's keys are the list to match the query against.  The returned
 * results of the matches() function will be the values for all keys that matched the query.
 */
export class MatchlistProvider extends Provider {
	Matchlist: Map<string,{}>;

	/**
	 * @constructor
	 * @param {} def
	 */
	constructor(def: ProviderDefinitions) {
		super(def);
		this.Matchlist = new Map();

		this.BuildMatchlist();
	}

	matches(query:string): MatchDefinition {
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

	/**
	 * Called to build the matchlist
	 */
	BuildMatchlist():Map<any,any> {
		throw new Error("MatchlistProvider.BuildMatchlist() must be over-ridden.");
	}
}
// Providers.Provider          = Provider;
// Providers.MatchlistProvider = MatchlistProvider;

Providers.DefaultMaxMatches = 10;
