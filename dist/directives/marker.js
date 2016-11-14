"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var option_builder_1 = require('../services/option-builder');
var navigator_geolocation_1 = require('../services/navigator-geolocation');
var geo_coder_1 = require('../services/geo-coder');
var ng2_map_1 = require('../services/ng2-map');
var Subject_1 = require('rxjs/Subject');
var INPUTS = [
    'anchorPoint', 'animation', 'clickable', 'cursor', 'draggable', 'icon', 'label', 'opacity',
    'optimized', 'place', 'position', 'shape', 'title', 'visible', 'zIndex',
];
var OUTPUTS = [
    'markerAnimationChanged', 'markerClick', 'markerClickableChanged', 'markerCursorChanged', 'markerDblclick', 'markerDrag', 'markerDragend', 'markerDraggableChanged',
    'markerDragstart', 'markerFlatChanged', 'markerIconChanged', 'markerMousedown', 'markerMouseout', 'markerMouseover', 'markerMouseup', 'markerPositionChanged', 'markerRightclick',
    'markerShapeChanged', 'markerTitleChanged', 'markerVisibleChanged', 'markerZindexChanged',
];
var Marker = (function () {
    function Marker(ng2Map, optionBuilder, geolocation, geoCoder) {
        var _this = this;
        this.ng2Map = ng2Map;
        this.optionBuilder = optionBuilder;
        this.geolocation = geolocation;
        this.geoCoder = geoCoder;
        this.options = {};
        this.inputChanges$ = new Subject_1.Subject();
        // all outputs needs to be initialized,
        // http://stackoverflow.com/questions/37765519/angular2-directive-cannot-read-property-subscribe-of-undefined-with-outputs
        OUTPUTS.forEach(function (output) { return _this[output] = new core_1.EventEmitter(); });
    }
    Marker.prototype.ngOnInit = function () {
        var _this = this;
        if (this.ng2Map.map) {
            this.initialize(this.ng2Map.map);
        }
        else {
            this.ng2Map.mapReady$.subscribe(function (map) { return _this.initialize(map); });
        }
    };
    Marker.prototype.ngOnChanges = function (changes) {
        this.inputChanges$.next(changes);
    };
    // called when map is ready
    Marker.prototype.initialize = function (map) {
        var _this = this;
        console.log('marker is being initialized');
        this.options = this.optionBuilder.googlizeAllInputs(INPUTS, this);
        console.log('MARKER options', this.options);
        this.options.map = map;
        // will be set after geocoded
        typeof this.options.position === 'string' && (delete this.options.position);
        this.marker = new google.maps.Marker(this.options);
        this.marker['mapObjectName'] = this.constructor['name'];
        this.setPosition();
        // set google events listeners and emits to this outputs listeners
        this.ng2Map.setObjectEvents(OUTPUTS, this, 'marker');
        // update marker when input changes
        this.inputChanges$
            .subscribe(function (changes) {
            console.log('marker options are changed', changes);
            _this.ng2Map.updateGoogleObject(_this.marker, changes);
        });
    };
    Marker.prototype.setPosition = function () {
        var _this = this;
        if (!this['position']) {
            this.geolocation.getCurrentPosition().subscribe(function (position) {
                console.log('setting marker position from current location');
                var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                // console.log('this.marker', this.marker);
                _this.marker.setPosition(latLng);
            });
        }
        else if (typeof this['position'] === 'string') {
            this.geoCoder.geocode({ address: this['position'] }).subscribe(function (results) {
                console.log('setting marker position from address', _this['position']);
                // console.log('this.marker', this.marker);
                _this.marker.setPosition(results[0].geometry.location);
            });
        }
    };
    Marker.prototype.ngOnDestroy = function () {
        var _this = this;
        if (this.marker) {
            OUTPUTS.forEach(function (output) { return google.maps.event.clearListeners(_this.marker, output); });
            delete this.marker.setMap(null);
            delete this.marker;
        }
    };
    Marker = __decorate([
        core_1.Directive({
            selector: 'ng2-map>marker',
            inputs: INPUTS,
            outputs: OUTPUTS,
        }), 
        __metadata('design:paramtypes', [ng2_map_1.Ng2Map, option_builder_1.OptionBuilder, navigator_geolocation_1.NavigatorGeolocation, geo_coder_1.GeoCoder])
    ], Marker);
    return Marker;
}());
exports.Marker = Marker;
//# sourceMappingURL=marker.js.map