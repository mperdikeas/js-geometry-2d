# http://stackoverflow.com/a/40180181/274677
get_json_val() {
    python -c "import json,sys;sys.stdout.write(json.dumps(json.load(sys.stdin)$1))";
}
get_npm_command() {
    local temp=$(echo $npm_config_argv | get_json_val "['original'][0]")
    echo "$temp" | tr -dc "[:alnum:]"
}
if [ $(get_npm_command) != "publish" ]; then
    echo "Skipping prepublish script"
    exit 0
fi
# else
echo "prepublish called in the context of publish"
npm run clean && flow check && npm run test && npm run build && cp src/point.js lib/point.js.flow
