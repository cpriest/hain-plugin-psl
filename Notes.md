# Features
1. ~~Separate definition files~~
2. auto-complete Providers
    1. Queryable - Google Suggest
    2. Queryable - API (Github)
    3. Filesystem - Directory / Pattern Matching


3. My own binding to execute /quit (for dev)



# YAGNI
1. Allow for non-provider based pattern matching
    Such as '^ssh (@sshFiles) (/.+) (@xyz)'
        Currently this would result in:
        ^ssh ($1) (/.+) ($2)    - clearly $2 would refer to the 2nd ( )

