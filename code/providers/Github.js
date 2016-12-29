'use strict';

//noinspection JSUnusedLocalSymbols
let { log, indent } = require('../utils');


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
					if(this.def.log.included) {
						log('Included Repositories:\n%s', indent(
							Array.from(included.keys())
								.sort()
								.join('\n')));
					}
					if(this.def.log.excluded) {
						log('Excluded Repositories:\n%s', indent(
							Array.from(excluded.keys())
								.sort()
								.join('\n')));
					}

					this.Matchlist = included;
					log(`Included ${included.size}/${res.data.length} GitHub repositories @${this.def.name}`);

					this.IndexingCompleted();
				});
		}

		/**
		 * Returns true if the given rule matches the repo
		 * @param {object} rule
		 * @param {Repository} repo
		 */
		RuleMatches(rule, repo) {
			let regexKeys = [ 'name', 'full_name'];

			for(let key of Object.keys(rule)) {
				if(regexKeys.indexOf(key) !== -1) {
					if(!(new RegExp(rule[key], 'i')).test(repo[key]))
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
