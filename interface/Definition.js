'use strict';

/**
 * These classes provide for proper type Defs used throughout the project in JSdoc form.
 */

/**
 * @typedef {object} Definition
 * @property {PatternDefinition[]} patterns       - An array of pattern Defs
 * @property {ProviderDefinitions[]} providers    - An array of providers
 */

/**
 * @typedef {object} PatternDefinition
 * @property {string} pattern  - A regular expression pattern specifying what to match against user input
 *                                pattern matches may be used in subsequent properties.
 * @property {string} cmd      - The command to pass to shell.open()
 * @property {string} title    - The title shown to the user for the match
 * @property {string} desc     - The description shown to the user for the match
 * @property {string} icon     - The icon to be used for the match
 *                                @TODO: If not specified, an appropriate icon match will be attempted (load url for favicon, icon from exe, etc).
 */

/**
 * @typedef {object} MatchDefinition
 * @property {string} cmd        - The command to be passed back to hain
 * @property {string} title      - The title to be passed back to hain
 * @property {string} desc       - The description to be passed back to hain
 * @property {string} icon       - The icon to be passed back to hain
 */

/**
 * @typedef {object} ProviderDefinition
 * @property {string} name             - The name of the provider
 * @property {string} type             - A string identifying the provider class name (Case Sensitive)
 * @property {ProviderOptions} options - Key/Value items which specify options for the provider
 */

/**
 * @typedef {ProviderDefinition} FilesetProviderDefinition
 * @property {string|string[]} glob           - String patterns used as input to glob() for creating the fileset
 * @property {string|string[]} filters        - Regular expression strings whose matches will be removed from the fileset
 * @property {FilesetProviderOptions} options - Regular expression strings whose matches will be removed from the fileset
 * //@property {object} transforms              - A key/value set of perl style substitution command.
 * //                                             title:  If present, any presentational use of a filename will use the transformed version
 */

/**
 * @typedef {object} ProviderOptions
 * @property {int} MaxMatches            - The maximum items a provider should return (Default: 10)
 */

/**
 * @typedef {ProviderOptions} FilesetProviderOptions
 */

/**
 * @typedef {Map} PatternsMap        - Map of loaded Patterns
 * @property {Function} Pattern      - Base class for a Pattern
 */

/**
 * @typedef {Map} ProvidersMap       - Map of loaded Providers
 * @property {Function} Provider     - Base class for Providers
 */

/** @typedef {ProviderDefinition|FilesetProviderDefinition} ProviderDefinitions */
