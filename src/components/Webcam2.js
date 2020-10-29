import React, {Component} from 'react';
import * as cocoSsd from "@tensorflow-models/coco-ssd";

class Webcam2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      currentInfo: '',
      previousCenter: '',
      currentState: ''
    };
  };
  videoRef = React.createRef();
  canvasRef = React.createRef();
  stylesVideo = {
    position: 'fixed',
    top: 250,
    left: 150,
  };

  stylesCanvas = {
    position: 'fixed',
    top: 250,
    left: 150,
  };
  // stylesVideo = {
  //   position: 'fixed',
  //   top: 200,
  //   left: 150,
  // };
  //
  // stylesCanvas = {
  //   position: 'fixed',
  //   top: 200,
  //   left: 450,
  // };

determineIfEntered() {

}
  detectFromVideoFrame = (model, video) => {
    model.detect(video).then(predictions => {
      this.showDetections(predictions);

      requestAnimationFrame(() => {
        this.detectFromVideoFrame(model, video);
      });
    }, (error) => {
      console.log("Couldn't start the webcam")
      console.error(error)
    });
  };

  showDetections = predictions => {
    const ctx = this.canvasRef.current.getContext("2d");
    const previousCenter = this.state.previousCenter;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const font = "24px helvetica";
    ctx.font = font;
    ctx.textBaseline = "top";

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      const center = x + width/2;

      if (prediction.class === "person" && prediction.score > 0.6) {
        if(center <= 320 && center >= 315 && previousCenter <= 315) {
          this.setState(prevState => {
             return {
               count: prevState.count - 1,
               currentInfo: prediction.bbox,
               currentState: 'Entered!'
             }
          });
        }
        if(center >= 325 && center <= 330 && previousCenter <= 330) {
            this.setState(prevState => {
               return {
                 count: prevState.count + 1,
                 currentInfo: prediction.bbox,
                 currentState: 'Exited!'
               }
            });
        }
        ctx.strokeStyle = "#2fff00";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = "#2fff00";

        //my attempt to find the middle of the bbox
        // ctx.beginPath();       // Start a new path
        // ctx.moveTo(width/2, y);    // Move the pen to (30, 50)
        // ctx.lineTo(width/2, height);  // Draw a line to (150, 100)
        // ctx.stroke();

        // const textWidth = ctx.measureText(prediction.class).width;
        // const textHeight = parseInt(font, 10);
        //
        // ctx.fillRect(x, y, textWidth + 10, textHeight + 10);
        // ctx.fillRect(x, y + height - textHeight, textWidth + 15, textHeight + 10);
        //
        // ctx.fillStyle = "#000000";
        // ctx.fillText(prediction.class, x, y);
        // ctx.fillText(prediction.score.toFixed(2), x, y + height - textHeight);
      } //person
      this.setState({
        previousCenter: prediction.bbox[0] + width/2
      });
    });
  };

  componentDidMount() {
    const canvas = document.getElementById('canvas2');
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = "#FF0000";
    ctx.lineWidth = 10;

    ctx.beginPath();       // Start a new path
    ctx.moveTo(320, 0);    // Move the pen to (30, 50)
    ctx.lineTo(320, 720);  // Draw a line to (150, 100)
    ctx.stroke();          // Render the path

    if (navigator.mediaDevices.getUserMedia || navigator.mediaDevices.webkitGetUserMedia) {
      const webcamPromise = navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: false,
        })
        .then(stream => {
          window.stream = stream;
          this.videoRef.current.srcObject = stream;

          return new Promise(resolve => {
            this.videoRef.current.onloadedmetadata = () => {
              resolve();
            };
          });
        }, (error) => {
          console.log("Couldn't start the webcam")
          console.error(error)
        });

      const loadlModelPromise = cocoSsd.load();

      Promise.all([loadlModelPromise, webcamPromise])
        .then(values => {
          this.detectFromVideoFrame(values[0], this.videoRef.current);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }

  render() {
    return (
      <div>
        <video
          style={this.stylesVideo}
          autoPlay
          muted
          playsInline
          ref={this.videoRef}
          width="640"
          height="480"
        />
        <canvas id="canvas" style={this.stylesCanvas} ref={this.canvasRef} width="640" height="480"/>
        <canvas id="canvas2" style={this.stylesCanvas} ref={this.canvasRef2} width="640" height="480"/>
        <div className="score">People counted: {this.state.count}</div>
        <div className="info">Info: x: {this.state.currentInfo[0]} PREVIOUS X: {Math.round(this.state.previousCenter)} Direction: {this.state.currentState}</div>
      </div>
    );
  }
}

export default Webcam2;
