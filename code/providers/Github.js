'use strict';

//noinspection JSUnusedLocalSymbols
const { indent } = require('../utils');
const qs         = require('querystring');
const { VM }     = require('vm2');

class GithubApi {
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
	let { MatchlistProvider } = require('./Providers');

	class GithubProvider extends MatchlistProvider {
		/**
		 * Builds the matchlist according to what's queryable by the Github API
		 *
		 * @returns {Promise<object[]>}
		 */
		BuildMatchlist() {
			let API = new GithubApi(this.def.auth);

			return this.ResolveQueries(API);
		}

		/**
		 * @param API {GithubApi}
		 *
		 * @returns {Promise<object[]>}
		 */
		ResolveQueries(API) {
			let AllResults = [];
			let resolved   = this.def.queries.length;

			return new Promise((resolve, reject) => {
				for(let query of this.def.queries) {
					API.get(`${this.def.uri}?per_page=100&q=` + qs.escape(query))
						.then((results) => {
							AllResults = AllResults.concat([...results]);
							if(--resolved === 0)
								resolve(AllResults);
						})
						.catch((err) => {
							if(err instanceof Error) {
								psl.log(err.stack);
							} else {
								psl.log(err);
							}
							psl.toast.enqueue('Failed to fetch results from Github, see debug log.');
						});
				}
			});
		}
	}
	return GithubProvider;
})();
