/**
 * These classes provide for proper type Defs used throughout the project in JSdoc form.
 */

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
	options: ProviderOptions;
}

declare interface FilesetProviderDefinition extends ProviderDefinition {
	/** - String patterns used as input to glob() for creating the fileset */
	glob: string | string[];

	/** - Regular expression strings whose matches will be removed from the fileset */
	filters: string | string[];

	/** - Regular expression strings whose matches will be removed from the fileset */
	options: FilesetProviderOptions;

	/** - A key/value set of perl style substitution command. */
	//transforms:object;
	// title:  If present, any presentational use of a filename will use the transformed version
}

declare interface ProviderOptions {
	/** - The maximum items a provider should return (Default: 10) */
	MaxMatches: number;
}

declare interface FilesetProviderOptions extends ProviderOptions {
}
