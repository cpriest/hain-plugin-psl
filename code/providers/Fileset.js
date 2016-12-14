'use strict';

const path = require("path");
const Glob = require("glob").Glob;

//noinspection JSUnusedLocalSymbols
let { log, indent } = require('../utils');

//noinspection JSUnusedLocalSymbols
module.exports = (pluginContext, PluginDir) => {
	let Providers = require('./Providers')(pluginContext, PluginDir);

	class FilesetProvider extends Providers.MatchlistProvider {
		/**
		 * @constructor
		 * @param {FilesetProviderDefinition} def
		 */
		constructor(def) {
			super(def);

			this.BuildFileset();
		}

		/**
		 * Builds the fileset according to the definition
		 */
		BuildFileset() {
			let Remaining = (this.def.glob || []).length;

			for(let globPattern of this.def.glob || []) {
				let globBasepath = this.FindBasepath(globPattern);

				new Glob(globPattern, (/** string[] */err, /** string[] */ matches) => {
					matches
						.filter((filepath) => {
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

							this.Matchlist.set(title, {
								path : filepath,
								title: title,
								name : r.name,
								base : r.base,
							});
						});
				}).on('end', (matches) => {
					if(--Remaining == 0) {
						log(`Found ${this.Matchlist.size} files for @${this.def.name}`);

						if(this.Matchlist.size > 0) {
							this.Replacables = Object.keys(
								this.Matchlist.values()
									.next().value
							);
						}
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
	return FilesetProvider;
};
