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
    3. Queryable - API (JIRA)
    4. ~~Refresh Interval~~
    5. ~~Filesystem - Directory / Pattern Matching~~
7. ~~Negative Search Filter (dep -chi)~~
8. ~~Extend pattern parameter substitution to full sandboxed template literal capability~~
9. More generic setup for github providers, allowing for specification of API endpoint definitions
    (this essentially moves the github specific code into a definition file)
10. ~~Try out async/await - love it!~~
11. ~~Partial pattern match w/ alt_description?~~

# Research


# YAGNI

1. Allow patterns to provide multiple results??

# Todo

1. Update plugin to new hain-0.6 API
    * Done:
        * ~~Both patterns and providers are now working with hain 0.6~~
    * Todo:
        * ~~Eliminate concept of "PatternProvider," roll pattern definition into a provider definition~~
        * Allow providers to specify their Group
        * ~~Update JetBrainStubs declarations for changes as well as pluginContext & psl global~~
        * ~~Expand on providers to allow for each item produce an entry for \[ { title, etc }, { ... } \]~~
        * ~~Fix all inspection errors~~
2. ~~Produce a preliminary hain-plugin-d.ts typescript definition~~
    1. Submit it to NPMjs.org as @type
3. ~~Produce a hain-plugin-psl.d.ts typescript definition~~
    1. Submit it to NPMjs.org as @type
4. ~~Get gulp / babel going to build the app so we can use newer features~~
5. Allow for any properties (future proof to some extent) to be resolved contained within result definition
6. ~~Remove custom 'title' from github provider, roll into standard resolution of result~~
7. Validate definitions as they are loaded to ensure required properties are present

# Refactoring



# Ideas

1. /psl commands
    1. /psl config x.y=z

# Hain Ideas

1. Using global shortcut key while hain is open should not close hain
2. Hain is not protected from invalid / exception causing synchronous query
3. Allow for compiled version of hain to still access debugger
4. ~~Improve log() function passed into plugins work as well as console.log (might require plugin-side library)~~
    a. Alternatively, a way to "hook-up" the plugins thread to the main application debugger??
5. Be able to move the hain window
6. Moving hain plugins to be in < webform > elements of main UI, they would still be run in their own processes but
    would be able to use electron utilities, they would also still be isolated from the main server, in addition they
    would be isolated from each other.  Per @appetizermonster it would probably take a lot of re-working of the code.

