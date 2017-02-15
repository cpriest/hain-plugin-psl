'use strict';

const path = require("path");
const Glob = require("glob").Glob;

//noinspection JSUnusedLocalSymbols
let { indent } = require('../utils');

module.exports = (() => {
	let { Providers, MatchlistProvider } = require('./Providers');

	class FilesetProvider extends MatchlistProvider {
		/**
		 * Builds the fileset according to the definition, called by parent class
		 */
		BuildMatchlist() {
			let Remaining = (this.def.glob || []).length;

			return new Promise((resolve, reject) => {
				for(let globPattern of this.def.glob || []) {
					let globBasepath = this.FindBasepath(globPattern);
					let AllResults = [ ];

					new Glob(globPattern, (/** string[] */err, /** string[] */ matches) => {
						AllResults.push(
							...matches
								.filter((filepath) => {
									for(let filter of this.def.filters || []) {
										if(filepath.match(new RegExp(filter)))
											return false;
									}
									return true;
								})
								.map((filepath) => {
									let shortPath = filepath.replace(globBasepath, ''),
										r         = path.parse(shortPath),
										title     = `${shortPath.replace(r.ext, '')}`;

									return {
										path : filepath,
										title: title,
										name : r.name,
										base : r.base,
									};
								})
						);
					}).on('end', (matches) => {
						if(--Remaining === 0)
							resolve(AllResults);
					});
				}
			});
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
	return FilesetProvider;
})();
