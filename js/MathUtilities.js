const MathUtilities = (function MathUtilitiesFactory(Math) {
    const MathUtils = {};

    MathUtils.degreesToRadians = 180 / Math.PI;
    MathUtils.radiansToDegrees = Math.PI / 180;
    MathUtils.halfPi = Math.PI / 2;
    MathUtils.twoPi = Math.PI * 2;

    MathUtils.calculateDistance = (width, height) => {
        return Math.sqrt(width * width + height * height);
    };

    MathUtils.calculatePointDistance = (x1, y1, x2, y2) => {
        const deltaX = x2 - x1;
        const deltaY = y2 - y1;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    };

    MathUtils.calculateAngle = (width, height) => MathUtils.halfPi + Math.atan2(height, width);

    MathUtils.calculatePointAngle = (x1, y1, x2, y2) => MathUtils.halfPi + Math.atan2(y2 - y1, x2 - x1);

    MathUtils.splitVector = (speed, angle) => ({
        x: Math.sin(angle) * speed,
        y: -Math.cos(angle) * speed,
    });

    MathUtils.randomInRange = (min, max) => Math.random() * (max - min) + min;

    MathUtils.randomInteger = (min, max) => ((Math.random() * (max - min + 1)) | 0) + min;

    MathUtils.randomChoice = function randomChoice(choices) {
        if (arguments.length === 1 && Array.isArray(choices)) {
            return choices[(Math.random() * choices.length) | 0];
        }
        return arguments[(Math.random() * arguments.length) | 0];
    };

    MathUtils.clamp = function clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    };

    MathUtils.convertTextToDotMatrix = function convertTextToDotMatrix(text, density = 3, fontFamily = "Georgia", fontSize = "60px") {
        const dots = [];
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const font = `${fontSize} ${fontFamily}`;

        ctx.font = font;
        const textWidth = ctx.measureText(text).width;
        const fontSizeValue = parseInt(fontSize.match(/(\d+)px/)[1]);
        canvas.width = textWidth + 20;
        canvas.height = fontSizeValue + 20;

        ctx.font = font;
        ctx.fillText(text, 10, fontSizeValue + 10);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < imageData.height; y += density) {
            for (let x = 0; x < imageData.width; x += density) {
                const index = (y * imageData.width + x) * 4;
                if (imageData.data[index + 3] > 0) {
                    dots.push({ x: x, y: y });
                }
            }
        }

        return {
            width: canvas.width,
            height: canvas.height,
            points: dots,
        };
    };

    return MathUtils;
})(Math);