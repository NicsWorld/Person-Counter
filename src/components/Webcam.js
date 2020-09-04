import React, {Component} from 'react';
import * as cocoSsd from "@tensorflow-models/coco-ssd";


class Webcam extends Component {

  constructor(props) {
    super(props);
    // this.model = this.model;
    // this.predictions = this.predictions;
    // this.predictWebcam = this.predictWebcam.bind(this);
    this.runPredictions = this.runPredictions.bind(this);
    this.state = {
      class: ''
    };
  };
  loadModel = async() => {
    console.log('loading model');
    this.model = await cocoSsd.load();
    return this.model;
  }

  componentDidMount() {
    const video = document.getElementById('webcam');

    if(this.getUserMediaSupported()) {

      //only get video not audio
      const constraints = {
        video: true
      };

      navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        video.srcObject= stream;
        // video.addEventListener('loadeddata', this.loadModel().then(() => {
        //   setInterval(this.runPredictions, 1000);
        // }));
      });
      video.onloadeddata = (event) => {
        this.loadModel()
        .then(() => {
          setInterval(this.runPredictions, 1000);
        // window.requestAnimationFrame(this.runPredictions);
        }); }

    }
  }


  runPredictions() {
    const video = document.getElementById('webcam');
    const container = document.getElementById('webcam-container');

      console.log('running predictions');
      let children = [];
      this.model.detect(video).then(function (predictions) {
        container.querySelectorAll('p').forEach(n => n.remove());
        container.querySelectorAll('div').forEach(n => n.remove());
        for (let n = 0; n < predictions.length; n++) {
          if (predictions[n].score > 0.6) {
            const p = document.createElement('p');
            p.innerText = predictions[n].class  + ' - with '
                + Math.round(parseFloat(predictions[n].score) * 100)
                + '% confidence.';
            p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
                + (predictions[n].bbox[1] - 10) + 'px; width: '
                + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

            const highlighter = document.createElement('div');
            highlighter.setAttribute('class', 'highlighter');
            highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
                + predictions[n].bbox[1] + 'px; width: '
                + predictions[n].bbox[2] + 'px; height: '
                + predictions[n].bbox[3] + 'px;';

            container.appendChild(highlighter);
            container.appendChild(p);
            children.push(highlighter);
            children.push(p);
          }
        }
      });
}

  getUserMediaSupported() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
  }



    render() {
      return (
        <div id="webcam-container">
          <video id="webcam" autoPlay width="640" height="480"></video>
        </div>
      );
    }
}

export default Webcam;
