'use strict';

//noinspection JSUnusedLocalSymbols
let { log, indent } = require('../utils');

class Github {
	constructor(auth) {
		this.req = require('request')
			.defaults({
				gzip   : true,
				jar    : true,
				auth   : auth,
				json   : true,
				headers: {
					'Accept'    : 'application/vnd.github.v3+json',
					'User-Agent': 'cpriest/hain-plugin-psl',
				}
			});
	}

	get(query) {
		return new Promise((resolve, reject) => {
			let results = [];
			let queued = 0;

			let _get = (query) => {
				if(query.substr(0, 1) === '/')
					query = 'https://api.github.com' + query;

				queued++;
				this.req(query, (err, res, body) => {
					if(!err && res.statusCode === 200) {
						results = results.concat(body);

						(res.headers.link || '')
							.split(/,\s*/)
							.find((link) => {
								if(link.indexOf('rel="next"') >= 0) {
									_get(link.match(/<(.+?)>/)[1]);
									return true;
								}
							});

						if(--queued === 0)
							resolve(results);
					} else {
						reject({ err, res, body });
					}
				});
			};
			_get(query);
		});
	}
}

//noinspection JSUnusedLocalSymbols
module.exports = (pluginContext, PluginDir) => {
	let Providers = require('./Providers')(pluginContext, PluginDir);

	class GithubProvider extends Providers.MatchlistProvider {
		/**
		 * Builds the matchlist according to what's queryable by the Github API
		 */
		BuildMatchlist() {
			let API = new Github(this.def.auth);
			let included = new Map(),
				excluded = new Map();

			API.get('/user/repos?per_page=100')
				.then((results) => {
					for(let repo of results) {
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
						console.log('Included Repositories:\n%s', indent(
							Array.from(included.keys())
								.sort()
								.join('\n')));
					}
					if(this.def.log.excluded) {
						console.log('Excluded Repositories:\n%s', indent(
							Array.from(excluded.keys())
								.sort()
								.join('\n')));
					}

					this.Matchlist = included;
					console.log(`Included ${included.size}/${results.length} GitHub repositories @${this.def.name}`);

					this.IndexingCompleted();
				})
				.catch((err) => {
					pluginContext.toast.enqueue('Failed to fetch from Github, see debug log.');
					console.log(err);
				});
		}
		/**
		 * Returns true if the given rule matches the repo
		 * @param {object} rule
		 * @param {object} repo
		 */
		RuleMatches(rule, repo) {
			let regexKeys = ['name', 'full_name'];

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
