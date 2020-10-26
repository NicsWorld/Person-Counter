import React, {Component} from 'react';
import * as cocoSsd from "@tensorflow-models/coco-ssd";

class Webcam2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0
    };
  };
  videoRef = React.createRef();
  canvasRef = React.createRef();

  stylesVideo = {
    position: 'fixed',
    top: 150,
    left: 150,
  };

  stylesCanvas = {
    position: 'fixed',
    top: 150,
    left: 450,
  };



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
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const font = "24px helvetica";
    ctx.font = font;
    ctx.textBaseline = "top";

    predictions.forEach(prediction => {
      if (prediction.class === "person" && prediction.score > 0.6) {
        console.log(prediction);
        this.setState(prevState => {
           return {count: prevState.count + 1}
        });

        const x = prediction.bbox[0];
        const y = prediction.bbox[1];
        const width = prediction.bbox[2];
        const height = prediction.bbox[3];

        ctx.strokeStyle = "#2fff00";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = "#2fff00";

        const textWidth = ctx.measureText(prediction.class).width;
        const textHeight = parseInt(font, 10);

        ctx.fillRect(x, y, textWidth + 10, textHeight + 10);
        ctx.fillRect(x, y + height - textHeight, textWidth + 15, textHeight + 10);

        ctx.fillStyle = "#000000";
        ctx.fillText(prediction.class, x, y);
        ctx.fillText(prediction.score.toFixed(2), x, y + height - textHeight);
      }
    });
  };

  componentDidMount() {
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
          width="1200"
          height="720"
        />
        <canvas style={this.stylesCanvas} ref={this.canvasRef} width="720" height="650" />
        <div className="score">People counted: {this.state.count}</div>
      </div>
    );
  }
}

export default Webcam2;
