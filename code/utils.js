'use strict';

// const logger = require('oh-my-log/lib/node6');
// let log = logger('PSL', {
// 	prefix: '%__date:green [%__name:blue:bold]:',
// 	func  : console.log,
// });


//noinspection JSUnusedLocalSymbols
module.exports = class Util {
	static log(...args) {
		args.unshift('PSL: ');
		console.log(...args);
		return args[1];
	}

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
			if(part.substr(0, 1) == '-') {
				if(part.length == 1)
					continue;

				let re = new RegExp(part.substr(1), 'i');

				let subMatches = matches.filter(re.test, re);

				matches = matches.filter((item) => {
					return subMatches.indexOf(item) == -1;
				})
			} else {
				let re  = new RegExp(part, 'i');
				matches = matches.filter(re.test, re);
			}
		}
		return matches;
	}
};

