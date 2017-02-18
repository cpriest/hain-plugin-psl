'use strict';

require('json5/lib/require');
const Glob = require("glob").Glob;

//noinspection JSUnusedLocalSymbols
let { indent } = require('./utils.js');

module.exports = (() => {
	/** @type ProvidersMap */
	const { /** @type {ProvidersMap|Map} */ Providers } = require('./providers/Providers');

	const { /** @type {PatternsMap|Map} */ Patterns } = require("./Patterns.js");

	/**
	 * @param {string} globPattern    A glob pattern of files to match
	 */
	function LoadDefinitionFiles(globPattern) {
		(new Glob(globPattern, (err, matches) => {
			for(let filepath of matches) {
				try {
					ParseDefinition(require(filepath));
				} catch(e) {
					psl.log(`While processing definition file: ${filepath}`);
					psl.log(indent(e.stack));
				}
			}
		})).on('end', (/** string[] */ files) => {
			psl.log(`Finished loading ${Patterns.size} patterns and ${Providers.size} providers from ${files.length} definition files.`);
		});
	}

	/**
	 * @param {Definition} def
	 */
	function ParseDefinition(def) {
		for(let pDef of def.patterns || []) {
			Patterns.Create(pDef);
		}

		for(let [name, pDef] of Object.entries(def.providers || { })) {
			pDef.name = name;

			Providers.Create(pDef);
		}
	}
	return LoadDefinitionFiles(__dirname + '/../defs/*.json*');
})();
