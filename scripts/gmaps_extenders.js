google.maps.Polygon.prototype.getBounds = function(bounds) {
    if(typeof bounds === 'undefined') bounds = new google.maps.LatLngBounds();
    var paths = this.getPaths();
    var path;
    for (var i = 0; i < paths.getLength(); i++) {
        path = paths.getAt(i);
        for (var ii = 0; ii < path.getLength(); ii++) {
            bounds.extend(path.getAt(ii));
        }
    }
    return bounds;
}

// add inCircle method to polygon class
google.maps.Polygon.prototype.getCenter = function() {
    var paths = this.getPaths();
    if(paths.getLength() != 1) return false;
    var path = paths.getAt(0);

    var centroid = {lat:0,lng:0};
    var signedArea = 0.0;
    var x0 = 0.0; // Current vertex X
    var y0 = 0.0; // Current vertex Y
    var x1 = 0.0; // Next vertex X
    var y1 = 0.0; // Next vertex Y
    var a  = 0.0; // Partial signed area

    // For all vertices except last
    for (var i=0; i < path.getLength()-1; i++) {
        x0 = path.getAt(i).lat();
        y0 = path.getAt(i).lng();
        x1 = path.getAt(i+1).lat();
        y1 = path.getAt(i+1).lng();
        a = x0*y1 - x1*y0;
        signedArea += a;
        centroid.lat += (x0 + x1)*a;
        centroid.lng += (y0 + y1)*a;
    }

    // Do last vertex
    x0 = path.getAt(i).lat();
    y0 = path.getAt(i).lng();
    x1 = path.getAt(0).lat();
    y1 = path.getAt(0).lng();
    a = x0*y1 - x1*y0;
    signedArea += a;
    centroid.lat += (x0 + x1)*a;
    centroid.lng += (y0 + y1)*a;

    signedArea *= 0.5;
    centroid.lat /= (6.0*signedArea);
    centroid.lng /= (6.0*signedArea);

    return new google.maps.LatLng(centroid.lat,centroid.lng);
}