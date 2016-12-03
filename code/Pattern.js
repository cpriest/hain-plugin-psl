'use strict';
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

			log(this.pattern, this.ProviderNames);

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
				log(matches);

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
