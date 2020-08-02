import 'ol/ol.css';
import {
    Map,
    View
} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Draw from 'ol/interaction/Draw';
import ImageWMS from "ol/source/ImageWMS";
import {
    Vector as VectorLayer
} from 'ol/layer';
import {
    Vector as VectorSource
} from 'ol/source';
import ImageLayer from "ol/layer/Image";
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import {
    toLonLat
} from 'ol/proj';
import Icon from 'ol/style/Icon';
import {
    addProjection,
    addCoordinateTransforms,
    transform
} from 'ol/proj';
import Overlay from "ol/Overlay";
import {
    genus
} from './genus';
import {
    defaults as defaultControls,
    Control
} from "ol/control";

var datum;
var container = document.getElementById("popup");
var content = document.getElementById("popup-content");
var closer = document.getElementById("popup-closer");
var startDate = new Date();
var datum;
var wmsLayerSource;
var wmsLayer;
var lastCoord;
var lastid;
var createLat;
var createLon;
var lastZoom;
var dop = false;
var createTool = false;
var editTool = false;
var deleteTool = false;
var draw;
var lat;
var lon;
window.document.genus = genus;
// test
//var veedel_layer = 'veedel:treestest';
//var linkGiessen = 'http://openmaps.online/veedel/';
//var pyUrl = 'https://opendem.info/cgi-bin/test/';

// Prod
var veedel_layer = 'veedel:trees';
var linkGiessen = 'https://giesst.koeln';
var pyUrl = 'https://opendem.info/cgi-bin/';


/**
 * Create an overlay to anchor the popup to the map.
 */
var overlay = new Overlay({
    element: container,
    autoPan: true,
    autoPanAnimation: {
        duration: 250,
    },
});
/**
 * Add a click handler to hide the popup.
 * @return {boolean} Don't follow the href.
 */
closer.onclick = function() {
    overlay.setPosition(undefined);
    closer.blur();
    return false;
};


// Create
var CreateControl = /*@__PURE__*/ (function(Control) {
    function CreateControl(opt_options) {
        var options = opt_options || {};
        var CreateDiv = document.createElement("div");
        CreateDiv.style.cssText =
            "position:absolute;top:50px;right:5px; width:40px; height:40px;";
        CreateDiv.className = "CreateDiv";
        CreateDiv.id = "CreateDiv";
        Control.call(this, {
            element: CreateDiv,
            target: options.target,
        });
        CreateDiv.addEventListener(
            "click",
            this.handleCreateDivChange.bind(this),
            false
        );
    }
    if (Control) CreateControl.__proto__ = Control;
    CreateControl.prototype = Object.create(Control && Control.prototype);
    CreateControl.prototype.constructor = CreateControl;
    CreateControl.prototype.handleCreateDivChange = function handleSelection() {

        if (createTool === false) {
            createTool = true;
            document.getElementById('CreateDiv').style.border = "2px solid red";
            document.getElementById('createNonModal').style.display = "block";
            // switch other toolbars	
            document.getElementById('EditDiv').style.border = "0px solid red";
            document.getElementById('DeleteDiv').style.border = "0px solid red";
            document.getElementById('editNonModal').style.display = "none";
            document.getElementById('deleteNonModal').style.display = "none";
            editTool = false;
            deleteTool = false;

        } else {
            createTool = false;
            document.getElementById('CreateDiv').style.border = "0px solid red";
            document.getElementById('createNonModal').style.display = "none";
        }

    };
    return CreateControl;
})(Control);

// Edit
var EditControl = /*@__PURE__*/ (function(Control) {
    function EditControl(opt_options) {
        var options = opt_options || {};
        var EditDiv = document.createElement("div");
        EditDiv.style.cssText =
            "position:absolute;top:100px;right:5px; width:40px; height:40px;";
        EditDiv.className = "EditDiv";
        EditDiv.id = "EditDiv";
        Control.call(this, {
            element: EditDiv,
            target: options.target,
        });
        EditDiv.addEventListener(
            "click",
            this.handleEditDivChange.bind(this),
            false
        );
    }
    if (Control) EditControl.__proto__ = Control;
    EditControl.prototype = Object.create(Control && Control.prototype);
    EditControl.prototype.constructor = CreateControl;
    EditControl.prototype.handleEditDivChange = function handleSelection() {

        if (editTool === false) {
            editTool = true;
            document.getElementById('EditDiv').style.border = "2px solid red";
            document.getElementById('editNonModal').style.display = "block";
            // switch other toolbar	
            document.getElementById('CreateDiv').style.border = "0px solid red";
            document.getElementById('DeleteDiv').style.border = "0px solid red"
            document.getElementById('createNonModal').style.display = "none";
            document.getElementById('deleteNonModal').style.display = "none";
            createTool = false;
            deleteTool = false;

        } else {
            editTool = false;
            document.getElementById('EditDiv').style.border = "0px solid red";
            document.getElementById('editNonModal').style.display = "none";
        }
    };
    return EditControl;
})(Control);

