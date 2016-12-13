'use strict';

//noinspection JSUnusedLocalSymbols
let { log, indent } = require('./utils.js');

module.exports = (pluginContext, PluginDir) => {
	/** @type {ProvidersMap} */
	let Providers = require('./providers/Providers.js')(pluginContext, PluginDir);

	class Pattern {
		/**
		 * @constructor
		 * @param {PatternDefinition} def
		 */
		constructor(def) {
			this.def            = def;
			this.ProviderNames  = [];
			this.ReplacableKeys = ['cmd', 'title', 'desc', 'icon'];

			for(let x of this.ReplacableKeys) {
				// Expand Environment Variables
				this.def[x] = Pattern.ExpandEnvVars(this.def[x]);

				// Sanitize any remaining ${...} present
				this.def[x] = this.def[x].replace(/\${(.+?)}/, '\\${$1}');
			}

			// Locate and replace any @providerNames with (.+)
			this.pattern =
				def.pattern
					.replace(/\(@(\w+?)\)/g,
						(p0, p1) => {
							this.ProviderNames.push(p1);
							return '(.+)';
						}
					);

			if(this.ProviderNames.size > 1)
				log('WARNING: Providers do not currently support more than one provider per pattern, if you have a use case for this please submit a ticket.');

			this.re = new RegExp(this.pattern, 'i');

			setTimeout(() => {
				if(this.ProviderNames.length) {
					let name        = this.ProviderNames[0],
						objProvider = Providers.get(name);
					if(!objProvider)
						throw new Error(`Unable to locate provider named @${name} specified in pattern: ${this.def.pattern}`);

					let re = new RegExp('\{(' + objProvider.Replacables.join('|') + ')\}');
					for(let x of this.ReplacableKeys)
						this.def[x] = this.def[x].replace(re, '\${md.$1}');
				}
			}, 500);
		}

		/**
		 * Checks the query for a match against this pattern
		 * @param {string} query
		 * @returns {MatchDefinition[]}
		 */
		matches(query) {
			if(this.re.test(query)) {
				if(this.ProviderNames.length == 0) {
					return [{
						cmd  : query.replace(this.re, this.def.cmd),
						title: query.replace(this.re, this.def.title),
						desc : query.replace(this.re, this.def.desc),
						icon : query.replace(this.re, this.def.icon),
					}];
				}

				let matches = this.re.exec(query);
				let index   = 1, name = this.ProviderNames[0];

				/** @type {Provider} */
				let objProvider = Providers.get(name);

				return objProvider
					.matches(matches[index])
					.map((md) => {
						return {
							cmd  : (new Function('md', 'return `' + this.def.cmd + '`;'))(md),
							title: (new Function('md', 'return `' + this.def.title + '`;'))(md),
							desc : (new Function('md', 'return `' + this.def.desc + '`;'))(md),
							icon : (new Function('md', 'return `' + this.def.icon + '`;'))(md),
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

	return Pattern;
};
