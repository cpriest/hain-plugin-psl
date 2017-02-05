'use strict';

import { VM } from 'vm2';
import { escape } from 'querystring';

// const logger = require('oh-my-log/lib/node6');
// let log = logger('PSL', {
// 	prefix: '%__date:green [%__name:blue:bold]:',
// 	func  : console.log,
// });

//noinspection JSUnusedLocalSymbols
export function indent(msg:string, level:number=1): string {
	let prefix = "    ".repeat(level);
	return msg.replace(/^(.+)$/mg, prefix+'$1');
}

/**
 * Regular Expression Query: Separates {query} by spaces and filters {matches} by each part as a regular expression
 * 	Each part can also be preceded by a minus (-) which will remove all matches from the set at that point
 * 	Whereas every other part acts as an INNER JOIN
 */
export function reQuery(query:string, matches:string[]): string[] {
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
 * Expand environment variables in cmd and return the result
 */
export function ExpandEnvVars(cmd:string): string {
	for(const name of Object.keys(process.env))
		cmd = cmd.replace(`\$${name}}`, process.env[name]);
	return cmd;
}

/**
 * This calls querystring.escape() on all parameters where {this} is a string
 * 	and matches a URN pattern
 *
 * @param  match			The entire string that matched
 * @param matches			The sub-matches & , offset, string)
 * @returns 				The replacement string to be used
 */
export function EscapeMatchesForURNs(match:string, ...matches:string[]): string {
	//noinspection JSUnusedLocalSymbols
	let string = matches.pop(),
		offset = matches.pop();

	let result = this;

	// For URN resources only
	if(/^\w+:\/\//.test(result))
		matches = matches.map(escape);

	for(let i = 0; i < matches.length; i++)
		result = result.replace(`\$${i + 1}`, matches[i])

	return result;
}

/**
 * Resolves a {literal} using a sandboxed VM with optional {sandbox}
 *
 * @param literal	The template literal in string form to be resolved
 * @param sandbox	The sandbox that will be the global scope for resolution
 * @returns 		The resolved literal
 */
export function ResolveLiteral(literal:string, sandbox:Object = {}): string {
	try {
		let vm = new VM({
			timeout: 25,
			sandbox: sandbox,
		});

		if(literal.substr(0, 1) !== '`')
			literal = '`' + literal + '`';

		return vm.run(literal);
	} catch(e) {
		psl.log(`Exception while processing literal: ${literal}\n${indent(e.stack)}`);
		return '';
	}
}