// Delete
var DeleteControl = /*@__PURE__*/ (function(Control) {
    function DeleteControl(opt_options) {
        var options = opt_options || {};
        var DeleteDiv = document.createElement("div");
        DeleteDiv.style.cssText =
            "position:absolute;top:150px;right:5px; width:40px; height:40px;";
        DeleteDiv.className = "DeleteDiv";
        DeleteDiv.id = "DeleteDiv";
        Control.call(this, {
            element: DeleteDiv,
            target: options.target,
        });
        DeleteDiv.addEventListener(
            "click",
            this.handleDeleteDivChange.bind(this),
            false
        );
    }
    if (Control) DeleteControl.__proto__ = Control;
    DeleteControl.prototype = Object.create(Control && Control.prototype);
    DeleteControl.prototype.constructor = DeleteControl;
    DeleteControl.prototype.handleDeleteDivChange = function handleSelection() {

        if (deleteTool === false) {
            deleteTool = true;
            document.getElementById('DeleteDiv').style.border = "2px solid red";
            document.getElementById('deleteNonModal').style.display = "block";
            // switch other toolbar	
            document.getElementById('CreateDiv').style.border = "0px solid red";
            document.getElementById('EditDiv').style.border = "0px solid red"
            document.getElementById('createNonModal').style.display = "none";
            document.getElementById('editNonModal').style.display = "none";
            createTool = false;
            editTool = false;

        } else {
            deleteTool = false;
            document.getElementById('DeleteDiv').style.border = "0px solid red";
            document.getElementById('deleteNonModal').style.display = "none";
        }
    };
    return DeleteControl;
})(Control);

// Location
var LocationControl = /*@__PURE__*/ (function(Control) {
    function LocationControl(opt_options) {
        var options = opt_options || {};
        var LocationDiv = document.createElement("div");
        LocationDiv.style.cssText =
            "position:absolute;top:200px;right:5px; width:40px; height:40px;";
        LocationDiv.className = "LocationDiv";
        LocationDiv.id = "LocationDiv";
        Control.call(this, {
            element: LocationDiv,
            target: options.target,
        });
        LocationDiv.addEventListener(
            "click",
            this.handleLocationDivChange.bind(this),
            false
        );
    }
    if (Control) LocationControl.__proto__ = Control;
    LocationControl.prototype = Object.create(Control && Control.prototype);
    LocationControl.prototype.constructor = LocationControl;
    LocationControl.prototype.handleLocationDivChange = function handleSelection() {

        navigator.geolocation.getCurrentPosition(onPosition);


        function onPosition(position) {
            map.getView().setCenter(transform([position.coords.longitude, position.coords.latitude, ], 'EPSG:4326', 'EPSG:3857'));
        }

    };
    return LocationControl;
})(Control);

// Layer LayerSwitcher
var LayerSwitchControl = /*@__PURE__*/ (function(Control) {
    function LayerSwitchControl(opt_options) {
        var options = opt_options || {};
        var LayerSwitchDiv = document.createElement("div");
        LayerSwitchDiv.style.cssText =
            "position:absolute;top:5px;right:5px; width:40px; height:40px;";
        LayerSwitchDiv.className = "LayerSwitchDiv";
        LayerSwitchDiv.id = "LayerSwitchDiv";
        Control.call(this, {
            element: LayerSwitchDiv,
            target: options.target,
        });
        LayerSwitchDiv.addEventListener(
            "click",
            this.handleLayerSwitchDivChange.bind(this),
            false
        );
    }
    if (Control) LayerSwitchControl.__proto__ = Control;
    LayerSwitchControl.prototype = Object.create(Control && Control.prototype);
    LayerSwitchControl.prototype.constructor = LayerSwitchControl;
    LayerSwitchControl.prototype.handleLayerSwitchDivChange = function handleSelection() {

        var layers = map.getLayers().getArray();;

        for (var i = layers.length - 1; i >= 0; i--) {
            console.log(layers[i].className_);
            if (layers[i].className_ == 'dop') {

                if (dop == false) {
                    layers[i].setVisible(true);
                    dop = true;
                    document.getElementById("LayerSwitchDiv").className = "LayerSwitchDivK";
                } else {
                    layers[i].setVisible(false);
                    dop = false;
                    document.getElementById("LayerSwitchDiv").className = "LayerSwitchDiv";
                }

            }
        }
    };
    return LayerSwitchControl;
})(Control);


wmsLayerSource = new ImageWMS({
    url: "https://www.opendem.info/geoserver/veedel/wms",
    params: {
        LAYERS: veedel_layer
    },
    serverType: "geoserver",
    crossOrigin: "anonymous",
    attributions: ', <a target="_blank" href="https://offenedaten-koeln.de/dataset/baumkataster-koeln">Stadt Köln CC BY 3.0 DE</a>',
});


wmsLayer = new ImageLayer({
    source: wmsLayerSource,
    // maxResolution: 2,
    className: 'wmsLayer',
    zIndex: 2
});



wmsLayerSource.on('imageloadstart', function() {
    document.getElementById('loader').style.display = 'block';
});

wmsLayerSource.on('imageloadend', function() {
    document.getElementById('loader').style.display = 'none';
});


var sourceV = new VectorSource({
    wrapX: false
});

var vector = new VectorLayer({
    source: sourceV
});

var wmsLayerSourceDOP = new ImageWMS({
    url: "https://www.wms.nrw.de/geobasis/wms_nw_dop",
    params: {
        LAYERS: "nw_dop_rgb"
    },
    serverType: "mapserver",
    crossOrigin: "anonymous",
    attributions: ', <a target="_blank" href="https://www.bezreg-koeln.nrw.de/brk_internet/geobasis/webdienste/geodatendienste/">Land NRW, DL-DE Zero 3.0</a>',
});

