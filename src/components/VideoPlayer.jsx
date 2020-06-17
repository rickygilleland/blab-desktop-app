import React from 'react';

class VideoPlayer extends React.PureComponent {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        

    }

    componentDidUpdate(prevProps, prevState) {
       
    }

    render() {

        const { renderVideo, stream, publisher, isLocal } = this.props;

        return(
            <video autoPlay ref={renderVideo(stream)} muted={isLocal} className={!publisher.id.includes("_screensharing") ? 'video-flip shadow' : ''} style={{height:"100%",width:"100%", borderRadius: 25}}></video>
        )
    }
}

export default VideoPlayer;