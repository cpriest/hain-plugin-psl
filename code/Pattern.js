'use strict';

/** @type {ProvidersMap} */
let Providers       = require('./providers/Providers.js');
let { log, indent } = require('./utils.js');

module.exports = (
	class Pattern {
		/**
		 * @constructor
		 * @param {PatternDefinition} def
		 */
		constructor(def) {
			this.def           = def;
			this.ProviderNames = new Map();

			// log(def.pattern);

			// Locate and replace any @providerNames with (.+)
			this.pattern =
				def.pattern
					.replace(/\(@(\w+?)\)/g,
						(p0, p1) => {
							this.ProviderNames.set(this.ProviderNames.size + 1, p1);
							return '(.+)';
						}
					);

			if(this.ProviderNames.size > 1)
				log('WARNING: Providers do not currently support more than one provider per pattern, if you have a use case for this please submit a ticket.');

			this.re = new RegExp(this.pattern, 'i');
		}

		/**
		 * Checks the query for a match against this pattern
		 * @param {string} query
		 * @returns {MatchDefinition[]}
		 */
		matches(query) {
			if(this.re.test(query)) {
				if(this.ProviderNames.size == 0) {
					return [{
						cmd  : query.replace(this.re, Pattern.ExpandEnvVars(this.def.cmd)),
						title: query.replace(this.re, Pattern.ExpandEnvVars(this.def.title)),
						desc : query.replace(this.re, Pattern.ExpandEnvVars(this.def.desc)),
						icon : query.replace(this.re, Pattern.ExpandEnvVars(this.def.icon)),
					}];
				}

				let matches = this.re.exec(query);
				let index = 1, name = this.ProviderNames.get(1);

				log(matches);

				/** @type {Provider} */
				let objProvider = Providers.get(name);
				if(!objProvider)
					throw new Error(`Unable to locate provider named @${name} specified in pattern: ${this.def.pattern}`);

				return objProvider
						.matches(matches[index])
						.map((md) => {
							return {
								cmd  : Pattern.ExpandEnvVars(this.def.cmd).replace('$1', md.cmd),
								title: Pattern.ExpandEnvVars(this.def.title).replace('$1', md.title),
								desc : Pattern.ExpandEnvVars(this.def.desc).replace('$1', md.desc),
								icon : Pattern.ExpandEnvVars(this.def.icon).replace('$1', md.icon),
							}
						});
			}
			return [];
		}

		/**
		 * @param {string} cmd
		 * @returns {string}
		 */
		static ExpandEnvVars(cmd) {
			for(const name of Object.keys(process.env))
				cmd = cmd.replace(`\$${name}}`, process.env[name]);
			return cmd;
		}
	}
);