var wmsLayerDOP = new ImageLayer({
    source: wmsLayerSourceDOP,
    visible: false,
    className: 'dop',
    zIndex: 1
});



// url parameter coordinates

var zoomView = 17;
var ycoord = 774670.0;
var xcoord = 6610915.0;


try {
    if (getUrlVars()["y"] != undefined) {
        ycoord = parseFloat(getUrlVars()["y"]);
    }
} catch (e) {}

try {
    if (getUrlVars()["x"] != undefined) {
        xcoord = parseFloat(getUrlVars()["x"]);
    }
} catch (e) {}

// lat lon

try {
    if (getUrlVars()["xcoord"] != undefined) {
        xcoord = parseFloat(getUrlVars()["xcoord"]);
    }
} catch (e) {}
try {
    if (getUrlVars()["ycoord"] != undefined) {
        ycoord = parseFloat(getUrlVars()["ycoord"]);
    }
} catch (e) {}
try {
    if (getUrlVars()["zoomView"] != undefined) {
        zoomView = Number(getUrlVars()["zoomView"]);
    }
} catch (e) {}



// Map
var view = new View({
    center: [ycoord, xcoord],
    zoom: zoomView,
});
var map = new Map({
    controls: defaultControls().extend([
        //new LegendControl(),
        //new TimesliderControl(),
        //new SwitchControl(),
        new LayerSwitchControl(),
        new CreateControl(),
        new EditControl(),
        new DeleteControl(),
        new LocationControl()
    ]),
    layers: [
        new TileLayer({
            source: new OSM()
        }),
        wmsLayer, wmsLayerDOP, vector
    ],
    target: "map",
    overlays: [overlay],
    view: view,
});



if (getUrlVars()["xcoord"] == undefined && getUrlVars()["x"] == undefined) {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(onPosition);
    }

    function onPosition(position) {
        map.getView().setCenter(transform([position.coords.longitude, position.coords.latitude, ], 'EPSG:4326', 'EPSG:3857'));
    }


}

// events


/**
 * Handle change event.
 */


// update WMS

