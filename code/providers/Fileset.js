'use strict';

let Providers       = require('./Providers');
const path          = require("path");
const Glob          = require("glob").Glob;
let { log, indent } = require('../utils');

module.exports = (
	class FilesetProvider extends Providers.Provider {
		/**
		 * @constructor
		 * @param {FilesetProviderDefinition} def
		 */
		constructor(def) {
			super(def);

			this.BuildFileset();
		}

		/**
		 * @param {string} query    A pattern match value to query against this provider
		 * @returns {MatchDefinition[]}
		 */
		matches(query) {
			let matches = Array.from(this.Filepaths.keys());

			for(let part of query.split(/\s+/i)) {
				let re  = new RegExp(part, 'i');
				matches = matches.filter(re.test, re);
			}

			let MaxMatches = (this.def.options && this.def.options.MaxMatches) || Providers.DefaultMaxMatches;

			return matches
				.reduce((acc, item) => {
					if(acc.length < MaxMatches)
						acc.push(item);
					return acc;
				}, [])
				.map((filepath) =>
					this.Filepaths.get(filepath)
				);
		}

		/**
		 * Builds the fileset according to the definition
		 */
		BuildFileset() {
			this.Filepaths = new Map();

			let Remaining = (this.def.glob || []).length;

			for(let globPattern of this.def.glob || []) {
				let globBasepath = this.FindBasepath(globPattern);

				new Glob(globPattern, (/** string[] */err, /** string[] */ matches) => {
					matches.filter(
						(filepath) => {
							for(let filter of this.def.filters || []) {
								if(filepath.match(new RegExp(filter)))
									return false;
							}
							return true;
						})
						.forEach((filepath) => {
							let shortPath = filepath.replace(globBasepath, ''),
								r         = path.parse(shortPath),
								title     = `${shortPath.replace(r.ext, '')}`;

							this.Filepaths.set(title, {
								path : filepath,
								title: title,
								name : r.name,
								base : r.base,
							});
						});
				}).on('end', (matches) => {
					if(--Remaining == 0) {
						log(`Found ${this.Filepaths.size} files for @${this.def.name}`);

						if(this.Filepaths.size > 0)
							this.Replacables = Object.keys(this.Filepaths.values().next().value);
					}
				});
			}

		}

		/**
		 * Finds the basepath of the globPattern and returns it
		 * @param {string} globPattern
		 * @returns {string}
		 */
		FindBasepath(globPattern) {
			let index = globPattern.indexOf('*');
			if(index >= 0)
				return globPattern.substr(0, index);
			return globPattern;
		}
	}
);
