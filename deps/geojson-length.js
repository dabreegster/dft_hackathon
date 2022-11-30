// https://github.com/tyrasd/geojson-length

export function geojsonLength(geometry) {
    if (geometry.type === 'LineString')
        return calculateLength(geometry.coordinates);
    else if (geometry.type === 'MultiLineString')
        return geometry.coordinates.reduce(function(memo, coordinates) {
            return memo + calculateLength(coordinates);
        }, 0);
    else
        return null;
}

function calculateLength(lineString) {
    if (lineString.length<2)
        return 0;
    var result = 0;
    for (var i=1; i<lineString.length; i++)
        result += distance(lineString[i-1][0],lineString[i-1][1],
                           lineString[i  ][0],lineString[i  ][1]);
    return result;
}

/**
 * Calculate the approximate distance between two coordinates (lat/lon)
 *
 * © Chris Veness, MIT-licensed,
 * http://www.movable-type.co.uk/scripts/latlong.html#equirectangular
 */
function distance(x1,y1,x2,y2) {
    var R = 6371000;
    let dx = (x2 - x1) * Math.PI / 180;
    y1 = y1 * Math.PI / 180;
    y2 = y2 * Math.PI / 180;
    var x = dx * Math.cos((y1+y2)/2);
    var y = (y2-y1);
    var d = Math.sqrt(x*x + y*y);
    return R * d;
};