// handle events abhängig vom aktivierten Tool
map.on("singleclick", function(evt) {


    if (createTool === true) {

        var latlon = toLonLat(evt.coordinate);
        lat = latlon[0];
        lon = latlon[1];

        self = this;

        document.getElementById("coordinates_create_x").innerText = lat;
        document.getElementById("coordinates_create_y").innerText = lon;
        if (self.dinamicPinLayer !== undefined) {
            console.log("moove")
            self.iconGeometry.setCoordinates(evt.coordinate);
            //or create another pin  
        } else {
            self.iconGeometry = new Point(evt.coordinate);
            var iconFeature = new Feature({
                geometry: self.iconGeometry,
                name: 'marker'
            });
            var iconStyle = new Style({
                image: new Icon(({
                    anchor: [0.5, 46],
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    size: [48, 48],
                    opacity: 1,
                    src: 'icon.png'
                }))
            });

            iconFeature.setStyle(iconStyle);

            var vectorSource = new VectorSource({
                features: [iconFeature]

            });
            self.dinamicPinLayer = new VectorLayer({
                source: vectorSource,
                zIndex: 3,
                className: 'pinVector'
            });
            map.addLayer(self.dinamicPinLayer);
        }

        // edit

    } else if (editTool === true) {

        // delete spans & values
        document.getElementById('baumartEditSpan').innerHTML = '';
        document.getElementById('umfangEditSpan').innerHTML = '';
        document.getElementById('durchmesserEditSpan').innerHTML = '';
        document.getElementById('alterEditSpan').innerHTML = '';
        document.getElementById('alterKlasseEditSpan').innerHTML = '';
        document.getElementById('untergrundEditSpan').innerHTML = '';
        document.getElementById('baumartEdit').value = '';
        document.getElementById('umfangEdit').value = '';
        document.getElementById('durchmesserEdit').value = '';
        document.getElementById('alterEdit').value = '';
        document.getElementById('alterEdit').value = '';
        document.getElementById('commentEdit').value = '';
        document.getElementById('ak1Edit').checked = false;
        document.getElementById('ak2Edit').checked = false;
        document.getElementById('ak3Edit').checked = false;
        document.getElementById('untergrundEdit').checked = false;



        var viewResolution = /** @type {number} */ (view.getResolution());
        var url = wmsLayerSource.getFeatureInfoUrl(
            evt.coordinate,
            viewResolution,
            "EPSG:3857", {
                INFO_FORMAT: "application/json"
            }
        );

        lastCoord = evt.coordinate;

        if (url) {
            fetch(url)
                .then(function(response) {
                    if (!response.ok) {
                        alert('Irgendwas ist leider schief gegangen.');
                    } else {
                        return response.text();
                    }
                })
                .then(function(json) {

                    var fi = JSON.parse(json);
                    window.document.baemsche = fi;

                    if (fi.features.length > 0) {

                        document.getElementById('edit').style.display = 'block';
                        document.getElementById('editNonModal').style.display = 'none';
                        lastid = fi.features[0].properties.tree_id;

                        if (fi.features[0].properties.name_ger === 'none') {
                            document.getElementById('baumartEdit').value = '';
                        } else {
                            document.getElementById('baumartEdit').value = fi.features[0].properties.name_ger;
                        }
                        if (fi.features[0].properties.name_src == 'crowd') {
                            document.getElementById('baumartEditSpan').innerHTML = '<img class="marginleft" src="community_white.svg" alt="community" width="25" height="25">';
                        }
                        if (fi.features[0].properties.name_src == 'Berechnung aus Stadt Köln Daten') {
                            document.getElementById('baumartEditSpan').innerHTML = '<img class="marginleft" src="computer_white.svg" alt="algorithm" width="25" height="25">';
                        }

                        var radius = fi.features[0].properties.radius;

                        var durchmesser = '';
                        if (radius !== null) {
                            durchmesser = radius * 2;
                        }

                        if (fi.features[0].properties.radius_src == 'crowd') {
                            document.getElementById('umfangEditSpan').innerHTML = '<img class="marginleft" src="community_white.svg" alt="community" width="25" height="25">';
                            document.getElementById('durchmesserEditSpan').innerHTML = '<img class="marginleft" src="community_white.svg" alt="community" width="25" height="25">';
                        }
                        if (fi.features[0].properties.radius_src == 'Berechnung aus Stadt Köln Daten') {
                            document.getElementById('umfangEditSpan').innerHTML = '<img class="marginleft" src="computer_white.svg" alt="algorithm" width="25" height="25">';
                            document.getElementById('durchmesserEditSpan').innerHTML = '<img class="marginleft" src="computer_white.svg" alt="algorithm" width="25" height="25">';
                        }

                        document.getElementById('durchmesserEdit').value = durchmesser;

                        if (radius != null) {
                            var umfang = Math.PI * (radius + radius);
                            document.getElementById('umfangEdit').value = Math.round(umfang);
                        } else {
                            document.getElementById('umfangEdit').value = '-';
                        }


                        var alter = fi.features[0].properties.age;
                        if (alter !== -1) {
                            document.getElementById('alterEdit').value = alter;
                        }
                        if (fi.features[0].properties.age_src == 'crowd') {
                            document.getElementById('alterEditSpan').innerHTML = '<img class="marginleft" src="community_white.svg" alt="community" width="25" height="25">';
                        }
                        if (fi.features[0].properties.age_src == 'Berechnung aus Stadt Köln Daten') {
                            document.getElementById('alterEditSpan').innerHTML = '<img class="marginleft" src="computer_white.svg" alt="algorithm" width="25" height="25">';
                        }
                        var age_group = fi.features[0].properties.age_group;
                        if (age_group !== -1) {

                            var radios = document.getElementsByName('altersklasseEdit');

                            for (var i = 0, length = radios.length; i < length; i++) {

                                if (radios[i].value == age_group) {

                                    radios[i].checked = true;
                                }
                            }
                        }
                        if (fi.features[0].properties.age_g_src == 'crowd') {
                            document.getElementById('alterKlasseEditSpan').innerHTML = '<img class="marginleft" src="community_white.svg" alt="community" width="25" height="25">';
                        }
                        if (fi.features[0].properties.age_g_src == 'Berechnung aus Stadt Köln Daten') {
                            document.getElementById('alterKlasseEditSpan').innerHTML = '<img class="marginleft" src="computer_white.svg" alt="algorithm" width="25" height="25">';
                        }
                        var subsoil = fi.features[0].properties.subsoil;
                        if (subsoil == 'true') {
                            document.getElementById('untergrundEdit').checked = true;

                            document.getElementById('untergrundEditSpan').innerHTML = '<img class="marginleft" src="community_white.svg" alt="community" width="25" height="25">';
                        }
                    }
                });
        }

        // delete	
    } else if (deleteTool === true) {
        var viewResolution = /** @type {number} */ (view.getResolution());
        var url = wmsLayerSource.getFeatureInfoUrl(
            evt.coordinate,
            viewResolution,
            "EPSG:3857", {
                INFO_FORMAT: "application/json"
            }
        );
        lastCoord = evt.coordinate;
        if (url) {
            fetch(url)
                .then(function(response) {
                    if (!response.ok) {
                        alert('Irgendwas ist leider schief gegangen.');
                    } else {
                        return response.text();
                    }
                })
                .then(function(json) {
                    var fi = JSON.parse(json);
                    if (fi.features.length > 0) {
                        document.getElementById('delete').style.display = 'block';
                        document.getElementById('deleteNonModal').style.display = 'none';
                        lastid = fi.features[0].properties.tree_id;
                        var baumart = fi.features[0].properties.deutschern;
                        if (baumart === null) {
                            baumart = 'unbekannt';
                        }
                        document.getElementById('deleteBaumart').innerHTML = baumart;
                    }
                });
        }


    } else {

        //featureInfo
        var viewResolution = /** @type {number} */ (view.getResolution());
        var url = wmsLayerSource.getFeatureInfoUrl(
            evt.coordinate,
            viewResolution,
            "EPSG:3857", {
                INFO_FORMAT: "application/json"
            }
        );
        lastCoord = evt.coordinate;
        if (url) {
            fetch(url)
                .then(function(response) {
                    if (!response.ok) {
                        alert('Irgendwas ist leider schief gegangen.');
                    } else {
                        return response.text();
                    }
                })
                .then(function(json) {
                    var fi = JSON.parse(json);
                    if (fi.features.length > 0) {

                        var source = fi.features[0].properties.source;
                        if (source == 'crowd') {
                            source = 'Nachbarschaft'
                        };
                        var create_edit = fi.features[0].properties.create_edit;
                        if (create_edit == null) {
                            create_edit = " ";
                        } else {
                            create_edit = new Date(create_edit);
                            create_edit = create_edit.toLocaleDateString('de-DE');
                        }


                        var age = fi.features[0].properties.age;
                        if (age == null) {
                            age = 'unbekannt';
                        }
                        if (age == -1) {
                            age = 'unbekannt';
                        }
                        var age_src = fi.features[0].properties.age_src;

                        var age_group = fi.features[0].properties.age_group;
                        switch (age_group) {
                            case 0:
                                age_group = "<= 25 Jahre"
                                break;
                            case 1:
                                age_group = "26 - 40 Jahre"
                                break;
                            case 2:
                                age_group = "> 40 Jahre"
                                break;
                            default:
                                age_group = "keine Angabe vorhanden"
                        }
                        var age_g_src = fi.features[0].properties.age_g_src;

                        var art = fi.features[0].properties.name_ger;
                        if (art == null) {
                            art = "keine Angabe vorhanden"
                        }
                        var name_src = fi.features[0].properties.name_src;
                        var durchmesser = fi.features[0].properties.radius;
                        if (durchmesser == null || durchmesser == -1) {
                            durchmesser = 'unbekannt';
                        } else {
                            durchmesser = durchmesser * 2;
                        }
                        var radius_src = fi.features[0].properties.radius_src;

                        var liter = fi.features[0].properties.watered;
                        if (liter == null) {
                            liter = " ? "
                        };
                        var comment = fi.features[0].properties.comment_editor;
                        if (comment == null) {
                            comment = " "
                        };
                        var subsoil = fi.features[0].properties.subsoil;
                        if (subsoil == 'true') {
                            subsoil = "Ja"
                        } else {
                            subsoil = "";
                        }
                        var coordinate = evt.coordinate;
                        lastid = fi.features[0].properties.tree_id;


                        if (source == 'Nachbarschaft') {
                            content.innerHTML = 'Geschätztes Alter: ' + age + ' Jahre';
                            content.innerHTML += '<br/>Altersgruppe: ' + age_group;
                            content.innerHTML += '<br/>Art: ' + art;
                            content.innerHTML += '<br/>Durchmesser: ' + durchmesser + ' cm';
                            content.innerHTML += '<br/>Letzte Editierung: ' + create_edit
                            content.innerHTML += '<br/>Quelle: ' + source;
                            content.innerHTML += '<br/>Kommentar: ' + comment;
                            content.innerHTML += '<br/>Auf schwierigem Umtergrund: ' + subsoil;

                        } else {
                            content.innerHTML = 'Geschätztes Alter: ' + age + ' Jahre';
                            if (age_src == 'crowd') {
                                content.innerHTML += '&nbsp;<img class="marginleft" src="community.svg" alt="community" width="20" height="20">';
                            }
                            content.innerHTML += '<br/>Altersgruppe: ' + age_group;
                            if (age_g_src == 'crowd') {
                                content.innerHTML += '&nbsp;<img class="marginleft" src="community.svg" alt="community" width="20" height="20">';
                            }
                            if (age_g_src == 'Berechnung aus Stadt Köln Daten') {
                                content.innerHTML += '<img class="marginleft" src="computer.svg" alt="algorithm" width="20" height="20">';
                            }
                            content.innerHTML += '<br/>Art: ' + art;
                            if (name_src == 'crowd') {
                                content.innerHTML += '&nbsp;<img class="marginleft" src="community.svg" alt="community" width="20" height="20">';
                            }
                            if (name_src == 'Berechnung aus Stadt Köln Daten') {
                                content.innerHTML += '<img class="marginleft" src="computer.svg" alt="algorithm" width="20" height="20">';
                            }
                            content.innerHTML += '<br/>Durchmesser: ' + durchmesser + ' cm';
                            if (radius_src == 'crowd') {
                                content.innerHTML += '&nbsp;<img class="marginleft" src="community.svg" alt="community" width="20" height="20">';
                            }
                            if (radius_src == 'Berechnung aus Stadt Köln Daten') {
                                content.innerHTML += '<img class="marginleft" src="computer.svg" alt="algorithm" width="20" height="20">';
                            }
                            content.innerHTML += '<br/>Letzte Editierung: ' + create_edit
                            content.innerHTML += '<br/>Quelle: ' + source;
                            content.innerHTML += '<br/>Kommentar: ' + comment;
                            content.innerHTML += '<br/>Auf schwierigem Umtergrund: ' + subsoil;
                            content.innerHTML += '<br/><br/><img class="marginleft" src="community.svg" alt="community" width="20" height="20"> Quelle: Nachbarschaft';
                            content.innerHTML += '<br/><img class="marginleft" src="computer.svg" alt="algorithm" width="20" height="20"> Quelle: Algorithmen';
                        }
                        overlay.setPosition(coordinate);
                    }
                });
        }
    }
});

