const videoElement = document.getElementById('webcam');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const loadingText = document.getElementById('loading');

// ক্যানভাসের সাইজ স্ক্রিনের সমান করা
function resizeCanvas() {
    canvasElement.width = window.innerWidth;
    canvasElement.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// MediaPipe Hands সেটআপ
const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 0, // সুপার ফাস্ট ট্র্যাকিংয়ের জন্য
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults((results) => {
    // ক্যামেরা চালু হলে লোডিং টেক্সট সরিয়ে ফেলা
    if(loadingText.style.display !== 'none') {
        loadingText.style.display = 'none';
    }

    // প্রতি ফ্রেমে ক্যানভাস পরিষ্কার করা
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // হাতের রেখা (Skeleton) আঁকার কোড
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
            color: '#00ffff', // সায়ান রঙের রেখা
            lineWidth: 3
        });
        drawLandmarks(canvasCtx, landmarks, {
            color: '#ff00ff', // ম্যাজেন্টা রঙের পয়েন্ট
            lineWidth: 1,
            radius: 3
        });
    }
    
    canvasCtx.restore();
});

// ক্যামেরা স্টার্ট করা
const camera = new Camera(videoElement, {
    onFrame: async () => {
        await hands.send({image: videoElement});
    },
    width: 640,
    height: 480,
    facingMode: 'user' // ফ্রন্ট ক্যামেরা
});

camera.start().catch(err => {
    loadingText.innerText = "ক্যামেরা অ্যাক্সেস পাওয়া যায়নি!";
    console.error(err);
});
  
