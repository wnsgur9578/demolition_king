import React, { useEffect, useRef } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import * as drawingUtils from '@mediapipe/drawing_utils';

function PoseOverlay() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      const canvasCtx = canvasRef.current.getContext('2d');
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      if (results.poseLandmarks) {
        drawingUtils.drawConnectors(canvasCtx, results.poseLandmarks, Pose.POSE_CONNECTIONS,
          { color: '#00FF00', lineWidth: 4 });
        drawingUtils.drawLandmarks(canvasCtx, results.poseLandmarks,
          { color: '#FF0000', lineWidth: 2 });
      }
      canvasCtx.restore();
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await pose.send({ image: videoRef.current });
      },
      width: 360,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
    };
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% - 540px - -55px)', // 화면 아래에서 20px 위
        right: '20px',
        width: '360px',
        height: '480px',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 0 10px rgba(0,0,0,0.2)',
        backgroundColor: 'black',
      }}
    >
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
      />
      <canvas
        ref={canvasRef}
        width={360}
        height={540}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default PoseOverlay;
