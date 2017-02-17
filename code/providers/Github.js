'use strict';

//noinspection JSUnusedLocalSymbols
const { indent } = require('../utils');
const qs         = require('querystring');

class GithubApi {
	constructor(auth) {
		this.rp = require('request-promise-native')
			.defaults({
				gzip                   : true,
				jar                    : true,
				auth                   : auth,
				json                   : true,
				resolveWithFullResponse: true,
				headers                : {
					'Accept'    : 'application/vnd.github.v3+json',
					'User-Agent': 'cpriest/hain-plugin-psl',
				}
			});
	}

	async get(query) {
		if(query.substr(0, 1) === '/')
			query = 'https://api.github.com' + query;

		let res = await this.rp(query);

		let nextPageURL = (res.headers.link || '')
			.split(/,\s*/)
			.reduce((acc, link) => {
				if(link.indexOf('rel="next"') >= 0)
					return link.match(/<(.+?)>/)[1];
				return acc;
			}, '');
		if(nextPageURL) {
			return (/** @type {object[]} */ res.body.items || /** @type {string} */ res.body)
				.concat(await this.get(nextPageURL));
		}

		return res.body.items || res.body;
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
		async ResolveQueries(API) {
			try {
				return []
					.concat(
						...await Promise.all(
							this.def.queries
								.map(query =>
									API.get(`${this.def.uri}?per_page=100&q=` + qs.escape(query))
								)
						)
					);
			} catch(e) {
				psl.log('Failed to fetch results from Github:', e.stack || e);
				psl.toast.enqueue('Failed to fetch results from Github, see debug log.');
			}
			return [];
		}
	}
	return GithubProvider;
})();
