# DfT connectivity hackathon

## Development

First you need to manually unzip a file: `cd data; unzip lsoa_scores.zip`

Vanilla JS right now, no tooling. You need Python to run an example web server. Just run:

```bash
./serve_locally.sh
```

and then go to <http://0.0.0.0:8000/>. You can just refresh the page (`Ctrl + Shift + R` to make sure your browser caching doesn't lose any changes) and leave this server running.

You might need a Firefox "CORS Everywhere" extension or similar to develop locally. Use that at your own risk and/or please file an issue and tell me how to do this properly.

Use [prettier](https://prettier.io) to auto-format code (or trust VS Code or another IDE): `prettier --write *.js *.html css/*`
