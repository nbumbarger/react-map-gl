/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL from 'react-map-gl';
import {PerspectiveMercatorViewport} from 'viewport-mercator-project';
import TWEEN from 'tween.js';

import ControlPanel from './control-panel';

const token = process.env.MapboxAccessToken; // eslint-disable-line

if (!token) {
  throw new Error('Please specify a valid mapbox token');
}

// Required by tween.js
function animate() {
  TWEEN.update();
  window.requestAnimationFrame(animate);
}
animate();

'use strict'

import turfBearing from '@turf/bearing'

// Calculate bearing from one point to another
const getBearing = (coord1, coord2) => {
  const [ point1, point2 ] = [coord1, coord2].map((coord) => {
    return {
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [coord[0], coord[1]]
      }
    }
  })
  return turfBearing(point1, point2)
}


export default class App extends Component {

  state = {
    viewport: {
      latitude: 38.910337,
      longitude: -77.04227,
      zoom: 18,
      bearing: 0,
      pitch: 60,
      width: 500,
      height: 500
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resize);
  }

  _resize = () => {
    this.setState({
      viewport: {
        ...this.state.viewport,
        width: this.props.width || window.innerWidth,
        height: this.props.height || window.innerHeight
      }
    });
  };

  _easeTo = ({longitude, latitude}) => {
    // Remove existing animations
    TWEEN.removeAll();

    const {viewport} = this.state;
    const { longitude: prevLongitude, latitude: prevLatitude } = viewport

    new TWEEN.Tween(viewport)
      .to({
        longitude, latitude,
        zoom: 18,
        bearing: getBearing(
          [prevLongitude, prevLatitude],
          [longitude, latitude])
      }, 10000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => this._onViewportChange(viewport))
      .start();
  };

  _onViewportChange = viewport => this.setState({viewport});

  render() {

    const { viewport, settings } = this.state;

    return (
      <div>
        <MapGL
          {...viewport}
          {...settings}
          mapStyle="mapbox://styles/nbumbarg/cj5frr9wz2ktl2srxp4dvpv8o"
          onViewportChange={this._onViewportChange}
          dragToRotate={false}
          mapboxApiAccessToken={token} />
        <ControlPanel containerComponent={this.props.containerComponent}
          onViewportChange={this._easeTo} />
      </div>
    );
  }

}
