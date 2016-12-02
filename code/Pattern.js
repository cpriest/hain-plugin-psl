'use strict';
let { log, indent } = require('./utils.js');

module.exports = (
	class Pattern {
		/**
		 * @constructor
		 * @param {PatternDefinition} def
		 */
		constructor(def) {
			this.def = def;
			this.re = new RegExp(def.pattern, 'i');
		}

		/**
		 * Checks the query for a match against this pattern
		 * @param {string} query
		 * @returns {boolean}
		 */
		matches(query) {
			this.query = query;
			return this.re.test(query);
		}

		/**
		 * Replaces the pattern matches in the string with matches from the last query
		 * @param {string} s
		 * @returns {string}
		 */
		replace(s) {
			return this.query.replace(this.re, Pattern.ExpandEnvVars(s));
		}

		/** @returns {string} - The expanded command per the match */
		get cmd() { return this.replace(this.def.cmd); }

		/** @returns {string} - The expanded title per the match */
		get title() { return this.replace(this.def.title); }

		/** @returns {string} - The expanded description per the match */
		get desc() { return this.replace(this.def.desc); }

		/** @returns {string} - The expanded icon per the match */
		get icon() { return this.replace(this.def.icon); }

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
