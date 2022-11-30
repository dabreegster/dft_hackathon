#!/usr/bin/python3

import csv
import json

geojson = {
        "type": "FeatureCollection",
        "features": []
}

with open("/home/dabreegster/NaPTAN_stops.csv") as f:
    for row in csv.DictReader(f):
        lat = row['Latitude']
        lon = row['Longitude']
        code = row['ATCOCode']
        if lat and lon and code:
            geojson["features"].append({
                "geometry": {
                    "type": "Point",
                    "coordinates": [lon, lat],
                },
                "properties": {
                    "code": code,
                }
            })
    print(json.dumps(geojson))