// event handlers


document.getElementById("createReady").addEventListener("click", createReady);
document.getElementById("createTree").addEventListener("click", createTree);
document.getElementById("resetCreateTree").addEventListener("click", resetCreateTree);
document.getElementById("editTree").addEventListener("click", editTree);
document.getElementById("deleteTree").addEventListener("click", deleteTree);
document.getElementById("ak1Edit").addEventListener("click", deactivateRadio);
document.getElementById("ak2Edit").addEventListener("click", deactivateRadio);
document.getElementById("ak3Edit").addEventListener("click", deactivateRadio);
document.getElementById("deleteBaumartEdit").addEventListener("click", deleteBaumartEdit);
document.getElementById("giessenIcon").addEventListener("click", giessen);
giessenIcon


function deleteBaumartEdit() {

    document.getElementById('baumartEdit').value = '';
}

function giessen() {

    var txt;
    var r = confirm("Hier kannst Du mit dem Kartenausschnitt zur GießApp wechseln");
    if (r == true) {
        var center = map.getView().getCenter();
        var zoom = map.getView().getZoom();

        window.open(linkGiessen + "?y=" + center[0] + "&x=" + center[1] + "&zoomView=" + zoom);
    } else {
    }
}

function deactivateRadio() {

    //if (document.getElementById(this.id).checked === true){

    if (this.classList.contains("imChecked")) {
        this.classList.remove("imChecked");
        this.checked = false;
    } else {
        this.checked = true;
        this.classList.add("imChecked");
    };
}



