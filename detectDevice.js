async function detectDevice() {
    let score = 0;
    let desktopIndicators = 0;
    let mobileIndicators = 0;
    let debugInfo = {
        screen: {},
        pointer: {},
        battery: {},
        hardware: {},
        aspectRatio: 0,
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        indicators: { desktop: [], laptop: [], mobile: [] }
    };

    // screen & touch detection
    const isTouchDevice = navigator.maxTouchPoints > 0;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = window.devicePixelRatio || 1;
    debugInfo.screen = { width, height, isTouchDevice, pixelRatio };

    if (width >= 1920) desktopIndicators++;
    if (height >= 1080) desktopIndicators++;
    if (width >= 768 && height >= 600) score++;
    if (isTouchDevice) {
        score += 3;
        mobileIndicators++;
    }
    if (width < 768) mobileIndicators += 3;

    // pointer detection
    if (window.matchMedia) {
        const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
        const finePointer = window.matchMedia("(pointer: fine)").matches;
        const hoverCapable = window.matchMedia("(hover: hover)").matches;
        debugInfo.pointer = { coarsePointer, finePointer, hoverCapable };

        if (coarsePointer && hoverCapable) score += 2;
        if (finePointer && hoverCapable) desktopIndicators++;
        if (coarsePointer && !hoverCapable) mobileIndicators++;
    }

    // battery detection
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            debugInfo.battery = battery;
            if (battery.level < 1) score += 4;
            if (battery.charging) score += 1;
            if (battery.chargingTime > 0) score += 2;
            if (battery.dischargingTime !== Infinity) score += 2;
            if (battery.level === 1 && battery.chargingTime === 0 && battery.dischargingTime === Infinity) desktopIndicators += 2;
        } catch (e) {
            desktopIndicators++;
        }
    } else {
        desktopIndicators++;
    }

    // hardware detection (cpu cores)
    const cores = navigator.hardwareConcurrency || 4;
    debugInfo.hardware = { cores };
    if (cores <= 4) score++;
    if (cores >= 8) desktopIndicators++;
    if (cores <= 6) mobileIndicators++;

    // aspect ratio detection
    const aspectRatio = width / height;
    debugInfo.aspectRatio = aspectRatio;
    if (aspectRatio < 1.8) score++;
    if (aspectRatio >= 2) desktopIndicators++;
    if (aspectRatio > 2.1) mobileIndicators++;

    // output highest category
    const scores = { mobile: mobileIndicators, laptop: score, desktop: desktopIndicators };
    const highestCategory = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    return scores[highestCategory] >= 5 ? highestCategory : "unknown";
}

// export result
window.detectDevice = detectDevice;
