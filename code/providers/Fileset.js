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
			let matches = this.Filepaths;

			log(`Fileset Provider Query: ${query}, parts: ${query.split(/\s+/i)}`);
			for(let part of query.split(/\s+/i)) {
				let re  = new RegExp(part, 'i');
				matches = matches.filter(re.test, re);
			}

			return matches.map((filepath) => {
				let [filename, basename] = this.ParseFilepath(filepath);
				return {
					cmd  : filepath,
					title: basename,
					desc : basename,
					icon : basename,
				}
			});
		}

		/**
		 * Returns the filename and basename for the given filepath
		 * @param filepath
		 * @return {[ {string}, {string} ]}
		 */
		ParseFilepath(filepath) {
			let filename = filepath;

			if(this.def.options.StripBaseDirectory !== false ) {
				filename = this.Basepaths
					.reduce((acc, basepath) => {
						return filepath.replace(basepath, '');
					}, filepath);
			}

			let basename = filename;
			if(this.def.options.StripExtension !== false) {
				basename = filename.replace(path.parse(filepath)['ext'], '')
			}
			return [filename, basename];
		}

		/**
		 * Builds the fileset according to the definition
		 */
		BuildFileset() {
			this.Filepaths = [];
			this.Basepaths = new Set();

			let Remaining = (this.def.glob || []).length;

			for(let globPattern of this.def.glob || []) {
				this.Basepaths.add(this.FindBasepath(globPattern));
				new Glob(globPattern, (/** string[] */err, /** string[] */ matches) => {
					matches        = matches.filter((filepath) => {
						for(let filter of this.def.filters || []) {
							if(filepath.match(new RegExp(filter)))
								return false;
						}
						return true;
					});
					this.Filepaths = this.Filepaths.concat(matches);
				}).on('end', (matches) => {
					if(--Remaining == 0)
						log(`Found ${this.Filepaths.length} files for @${this.def.name}`);
				});
			}
			this.Basepaths = Array.from(this.Basepaths);
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
