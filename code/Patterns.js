'use strict';

//noinspection JSUnusedLocalSymbols
let { indent, ExpandEnvVars, EscapeMatchesForURNs, ResolveLiteral } = require('./utils.js');
const ResolveIcon                                                   = require('./util/IconResolver');

let Patterns = new Map();

module.exports = (() => {
	/** @type {ProvidersMap} */
	let Providers   = require('./providers/Providers.js');

	class Pattern {
		/**
		 * @constructor
		 * @param {PatternDefinition} def
		 */
		constructor(def) {
			this.def = def;
			this.id  = this.GetSanitizedID();

			this.ReplacableKeys = ['cmd', 'title', 'desc', 'icon'];

			for(let x of this.ReplacableKeys) {
				// Expand Environment Variables
				this.def[x] = ExpandEnvVars(this.def[x]);
			}

			this.pattern = this.def.pattern;

			this.re = new RegExp(this.pattern, 'i');
		}

		/**
		 * Checks the query for a match against this pattern
		 * @param {string} query
		 * @returns {MatchDefinition[]}
		 */
		matches(query) {
			if(!this.re.test(query))
				return [];

			return [{
				cmd  : ResolveLiteral(query.replace(this.re, EscapeMatchesForURNs.bind(this.def.cmd))),
				title: ResolveLiteral(query.replace(this.re, this.def.title)),
				desc : ResolveLiteral(query.replace(this.re, this.def.desc)),
				icon : this.def.icon
					? ResolveLiteral(query.replace(this.re, this.def.icon))
					: ResolveIcon(this.def.cmd.replace('/\$\d+/', '')),
			}];
		}

		GetSanitizedID() {
			let pat = this.def.pattern
				.replace(/\(\??:?([^)]+)\)/g, '{$1}')	// Translate Captures to { }
				.replace(/[?:\s]+/g, '')				// Strip Characters
				.replace(/[|]+/g, ',');					// Translate | to ,
			let cmd = this.def.cmd
				.replace(/([\w]+:\/\/|www.)/g, '')		// Strip URI type
				.replace(/[^\w\d%.]+/g, '_');			// Translate non alpha-numeric & % to _

			return `#${pat}#~${cmd}`
				.replace(/[\\/:*?<>|]+/g, '_');		// Finally _ any illegal file characters (windows) from line
		}
	}

	class ProviderPattern extends Pattern {
		/**
		 * @constructor
		 * @param {PatternDefinition} def
		 */
		constructor(def) {
			super(def);
			this.ProviderNames = [];

			// Locate and replace any @providerNames with (.+)
			this.pattern =
				def.pattern
					.replace(/\(@(\w+?)\)/g,
						(p0, p1) => {
							this.ProviderNames.push(p1);
							return '(.+)';
						}
					);

			if(this.ProviderNames.length !== 1) {
				if(this.ProviderNames.length === 0)
					psl.log('WARNING: No providers identified for pattern %s, provider names look like this: @sshFiles', this.def.pattern);
				else if(this.ProviderNames.length > 1)
					psl.log('WARNING: Providers currently support a single provider per pattern, if you have a use case for more than one provider please let me know.');
				return;
			}

			this.re = new RegExp(this.pattern, 'i');

			Providers.get(this.ProviderNames[0])
				.then((objProvider) => {
					psl.indexer.set(objProvider.id,
						[...objProvider.Matchlist]
							.map(([title, item]) => {
								let cmd = ResolveLiteral(this.def.cmd, item);

								return {
									id           : cmd,
									primaryText  : ResolveLiteral(this.def.title, item),
									secondaryText: ResolveLiteral(this.def.desc, item),
									icon         : this.def.icon ? ResolveLiteral(this.def.icon, item) : ResolveIcon(cmd),
									group        : 'Providers',
								};
							})
					);
				});
		}

		/**
		 * Checks the query for a match against this pattern
		 * @param {string} query
		 * @returns {MatchDefinition[]}
		 */
		matches(query) {
			// No longer being used as providers are sent straight into hain via the Indexer API
			// if(!this.objProvider || !this.re.test(query))
				return [];
			//
			// let matches = this.re.exec(query);
			// let index   = 1;
			//
			// return this.objProvider
			// 	.matches(matches[index])
			// 	.map((md) => {
			// 		return {
			// 			cmd  : ResolveLiteral(this.def.cmd, md),
			// 			title: ResolveLiteral(this.def.title, md),
			// 			desc : ResolveLiteral(this.def.desc, md),
			// 			icon : ResolveLiteral(this.def.icon, md),
			// 		};
			// 	})
			// 	.sort((a, b) => {
			// 		let aRecentIdx = this.RecentList.indexOf(a.cmd),
			// 			bRecentIdx = this.RecentList.indexOf(b.cmd);
			//
			// 		if(aRecentIdx === bRecentIdx)
			// 			return a.title.localeCompare(b.title);
			//
			// 		if(aRecentIdx >= 0 && bRecentIdx >= 0)
			// 			return aRecentIdx - bRecentIdx;
			// 		else if(aRecentIdx >= 0)
			// 			return -1;
			// 		else if(bRecentIdx >= 0)
			// 			return 1;
			//
			// 		psl.log(`sort of ${a.title} vs ${b.title} with a/b recent idx of ${aRecentIdx}/${bRecentIdx} uncaught case`);
			// 		return 0;
			// 	});
		}

		/**
		 * @param {PatternDefinition} def
		 */
		static usesProviders(def) {
			return /\(@(\w+?)\)/.test(def.pattern);
		}
	}

	Patterns.Pattern         = Pattern;
	Patterns.ProviderPattern = ProviderPattern;

	/**
	 * @constructor
	 * @param {PatternDefinition} def
	 */
	function Create(def) {
		if(ProviderPattern.usesProviders(def))
			return new ProviderPattern(def);
		return new Pattern(def);
	}

	Patterns.Create = Create;

	return Patterns;
})();
