import React,{Component} from 'react';
import { MorphReplace } from 'react-svg-morph';
import IconicDisplay from './IconicDisplay.jsx';

const defaultState = {
  started:false,
  thumb:false,
  timestamp: 0,
  duration:false,
  currentTime:"0:0",
  timePercent:0+"%",
  volume:1,
  playback:false,
  muted:false,
  playbackSpeed:1,
  videoEffect:0
}

class VideoManipulation extends Component {
  constructor(props){
    super(props);
    this.state = {
      fileName: 'video_demo',
      ...defaultState
    }

    this.drawLoader = this.drawLoader.bind(this);
    this.drawThumb = this.drawThumb.bind(this);
    this.downloadImage = this.downloadImage.bind(this);
    this.drawControllers = this.drawControllers.bind(this);
    this.handleVideoPlayback = this.handleVideoPlayback.bind(this);
    this.handleMute = this.handleMute.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.handleFullscreen = this.handleFullscreen.bind(this);
    this.videoLoopInCanvas = this.videoLoopInCanvas.bind(this);
    this.filterCanvas = this.filterCanvas.bind(this);
    this.grayscaleFilter = this.grayscaleFilter.bind(this);
    this.invertFilter = this.invertFilter.bind(this);
    this.playbackWithEffect = this.playbackWithEffect.bind(this);
  }
  componentWillMount(){

  }
  componentDidMount() {
    this.initCanvas();
    this.drawLoader();
    this.drawControllers();
    this.videoLoopInCanvas();
  }
  initCanvas(){
    this.canvas = this.refs.canvas;
    this.video_canvas = this.refs.video_canvas;
    this.video = this.refs.video;
    this.vw = this.video_canvas.clientWidth;
    this.vh = this.video_canvas.clientHeight;
    this.w = this.canvas.clientWidth;
    this.h = this.canvas.clientHeight;
    this.vctx = this.video_canvas.getContext('2d');
    this.vctx.canvas.width  = this.vw;
    this.vctx.canvas.height = this.vh;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.canvas.width  = this.w;
    this.ctx.canvas.height = this.h;

    this.vctx.fillStyle = '#0f0f0f';
    this.vctx.fillRect(0, 0, this.vw, this.vh);
    this.vctx.strokeStyle = '#ffffff';
    this.vctx.strokeRect(0, 0, this.vw, this.vh);
  }
  videoLoopInCanvas() {
    this.vctx.canvas.width = this.video.videoWidth;
    this.vctx.canvas.height = this.video.videoHeight;

    this.playbackWithEffect();
    window.setTimeout(this.videoLoopInCanvas, 10);
  }
  handleVideoPlayback(){
    if(this.video.paused) {
      this.setState({
        playback:true,
        started:true
      },function(){
        this.video.play();
      }.bind(this));
    }
    else {
      this.setState({
        playback:false
      },function(){
        this.video.pause()
      }.bind(this));
    }

    return false;
  }
  handleMute(){
      this.setState({
        muted: !this.state.muted
      },function(){
        this.video.muted = !this.video.muted;
      }.bind(this));
    return false;
  }
  handleVolumeChange(e){
    this.setState({
      volume: e.target.value
    },function(){
      this.video.volume = this.state.volume
    });
  }

  handlePlaybackLocation(e){
    console.log(e.target,'');
  }

