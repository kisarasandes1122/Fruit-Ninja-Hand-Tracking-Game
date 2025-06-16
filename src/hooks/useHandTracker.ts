import { useState, useEffect, useRef } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { GAME_CONFIG } from '../game/constants';

export interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

export interface ProcessedLandmarks {
  indexFinger: { x: number; y: number } | null;
  middleFinger: { x: number; y: number } | null;
  thumb: { x: number; y: number } | null;
  isSlicing: boolean;
  velocity: number;
  sliceStrength: number;
  handConfidence: number;
  gestureType: 'pointing' | 'slicing' | 'idle';
  rawVelocity: number;
  acceleration: number;
  movementDirection: { x: number; y: number };
  fingerDistance: number;
}

interface VelocityPoint {
  x: number;
  y: number;
  timestamp: number;
  velocity: number;
}

export const useHandTracker = () => {
  const [landmarks, setLandmarks] = useState<ProcessedLandmarks>({
    indexFinger: null,
    middleFinger: null,
    thumb: null,
    isSlicing: false,
    velocity: 0,
    sliceStrength: 0,
    handConfidence: 0,
    gestureType: 'idle',
    rawVelocity: 0,
    acceleration: 0,
    movementDirection: { x: 0, y: 0 },
    fingerDistance: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  
  const handLandmarkerRef = useRef<HandLandmarker | null>(null);
  const velocityHistoryRef = useRef<VelocityPoint[]>([]);
  const smoothedPositionsRef = useRef<{
    indexFinger: { x: number; y: number } | null;
    middleFinger: { x: number; y: number } | null;
    thumb: { x: number; y: number } | null;
  }>({
    indexFinger: null,
    middleFinger: null,
    thumb: null
  });
  const lastSliceTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const previousPositionRef = useRef<{ x: number; y: number; timestamp: number } | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const initializeHandTracker = async () => {
      try {
        setIsLoading(true);
        
        // Create video element with optimal settings
        const video = document.createElement('video');
        video.autoplay = true;
        video.playsInline = true;
        video.muted = true;
        video.style.transform = 'scaleX(-1)'; // Mirror for natural interaction
        setVideoElement(video);

        // Get user media with high-quality settings
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            frameRate: { ideal: 60, min: 30 },
            facingMode: 'user'
          }
        });
        video.srcObject = stream;
        await video.play();

        // Initialize MediaPipe with maximum sensitivity
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        
        const handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5, // Lowered for better detection
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        
        handLandmarkerRef.current = handLandmarker;
        setIsLoading(false);
        
        // Start ultra-high-frequency detection loop
        const detectHands = () => {
          if (handLandmarkerRef.current && video && video.readyState >= 2) {
            try {
              const results = handLandmarkerRef.current.detectForVideo(
                video,
                performance.now()
              );
              
              processResults(results);
            } catch (err) {
              console.warn('Hand detection frame skipped:', err);
            }
          }
          animationFrameRef.current = requestAnimationFrame(detectHands);
        };
        
        detectHands();
        
      } catch (err) {
        console.error('Error initializing hand tracker:', err);
        setError('Failed to initialize hand tracking. Please ensure camera access is granted and you\'re using a supported browser.');
        setIsLoading(false);
      }
    };

    const processResults = (results: any) => {
      const now = performance.now();
      
      if (results.landmarks && results.landmarks.length > 0) {
        // Use the most confident hand detection
        let bestHand = results.landmarks[0];
        let bestConfidence = 0.8;
        
        // Calculate hand confidence
        if (results.worldLandmarks && results.worldLandmarks.length > 0) {
          const worldLandmarks = results.worldLandmarks[0];
          bestConfidence = calculateHandConfidence(worldLandmarks);
        }
        
        const handLandmarks = bestHand;
        
        // Extract key landmarks with all finger joints for better tracking
        const indexFingerTip = handLandmarks[8];   // Index finger tip
        const indexFingerPip = handLandmarks[6];   // Index finger PIP joint
        const middleFingerTip = handLandmarks[12]; // Middle finger tip
        const thumbTip = handLandmarks[4];         // Thumb tip
        const wrist = handLandmarks[0];            // Wrist
        
        if (indexFingerTip && middleFingerTip && thumbTip) {
          // Convert to screen coordinates (mirrored)
          const rawPositions = {
            indexFinger: {
              x: (1 - indexFingerTip.x) * window.innerWidth,
              y: indexFingerTip.y * window.innerHeight,
            },
            middleFinger: {
              x: (1 - middleFingerTip.x) * window.innerWidth,
              y: middleFingerTip.y * window.innerHeight,
            },
            thumb: {
              x: (1 - thumbTip.x) * window.innerWidth,
              y: thumbTip.y * window.innerHeight,
            }
          };
          
          // Minimal smoothing for maximum responsiveness
          const smoothingFactor = 0.3; // Reduced for faster response
          const smoothedPositions = applySmoothingToPositions(rawPositions, smoothingFactor);
          
          // Calculate ultra-precise velocity and movement data
          const movementData = calculatePreciseMovement(smoothedPositions.indexFinger, now);
          
          // Detect gesture type with enhanced sensitivity
          const gestureType = detectAdvancedGesture(handLandmarks, indexFingerPip, wrist);
          
          // Calculate finger distances for additional gesture context
          const fingerDistance = calculateFingerDistance(smoothedPositions);
          
          // ULTIMATE SLICE DETECTION - Multiple redundant methods
          const sliceData = detectSliceUltimate(
            movementData,
            smoothedPositions,
            gestureType,
            fingerDistance,
            bestConfidence,
            now
          );
          
          setLandmarks({
            indexFinger: smoothedPositions.indexFinger,
            middleFinger: smoothedPositions.middleFinger,
            thumb: smoothedPositions.thumb,
            isSlicing: sliceData.isSlicing,
            velocity: movementData.smoothedVelocity,
            sliceStrength: sliceData.strength,
            handConfidence: bestConfidence,
            gestureType,
            rawVelocity: movementData.rawVelocity,
            acceleration: movementData.acceleration,
            movementDirection: movementData.direction,
            fingerDistance
          });
        }
      } else {
        // Hand not detected - reset tracking state
        resetTrackingState();
      }
    };

    const calculateHandConfidence = (worldLandmarks: any[]): number => {
      if (!worldLandmarks || worldLandmarks.length === 0) return 0;
      
      let confidence = 0.6; // Base confidence
      
      // Check landmark stability
      const validLandmarks = worldLandmarks.filter(landmark => 
        Math.abs(landmark.x) < 0.8 && Math.abs(landmark.y) < 0.8 && Math.abs(landmark.z) < 0.5
      );
      
      confidence += (validLandmarks.length / worldLandmarks.length) * 0.4;
      
      return Math.min(1.0, confidence);
    };

    const applySmoothingToPositions = (rawPositions: any, smoothingFactor: number) => {
      const smoothed = { ...rawPositions };
      
      Object.keys(rawPositions).forEach(key => {
        if (smoothedPositionsRef.current[key as keyof typeof smoothedPositionsRef.current]) {
          const prev = smoothedPositionsRef.current[key as keyof typeof smoothedPositionsRef.current]!;
          smoothed[key] = {
            x: prev.x * smoothingFactor + rawPositions[key].x * (1 - smoothingFactor),
            y: prev.y * smoothingFactor + rawPositions[key].y * (1 - smoothingFactor)
          };
        }
      });
      
      smoothedPositionsRef.current = smoothed;
      return smoothed;
    };

    const calculatePreciseMovement = (position: { x: number; y: number }, timestamp: number) => {
      // Add to velocity history
      velocityHistoryRef.current.push({
        x: position.x,
        y: position.y,
        timestamp,
        velocity: 0
      });
      
      // Keep optimal history length
      if (velocityHistoryRef.current.length > 15) {
        velocityHistoryRef.current = velocityHistoryRef.current.slice(-15);
      }
      
      let rawVelocity = 0;
      let smoothedVelocity = 0;
      let acceleration = 0;
      let direction = { x: 0, y: 0 };
      
      if (velocityHistoryRef.current.length >= 2) {
        const current = velocityHistoryRef.current[velocityHistoryRef.current.length - 1];
        const previous = velocityHistoryRef.current[velocityHistoryRef.current.length - 2];
        
        const dx = current.x - previous.x;
        const dy = current.y - previous.y;
        const dt = current.timestamp - previous.timestamp;
        
        if (dt > 0) {
          rawVelocity = Math.sqrt(dx * dx + dy * dy) / dt * 1000;
          
          // Calculate direction
          const magnitude = Math.sqrt(dx * dx + dy * dy);
          if (magnitude > 0) {
            direction = { x: dx / magnitude, y: dy / magnitude };
          }
        }
        
        // Calculate smoothed velocity from recent history
        const recentPoints = velocityHistoryRef.current.slice(-5);
        if (recentPoints.length >= 2) {
          let totalVelocity = 0;
          let validSamples = 0;
          
          for (let i = 1; i < recentPoints.length; i++) {
            const curr = recentPoints[i];
            const prev = recentPoints[i - 1];
            const dx = curr.x - prev.x;
            const dy = curr.y - prev.y;
            const dt = curr.timestamp - prev.timestamp;
            
            if (dt > 0) {
              totalVelocity += Math.sqrt(dx * dx + dy * dy) / dt * 1000;
              validSamples++;
            }
          }
          
          smoothedVelocity = validSamples > 0 ? totalVelocity / validSamples : 0;
        }
        
        // Calculate acceleration
        if (velocityHistoryRef.current.length >= 3) {
          const recent = velocityHistoryRef.current.slice(-3);
          const v1 = Math.sqrt(
            Math.pow(recent[1].x - recent[0].x, 2) + 
            Math.pow(recent[1].y - recent[0].y, 2)
          ) / (recent[1].timestamp - recent[0].timestamp) * 1000;
          
          const v2 = Math.sqrt(
            Math.pow(recent[2].x - recent[1].x, 2) + 
            Math.pow(recent[2].y - recent[1].y, 2)
          ) / (recent[2].timestamp - recent[1].timestamp) * 1000;
          
          acceleration = v2 - v1;
        }
      }
      
      return { rawVelocity, smoothedVelocity, acceleration, direction };
    };

    const detectAdvancedGesture = (landmarks: any[], indexPip: any, wrist: any): 'pointing' | 'slicing' | 'idle' => {
      if (!landmarks || !indexPip || !wrist) return 'idle';
      
      const indexTip = landmarks[8];
      const middleTip = landmarks[12];
      const ringTip = landmarks[16];
      const pinkyTip = landmarks[20];
      
      // More sensitive finger extension detection
      const indexExtended = indexTip.y < indexPip.y - 0.01;
      const middleExtended = middleTip.y < landmarks[9].y - 0.01;
      const ringExtended = ringTip.y < landmarks[13].y - 0.01;
      const pinkyExtended = pinkyTip.y < landmarks[17].y - 0.01;
      
      const extendedFingers = [indexExtended, middleExtended, ringExtended, pinkyExtended].filter(Boolean).length;
      
      // More permissive gesture detection
      if (indexExtended && extendedFingers >= 1) {
        return extendedFingers >= 2 ? 'slicing' : 'pointing';
      }
      
      return 'idle';
    };

    const calculateFingerDistance = (positions: any): number => {
      if (!positions.indexFinger || !positions.thumb) return 0;
      
      return Math.sqrt(
        Math.pow(positions.indexFinger.x - positions.thumb.x, 2) +
        Math.pow(positions.indexFinger.y - positions.thumb.y, 2)
      );
    };

    const detectSliceUltimate = (
      movementData: any,
      positions: any,
      gestureType: string,
      fingerDistance: number,
      confidence: number,
      timestamp: number
    ) => {
      const { rawVelocity, smoothedVelocity, acceleration } = movementData;
      const timeSinceLastSlice = timestamp - lastSliceTimeRef.current;
      
      let isSlicing = false;
      let strength = 0;
      
      // ULTRA-SENSITIVE DETECTION - Multiple triggers
      const cooldownOk = timeSinceLastSlice > 50; // Very short cooldown
      
      if (cooldownOk && confidence > 0.3) {
        // Method 1: Raw velocity (most sensitive)
        if (rawVelocity > 150) {
          isSlicing = true;
          strength = Math.min(1.0, rawVelocity / 800);
        }
        
        // Method 2: Smoothed velocity (for sustained movement)
        if (smoothedVelocity > 120) {
          isSlicing = true;
          strength = Math.max(strength, Math.min(1.0, smoothedVelocity / 600));
        }
        
        // Method 3: Acceleration-based (for quick flicks)
        if (Math.abs(acceleration) > 100) {
          isSlicing = true;
          strength = Math.max(strength, Math.min(1.0, Math.abs(acceleration) / 400));
        }
        
        // Method 4: Gesture-based (lower thresholds for pointing/slicing)
        if (gestureType === 'pointing' && rawVelocity > 100) {
          isSlicing = true;
          strength = Math.max(strength, Math.min(1.0, rawVelocity / 500));
        }
        
        if (gestureType === 'slicing' && rawVelocity > 80) {
          isSlicing = true;
          strength = Math.max(strength, Math.min(1.0, rawVelocity / 400));
        }
        
        // Method 5: Finger distance change (pinch/spread detection)
        if (fingerDistance > 50 && rawVelocity > 80) {
          isSlicing = true;
          strength = Math.max(strength, 0.6);
        }
        
        // Method 6: Any significant movement with extended finger
        if (gestureType !== 'idle' && rawVelocity > 60) {
          isSlicing = true;
          strength = Math.max(strength, 0.4);
        }
      }
      
      if (isSlicing) {
        lastSliceTimeRef.current = timestamp;
        console.log(`🗡️ SLICE DETECTED! Velocity: ${rawVelocity.toFixed(0)}, Strength: ${strength.toFixed(2)}, Gesture: ${gestureType}`);
      }
      
      return { isSlicing, strength };
    };

    const resetTrackingState = () => {
      setLandmarks({
        indexFinger: null,
        middleFinger: null,
        thumb: null,
        isSlicing: false,
        velocity: 0,
        sliceStrength: 0,
        handConfidence: 0,
        gestureType: 'idle',
        rawVelocity: 0,
        acceleration: 0,
        movementDirection: { x: 0, y: 0 },
        fingerDistance: 0
      });
      
      smoothedPositionsRef.current = {
        indexFinger: null,
        middleFinger: null,
        thumb: null
      };
      
      velocityHistoryRef.current = [];
    };

    initializeHandTracker();

    return () => {
      // Cleanup
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (handLandmarkerRef.current) {
        handLandmarkerRef.current.close();
      }
      
      setVideoElement(null);
    };
  }, []);

  return { landmarks, isLoading, error, videoElement };
};