import React from 'react';
import { ipcRenderer } from 'electron';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
const bodyPix = require('@tensorflow-models/body-pix');

class FaceTrackingNetBackground extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            raw_local_stream: null
        }

        this.startNet = this.startNet.bind(this);
    }

    componentDidMount() {
       this.startNet();
    }

    async startNet() {
        const { settings } = this.props;
        
        let streamOptions;
        if (settings.defaultDevices != null && Object.keys(settings.defaultDevices).length !== 0) {
            streamOptions = {
                video: {
                    aspectRatio: 1.3333333333,
                    deviceId: settings.defaultDevices.videoInput
                },
                audio: false
            }
        } else {
            streamOptions = {
                video: {
                    aspectRatio: 1.3333333333,
                },
                audio: false
            }
        }

        const raw_local_stream = await navigator.mediaDevices.getUserMedia(streamOptions);

        console.log("steam", raw_local_stream);
        console.log("settings", streamOptions);

        let tracks = raw_local_stream.getTracks();
        console.log("tracks", tracks);

        this.setState({ raw_local_stream })

        let localVideo = document.createElement("video")
        localVideo.srcObject = raw_local_stream;
        localVideo.autoplay = true;
        localVideo.muted = true;

        localVideo.onloadedmetadata = () => {
            localVideo.width = localVideo.videoWidth;
            localVideo.height = localVideo.videoHeight;
        }

        const net = await bodyPix.load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            multiplier: 0.5,
            quantBytes: 2
        });

        var personSegmentation = null;

        localVideo.onplaying = async () => {
            async function getUpdatedCoords() {
                const curDate = new Date();
    
                if (personSegmentation == null || (curDate.getTime() - personSegmentation.generated) > 200) {
    
                    personSegmentation = await net.segmentPersonParts(localVideo, {
                        internalResolution: 'low',
                        segmentationThreshold: .6,
                        maxDetections: 1,
                    });  
                    
                    personSegmentation.generated = curDate.getTime();
    
                    ipcRenderer.invoke('face-tracking-update', { type: 'updated_coordinates', personSegmentation });
                }
    
                requestAnimationFrame(getUpdatedCoords);
            }
    
            getUpdatedCoords();
        }

    }

    componentDidUpdate(prevProps, prevState) {
    }

    componentWillUnmount() {
        const { raw_local_stream } = this.state;

        if (raw_local_stream != null) {
            const tracks = raw_local_stream.getTracks();

            tracks.forEach(function(track) {
                track.stop();
            })
        }
    }

    render() {
        return(null);
    }
}

export default FaceTrackingNetBackground;