function createReady() {
    if (document.getElementById("coordinates_create_x").innerText === '') {
        alert('Bitte in die Karte klicken um den Standort des Baumes anzulegen.');
    } else {
        createLat = document.getElementById('coordinates_create_x').innerText;
        createLon = document.getElementById('coordinates_create_y').innerText;
        document.getElementById('createNonModal').style.display = 'none';
        document.getElementById('create').style.display = 'block';
    }
}

function resetCreateTree() {
    document.getElementById('baumart').value = '';
    document.getElementById('umfang').value = '';
    document.getElementById('durchmesser').value = '';
    document.getElementById('alter').value = '';
    document.getElementById('commentCreate').value = '';
    document.getElementById('ak1').checked = false;
    document.getElementById('ak2').checked = false;
    document.getElementById('ak3').checked = false;
    document.getElementById('untergrund').checked = false;

}

function createTree() {

    if (document.getElementById("license").checked === false) {
        alert('Bitte zunächst die Lizenz akzeptieren');

    } else {
        document.getElementById('loader').style.display = 'block';
        //document.getElementById('createTree').style.display = 'block';
        var name_ger = document.getElementById('baumart').value;
        var umfang = document.getElementById('umfang').value;
        var durchmesser = document.getElementById('durchmesser').value;

        var radius = -1;
        if (umfang !== '') {
            radius = (umfang / Math.PI) / 2;
        }
        if (durchmesser !== '') {
            radius = durchmesser / 2;
        }
        var age = document.getElementById('alter').value;
        var subsoil = document.getElementById('untergrund').checked;
        var subsoil = 'false';
        if (document.getElementById('untergrund').checked === true) {
            subsoil = 'true';
        }
        var comment = document.getElementById('commentCreate').value;
        var age_group = -1;
        var radios = document.getElementsByName('altersklasse');
        var age_g_defined = false;
        for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked) {
                age_g_defined = true;
                // do whatever you want with the checked radio
                age_group = (radios[i].value);
                break;
            }
        }
        if (age !== "" && age_g_defined === false) {
            if (age >= 0 && age <= 25) {
                age_group = 0;
            }
            if (age > 25 && age <= 40) {
                age_group = 1;
            }
            if (age > 40) {
                age_group = 2;
            }
        }

        // alter und altersklasse berechnen
        if (age == '' && age_group == -1 && radius !== -1) {
            age = calculateAge(radius, name_ger);
            if (age >= 0 && age <= 25) {
                age_group = 0;
            }
            if (age > 25 && age <= 40) {
                age_group = 1;
            }
            if (age > 40) {
                age_group = 2;
            }
        }
        if (radius == -1) {

            radius = null;
        }
        var url = pyUrl + 'createTree.py?lat=' + createLat + '&lon=' + createLon + '&name_ger=' + name_ger + '&radius=' + radius + '&age=' + age + '&age_group=' + age_group + '&subsoil=' + subsoil + '&comment=' + comment;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {

                try {
                    var res = JSON.parse(this.response);
                    if (res.request === 'done') {
                        document.getElementById('loader').style.display = 'none';
                        alert('Danke! Ein neuer Baum wurde in das Kataster eingepflegt.')
                        document.getElementById('create').style.display = 'none';
                        document.getElementById('CreateDiv').style.border = "0px solid red";
                        document.getElementById("coordinates_create_x").innerText = '';
                        document.getElementById("coordinates_create_y").innerText = '';
                        createTool = false;
                        // Pseudo Parameter for the refresh
                        wmsLayerSource.updateParams({
                            'update': Math.random()
                        });
                    } else {
                        alert("Leider ist etwas schief gelaufen.");
                        document.getElementById('loader').style.display = 'none';
                    }
                } catch (e) {
                    alert("Leider ist etwas schief gelaufen.");
                    document.getElementById('loader').style.display = 'none';
                }
            }
        };
        xhttp.onerror = function() {
            document.getElementById('loader').style.display = 'none';
            alert("Leider ist etwas schief gelaufen.");
        };

        xhttp.open("Get", url, true);
        xhttp.send();
    }
}

