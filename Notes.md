# Features

1. ~~urlencode() parameter matches placed into URLs~~
2. ~~Separate definition files~~
3. ~~Move some FilesetProvider functionality into Provider base class or a new sub-class as commonalities reveal themselves~~
4. ~~Sort by recently used alphabetically, then the rest, alphabetically~~
5. ~~Automatic icon identification if unspecified~~
6. auto-complete Providers
    1. Queryable - Google Suggest (w, w/o preview)
    2. ~~Queryable - API (Github)~~
        1. ~~Repositories~~
        2. ~~Pull Requests~~
        3. ~~Issues~~
    4. Queryable - API (JIRA)
    5. ~~Filesystem - Directory / Pattern Matching~~
7. ~~Negative Search Filter (dep -chi)~~
8. ~~Extend pattern parameter substitution to full sandboxed template literal capability~~
9. More generic setup for github providers, allowing for specification of API endpoint definitions
    (this essentially moves the github specific code into a definition file)
10. Provide pre-match completion hint for patterns
12. ~~Partial pattern match w/ alt_description?~~

# Research


# YAGNI

1. Allow patterns to provide multiple results??

# Todo

1. Update plugin to new hain-0.6 API
    * Done:
        * ~~Both patterns and providers are now working with hain 0.6~~
    * Todo:
        * Eliminate concept of "PatternProvider," roll pattern definition into a provider definition
        * Allow providers to specify their Group
        * Update JetBrainStubs declarations for changes as well as pluginContext & psl global
        * Expand on providers to allow for each item produce an entry for \[ { title, etc }, { ... } \]
        * 

# Refactoring

1. ~~Separate out Pattern vs Patterns w/ Providers into different classes (Provider Patterns have much more code)~~
2. ~~Perhaps move PCRE Matching of {string\[\]} to a utility function~~
3. ~~Notion of 'Replacables' no longer valid since sandboxing?~~
5. ~~Move ExpandVars into Utils~~
6. Switch to import * from * rather than require?
7. ~~Have MatchlistProvider call this.BuildMatchlist() from it's own constructor, then FilesetProvider won't need it's own constructor just for that.~~
8. ~~Better .id for Patterns than the pattern (possibly cleaned up pattern)...~~
9. ~~Better way of handling setTimeout() code in ProviderPattern (via event emission)~~


# Ideas

1. /psl commands
    1. /psl config x.y=z
3. Provider sub-commands (/hide, /clear (hidden), etc.) (/hide stored in localStorage as pref)
4. FilesetProvider sub-commands (/hide (inherited, etc), /rm, ...)

# Hain Ideas

1. Using global shortcut key while hain is open should not close hain
2. Allow for compiled version of hain to still access debugger
3. ~~Improve log() function passed into plugins work as well as console.log (might require plugin-side library)~~
    a. Alternatively, a way to "hook-up" the plugins thread to the main application debugger??
4. Be able to move the hain window
5. Moving hain plugins to be in < webform > elements of main UI, they would still be run in their own processes but
    would be able to use electron utilities, they would also still be isolated from the main server, in addition they
    would be isolated from each other.  Per @appetizermonster it would probably take a lot of re-working of the code.

