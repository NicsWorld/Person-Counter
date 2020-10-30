import React, {Component} from 'react';
import * as cocoSsd from "@tensorflow-models/coco-ssd";

class Webcam extends Component {

  constructor(props) {
    super(props);
    this.runPredictions = this.runPredictions.bind(this);
    this.state = {
      count: 0,
      previousX: '',
      previousCenter: ''
    };
  };
  stylesCanvas = {
    position: 'fixed',
    left: 0,
  };
  loadModel = async() => {
    console.log('loading model');
    this.model = await cocoSsd.load();
    return this.model;
  }

  componentDidMount() {
    const canvas = document.getElementById('canvas2');
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 10;

    ctx.beginPath();       // Start a new path
    ctx.moveTo(320, 0);    // Move the pen to (30, 50)
    ctx.lineTo(320, 720);  // Draw a line to (150, 100)
    ctx.stroke();          // Render the path
    const video = document.getElementById('webcam');

    if(this.getUserMediaSupported()) {
      const constraints = {
        video: true
      };

      navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
        video.srcObject= stream;

      });
      video.onloadeddata = (event) => {
        this.loadModel()
        .then(() => {
          setInterval(this.runPredictions, 10);
          // this.runPredictions()
        }); }

    }
  }


  runPredictions() {
    const video = document.getElementById('webcam');
    const container = document.getElementById('webcam-container');
    // const {count} = this.state;
      let children = [];
      this.model.detect(video).then(function (predictions) {
        container.querySelectorAll('p').forEach(n => n.remove());
        container.querySelectorAll('div').forEach(n => n.remove());
        for (let n = 0; n < predictions.length; n++) {
          if (predictions[n].class === "person" && predictions[n].score > 0.6) {
            const previousX = this.state.previousX;
            console.log(predictions[n]);
            const x = predictions[n].bbox[0];
            if(x <= 315 && x >= 300 && previousX < 300) {
              this.setState(prevState => {
                 return {
                   count: prevState.count + 1
                 }
              });
            }

            if(x >= 325 && x <= 340 && previousX >= 340) {
                this.setState(prevState => {
                   return {
                     count: prevState.count - 1
                   }
                });
            }

            const highlighter = document.createElement('div');
            highlighter.setAttribute('class', 'highlighter');
            highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
                + predictions[n].bbox[1] + 'px; width: '
                + predictions[n].bbox[2] + 'px; height: '
                + predictions[n].bbox[3] + 'px;';

            container.appendChild(highlighter);
            // container.appendChild(p);
            children.push(highlighter);
            // children.push(p);
          }
          this.setState({
            previousX: predictions[n].bbox[0],
            previousCenter: predictions[n].bbox[0] + (predictions[n].bbox[2]/2)
          })
        }
      }.bind(this));
}

  getUserMediaSupported() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
  }



    render() {
      return (
        <div>
        <div id="webcam-container">
          <video id="webcam" autoPlay width="640" height="480"></video>
          <canvas id="canvas2" style={this.stylesCanvas} ref={this.canvasRef2} width="640" height="480"/>
        </div>
        <div className="score">People counted: {this.state.count}</div>
        <div className="score">PreviousX: {this.state.previousX}</div>
        <div className="score">previousCenter: {this.state.previousCenter}</div>
        </div>
      );
    }
}

export default Webcam;
