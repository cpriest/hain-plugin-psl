/**
 * These classes provide for proper type Defs used throughout the project in JSdoc form.
 */

type minutes = number;

declare type ProviderDefinitions = ProviderDefinition & FilesetProviderDefinition;

declare interface Definition {
	patterns: PatternDefinition[];

	providers: ProviderDefinitions[];
}

declare interface PatternDefinition extends MatchDefinition {
	/**
	 * A regular expression pattern specifying what to match against user input.
	 * Pattern matches may be used in subsequent properties, each property inherited
	 * from MatchDefinition is interpreted as a template literal.
	 **/
	pattern: string;
}

declare interface MatchDefinition {
	/** - The command to be passed back to hain */
	cmd: string;

	/** - The title to be passed back to hain */
	title: string;

	/** - The description to be passed back to hain */
	desc: string;

	/** - The icon to be passed back to hain */
	icon: string;
}

declare interface ProviderDefinition {
	/** The name of the provider */
	name: string;

	/** A string identifying the provider class name (Case Sensitive) */
	type: string;

	/**
	 * Specifies how each result is converted to a match result for hain,
	 * each string is interpreted as a template literal with the global
	 * containing all variables available by the provider class.
 	 */
	result:MatchDefinition;

	/** Key/Value items which specify options for the provider */
	options?: ProviderOptions;
}

declare interface MatchlistProviderDefinition extends ProviderDefinition {
	/** Options available to all Matchlist Providers */
	options?:MatchlistProviderOptions;

	/** Options available to all Matchlist Providers for logging */
	log?:MatchlistLogOptions;
}

declare interface MatchlistLogOptions {
	/** Log raw results of sub-class */
	results?: boolean;

	/** Log final list of included items */
	included?: boolean;

	/** Log list of excluded items */
	excluded?: boolean;
}

/** A single include/exclude rule which can be used to filter matchlist items (object hashes) */
declare interface PropertyFilterRule {
	/** A set of properties to match against an object, matches will be included */
	include?: {};

	/** A set of properties to match against an object, matches will be excluded */
	exclude?: {};
}

declare interface FilesetProviderDefinition extends MatchlistProviderDefinition {
	/** - String patterns used as input to glob() for creating the fileset */
	glob: string | string[];

	/** - Regular expression strings whose matches will be removed from the fileset */
	filters: string | string[];

	/** - Regular expression strings whose matches will be removed from the fileset */
	options: FilesetProviderOptions;
}

/** Basic Provider Options available to all Providers */
declare interface ProviderOptions {
}

/** Options available to all MatchlistProviders */
declare interface MatchlistProviderOptions extends ProviderOptions {
	/** Number of minutes between refreshes of match list, default: 15 minutes */
	refresh: minutes;
}

/** Options specific to FilesetProviders */
declare interface FilesetProviderOptions extends MatchlistProviderOptions {
}

declare interface QueryableProviderDefinition extends MatchlistProviderDefinition {
	/** The queries to submit against the Queryable API */
	queries:string[];
}
