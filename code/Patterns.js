'use strict';

//noinspection JSUnusedLocalSymbols
let {
	indent,
	ExpandEnvVars,
	/** @type function */ EscapeMatchesForURNs,
	ResolveLiteral
} = require('./utils.js');
const ResolveIcon                                                   = require('./util/IconResolver');

let Patterns;

module.exports = (() => {
	class PatternsMap extends Map {
		/**
		 * @param {PatternDefinition} def
		 *
		 * @returns {Pattern}
		 */
		Create(def) {
			return new Pattern(def);
		}
	}
	if(!Patterns)
		Patterns = new PatternsMap();

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

			Patterns.set(this.id, this);
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

	return { Patterns, Pattern };
})();
