'use strict';
let ProviderBase = require('./ProviderBase');
const Glob = require("glob").Glob;
let { log, indent } = require('../utils.js');

module.exports = (
	class FilesetProvider extends ProviderBase {
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
			this.Filepaths = [];

			let Remaining = (this.def.glob || []).length;

			for(let globPattern of this.def.glob || []) {
				new Glob(globPattern, (/** string[] */err, /** string[] */ matches) => {
					matches = matches.filter((filepath) => {
						for(let filter of this.def.filters || []) {
							if(filepath.match(new RegExp(filter)))
								return false;
						}
						return true;
					});
					this.Filepaths = this.Filepaths.concat(matches);
				}).on('end', (matches) => {
					if(Remaining-- == 0)
						log(`Found ${this.Filepaths.length} files for @${this.def.name}`);
				});
			}
		}
	}
);
