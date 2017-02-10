/**
 * These classes provide for proper type Defs used throughout the project in JSdoc form.
 */

declare type ProviderDefinitions = ProviderDefinition | FilesetProviderDefinition;

declare interface Definition {
	patterns: PatternDefinition[];

	providers: ProviderDefinitions[];
}

declare interface PatternDefinition {
	/** - A regular expression pattern specifying what to match against user input */
	pattern: string;
	// pattern matches may be used in subsequent properties.

	/** - The command to pass to shell.open() */
	cmd: string;

	/** - The title shown to the user for the match */
	title: string;

	/** - The description shown to the user for the match */
	desc: string;

	/** - The icon to be used for the match */
	icon: string;
//	@TODO: If not specified, an appropriate icon match will be attempted (load url for favicon, icon from exe, etc).
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
	/** - The name of the provider */
	name: string;

	/** - A string identifying the provider class name (Case Sensitive) */
		type: string;

	/** - Key/Value items which specify options for the provider */
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