function editTree() {
    if (document.getElementById("licenseEdit").checked === false) {
        alert('Bitte zunächst die Lizenz akzeptieren');
    } else {
        document.getElementById('loader').style.display = 'block';
        // check any changes
        var name_ger = document.getElementById('baumartEdit').value;
        if (name_ger === '') {
            name_ger = null;
        }
        var name_src = window.document.baemsche.features[0].properties.name_src;
        if (window.document.baemsche.features[0].properties.name_ger !== name_ger) {
            name_src = 'crowd';
        }
        var subsoil = 'false';
        if (document.getElementById('untergrundEdit').checked === true) {
            subsoil = 'true';
        }
        var comment = document.getElementById('commentEdit').value;
        var age = document.getElementById('alterEdit').value;
        if (age === "") {
            age = null;
        }
        var ageChanged = false;
        var age_src = window.document.baemsche.features[0].properties.age_src;
        if (window.document.baemsche.features[0].properties.age !== age) {
            age_src = 'crowd';
            ageChanged = true;
        }
        var age_group = window.document.baemsche.features[0].properties.age_group;
        var age_g_src = window.document.baemsche.features[0].properties.age_g_src;
        var radios = document.getElementsByName('altersklasseEdit');
        for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked) {
                age_g_src = 'crowd';
                // do whatever you want with the checked radio
                age_group = (radios[i].value);
                break;
            }
        }
        var durchmesser = document.getElementById('durchmesserEdit').value;
        var radius_src = window.document.baemsche.features[0].properties.radius_src;
        var radius = window.document.baemsche.features[0].properties.radius;
        var radiusChanged = false;
        if (durchmesser !== '') {
            radius = durchmesser / 2;

            if ((durchmesser / 2) !== radius) {
                radius = durchmesser / 2;
                radius = Math.round(radius);
                radius_src = 'crowd';
                radiusChanged = true;
            }
        }
        var umfang = document.getElementById('umfangEdit').value;
        if (umfang !== '' && radiusChanged == false) {
            radius = (umfang / Math.PI) / 2;
            radius = Math.round(radius);
            radius_src = 'crowd';
        }
        if (radius === 0) {
            radius = null;
            radius_src = null;
        }
        // alter und altersklasse berechnen
        if (age == null && age_group == -1 && radius !== null) {
            age = calculateAge(radius, name_ger);
            age = Math.round(age);
            if (age >= 0 && age <= 25) {
                age_group = 0;
            }
            if (age > 25 && age <= 40) {
                age_group = 1;
            }
            if (age > 40) {
                age_group = 2;
            }

            age_g_src = 'crowd';
            age_src = 'crowd';
        }
        if (ageChanged === true) {
            if (age >= 0 && age <= 25) {
                age_group = 0;
            }
            if (age > 25 && age <= 40) {
                age_group = 1;
            }
            if (age > 40) {
                age_group = 2;
            }
            age_g_src = 'crowd';
            age_src = 'crowd';

        }
        //document.getElementById('createTree').style.display = 'block';
        var url = pyUrl + 'editTree.py?id=' + lastid + '&name_ger=' + name_ger + '&name_src=' + name_src + '&radius=' + radius + '&radius_src=' + radius_src + '&age=' + age + '&age_src=' + age_src + '&subsoil=' + subsoil + '&comment=' + comment + '&age_group=' + age_group + '&age_g_src=' + age_g_src;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {

                try {
                    var res = JSON.parse(this.response);
                    if (res.request === 'done') {

                        document.getElementById('loader').style.display = 'none';
                        alert('Danke! Die Daten des Baumes wurden angepasst.')
                        document.getElementById('edit').style.display = 'none';
                        document.getElementById('EditDiv').style.border = "0px solid red";
                        editTool = false;
                    } else {
                        alert("Leider ist etwas schief gelaufen.");
                        document.getElementById('loader').style.display = 'none';
                    }

                } catch (e) {
                    alert("Leider ist etwas schief gelaufen.");
                    document.getElementById('loader').style.display = 'none';
                }

            }

        };
        xhttp.onerror = function() {
            document.getElementById('loader').style.display = 'none';
            alert("Leider ist etwas schief gelaufen.");
        };

        xhttp.open("Get", url, true);
        xhttp.send();
    }
}

function deleteTree() {
    var comment = document.getElementById('commentDelete').value;
    if (document.getElementById("checkDelete").checked === false) {
        alert('Bitte zunächst die Checkbox aktivieren, um zu Bestätigen, dass dieser Baum wirklich gelöscht werden soll.');
    } else {


        var url = pyUrl + 'deleteTree.py?id=' + lastid + '&comment=' + comment;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {

                try {
                    var res = JSON.parse(this.response);
                    if (res.request === 'done') {
                        alert('Danke! Dieser Baum wurde aus dem Datensatz gelöscht.')
                        document.getElementById('delete').style.display = 'none';
                        document.getElementById('DeleteDiv').style.border = "0px solid red";
                        deleteTool = false;

                        // Pseudo Parameter for the refresh
                        wmsLayerSource.updateParams({
                            'update': Math.random()
                        });
                    } else {
                        alert("Leider ist etwas schief gelaufen.");
                        document.getElementById('loader').style.display = 'none';
                    }

                } catch (e) {
                    alert("Leider ist etwas schief gelaufen.");
                    document.getElementById('loader').style.display = 'none';
                }
            }
        };
        xhttp.onerror = function() {
            alert("Leider ist etwas schief gelaufen.");
        };

        xhttp.open("Get", url, true);
        xhttp.send();
    }
}

