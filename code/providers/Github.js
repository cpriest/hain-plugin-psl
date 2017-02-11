'use strict';

//noinspection JSUnusedLocalSymbols
const { indent } = require('../utils');
const qs         = require('querystring');
const { VM }     = require('vm2');

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
			let queued  = 0;

			let _get = (query) => {
				if(query.substr(0, 1) === '/')
					query = 'https://api.github.com' + query;

				queued++;
				this.req(query, (err, res, body) => {
					if(!err && res.statusCode === 200) {
						results = results.concat(body.items || body);

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
module.exports = (() => {
	let Providers = require('./Providers');

	class GithubProvider extends Providers.MatchlistProvider {
		/**
		 * Builds the matchlist according to what's queryable by the Github API
		 */
		BuildMatchlist() {
			let API = new Github(this.def.auth);

			this.ResolveQueries(API);
		}

		ResolveQueries(API) {
			let AllResults = [];
			let resolved   = 0;

			let QueryResolved = () => {
				resolved++;
				if(resolved === this.def.queries.length) {
					let NamedResults = new Map();

					for(let item of AllResults) {
						let title = (new VM({
							timeout: 25,
							sandbox: item,
						})).run('`' + this.def.title + '`;');

						item.prov = { title };

						NamedResults.set(title, item);
					}
					if(this.def.log && this.def.log.results && AllResults.length > 0)
						psl.log(AllResults);

					let [included, excluded] = this.FilterResultsWithRules(NamedResults, this.def.rules || new Map());

					if(this.def.log && this.def.log.included) {
						psl.log(`Included Results (${this.def.name}):\n${indent(Array.from(included.keys())
							.sort()
							.join('\n'))}`);
					}
					if(this.def.log && this.def.log.excluded) {
						psl.log(`Excluded Results (${this.def.name}):\n${indent(Array.from(excluded.keys())
							.sort()
							.join('\n'))}`);
					}

					this.Matchlist = included;
					psl.log(`Included ${included.size}/${NamedResults.size} GitHub items for @${this.def.name}`);

					this.IndexingCompleted();
				}
			};

			for(let query of this.def.queries) {
				API.get(`${this.def.uri}?per_page=100&q=` + qs.escape(query))
					.then((results) => {
						AllResults = AllResults.concat([...results]);
						QueryResolved();
					})
					.catch((err) => {
						psl.toast.enqueue('Failed to fetch results from Github, see debug log.');
						if(err instanceof Error) {
							psl.log(err.stack);
						} else {
							psl.log(err);
							QueryResolved();
						}
					});
			}
		}

		FilterResultsWithRules(NamedResults, rules) {
			let included = new Map(),
				excluded = new Map();

			if(rules.size === 0)
				return [NamedResults, excluded];

			for(let [title, item] of NamedResults) {
				let include = true;

				for(let rule of rules) {
					if(rule.exclude) {
						if(this.RuleMatches(rule.exclude, item))
							include = false;
					} else if(rule.include) {
						if(this.RuleMatches(rule.include, item))
							include = true;
					}
				}
				(include
					? included
					: excluded).set(title, item);
			}
			return [included, excluded];
		}

		/**
		 * Returns true if the given rule matches the item
		 * @param {object} rule
		 * @param {object} item
		 */
		RuleMatches(rule, item) {
			for(let key of Object.keys(rule)) {
				if(typeof item[key] === 'string') {
					if(!(new RegExp(rule[key], 'i')).test(item[key]))
						return false;
				} else {
					if(item[key] !== rule[key])
						return false;
				}
			}
			return true;
		}
	}
	return GithubProvider;
})();
