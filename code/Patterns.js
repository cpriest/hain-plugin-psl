'use strict';

//noinspection JSUnusedLocalSymbols
let { indent, ExpandEnvVars, EscapeMatchesForURNs, ResolveLiteral } = require('./utils.js');
const ResolveIcon = require('./util/IconResolver');

let Patterns = new Map();

module.exports = (pluginContext, PluginDir) => {
	/** @type {ProvidersMap} */
	let Providers   = require('./providers/Providers.js')(pluginContext, PluginDir);
	let RecentItems = require('./RecentItems.js')(pluginContext, PluginDir);

	class Pattern {
		/**
		 * @constructor
		 * @param {PatternDefinition} def
		 */
		constructor(def) {
			this.def = def;
			this.id  = this.def.pattern;

			this.RecentList     = new RecentItems(this.id);
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

		/**
		 * Called when a given match is executed
		 * @param {MatchDefinition} match
		 */
		onExecute(match) {
			this.RecentList.unshift(match.cmd);
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
					/** @type {Provider} */
					this.objProvider = objProvider;
				});
		}

		/**
		 * Checks the query for a match against this pattern
		 * @param {string} query
		 * @returns {MatchDefinition[]}
		 */
		matches(query) {
			if(!this.objProvider || !this.re.test(query))
				return [];

			let matches = this.re.exec(query);
			let index   = 1;

			return this.objProvider
				.matches(matches[index])
				.map((md) => {
					return {
						cmd  : ResolveLiteral(this.def.cmd, md),
						title: ResolveLiteral(this.def.title, md),
						desc : ResolveLiteral(this.def.desc, md),
						icon : ResolveLiteral(this.def.icon, md),
					};
				})
				.sort((a, b) => {
					let aRecentIdx = this.RecentList.indexOf(a.cmd),
						bRecentIdx = this.RecentList.indexOf(b.cmd);

					if(aRecentIdx === bRecentIdx)
						return a.title.localeCompare(b.title);

					if(aRecentIdx >= 0 && bRecentIdx >= 0)
						return aRecentIdx - bRecentIdx;
					else if(aRecentIdx >= 0)
						return -1;
					else if(bRecentIdx >= 0)
						return 1;

					psl.log(`sort of ${a.title} vs ${b.title} with a/b recent idx of ${aRecentIdx}/${bRecentIdx} uncaught case`);
					return 0;
				});
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
};