// help
document.getElementById("helpIcon").addEventListener("click", help);

function help() {
    document.getElementById("help").style.display = "block";
    document.getElementById("head").style.pointerEvents = "none";
    document.getElementById("head").style.opacity = "50%";
    document.getElementById("map").style.pointerEvents = "none";
    document.getElementById("map").style.opacity = "50%";
}
document.getElementById("closeHelp").addEventListener("click", closeHelp);

function closeHelp() {
    document.getElementById("help").style.display = "none";
    document.getElementById("head").style.pointerEvents = "auto";
    document.getElementById("head").style.opacity = "1";
    document.getElementById("map").style.pointerEvents = "auto";
    document.getElementById("map").style.opacity = "1";
}
// legal notes
document.getElementById("legalIcon").addEventListener("click", legal);

function legal() {
    document.getElementById("legal").style.display = "block";
    document.getElementById("head").style.pointerEvents = "none";
    document.getElementById("head").style.opacity = "50%";
    document.getElementById("map").style.pointerEvents = "none";
    document.getElementById("map").style.opacity = "50%";
}
document.getElementById("closeLegal").addEventListener("click", closeLegal);

function closeLegal() {
    document.getElementById("legal").style.display = "none";
    document.getElementById("head").style.pointerEvents = "auto";
    document.getElementById("head").style.opacity = "1";
    document.getElementById("map").style.pointerEvents = "auto";
    document.getElementById("map").style.opacity = "1";
}

document.getElementById("closeCreate").addEventListener("click", closeCreate);

function closeCreate() {
    document.getElementById("create").style.display = "none";
    document.getElementById("head").style.pointerEvents = "auto";
    document.getElementById("head").style.opacity = "1";
    document.getElementById("map").style.pointerEvents = "auto";
    document.getElementById("map").style.opacity = "1";
    document.getElementById('CreateDiv').style.border = "0px solid red";
    document.getElementById("coordinates_create_x").innerText = '';
    document.getElementById("coordinates_create_y").innerText = '';
    createTool = false;
}

document.getElementById("closeEdit").addEventListener("click", closeEdit);

function closeEdit() {
    document.getElementById("edit").style.display = "none";
    document.getElementById("head").style.pointerEvents = "auto";
    document.getElementById("head").style.opacity = "1";
    document.getElementById("map").style.pointerEvents = "auto";
    document.getElementById("map").style.opacity = "1";
    document.getElementById('EditDiv').style.border = "0px solid red";
    editTool = false;
}

document.getElementById("closeDelete").addEventListener("click", closeDelete);

function closeDelete() {
    document.getElementById("delete").style.display = "none";
    document.getElementById("head").style.pointerEvents = "auto";
    document.getElementById("head").style.opacity = "1";
    document.getElementById("map").style.pointerEvents = "auto";
    document.getElementById("map").style.opacity = "1";
    document.getElementById('DeleteDiv').style.border = "0px solid red";
    deleteTool = false;
}

// get url parameters helper
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
        vars[key] = value;
    });
    return vars;
}

function copyStringToClipboard(str) {
    var el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style = {
        position: 'absolute',
        left: '-9999px'
    };
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
}

function calculateAge(radius, name_ger) {

    if (name_ger === 'none') {
        name_ger = null;
    }
    if (name_ger !== null) {
        var genus = window.document.genus[name_ger].genus;
        var altersfaktor = 0.5;

        switch (genus) {
            // eichen
            case 'Quercus':
                altersfaktor = 0.8;
                break;
                // linden
            case 'Tilia':
                altersfaktor = 0.8;
                break;
                // eiben
            case 'Taxus':
                altersfaktor = 0.7;
                break;
                // kiefern
            case 'Pinus"':
                altersfaktor = 0.7;
                break;
                // kastanien
            case 'Aesculus':
                altersfaktor = 0.7;
                break;
                // Buchen
            case 'Fagus':
                altersfaktor = 0.6;
                break;
                // Ahron
            case 'Acer':
                altersfaktor = 0.6;
                break;
                // ulme
            case 'Ulmus':
                altersfaktor = 0.6;
                break;
                // tanne
            case 'Abies':
                altersfaktor = 0.6;
                break;
                // edelkastanie
            case 'Castanea':
                altersfaktor = 0.4;
                break;
                // Plantane
            case 'Platanus':
                altersfaktor = 0.4;
                break;
                // Zeder
            case 'Cedrus':
                altersfaktor = 0.4;
                break;
                // mammutbaum
            case 'Sequoia':
                altersfaktor = 0.3;
                break;
                // blauglockenbaum
            case 'Paulownia':
                altersfaktor = 0.15;
                break;
        }

        //2 * pi * Radius
        var umfang = 2 * Math.PI * radius;
        var alter = umfang * altersfaktor;


    } else {
        var umfang = 2 * Math.PI * radius;
        var alter = umfang * 0.5;
    }
    return alter;
}

function documentLoaded(e) {
    // handle very small displays
    if (innerWidth < 450) {
        var title = document.getElementById("titleApp");
        title.style.fontSize = "1.1rem";
        title.style.top = "0px";
    }
}
document.addEventListener("DOMContentLoaded", documentLoaded);