  handlePlaybackSpeed(playbackSpeed) {
    this.setState({playbackSpeed},
      function(){
        this.video.playbackRate = playbackSpeed;
        return false;
      }.bind(this))
  }
  drawControllers(){
    this.video.addEventListener("loadedmetadata", function() {
      var minutes = Math.floor(this.video.duration / 60);
      var seconds = this.video.duration - minutes * 60;
      var duration = parseInt(minutes)+":"+parseInt(seconds);

      this.setState({
        duration
      });
    }.bind(this));
    this.video.addEventListener("timeupdate", function() {
      var minutes = Math.floor(this.video.currentTime / 60);
      var seconds = this.video.currentTime - minutes * 60;
      var currentTime = parseInt(minutes)+":"+parseInt(seconds);
      var maxduration = this.video.duration;
      var percentage = 100 * this.video.currentTime / maxduration;

      this.setState({
        currentTime,
        timePercent: percentage+'%'
      });
    }.bind(this));
  }
  handleFullscreen(){
    if (this.video.requestFullscreen) {
      this.video.requestFullscreen();
    } else if (this.video.msRequestFullscreen) {
      this.video.msRequestFullscreen();
    } else if (this.video.mozRequestFullScreen) {
      this.video.mozRequestFullScreen();
    } else if (this.video.webkitRequestFullscreen) {
      this.video.webkitRequestFullscreen();
    }
    return false;
  }
  drawLoader(){
    this.setState(defaultState);
    this.ctx.clearRect(0,0,this.w,this.h);
    this.ctx.font = "20px sans-serif";
    this.ctx.fillStyle = "#c0c0c0";
    this.ctx.textAlign = "center";
    this.ctx.fillText("Waiting for Thumbnail...",(this.w/2),(this.h/2));
    this.ctx.strokeStyle = "rgba(225,225,225, 0.20)";
    this.ctx.strokeText("Waiting for Thumbnail...",(this.w/2),(this.h/2));
  }
  drawThumb(){
    this.setState({
      thumb:true,
      timestamp: this.video.currentTime,
    });
    this.ctx.drawImage(this.video_canvas,0,0,this.w,this.h);
  }
  downloadImage(){
    var image = this.canvas.toDataURL();
    var aLink = document.createElement('a');
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("click");
    aLink.download = this.state.fileName+'_thumb_'+this.state.timestamp+'.png';
    aLink.href = image;
    aLink.dispatchEvent(evt);
  }
  handleVideoChange(fileName){
      this.setState({
        fileName
      },function(){
        this.reloadVideo()
      }.bind(this)
    ) ;
  }


  filterCanvas(filter,firterargs) {
    if (this.vw > 0 && this.vh > 0) {
      this.vctx.drawImage(this.video, 0, 0, this.vctx.canvas.width, this.vctx.canvas.height);
      var imageData = this.vctx.getImageData(0, 0, this.vctx.canvas.width, this.vctx.canvas.height);
      filter(imageData,firterargs);
      this.vctx.putImageData(imageData, 0, 0);
    }
  }
  invertFilter(pixels){
    var d = pixels.data;
    for (var i = 0; i < d.length; i += 4) {
      d[i]     = 255 - d[i];     // red
      d[i + 1] = 255 - d[i + 1]; // green
      d[i + 2] = 255 - d[i + 2]; // blue
    }
    return pixels;
  };

  grayscaleFilter(pixels){
    var d = pixels.data;
    for (var i = 0; i < d.length; i += 4) {
      var r = d[i];
      var g = d[i + 1];
      var b = d[i + 2];
      d[i] = d[i + 1] = d[i + 2] = (r+g+b)/3;
    }
    return pixels;
  };



  playbackWithEffect(){
    switch(this.state.videoEffect){
      case 1:
        this.filterCanvas(this.grayscaleFilter);
        break;
      case 2:
        this.filterCanvas(this.invertFilter);
        break;
      case 3:
        //this.filterCanvas(this.sharpenFilter);
        break;
      default:
        this.vctx.drawImage(this.video , 0, 0);
        break;
    }

  }

