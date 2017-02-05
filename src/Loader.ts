'use strict';

require('json5/lib/require');
const Glob = require("glob").Glob;

//noinspection JSUnusedLocalSymbols
import { indent } from './utils';

/** @type ProvidersMap */
import Providers from './providers/Providers';
/** @type PatternsMap */
import Patterns from './Patterns';

/**
 * @param globPattern    A glob pattern of files to match
 */
function LoadDefinitionFiles(globPattern:string) {
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
		let objPattern = Patterns.Create(pDef);
		Patterns.set(objPattern.id, objPattern);
	}

	for(let name of Object.keys(def.providers || { })) {
		let pDef = def.providers[name],
			ProviderClass;

		pDef.name = name;

		try {
			ProviderClass = require('./providers/' + pDef.type);
			let objProvider = new ProviderClass(pDef);
			Providers.set(objProvider.id, objProvider);
		} catch(e) {
			if(e.code === 'MODULE_NOT_FOUND')
				e.message = `Unable to find provider module named '${pDef.type}' specified as type parameter for @${name} provider`;
			throw e;
		}
	}
}

console.log('PluginDir needed in Loader.ts');
export = LoadDefinitionFiles(/*PluginDir + */'/defs/*.json*');
