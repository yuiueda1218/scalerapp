// script.js
document.addEventListener('DOMContentLoaded', () => {
    const image = document.getElementById('image');
    const canvas = document.getElementById('canvas');
    const distanceDisplay = document.getElementById('distanceDisplay');
    const fileInput = document.getElementById('fileInput');
    const pasteButton = document.getElementById('pasteButton');
    const calibrationButton = document.getElementById('calibrationButton');
    const ctx = canvas.getContext('2d');

    let clicks = [];
    let firstDistance = null;
    let calibrating = false;

    image.addEventListener('load', () => {
        canvas.width = image.width;
        canvas.height = image.height;
    });

    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // 垂直線を描く
        drawVerticalLine(ctx, x, 0, canvas.height);

        clicks.push({ x, y });

        if (calibrating && clicks.length === 2) {
            firstDistance = Math.abs(clicks[0].x - clicks[1].x);
            distanceDisplay.innerText = `キャリブレーション距離: ${firstDistance} ピクセル (1秒)`;
            calibrating = false;
            clicks = [];
        } else if (!calibrating && clicks.length === 2) {
            const secondDistance = Math.abs(clicks[0].x - clicks[1].x);
            const seconds = secondDistance / firstDistance;
            distanceDisplay.innerText = `計測距離: ${secondDistance} ピクセル (${seconds.toFixed(2)}秒)`;
            clicks = [];
        }
    });

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    pasteButton.addEventListener('click', () => {
        navigator.clipboard.read().then(items => {
            for (let item of items) {
                if (item.types.includes('image/png')) {
                    item.getType('image/png').then(blob => {
                        const url = URL.createObjectURL(blob);
                        image.src = url;
                    });
                }
            }
        }).catch(err => {
            console.error('Error reading clipboard contents: ', err);
        });
    });

    calibrationButton.addEventListener('click', () => {
        calibrating = true;
        clicks = [];
        distanceDisplay.innerText = 'キャリブレーションモード: 2点をクリックしてください';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    function drawVerticalLine(ctx, x, y1, y2) {
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
});
