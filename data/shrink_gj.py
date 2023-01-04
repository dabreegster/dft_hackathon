#!/usr/bin/python3
# Compresses a GeoJSON file with a very particular format

import collections
import json
import sys

with open("lsoa_scores.geojson") as f:
    gj = json.load(f);

    rewrite_props = collections.OrderedDict()

    for feature in gj["features"]:
        # Round geometry coordinates. Assuming MultiPolygon, with one polygon and no holes
        for pt in feature["geometry"]["coordinates"][0][0]:
            pt[0] = round(pt[0], ndigits=4)
            pt[1] = round(pt[1], ndigits=4)

        props = {}
        for k, v in feature["properties"].items():
            # The score keys are very long. Rename them to numbers
            if k not in rewrite_props:
                rewrite_props[k] = str(len(rewrite_props))
            new_key = rewrite_props[k]
            # Round scores to integers
            if type(v) == float:
                props[new_key] = int(v)
        feature["properties"] = props

    print(json.dumps(gj))

    # Also print the lookup table
    print({v: k for k, v in rewrite_props.items()}, file=sys.stderr)
