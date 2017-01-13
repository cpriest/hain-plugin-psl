'use strict';

const { escape } = require('querystring');
const { VM }     = require('vm2');

// const logger = require('oh-my-log/lib/node6');
// let log = logger('PSL', {
// 	prefix: '%__date:green [%__name:blue:bold]:',
// 	func  : console.log,
// });

// Quick Shim rather than get transpiling setup yet (Object.entries is not in Node 6.5 yet, but is in Node 7)
Object.entries =
	typeof Object.entries === 'function'
		? Object.entries
		: obj => Object.keys(obj)
			.map(k => [k, obj[k]]);

//noinspection JSUnusedLocalSymbols
module.exports = class Util {
	static indent(msg, level=1) {
		let prefix = "    ".repeat(level);
		return msg.replace(/^(.+)$/mg, prefix+'$1');
	}

	/**
	 * Regular Expression Query: Separates {query} by spaces and filters {matches} by each part as a regular expression
	 * 	Each part can also be preceded by a minus (-) which will remove all matches from the set at that point
	 * 	Whereas every other part acts as an INNER JOIN
	 *
	 * @param {string} query
	 * @param {string[]} matches
	 * @returns {string[]}
	 */
	static reQuery(query, matches) {
		for(let part of query.split(/\s+/i)) {
			if(part.substr(0, 1) === '-') {
				if(part.length === 1)
					continue;

				let re = new RegExp(part.substr(1), 'i');

				let subMatches = matches.filter(re.test, re);

				matches = matches.filter((item) => {
					return subMatches.indexOf(item) === -1;
				})
			} else {
				let re  = new RegExp(part, 'i');
				matches = matches.filter(re.test, re);
			}
		}
		return matches;
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

	/**
	 * This calls querystring.escape() on all parameters where {this} is a string
	 * 	and matches a URN pattern
	 *
	 * @param {string} match			The entire string that matched
	 * @param {string} matches			The sub-matches & , offset, string)
	 * @returns {string}				The replacement string to be used
	 */
	static EscapeMatchesForURNs(match, ...matches) {
		//noinspection JSUnusedLocalSymbols
		let string = matches.pop(),
			offset = matches.pop();

		//noinspection JSValidateTypes
		/** @var {string} */
		let result = this;

		// For URN resources only
		if(/^\w+:\/\//.test(result)) {
			matches = matches.map(escape);
			for(let i = 0; i < matches.length; i++)
				result = result.replace(`\$${i + 1}`, matches[i])
		}

		return result;
	}

	/**
	 * Resolves a {literal} using a sandboxed VM with optional {sandbox}
	 *
	 * @param {string} literal
	 * @param {object} sandbox
	 * @returns {string}
	 */
	static ResolveLiteral(literal, sandbox = {}) {
		try {
			let vm = new VM({
				timeout: 25,
				sandbox: sandbox,
			});

			if(literal.substr(0, 1) !== '`')
				literal = '`' + literal + '`';

			return vm.run(literal);
		} catch(e) {
			log(`Exception while processing literal: ${literal}\n${Util.indent(e.stack)}`);
			return '';
		}
	}
};