  handleEffect(videoEffect){
    this.setState({
      videoEffect
    });
    return
  }
  reloadVideo() {
    this.video.load();
    this.drawLoader();
  }
  render() {
   var timelineStyle = {width: this.state.timePercent}
   var volumeKnobStyle = {left: this.state.volumePercent}

   return (
     <div className="page mt20">
       <div className="action-buttons light row">
         <div className="col-sm-6">
           <div className="action-buttons row">
             <div className="col-xs-6 col-sm-4 text-left">
               <div className="input-group">
                 <span className="input-group-addon lbl">
                   <label>video</label>
                 </span>
                <span onClick={()=>{this.handleVideoChange("video_demo")}} className={"input-group-addon btn "+ (this.state.fileName=="video_demo" ? "active" : "")}>1</span>
                <span onClick={()=>{this.handleVideoChange("video_demo2")}} className={"input-group-addon btn "+ (this.state.fileName=="video_demo2" ? "active" : "")}>2</span>
                <span onClick={()=>{this.handleVideoChange("video_demo3")}} className={"input-group-addon btn "+ (this.state.fileName=="video_demo3" ? "active" : "")}>3</span>
               </div>
             </div>
             <div className="col-xs-6 col-sm-4 text-center">
               <div className="input-group">
                 <span className={"input-group-addon btn "+ (this.state.videoEffect==0 ? "active" : "")} onClick={this.handleEffect.bind(this,0)}>Normal</span>
                 <span className={"input-group-addon btn "+ (this.state.videoEffect==1 ? "active" : "")} onClick={this.handleEffect.bind(this,1)}>B&W</span>
                 <span className={"input-group-addon btn "+ (this.state.videoEffect==2 ? "active" : "")} onClick={this.handleEffect.bind(this,2)}>Invert</span>
               </div>
             </div>
             <div className="col-xs-6 col-sm-4 text-right">
               <div className="input-group">
                <span className={"input-group-addon btn "+ (this.state.playbackSpeed==0.5 ? "active" : "")} onClick={this.handlePlaybackSpeed.bind(this,0.5)}>.5x</span>
                <span className={"input-group-addon btn "+ (this.state.playbackSpeed==1 ? "active" : "")} onClick={this.handlePlaybackSpeed.bind(this,1)}>1x</span>
                <span className={"input-group-addon btn "+ (this.state.playbackSpeed==2 ? "active" : "")} onClick={this.handlePlaybackSpeed.bind(this,2)}>2x</span>
               </div>
             </div>
           </div>
         </div>
         <div className="col-sm-6 text-right">
           <div className="action-buttons row">
             <div className="col-sm-6 text-left">
               <button type="button" className="btn btn-primary" onClick={this.drawThumb}>Generate Thumbnail</button>
             </div>
             <div className="col-sm-6 text-right">
               <button type="button" className={'btn btn-success ' + (this.state.thumb?'visible':'hidden')} onClick={this.downloadImage}>Save Thumbnail</button>
               <button type="button" className={'btn btn-danger ' + (this.state.thumb?'visible':'hidden')} onClick={this.drawLoader}>Clear</button>
             </div>
           </div>
         </div>
       </div>
       <div className="row">
         <div className="col-xs-12 col-sm-6 relative video_wrap">
           <div className="custom-controls">
             <div className="row">
               <div className="col-xs-1">
                 <MorphReplace rotation="none" width={20} height={20} onClick={this.handleVideoPlayback}>
                     {this.state.playback?<IconicDisplay width={20} height={20} key="pause" svg="pause" fill="#00a0e0"  />:<IconicDisplay width={20} height={20} key="play" svg="play" fill="#00a0e0"  />}
                 </MorphReplace>
               </div>
               <div className="col-xs-6">
                 <div className="progressBar" ref="progressBar">
                   <div className="timeBar" ref="timeBar" style={timelineStyle}></div>
                 </div>
               </div>
               <div className="col-xs-1">
                  {this.state.started ? this.state.currentTime:this.state.duration}
               </div>
               <div className="col-xs-3">
                 <div className="row">
                   <div className="col-xs-3">
                     <MorphReplace rotation="none" width={20} height={20} onClick={this.handleMute}>
                         {this.state.muted?<IconicDisplay width={20} height={20} key="mute" svg="mute" fill="#00a0e0"  />:<IconicDisplay width={20} height={20} key="unmute" svg="unmute" fill="#00a0e0"  />}
                     </MorphReplace>
                   </div>
                   <div className="col-xs-9">
                     <input id="volume" type="range" min="0" max="1" step="0.1" value={this.state.volume} onChange={this.handleVolumeChange}/>
                   </div>
                 </div>
               </div>
               <div className="col-xs-1 form-group">
                 <IconicDisplay svg="fullscreen" fill="#00a0e0" width={20} height={20} onClick={this.handleFullscreen} />
               </div>
             </div>
           </div>
          <canvas ref="video_canvas" />
          <video id='v' loop width="500" ref="video" className={this.state.fileName}>
            <source src={'./assets/video/'+this.state.fileName+'.webm'} type='video/webm' />
            <source src={'./assets/video/'+this.state.fileName+'.ogv'} type='video/ogg' />
            <source src={'./assets/video/'+this.state.fileName+'.mp4'} type='video/mp4' />
            <p>Your browser does not support the video tag.</p>
          </video>
        </div>
        <div className="col-xs-12 col-sm-6">
          <canvas ref="canvas" />
        </div>
       </div>
     </div>);
  }
}
function getOffset(el) {
  el = el.getBoundingClientRect();
  return {
    left: el.left + window.scrollX,
    top: el.top + window.scrollY
  }
}
export default VideoManipulation
