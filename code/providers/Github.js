'use strict';

// process.env.DEBUG='psl:github*';

//noinspection JSUnusedLocalSymbols
let { log, indent } = require('../utils');
let dbg             = require('debug')('psl:github');
dbg.inc             = require('debug')('psl:github:included');
dbg.exc             = require('debug')('psl:github:excluded');


//noinspection JSUnusedLocalSymbols
module.exports = (pluginContext, PluginDir) => {
	let Providers = require('./Providers')(pluginContext, PluginDir);
	let GitHubApi = require('github-api');

	class GithubProvider extends Providers.MatchlistProvider {
		/**
		 * Builds the matchlist according to what's queryable by the Github API
		 */
		BuildMatchlist() {
			let API      = new GitHubApi(this.def.auth);
			let included = new Map(),
				excluded = new Map();

			API.getUser()
				.listRepos()
				.then((res) => {
					for(let repo of res.data) {
						let include = true;
						for(let rule of this.def.rules) {
							if(rule.exclude) {
								if(this.RuleMatches(rule.exclude, repo))
									include = false;
							} else if(rule.include) {
								if(this.RuleMatches(rule.include, repo))
									include = true;
							}
						}
						(include
							? included
							: excluded).set(repo.full_name, repo);
					}
					if(dbg.inc.enabled) {
						dbg.inc('\n%s', indent(
							Array.from(included.keys())
								.sort()
								.join('\n')));
					}
					if(dbg.exc.enabled) {
						dbg.exc('\n%s', indent(
							Array.from(excluded.keys())
								.sort()
								.join('\n')));
					}

					this.Matchlist = included;
					log(`Included ${included.size}/${res.data.length} GitHub repositories @${this.def.name}`);

					if(this.Matchlist.size > 0) {
						this.Replacables = Object.keys(
							this.Matchlist.values()
								.next().value
						);
					}
					this.IndexingCompleted();
				});
		}

		/**
		 * Returns true if the given rule matches the repo
		 * @param {object} rule
		 * @param {Repository} repo
		 */
		RuleMatches(rule, repo) {
			let regexMap = {
				name: 'full_name',
			};
			for(let key of Object.keys(rule)) {
				if(key in regexMap) {
					if(!(new RegExp(rule[key], 'i')).test(repo[regexMap[key]]))
						return false;
				} else {
					if(repo[key] !== rule[key])
						return false;
				}
			}
			return true;
		}

	}
	return GithubProvider;
};
