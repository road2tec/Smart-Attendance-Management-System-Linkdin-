import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, LoaderCircle, UserCheck, MapPin, Check, AlertTriangle, X, Sparkles, CheckCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Attendance Component that handles face verification and location checking
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.classItem - Class information object with at least _id and title
 * @param {boolean} props.isDark - Whether to use dark mode styling
 * @param {Function} props.verifyFace - Function that receives face embedding data and returns a Promise that resolves to {success: boolean}
 * @param {Function} props.checkLocationAndMarkPresent - Function that receives {classId, location} and returns a Promise that resolves to {isValid: boolean}
 * @param {string} props.modelsPath - Path to face-api models, defaults to '/models'
 */
const AttendanceComponent = ({ 
  isOpen, 
  onClose, 
  classItem, 
  isDark,
  verifyFace,
  checkLocationAndMarkPresent,
  modelsPath = '/models'
}) => {
  // Component state
  const [step, setStep] = useState('initial');
  const [stream, setStream] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [username, setUsername] = useState(''); 
  const [autoCloseTimeout, setAutoCloseTimeout] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0); 
  
  // References
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Load face-api models on component mount
  useEffect(() => {
    if (!isOpen) return;
    
    // Get username from localStorage
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};
    setUsername(user.firstName || user.name || 'Champ');
    
    const loadModels = async () => {
      try {
        const MODEL_URL = modelsPath;
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        
        setModelsLoaded(true);
      } catch (error) {
        console.error('[FaceAPI] Error loading models:', error);
        setErrorMsg('Failed to load face detection models');
        setStep('error');
        toast.error('Face verification service unavailable');
      }
    };

    loadModels();

    return () => {
      stopCamera();
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
    };
  }, [isOpen, modelsPath]);

  // Reset component state when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetComponentState();
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 } 
        } 
      });
      
      if (!videoRef.current) return;
      
      videoRef.current.srcObject = mediaStream;
      videoRef.current.onloadedmetadata = async () => {
        try {
          await videoRef.current.play();
          setStream(mediaStream);
          setTimeout(() => detectFace(), 800);
        } catch (err) {
          setErrorMsg('Failed to start video stream');
          setStep('error');
        }
      };
      
    } catch (error) {
      setErrorMsg('Camera access denied. Please enable permissions.');
      setStep('error');
    }
  };
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const REQUIRED_FRAMES = 10;

  const detectFace = async (frameCount = 0) => {
    if (!videoRef.current || !canvasRef.current || step !== 'camera') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState !== 4) {
      setTimeout(() => detectFace(frameCount), 100);
      return;
    }

    try {
      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      faceapi.matchDimensions(canvas, displaySize);

      const detections = await faceapi
        .detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors();

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detections.length === 0) {
        if (frameCount > 0) setDetectionProgress(0);
        setTimeout(() => detectFace(0), 400);
        return;
      }

      // Draw custom stylized landmarks
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      ctx.strokeStyle = '#506EE5';
      ctx.lineWidth = 2;
      resizedDetections.forEach(det => {
        const box = det.detection.box;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
      });

      const newFrameCount = frameCount + 1;
      setDetectionProgress(Math.floor((newFrameCount / REQUIRED_FRAMES) * 100));

      if (newFrameCount >= REQUIRED_FRAMES) {
        const faceDescriptor = resizedDetections[0].descriptor;
        processFaceEmbedding(Array.from(faceDescriptor));
      } else {
        setTimeout(() => detectFace(newFrameCount), 200);
      }

    } catch (error) {
      setErrorMsg('Critical facial recognition error.');
      setStep('error');
    }
  };

  const processFaceEmbedding = async (embeddingData) => {
    setStep('processing');
    setIsLoading(true);
    try {
      const result = await verifyFace(embeddingData);
      if (result && result.success) {
        setStep('face-verified');
        getLocation();
      } else {
        setErrorMsg('Face verification failed. Bio-match mismatch.');
        setStep('error');
      }
    } catch (error) {
      setErrorMsg('verification failed: ' + (error?.message || 'Server error'));
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const getLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation not supported.');
      setStep('error');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        
        setIsLoading(true);
        try {
          const result = await checkLocationAndMarkPresent({
            classId: classItem._id,
            location: userLocation,
          });
          
          if (result && result.isValid) {
            setStep('success');
            const timeoutId = setTimeout(() => handleClose(), 5000);
            setAutoCloseTimeout(timeoutId);
          } else {
            setErrorMsg('Location mismatch. You must be in the classroom.');
            setStep('error');
          }
        } catch (error) {
          setErrorMsg('Location error: ' + (error?.message || 'Access denied'));
          setStep('error');
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setErrorMsg('Please enable location services to proceed.');
        setStep('error');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };
  
  const resetComponentState = () => {
    stopCamera();
    setStep('initial');
    setErrorMsg('');
    setIsLoading(false);
    setDetectionProgress(0);
  };

  const handleStart = () => {
    setStep('camera');
    startCamera();
  };
  
  const handleClose = () => {
    resetComponentState();
    onClose();
  };
  
  const handleRetry = () => {
    resetComponentState();
    setStep('initial');
  };

  const getGenZCaption = () => {
    switch(step) {
      case 'initial': return "Time for class! Let's mark your attendance. ✨";
      case 'camera': return "Scanning your face... please hold still! 💅";
      case 'processing': return "Checking your scan... almost there! 🔒";
      case 'face-verified': return "Face match found! Now checking your location... 📍";
      case 'success': return "Success! Your attendance is recorded. 👑💯";
      case 'error': return "Oops! Something went wrong. 💀";
      default: return "Starting scan... no cap! ⚡";
    }
  };

  if (!isOpen) return null;
  
  return (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-md transition-all duration-300 ${isDark ? 'bg-black/60' : 'bg-indigo-900/20'}`}>
      <div className={`relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 font-sans ${isDark ? 'bg-[#0A0E13] border border-[#1E2733]' : 'bg-white border border-gray-100'}`}>
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className={`absolute top-5 right-5 z-20 p-2 rounded-full transition-all ${isDark ? 'hover:bg-gray-800 text-gray-500 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-900'}`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h3 className={`text-2xl font-extrabold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {step === 'success' ? 'Attendance Success!' : 'Class Check-in'}
            </h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${isDark ? 'bg-indigo-500/10 text-brand-light' : 'bg-indigo-50 text-indigo-700'}`}>
              {classItem?.course?.courseCode || 'LIVE'} <span className="mx-2 opacity-30">•</span> {classItem?.title || 'Session'}
            </div>
          </div>

          {/* GenZ Caption Card */}
          <div className={`mb-8 p-4 rounded-2xl relative overflow-hidden flex items-center gap-4 ${isDark ? 'bg-[#121A22] border border-[#1E2733]' : 'bg-indigo-50/50 border border-indigo-100'}`}>
             <div className={`p-2.5 rounded-xl ${isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-600 text-white'}`}>
                <Sparkles className="w-5 h-5" />
             </div>
             <div>
                <p className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-indigo-900'}`}>{getGenZCaption()}</p>
                <p className={`text-[11px] font-semibold tracking-wide ${isDark ? 'text-gray-500' : 'text-indigo-400'} uppercase mt-0.5`}>Current Status</p>
             </div>
          </div>

          {/* Dynamic Content Area */}
          <div className="min-h-[300px] flex flex-col justify-center">
            {step === 'initial' && (
              <div className="text-center animate-in fade-in slide-in-from-bottom-4">
                <div className={`relative w-24 h-24 mx-auto mb-6 flex items-center justify-center rounded-3xl ${isDark ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' : 'bg-indigo-600'} shadow-lg`}>
                  <Camera className="h-10 w-10 text-white" />
                  <div className="absolute -right-2 -bottom-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-current flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className={`mb-8 font-medium px-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>We need to verify your bio-match and GPS coordinates to secure your attendance.</p>
                <button 
                  onClick={handleStart} 
                  className={`w-full py-4 rounded-2xl font-extrabold text-sm uppercase tracking-widest transition-all shadow-lg ${
                    !modelsLoaded 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-indigo-300'
                  }`}
                  disabled={!modelsLoaded}
                >
                  {!modelsLoaded ? (
                    <span className="flex items-center justify-center">
                      <LoaderCircle className="h-5 w-5 mr-3 animate-spin" />
                      Starting Scan...
                    </span>
                  ) : (
                    "Start Check-in"
                  )}
                </button>
              </div>
            )}

            {step === 'camera' && (
              <div className="animate-in fade-in zoom-in-95">
                <div className={`relative w-full h-[280px] rounded-3xl overflow-hidden border-4 ${isDark ? 'border-[#1E2733]' : 'border-gray-100'} bg-black shadow-inner`}>
                  <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover grayscale-[30%]" autoPlay playsInline muted />
                  <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
                  
                  {/* Scanning Overlay */}
                  <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-[1px] bg-indigo-500 shadow-[0_0_15px_#6366f1] animate-pulse"></div>
                  
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest">
                    Scanning your face...
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between items-end mb-2">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Verification Progress</p>
                    <p className={`text-xs font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{detectionProgress}%</p>
                  </div>
                  <div className={`w-full h-3 rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'} overflow-hidden`}>
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${detectionProgress}%` }}
                    />
                  </div>
                  <p className={`mt-3 text-[11px] text-center font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Hold steady... scanning landmarks for bio-authentication
                  </p>
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className="text-center py-12 animate-in fade-in">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
                <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Confirming it's you...</h4>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Checking face against records</p>
              </div>
            )}

            {step === 'face-verified' && (
              <div className="text-center py-10 animate-in zoom-in-95">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                  <UserCheck className="w-10 h-10" />
                </div>
                <h4 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Face Confirmed!</h4>
                <div className="flex items-center justify-center gap-2 mb-6">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                   <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Checking your location...</p>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-6 animate-in zoom-in-95">
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'}`}>
                  <Check className="h-12 w-12" strokeWidth={3} />
                </div>
                <h3 className={`text-2xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Attendance Success! 💼</h3>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-10`}>Your presence has been recorded successfully.</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#121A22] border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                    <CheckCircle className="w-5 h-5 text-emerald-500 mb-2 mx-auto" />
                    <p className="text-[10px] font-black uppercase text-emerald-600">Face Scan</p>
                    <p className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Verified</p>
                  </div>
                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#121A22] border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                    <MapPin className="w-5 h-5 text-emerald-500 mb-2 mx-auto" />
                    <p className="text-[10px] font-black uppercase text-emerald-600">School Location</p>
                    <p className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Valid</p>
                  </div>
                </div>
              </div>
            )}

            {step === 'error' && (
              <div className="text-center py-6 animate-in slide-in-from-top-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-50 text-rose-600'}`}>
                  <AlertTriangle className="h-10 w-10" />
                </div>
                <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Check-in Failed</h3>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-8 px-8`}>
                  {errorMsg || "The verification process was interrupted or data didn't match."}
                </p>
                <div className="flex gap-4">
                   <button 
                  onClick={handleRetry} 
                  className={`flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md ${
                    isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Try Again
                </button>
                <button 
                  onClick={handleClose} 
                  className={`flex-1 py-3.5 rounded-2xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20`}
                >
                  Dismiss
                </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info ONLY on non-final states */}
        {step !== 'success' && step !== 'error' && (
          <div className={`p-5 px-8 flex justify-between items-center ${isDark ? 'bg-[#121A22]/50 border-t border-[#1E2733]' : 'bg-gray-50 border-t border-gray-100'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Smart-Attendance v4.0</p>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-emerald-500' : 'bg-emerald-500'}`}></span>
          </div>
        )}

        <ToastContainer position="top-center" autoClose={3000} theme={isDark ? "dark" : "light"} />
      </div>
    </div>
  );
};

export default AttendanceComponent;