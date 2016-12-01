'use strict';
let ProviderBase = require('./ProviderBase');

module.exports = (
	class FilesetProvider extends ProviderBase {
		/**
		 * @param {FilesetProviderDefinition} def
		 */
		constructor(def) {
			super();
			this.def = def;
		}
	}
);
