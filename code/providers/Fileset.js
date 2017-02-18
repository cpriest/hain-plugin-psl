'use strict';

const path = require("path");
const globSync   = require('glob').sync;

//noinspection JSUnusedLocalSymbols
let { indent } = require('../utils');

module.exports = (() => {
	let { Providers, MatchlistProvider } = require('./Providers');

	/**
	 * @property {FilesetProviderDefinition} def
	 **/
	class FilesetProvider extends MatchlistProvider {

		/**
		 * Builds the fileset according to the definition, called by parent class
		 */
		async BuildMatchlist() {
			let _glob = async(pattern, filters) => {
				let globBasepath = this.FindBasepath(pattern);

				return await
					globSync(pattern)
						.filter((filepath) =>
							filters.find((filter) =>
								!filepath.match(new RegExp(filter))
							))
						.map((filepath) => {
							let shortPath  = filepath.replace(globBasepath, ''),
								parsedPath = path.parse(shortPath),
								title      = `${shortPath.replace(parsedPath.ext, '')}`;

							return {
								path : filepath,
								title: title,
								dir  : parsedPath.dir,
								base : parsedPath.base,
								ext  : parsedPath.ext,
								name : parsedPath.name,
							};
						});
			};

			return [].concat(...await Promise.all(
				this.def.glob
					.map((pattern) => _glob(pattern, this.def.filters))
			));
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
