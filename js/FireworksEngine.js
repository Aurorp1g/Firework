"use strict";

const IS_MOBILE = window.innerWidth <= 640;
const IS_DESKTOP = window.innerWidth > 800;
const IS_HEADER = IS_DESKTOP && window.innerHeight < 300;

const IS_HIGH_END_DEVICE = (() => {
    const hwConcurrency = navigator.hardwareConcurrency;
    if (!hwConcurrency) {
        return false;
    }
    const minCount = window.innerWidth <= 1024 ? 4 : 8;
    return hwConcurrency >= minCount;
})();

const MAX_WIDTH = 7680;
const MAX_HEIGHT = 4320;
const GRAVITY = 0.9;
let simulationSpeed = 1;

function getDefaultScaleFactor() {
    if (IS_MOBILE) return 0.9;
    if (IS_HEADER) return 0.75;
    return 1;
}

let stageWidth, stageHeight;

let quality = 1;
let lowQualityMode = false;
let normalQualityMode = false;
let highQualityMode = true;

const QUALITY_LOW = 1;
const QUALITY_NORMAL = 2;
const QUALITY_HIGH = 3;

const SKY_LIGHT_NONE = 0;
const SKY_LIGHT_DIM = 1;
const SKY_LIGHT_NORMAL = 2;

const COLOR_PALETTE = {
    Red: "#ff0043",
    Green: "#14fc56",
    Blue: "#1e7fff",
    Purple: "#e60aff",
    Gold: "#ffbf36",
    White: "#ffffff",
};

const INVISIBLE_COLOR = "_INVISIBLE_";

const PI_2 = Math.PI * 2;
const PI_HALF = Math.PI * 0.5;

const trailsCanvas = new CanvasStage("trails-canvas");
const mainCanvas = new CanvasStage("main-canvas");
const canvasStages = [trailsCanvas, mainCanvas];

const textFireworkContent = ["新年快乐", "学业有成", "万事如意", "心想事成", "身体健康", "爱你小猪猪"];
const textDotMatrices = {};
textFireworkContent.forEach((word) => {
    textDotMatrices[word] = MathUtilities.convertTextToDotMatrix(word, 3, "Gabriola,华文琥珀", "90px");
});

// 多语言支持系统
const translations = {
    'zh-CN': {
        // 页面标题
        'pageTitle': '烟花模拟器',
        
        // 加载界面
        'loadingHeader': '加载中',
        'loadingStatus': '正在装配烟花',
        
        // 菜单界面
        'language': '语言',
        'settings': '设置',
        'settingsSubtitle': '若想了解更多信息 请点击任意标签',
        'close': '关闭',
        
        // 控制按钮
        'shellType': '烟花类型',
        'shellSize': '烟花大小',
        'quality': '画质',
        'skyLighting': '照亮天空',
        'scaleFactor': '缩放',
        'wordShell': '文字烟花',
        'autoLaunch': '自动放烟花',
        'finaleMode': '同时放更多的烟花',
        'hideControls': '隐藏控制按钮',
        'fullscreen': '全屏',
        'longExposure': '保留烟花的火花',
        
        // 选择器选项翻译
        'Random': '随机',
        'Crackle': '爆裂',
        'Chrysanthemum': '菊花',
        'Falling Leaves': '落叶',
        'Floral': '花束',
        'Ghost': '鬼影',
        'Horse Tail': '马尾',
        'Palm': '棕榈',
        'Ring': '圆环',
        'Explosion Ring': '爆炸环',
        'Spiral': '螺旋',
        'Waterfall': '瀑布',
        'Rainbow': '彩虹',
        'Meteor': '流星',
        'Snowflake': '雪花',
        'Galaxy': '银河',
        'Lightning': '闪电',
        'Whirlpool': '漩涡',
        'Firefall': '火瀑布',
        'Time Delay': '延时',
        'Rainbow Whirl': '彩虹漩涡',
        'Strobe': '频闪',
        'Willow': '柳树',
        'Heart': '心形',
        'Crossette': '十字',
        
        // 画质选项
        '低': '低',
        '正常': '正常',
        '高': '高',
        'Low': '低',
        'Normal': '正常',
        'High': '高',
        
        // 照亮天空选项
        '不': '不',
        '暗': '暗',
        '正常': '正常',
        'None': '不',
        'Dim': '暗',
        'Normal': '正常',
        
        // 帮助内容
        'languageHelp': {
            header: '语言',
            body: '选择界面的语言。支持中文和英文。'
        },
        'shellTypeHelp': {
            header: '烟花类型',
            body: '你要放的烟花的类型，选择"随机（Random）"可以获得非常好的体验！'
        },
        'shellSizeHelp': {
            header: '烟花大小',
            body: '烟花越大绽放范围就越大，但是烟花越大，设备所需的性能也会增多，大的烟花可能导致你的设备卡顿。'
        },
        'qualityHelp': {
            header: '画质',
            body: '如果动画运行不流畅，你可以试试降低画质。画质越高，烟花绽放后的火花数量就越多，但高画质可能导致你的设备卡顿。'
        },
        'skyLightingHelp': {
            header: '照亮天空',
            body: '烟花爆炸时，背景会被照亮。如果你的屏幕看起来太亮了，可以把它改成"暗"或者"不"。'
        },
        'scaleFactorHelp': {
            header: '缩放',
            body: '使你与烟花离得更近或更远。对于较大的烟花，你可以选择更小的缩放值，尤其是在手机或平板电脑上。'
        },
        'wordShellHelp': {
            header: '文字烟花',
            body: '开启后，会出现烟花形状的文字。例如：新年快乐、心想事成等等'
        },
        'autoLaunchHelp': {
            header: '自动放烟花',
            body: '开启后你就可以坐在你的设备屏幕前面欣赏烟花了，你也可以关闭它，但关闭后你就只能通过点击屏幕的方式来放烟花。'
        },
        'finaleModeHelp': {
            header: '同时放更多的烟花',
            body: '可以在同一时间自动放出更多的烟花（但需要开启先开启"自动放烟花"）。'
        },
        'hideControlsHelp': {
            header: '隐藏控制按钮',
            body: '隐藏屏幕顶部的按钮。如果你要截图，或者需要一个无缝的体验，你就可以将按钮隐藏，隐藏按钮后你仍然可以在右上角打开设置。'
        },
        'fullscreenHelp': {
            header: '全屏',
            body: '切换至全屏模式'
        },
        'longExposureHelp': {
            header: '保留烟花的火花',
            body: '可以保留烟花留下的火花'
        }
    },
    'en-US': {
        // 页面标题
        'pageTitle': 'Fireworks Simulator',
        
        // 加载界面
        'loadingHeader': 'Loading',
        'loadingStatus': 'Assembling fireworks',
        
        // 菜单界面
        'settings': 'Settings',
        'settingsSubtitle': 'Click any label for more information',
        'close': 'Close',
        
        // 控制按钮
        'shellType': 'Firework Type',
        'shellSize': 'Firework Size',
        'quality': 'Quality',
        'skyLighting': 'Sky Lighting',
        'scaleFactor': 'Scale Factor',
        'wordShell': 'Text Fireworks',
        'autoLaunch': 'Auto Launch',
        'finaleMode': 'Finale Mode',
        'hideControls': 'Hide Controls',
        'fullscreen': 'Fullscreen',
        'longExposure': 'Long Exposure',
        
        // 选择器选项翻译
        'Random': 'Random',
        'Crackle': 'Crackle',
        'Chrysanthemum': 'Chrysanthemum',
        'Falling Leaves': 'Falling Leaves',
        'Floral': 'Floral',
        'Ghost': 'Ghost',
        'Horse Tail': 'Horse Tail',
        'Palm': 'Palm',
        'Ring': 'Ring',
        'Explosion Ring': 'Explosion Ring',
        'Spiral': 'Spiral',
        'Waterfall': 'Waterfall',
        'Rainbow': 'Rainbow',
        'Meteor': 'Meteor',
        'Snowflake': 'Snowflake',
        'Galaxy': 'Galaxy',
        'Lightning': 'Lightning',
        'Whirlpool': 'Whirlpool',
        'Firefall': 'Firefall',
        'Time Delay': 'Time Delay',
        'Rainbow Whirl': 'Rainbow Whirl',
        'Strobe': 'Strobe',
        'Willow': 'Willow',
        'Heart': 'Heart',
        'Crossette': 'Crossette',
        
        // 画质选项
        '低': 'Low',
        '正常': 'Normal',
        '高': 'High',
        'Low': 'Low',
        'Normal': 'Normal',
        'High': 'High',
        
        // 照亮天空选项
        '不': 'None',
        '暗': 'Dim',
        '正常': 'Normal',
        'None': 'None',
        'Dim': 'Dim',
        'Normal': 'Normal',
        
        // 帮助内容
        'languageHelp': {
            header: 'Language',
            body: 'Select the language for the interface. Supports Chinese and English.'
        },
        'shellTypeHelp': {
            header: 'Firework Type',
            body: 'The type of firework you want to launch. Choosing "Random" provides a great experience!'
        },
        'shellSizeHelp': {
            header: 'Firework Size',
            body: 'Larger fireworks have a bigger explosion range, but require more device performance. Large fireworks may cause your device to lag.'
        },
        'qualityHelp': {
            header: 'Quality',
            body: 'If the animation runs slowly, try lowering the quality. Higher quality means more sparks after the firework explodes, but may cause your device to lag.'
        },
        'skyLightingHelp': {
            header: 'Sky Lighting',
            body: 'When fireworks explode, the background will be illuminated. If your screen appears too bright, you can change it to "Dim" or "None".'
        },
        'scaleFactorHelp': {
            header: 'Scale Factor',
            body: 'Brings you closer or further from the fireworks. For larger fireworks, you can choose a smaller scale value, especially on mobile or tablet devices.'
        },
        'wordShellHelp': {
            header: 'Text Fireworks',
            body: 'When enabled, fireworks will form text shapes. For example: Happy New Year, Best Wishes, etc.'
        },
        'autoLaunchHelp': {
            header: 'Auto Launch',
            body: 'When enabled, you can sit back and enjoy the fireworks on your device screen. If disabled, you can only launch fireworks by clicking the screen.'
        },
        'finaleModeHelp': {
            header: 'Finale Mode',
            body: 'Allows more fireworks to be launched simultaneously (but requires "Auto Launch" to be enabled first).'
        },
        'hideControlsHelp': {
            header: 'Hide Controls',
            body: 'Hides the buttons at the top of the screen. Useful for screenshots or a seamless experience. You can still open settings from the top right corner.'
        },
        'fullscreenHelp': {
            header: 'Fullscreen',
            body: 'Switch to fullscreen mode'
        },
        'longExposureHelp': {
            header: 'Long Exposure',
            body: 'Preserves the sparks left by fireworks'
        }
    }
};

// 当前语言设置
let currentLanguage = 'zh-CN';

// 帮助内容对象
const helpContent = {
    language: { header: '', body: '' },
    shellType: { header: '', body: '' },
    shellSize: { header: '', body: '' },
    quality: { header: '', body: '' },
    skyLighting: { header: '', body: '' },
    scaleFactor: { header: '', body: '' },
    wordShell: { header: '', body: '' },
    autoLaunch: { header: '', body: '' },
    finaleMode: { header: '', body: '' },
    hideControls: { header: '', body: '' },
    fullscreen: { header: '', body: '' },
    longExposure: { header: '', body: '' }
};

// 语言切换功能
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('fireworks_language', lang);
        updateUI();
    }
}

// 获取翻译文本
function t(key) {
    return translations[currentLanguage]?.[key] || key;
}

// 语言切换功能
function toggleLanguage() {
    const newLang = currentLanguage === 'zh-CN' ? 'en-US' : 'zh-CN';
    setLanguage(newLang);
}

// 更新界面文本
function updateUI() {
    // 更新页面标题
    document.title = t('pageTitle');
    
    // 更新加载界面
    const loadingHeader = document.querySelector('.loading-init__header');
    const loadingStatus = document.querySelector('.loading-init__status');
    if (loadingHeader) loadingHeader.textContent = t('loadingHeader');
    if (loadingStatus) loadingStatus.textContent = t('loadingStatus');
    
    // 更新菜单界面
    const menuHeader = document.querySelector('.menu__header');
    const menuSubheader = document.querySelector('.menu__subheader');
    const helpModalCloseBtn = document.querySelector('.help-modal__close-btn');
    
    if (menuHeader) menuHeader.textContent = t('settings');
    if (menuSubheader) menuSubheader.textContent = t('settingsSubtitle');
    if (helpModalCloseBtn) helpModalCloseBtn.textContent = t('close');
    
    // 更新语言选择器
    const languageSelect = document.querySelector('.language-select');
    if (languageSelect) {
        languageSelect.value = currentLanguage;
    }
    
    // 更新控制按钮标签
    const labels = {
        '.language-label': 'language',
        '.shell-type-label': 'shellType',
        '.shell-size-label': 'shellSize',
        '.quality-ui-label': 'quality',
        '.sky-lighting-label': 'skyLighting',
        '.scaleFactor-label': 'scaleFactor',
        '.word-shell-label': 'wordShell',
        '.auto-launch-label': 'autoLaunch',
        '.finale-mode-label': 'finaleMode',
        '.hide-controls-label': 'hideControls',
        '.fullscreen-label': 'fullscreen',
        '.long-exposure-label': 'longExposure'
    };
    
    Object.keys(labels).forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = t(labels[selector]);
        }
    });
    
    // 更新语言选择器的选项文本
    const languageOptions = document.querySelectorAll('.language-select option');
    if (languageOptions.length >= 2) {
        languageOptions[0].textContent = t('中文');
        languageOptions[1].textContent = t('english');
    }

    // 重新初始化选择器选项以应用翻译
    updateSelectOptions();
    
    // 更新帮助内容
    helpContent.language = t('languageHelp');
    helpContent.shellType = t('shellTypeHelp');
    helpContent.shellSize = t('shellSizeHelp');
    helpContent.quality = t('qualityHelp');
    helpContent.skyLighting = t('skyLightingHelp');
    helpContent.scaleFactor = t('scaleFactorHelp');
    helpContent.wordShell = t('wordShellHelp');
    helpContent.autoLaunch = t('autoLaunchHelp');
    helpContent.finaleMode = t('finaleModeHelp');
    helpContent.hideControls = t('hideControlsHelp');
    helpContent.fullscreen = t('fullscreenHelp');
    helpContent.longExposure = t('longExposureHelp');
}

// 更新选择器选项
function updateSelectOptions() {
    // 保存当前选中的值
    const currentShellType = domElements.shellType.value;
    const currentQuality = domElements.quality.value;
    const currentSkyLighting = domElements.skyLighting.value;

    function populateSelectOptions(node, options) {
        node.innerHTML = options.reduce((acc, opt) => (acc += `<option value="${opt.value}">${t(opt.label)}</option>`), "");
    }

    // 烟花类型选项
    let options = "";
    shellTypesList.forEach((opt) => (options += `<option value="${opt}">${t(opt)}</option>`));
    domElements.shellType.innerHTML = options;
    // 恢复之前选中的值
    if (currentShellType && shellTypesList.includes(currentShellType)) {
        domElements.shellType.value = currentShellType;
    }

    // 画质选项
    populateSelectOptions(domElements.quality, [
        { label: "低", value: QUALITY_LOW },
        { label: "正常", value: QUALITY_NORMAL },
        { label: "高", value: QUALITY_HIGH },
    ]);
    // 恢复之前选中的值
    if (currentQuality) {
        domElements.quality.value = currentQuality;
    }

    // 照亮天空选项
    populateSelectOptions(domElements.skyLighting, [
        { label: "不", value: SKY_LIGHT_NONE },
        { label: "暗", value: SKY_LIGHT_DIM },
        { label: "正常", value: SKY_LIGHT_NORMAL },
    ]);
    // 恢复之前选中的值
    if (currentSkyLighting) {
        domElements.skyLighting.value = currentSkyLighting;
    }
}

// 语言切换功能
function handleLanguageChange() {
    const languageSelect = document.querySelector('.language-select');
    if (languageSelect) {
        const newLang = languageSelect.value;
        setLanguage(newLang);
    }
}

// 初始化语言设置
function initLanguage() {
    const savedLanguage = localStorage.getItem('fireworks_language');
    if (savedLanguage && translations[savedLanguage]) {
        currentLanguage = savedLanguage;
    } else {
        // 根据浏览器语言自动检测
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('zh')) {
            currentLanguage = 'zh-CN';
        } else {
            currentLanguage = 'en-US';
        }
    }
    updateUI();
}

// 在DOM加载完成后初始化语言
document.addEventListener('DOMContentLoaded', function() {
    initLanguage();
    
    // 添加语言选择事件监听
    const languageSelect = document.querySelector('.language-select');
    if (languageSelect) {
        languageSelect.addEventListener('change', handleLanguageChange);
    }
    
    const canvasContainer = document.querySelector('.canvas-container');
    canvasContainer.style.backgroundImage = 'url()';
    canvasContainer.style.backgroundSize = '100%';
});

function isFullScreenEnabled() {
    return fullScreenManager.fullscreenEnabled;
}

function isFullScreenActive() {
    return !!fullScreenManager.fullscreenElement;
}

function toggleFullScreen() {
    if (isFullScreenEnabled()) {
        if (isFullScreenActive()) {
            fullScreenManager.exitFullscreen();
        } else {
            fullScreenManager.requestFullscreen(document.documentElement);
        }
    }
}

fullScreenManager.addEventListener("fullscreenchange", () => {
    appStateManager.setState({ fullscreen: isFullScreenActive() });
});

const appStateManager = {
    _listeners: new Set(),
    _dispatch(prevState) {
        this._listeners.forEach((listener) => listener(this.state, prevState));
    },

    state: {
        paused: true,
        soundEnabled: true,
        menuOpen: false,
        openHelpTopic: null,
        fullscreen: isFullScreenActive(),
        config: {
            quality: String(IS_HIGH_END_DEVICE ? QUALITY_HIGH : QUALITY_NORMAL),
            shell: "Random",
            size: IS_DESKTOP ? "3" : IS_HEADER ? "1.2" : "2",
            wordShell: true,
            autoLaunch: true,
            finale: true,
            skyLighting: SKY_LIGHT_NORMAL + "",
            hideControls: IS_HEADER,
            longExposure: false,
            scaleFactor: getDefaultScaleFactor(),
        },
    },

    setState(nextState) {
        const prevState = this.state;
        this.state = Object.assign({}, this.state, nextState);
        this._dispatch(prevState);
        this.persist();
    },

    subscribe(listener) {
        this._listeners.add(listener);
        return () => this._listeners.remove(listener);
    },

    load() {
        const serializedData = localStorage.getItem("fireworks_data");
        if (serializedData) {
            const { schemaVersion, data } = JSON.parse(serializedData);

            const config = this.state.config;
            switch (schemaVersion) {
                case "1.1":
                    config.quality = data.quality;
                    config.size = data.size;
                    config.skyLighting = data.skyLighting;
                    break;
                case "1.2":
                    config.quality = data.quality;
                    config.size = data.size;
                    config.skyLighting = data.skyLighting;
                    config.scaleFactor = data.scaleFactor;
                    break;
                default:
                    throw new Error("version switch should be exhaustive");
            }
        } else if (localStorage.getItem("schemaVersion") === "1") {
            let size;
            try {
                const sizeRaw = localStorage.getItem("configSize");
                size = typeof sizeRaw === "string" && JSON.parse(sizeRaw);
            } catch (e) {
                return;
            }
            const sizeInt = parseInt(size, 10);
            if (sizeInt >= 0 && sizeInt <= 4) {
                this.state.config.size = String(sizeInt);
            }
        }
    },

    persist() {
        const config = this.state.config;
        localStorage.setItem(
            "fireworks_data",
            JSON.stringify({
                schemaVersion: "1.2",
                data: {
                    quality: config.quality,
                    size: config.size,
                    skyLighting: config.skyLighting,
                    scaleFactor: config.scaleFactor,
                },
            })
        );
    },
};

if (!IS_HEADER) {
    appStateManager.load();
}

function togglePauseState(toggle) {
    const paused = appStateManager.state.paused;
    let newValue;
    if (typeof toggle === "boolean") {
        newValue = toggle;
    } else {
        newValue = !paused;
    }

    if (paused !== newValue) {
        appStateManager.setState({ paused: newValue });
    }
}

function toggleSoundState(toggle) {
    if (typeof toggle === "boolean") {
        appStateManager.setState({ soundEnabled: toggle });
    } else {
        appStateManager.setState({ soundEnabled: !appStateManager.state.soundEnabled });
    }
}

function toggleMenuState(toggle) {
    if (typeof toggle === "boolean") {
        appStateManager.setState({ menuOpen: toggle });
    } else {
        appStateManager.setState({ menuOpen: !appStateManager.state.menuOpen });
    }
}

function updateConfiguration(nextConfig) {
    nextConfig = nextConfig || getConfigurationFromDOM();
    appStateManager.setState({
        config: Object.assign({}, appStateManager.state.config, nextConfig),
    });

    applyConfigurationChanges();
}

function applyConfigurationChanges() {
    const config = appStateManager.state.config;

    quality = parseInt(config.quality);
    lowQualityMode = quality === QUALITY_LOW;
    normalQualityMode = quality === QUALITY_NORMAL;
    highQualityMode = quality === QUALITY_HIGH;

    if (getSkyLightingSetting() === SKY_LIGHT_NONE) {
        domElements.canvasContainer.style.backgroundColor = "#000";
    }

    Spark.drawWidth = quality === QUALITY_HIGH ? 0.75 : 1;
}

const isSimulationRunning = (state = appStateManager.state) => !state.paused && !state.menuOpen;
const isSoundEnabled = (state = appStateManager.state) => state.soundEnabled;
const canPlaySound = (state = appStateManager.state) => isSimulationRunning(state) && isSoundEnabled(state);
const getQualitySetting = () => parseInt(appStateManager.state.config.quality);
const getShellType = () => appStateManager.state.config.shell;
const getShellSize = () => parseFloat(appStateManager.state.config.size);
const isFinaleModeEnabled = () => appStateManager.state.config.finale;
const getSkyLightingSetting = () => parseInt(appStateManager.state.config.skyLighting);
const getScaleFactor = () => parseFloat(appStateManager.state.config.scaleFactor);


const domElementKeys = {
    stageContainer: ".stage-container",
    canvasContainer: ".canvas-container",
    controls: ".controls",
    menu: ".menu",
    menuInnerWrap: ".menu__inner-wrap",
    pauseBtn: ".pause-btn",
    pauseBtnSVG: ".pause-btn use",
    soundBtn: ".sound-btn",
    soundBtnSVG: ".sound-btn use",
    languageSelect: ".language-select",
    languageLabel: ".language-label",
    shellType: ".shell-type",
    shellTypeLabel: ".shell-type-label",
    shellSize: ".shell-size",
    shellSizeLabel: ".shell-size-label",
    quality: ".quality-ui",
    qualityLabel: ".quality-ui-label",
    skyLighting: ".sky-lighting",
    skyLightingLabel: ".sky-lighting-label",
    scaleFactor: ".scaleFactor",
    scaleFactorLabel: ".scaleFactor-label",
    wordShell: ".word-shell",
    wordShellLabel: ".word-shell-label",
    autoLaunch: ".auto-launch",
    autoLaunchLabel: ".auto-launch-label",
    finaleModeFormOption: ".form-option--finale-mode",
    finaleMode: ".finale-mode",
    finaleModeLabel: ".finale-mode-label",
    hideControls: ".hide-controls",
    hideControlsLabel: ".hide-controls-label",
    fullscreenFormOption: ".form-option--fullscreen",
    fullscreen: ".fullscreen",
    fullscreenLabel: ".fullscreen-label",
    longExposure: ".long-exposure",
    longExposureLabel: ".long-exposure-label",
    helpModal: ".help-modal",
    helpModalOverlay: ".help-modal__overlay",
    helpModalHeader: ".help-modal__header",
    helpModalBody: ".help-modal__body",
    helpModalCloseBtn: ".help-modal__close-btn",
};

const domElements = {};
Object.keys(domElementKeys).forEach((key) => {
    domElements[key] = document.querySelector(domElementKeys[key]);
});

if (!isFullScreenEnabled()) {
    domElements.fullscreenFormOption.classList.add("remove");
}

const domToHelpKeyMap = {
    languageLabel: "language",
    shellTypeLabel: "shellType",
    shellSizeLabel: "shellSize",
    qualityLabel: "quality",
    skyLightingLabel: "skyLighting",
    scaleFactorLabel: "scaleFactor",
    wordShellLabel: "wordShell",
    autoLaunchLabel: "autoLaunch",
    finaleModeLabel: "finaleMode",
    hideControlsLabel: "hideControls",
    fullscreenLabel: "fullscreen",
    longExposureLabel: "longExposure",
};

function renderApplication(state) {
    const pauseIcon = `#icon-${state.paused ? "play" : "pause"}`;
    const soundIcon = `#icon-sound-${isSoundEnabled(state) ? "on" : "off"}`;
    domElements.pauseBtnSVG.setAttribute("href", pauseIcon);
    domElements.pauseBtnSVG.setAttribute("xlink:href", pauseIcon);
    domElements.soundBtnSVG.setAttribute("href", soundIcon);
    domElements.soundBtnSVG.setAttribute("xlink:href", soundIcon);
    domElements.controls.classList.toggle("hide", state.menuOpen || state.config.hideControls);
    domElements.canvasContainer.classList.toggle("blur", state.menuOpen);
    domElements.menu.classList.toggle("hide", !state.menuOpen);
    domElements.finaleModeFormOption.style.opacity = state.config.autoLaunch ? 1 : 0.32;

    // 更新语言选择器
    domElements.languageSelect.value = currentLanguage;
    
    domElements.quality.value = state.config.quality;
    domElements.shellType.value = state.config.shell;
    domElements.shellSize.value = state.config.size;
    domElements.wordShell.checked = state.config.wordShell;
    domElements.autoLaunch.checked = state.config.autoLaunch;
    domElements.finaleMode.checked = state.config.finale;
    domElements.skyLighting.value = state.config.skyLighting;
    domElements.hideControls.checked = state.config.hideControls;
    domElements.fullscreen.checked = state.fullscreen;
    domElements.longExposure.checked = state.config.longExposure;
    domElements.scaleFactor.value = state.config.scaleFactor.toFixed(2);

    domElements.menuInnerWrap.style.opacity = state.openHelpTopic ? 0.12 : 1;
    domElements.helpModal.classList.toggle("active", !!state.openHelpTopic);
    if (state.openHelpTopic) {
        const { header, body } = helpContent[state.openHelpTopic];
        domElements.helpModalHeader.textContent = header;
        domElements.helpModalBody.textContent = body;
    }
}

appStateManager.subscribe(renderApplication);

function handleApplicationStateChange(state, prevState) {
    const canPlay = canPlaySound(state);
    const couldPlayPreviously = canPlaySound(prevState);

    if (canPlay !== couldPlayPreviously) {
        if (canPlay) {
            audioManager.resumeAll();
        } else {
            audioManager.pauseAll();
        }
    }
}

appStateManager.subscribe(handleApplicationStateChange);

function getConfigurationFromDOM() {
    return {
        quality: domElements.quality.value,
        shell: domElements.shellType.value,
        size: domElements.shellSize.value,
        wordShell: domElements.wordShell.checked,
        autoLaunch: domElements.autoLaunch.checked,
        finale: domElements.finaleMode.checked,
        skyLighting: domElements.skyLighting.value,
        longExposure: domElements.longExposure.checked,
        hideControls: domElements.hideControls.checked,
        scaleFactor: parseFloat(domElements.scaleFactor.value),
    };
}

// 添加语言选择事件监听
domElements.languageSelect.addEventListener('input', handleLanguageChange);
const updateConfigurationNoEvent = () => updateConfiguration();
domElements.quality.addEventListener("input", updateConfigurationNoEvent);
domElements.shellType.addEventListener("input", updateConfigurationNoEvent);
domElements.shellSize.addEventListener("input", updateConfigurationNoEvent);
domElements.wordShell.addEventListener("click", () => setTimeout(updateConfiguration, 0));
domElements.autoLaunch.addEventListener("click", () => setTimeout(updateConfiguration, 0));
domElements.finaleMode.addEventListener("click", () => setTimeout(updateConfiguration, 0));
domElements.skyLighting.addEventListener("input", updateConfigurationNoEvent);
domElements.longExposure.addEventListener("click", () => setTimeout(updateConfiguration, 0));
domElements.hideControls.addEventListener("click", () => setTimeout(updateConfiguration, 0));
domElements.fullscreen.addEventListener("click", () => setTimeout(toggleFullScreen, 0));
domElements.scaleFactor.addEventListener("input", () => {
    updateConfiguration();
    handleResize();
});

Object.keys(domToHelpKeyMap).forEach((elementKey) => {
    const helpKey = domToHelpKeyMap[elementKey];
    domElements[elementKey].addEventListener("click", () => {
        appStateManager.setState({ openHelpTopic: helpKey });
    });
});

domElements.helpModalCloseBtn.addEventListener("click", () => {
    appStateManager.setState({ openHelpTopic: null });
});

domElements.helpModalOverlay.addEventListener("click", () => {
    appStateManager.setState({ openHelpTopic: null });
});

const COLOR_NAMES = Object.keys(COLOR_PALETTE);
const COLOR_CODES = COLOR_NAMES.map((colorName) => COLOR_PALETTE[colorName]);
const COLOR_CODES_WITH_INVISIBLE = [...COLOR_CODES, INVISIBLE_COLOR];
const COLOR_CODE_INDEXES = COLOR_CODES_WITH_INVISIBLE.reduce((obj, code, i) => {
    obj[code] = i;
    return obj;
}, {});

const COLOR_TUPLES = {};
COLOR_CODES.forEach((hex) => {
    COLOR_TUPLES[hex] = {
        r: parseInt(hex.substr(1, 2), 16),
        g: parseInt(hex.substr(3, 2), 16),
        b: parseInt(hex.substr(5, 2), 16),
    };
});

function getRandomColorSimple() {
    return COLOR_CODES[(Math.random() * COLOR_CODES.length) | 0];
}

let lastSelectedColor;
function getRandomColor(options) {
    const notSame = options && options.notSame;
    const notColor = options && options.notColor;
    const limitWhite = options && options.limitWhite;
    let color = getRandomColorSimple();

    if (limitWhite && color === COLOR_PALETTE.White && Math.random() < 0.6) {
        color = getRandomColorSimple();
    }

    if (notSame) {
        while (color === lastSelectedColor) {
            color = getRandomColorSimple();
        }
    } else if (notColor) {
        while (color === notColor) {
            color = getRandomColorSimple();
        }
    }

    lastSelectedColor = color;
    return color;
}

function getRandomText() {
    if (textFireworkContent.length === 0) return "";
    if (textFireworkContent.length === 1) return textFireworkContent[0];
    return textFireworkContent[(Math.random() * textFireworkContent.length) | 0];
}

function getWhiteOrGold() {
    return Math.random() < 0.5 ? COLOR_PALETTE.Gold : COLOR_PALETTE.White;
}

function createPistilColor(shellColor) {
    return shellColor === COLOR_PALETTE.White || shellColor === COLOR_PALETTE.Gold
        ? getRandomColor({ notColor: shellColor })
        : getWhiteOrGold();
}

const chrysanthemumShell = (size = 1) => {
    const glitter = Math.random() < 0.25;
    const singleColor = Math.random() < 0.72;
    const color = singleColor ? getRandomColor({ limitWhite: true }) : [getRandomColor(), getRandomColor({ notSame: true })];
    const pistil = singleColor && Math.random() < 0.42;
    const pistilColor = pistil && createPistilColor(color);
    const secondColor = singleColor && (Math.random() < 0.2 || color === COLOR_PALETTE.White) ? pistilColor || getRandomColor({ notColor: color, limitWhite: true }) : null;
    const streamers = !pistil && color !== COLOR_PALETTE.White && Math.random() < 0.42;
    let starDensity = glitter ? 1.1 : 1.25;
    if (lowQualityMode) starDensity *= 0.8;
    if (highQualityMode) starDensity = 1.2;
    return {
        shellSize: size,
        spreadSize: 300 + size * 100,
        starLife: 900 + size * 200,
        starDensity,
        color,
        secondColor,
        glitter: glitter ? "light" : "",
        glitterColor: getWhiteOrGold(),
        pistil,
        pistilColor,
        streamers,
    };
};

const ghostShell = (size = 1) => {
    const shell = chrysanthemumShell(size);
    shell.starLife *= 1.5;
    let ghostColor = getRandomColor({ notColor: COLOR_PALETTE.White });
    shell.streamers = true;
    const pistil = Math.random() < 0.42;
    const pistilColor = pistil && createPistilColor(ghostColor);
    shell.color = INVISIBLE_COLOR;
    shell.secondColor = ghostColor;
    shell.glitter = "";
    return shell;
};

const strobeShell = (size = 1) => {
    const color = getRandomColor({ limitWhite: true });
    return {
        shellSize: size,
        spreadSize: 280 + size * 92,
        starLife: 1100 + size * 200,
        starLifeVariation: 0.4,
        starDensity: 1.1,
        color,
        glitter: "light",
        glitterColor: COLOR_PALETTE.White,
        strobe: true,
        strobeColor: Math.random() < 0.5 ? COLOR_PALETTE.White : null,
        pistil: Math.random() < 0.5,
        pistilColor: createPistilColor(color),
    };
};

const palmShell = (size = 1) => {
    const color = getRandomColor();
    const thick = Math.random() < 0.5;
    return {
        shellSize: size,
        color,
        spreadSize: 250 + size * 75,
        starDensity: thick ? 0.15 : 0.4,
        starLife: 1800 + size * 200,
        glitter: thick ? "thick" : "heavy",
    };
};

const ringShell = (size = 1) => {
    const color = getRandomColor();
    const pistil = Math.random() < 0.75;
    return {
        shellSize: size,
        ring: true,
        color,
        spreadSize: 300 + size * 100,
        starLife: 900 + size * 200,
        starCount: 2.2 * PI_2 * (size + 1),
        pistil,
        pistilColor: createPistilColor(color),
        glitter: !pistil ? "light" : "",
        glitterColor: color === COLOR_PALETTE.Gold ? COLOR_PALETTE.Gold : COLOR_PALETTE.White,
        streamers: Math.random() < 0.3,
    };
};

// 爆炸环烟花效果 - 多层环形爆炸
const explosionRingShell = (size = 1) => {
    const color = getRandomColor();
    const secondaryColor = getRandomColor({ notSame: color });
    const multiRing = Math.random() < 0.7; // 70%概率多层环形
    
    return {
        shellSize: size,
        ring: true,
        explosionRing: true, // 爆炸环标记
        multiRing: multiRing,
        ringLayers: multiRing ? Math.floor(Math.random() * 2) + 2 : 1, // 1-3层环形
        color,
        secondaryColor,
        spreadSize: 350 + size * 120,
        starLife: 800 + size * 180,
        starCount: 2.5 * PI_2 * (size + 1),
        starLifeVariation: 0.3,
        glitter: "medium",
        glitterColor: color === COLOR_PALETTE.Gold ? COLOR_PALETTE.Gold : COLOR_PALETTE.White,
        pistil: Math.random() < 0.6,
        pistilColor: createPistilColor(color),
        streamers: Math.random() < 0.4,
        delayExplosion: Math.random() < 0.5, // 50%概率延迟爆炸
    };
};

const crossetteShell = (size = 1) => {
    const color = getRandomColor({ limitWhite: true });
    return {
        shellSize: size,
        spreadSize: 300 + size * 100,
        starLife: 750 + size * 160,
        starLifeVariation: 0.4,
        starDensity: 0.85,
        color,
        crossette: true,
        pistil: Math.random() < 0.5,
        pistilColor: createPistilColor(color),
    };
};

const floralShell = (size = 1) => ({
    shellSize: size,
    spreadSize: 300 + size * 120,
    starDensity: 0.12,
    starLife: 500 + size * 50,
    starLifeVariation: 0.5,
    color: Math.random() < 0.65 ? "random" : Math.random() < 0.15 ? getRandomColor() : [getRandomColor(), getRandomColor({ notSame: true })],
    floral: true,
});

const fallingLeavesShell = (size = 1) => ({
    shellSize: size,
    color: INVISIBLE_COLOR,
    spreadSize: 300 + size * 120,
    starDensity: 0.12,
    starLife: 500 + size * 50,
    starLifeVariation: 0.5,
    glitter: "medium",
    glitterColor: COLOR_PALETTE.Gold,
    fallingLeaves: true,
});

const willowShell = (size = 1) => ({
    shellSize: size,
    spreadSize: 300 + size * 100,
    starDensity: 0.6,
    starLife: 3000 + size * 300,
    glitter: "willow",
    glitterColor: COLOR_PALETTE.Gold,
    color: INVISIBLE_COLOR,
});

const crackleShell = (size = 1) => {
    const color = Math.random() < 0.75 ? COLOR_PALETTE.Gold : getRandomColor();
    return {
        shellSize: size,
        spreadSize: 380 + size * 75,
        starDensity: lowQualityMode ? 0.65 : 1,
        starLife: 600 + size * 100,
        starLifeVariation: 0.32,
        glitter: "light",
        glitterColor: COLOR_PALETTE.Gold,
        color,
        crackle: true,
        pistil: Math.random() < 0.65,
        pistilColor: createPistilColor(color),
    };
};

const horsetailShell = (size = 1) => {
    const color = getRandomColor();
    return {
        shellSize: size,
        horsetail: true,
        color,
        spreadSize: 250 + size * 38,
        starDensity: 0.9,
        starLife: 2500 + size * 300,
        glitter: "medium",
        glitterColor: Math.random() < 0.5 ? getWhiteOrGold() : color,
        strobe: color === COLOR_PALETTE.White,
    };
};

const heartShell = (size = 1) => {
    const limitedSize = 0.3 + Math.random() * 0.2;
    const color = getRandomColor({ limitWhite: true });
    return {
        shellSize: size,
        spreadSize: 300 + limitedSize * 100,
        starLife: 1000 + limitedSize * 200,
        starDensity: 1.2,
        color,
        heart: true,
        glitter: "light",
        glitterColor: getWhiteOrGold(),
        pistil: Math.random() < 0.3,
        pistilColor: createPistilColor(color),
    };
};

// 螺旋烟花 - 螺旋形爆炸效果
const spiralShell = (size = 1) => {
    const color = getRandomColor();
    return {
        shellSize: size,
        spiral: true,
        color,
        spreadSize: 320 + size * 110,
        starLife: 850 + size * 190,
        starCount: 3.0 * PI_2 * (size + 1),
        starLifeVariation: 0.4,
        glitter: "medium",
        glitterColor: color === COLOR_PALETTE.Gold ? COLOR_PALETTE.Gold : COLOR_PALETTE.White,
        pistil: Math.random() < 0.5,
        pistilColor: createPistilColor(color),
    };
};

// 瀑布烟花 - 向下流动的瀑布效果
const waterfallShell = (size = 1) => {
    const color = getRandomColor();
    return {
        shellSize: size,
        waterfall: true,
        color,
        spreadSize: 280 + size * 90,
        starLife: 1200 + size * 250,
        starDensity: 0.8,
        starLifeVariation: 0.6,
        glitter: "willow",
        glitterColor: color,
        streamers: true,
    };
};

// 彩虹烟花 - 多彩渐变效果
const rainbowShell = (size = 1) => {
    const colors = [
        COLOR_PALETTE.Red,
        COLOR_PALETTE.Orange,
        COLOR_PALETTE.Yellow,
        COLOR_PALETTE.Green,
        COLOR_PALETTE.Blue,
        COLOR_PALETTE.Purple
    ];
    return {
        shellSize: size,
        rainbow: true,
        color: colors,
        spreadSize: 340 + size * 120,
        starLife: 900 + size * 200,
        starCount: 2.8 * PI_2 * (size + 1),
        glitter: "light",
        glitterColor: COLOR_PALETTE.White,
    };
};

// 流星烟花 - 带尾迹的流星效果
const meteorShell = (size = 1) => {
    const color = getRandomColor();
    return {
        shellSize: size,
        meteor: true,
        color,
        spreadSize: 260 + size * 80,
        starLife: 1500 + size * 300,
        starDensity: 0.6,
        starLifeVariation: 0.8,
        glitter: "heavy",
        glitterColor: color,
        trail: true,
    };
};

// 雪花烟花 - 雪花形状的爆炸效果
const snowflakeShell = (size = 1) => {
    const color = COLOR_PALETTE.White;
    return {
        shellSize: size,
        snowflake: true,
        color,
        spreadSize: 300 + size * 100,
        starLife: 1100 + size * 220,
        starCount: 2.4 * PI_2 * (size + 1),
        glitter: "light",
        glitterColor: COLOR_PALETTE.White,
    };
};

// 银河烟花 - 星云般的扩散效果
const galaxyShell = (size = 1) => {
    const colors = [COLOR_PALETTE.Blue, COLOR_PALETTE.Purple, COLOR_PALETTE.White];
    return {
        shellSize: size,
        galaxy: true,
        color: colors,
        spreadSize: 400 + size * 150,
        starLife: 1300 + size * 280,
        starDensity: 0.7,
        starLifeVariation: 0.9,
        glitter: "medium",
        glitterColor: COLOR_PALETTE.White,
        nebula: true,
    };
};

// 闪电烟花 - 闪电状的爆炸效果
const lightningShell = (size = 1) => {
    const color = COLOR_PALETTE.White;
    return {
        shellSize: size,
        lightning: true,
        color,
        spreadSize: 280 + size * 90,
        starLife: 700 + size * 150,
        starCount: 1.8 * PI_2 * (size + 1),
        glitter: "light",
        glitterColor: COLOR_PALETTE.White,
        flash: true,
    };
};

// 漩涡烟花 - 旋转的漩涡效果
const whirlpoolShell = (size = 1) => {
    const color = getRandomColor();
    return {
        shellSize: size,
        whirlpool: true,
        color,
        spreadSize: 350 + size * 120,
        starLife: 950 + size * 200,
        starCount: 2.6 * PI_2 * (size + 1),
        glitter: "heavy",
        glitterColor: color,
        rotation: true,
    };
};

// 烟火瀑布 - 连续下落的烟花效果
const firefallShell = (size = 1) => {
    const color = getRandomColor();
    return {
        shellSize: size,
        firefall: true,
        color,
        spreadSize: 320 + size * 110,
        starLife: 1800 + size * 350,
        starDensity: 0.5,
        starLifeVariation: 1.2,
        glitter: "willow",
        glitterColor: color,
        continuous: true,
    };
};

// 时间延迟烟花 - 分阶段爆炸效果
const timeDelayShell = (size = 1) => {
    const color = getRandomColor();
    return {
        shellSize: size,
        timeDelay: true,
        color,
        spreadSize: 330 + size * 115,
        starLife: 1000 + size * 210,
        starCount: 2.7 * PI_2 * (size + 1),
        glitter: "medium",
        glitterColor: color,
        stages: 3,
    };
};

// 彩虹漩涡 - 彩色漩涡效果
const rainbowWhirlShell = (size = 1) => {
    const colors = [
        COLOR_PALETTE.Red,
        COLOR_PALETTE.Orange, 
        COLOR_PALETTE.Yellow,
        COLOR_PALETTE.Green,
        COLOR_PALETTE.Blue,
        COLOR_PALETTE.Purple
    ];
    return {
        shellSize: size,
        rainbowWhirl: true,
        color: colors,
        spreadSize: 380 + size * 130,
        starLife: 1100 + size * 230,
        starCount: 3.2 * PI_2 * (size + 1),
        glitter: "light",
        glitterColor: COLOR_PALETTE.White,
    };
};

function getRandomShellName() {
    return Math.random() < 0.5 ? "Chrysanthemum" : shellTypesList[(Math.random() * (shellTypesList.length - 1) + 1) | 0];
}

function generateRandomShell(size) {
    if (IS_HEADER) return generateRandomFastShell()(size);
    return shellFactories[getRandomShellName()](size);
}

function createShellFromConfig(size) {
    return shellFactories[getShellType()](size);
}

const fastShellBlacklist = ["Falling Leaves", "Floral", "Willow"];
function generateRandomFastShell() {
    const isRandom = getShellType() === "Random";
    let shellName = isRandom ? getRandomShellName() : getShellType();
    if (isRandom) {
        while (fastShellBlacklist.includes(shellName)) {
            shellName = getRandomShellName();
        }
    }
    return shellFactories[shellName];
}

const shellFactories = {
    Random: generateRandomShell,
    Crackle: crackleShell,
    Crossette: crossetteShell,
    Chrysanthemum: chrysanthemumShell,
    "Falling Leaves": fallingLeavesShell,
    Floral: floralShell,
    Ghost: ghostShell,
    "Horse Tail": horsetailShell,
    Palm: palmShell,
    Ring: ringShell,
    "Explosion Ring": explosionRingShell,
    Spiral: spiralShell,
    Waterfall: waterfallShell,
    Rainbow: rainbowShell,
    Meteor: meteorShell,
    Snowflake: snowflakeShell,
    Galaxy: galaxyShell,
    Lightning: lightningShell,
    Whirlpool: whirlpoolShell,
    Firefall: firefallShell,
    "Time Delay": timeDelayShell,
    "Rainbow Whirl": rainbowWhirlShell,
    Strobe: strobeShell,
    Willow: willowShell,
    Heart: heartShell,
};

const shellTypesList = Object.keys(shellFactories);

function initializeApplication() {
    document.querySelector(".loading-init").remove();
    domElements.stageContainer.classList.remove("remove");

    function populateSelectOptions(node, options) {
        node.innerHTML = options.reduce((acc, opt) => (acc += `<option value="${opt.value}">${t(opt.label)}</option>`), "");
    }

    // 烟花类型选项
    let options = "";
    shellTypesList.forEach((opt) => (options += `<option value="${opt}">${t(opt)}</option>`));
    domElements.shellType.innerHTML = options;

    // 烟花大小选项（不需要翻译，因为都是尺寸单位）
    options = "";
    ['3"', '4"', '6"', '8"', '12"', '16"'].forEach((opt, i) => (options += `<option value="${i}">${opt}</option>`));
    domElements.shellSize.innerHTML = options;

    // 画质选项
    populateSelectOptions(domElements.quality, [
        { label: "低", value: QUALITY_LOW },
        { label: "正常", value: QUALITY_NORMAL },
        { label: "高", value: QUALITY_HIGH },
    ]);

    // 照亮天空选项
    populateSelectOptions(domElements.skyLighting, [
        { label: "不", value: SKY_LIGHT_NONE },
        { label: "暗", value: SKY_LIGHT_DIM },
        { label: "正常", value: SKY_LIGHT_NORMAL },
    ]);

    // 缩放选项（不需要翻译，因为都是百分比）
    populateSelectOptions(
        domElements.scaleFactor,
        [0.5, 0.62, 0.75, 0.9, 1.0, 1.5, 2.0].map((value) => ({ value: value.toFixed(2), label: `${value * 100}%` }))
    );

    togglePauseState(false);
    renderApplication(appStateManager.state);
    applyConfigurationChanges();
}

function fitShellPositionHorizontal(position) {
    const edge = 0.08;
    return (1 - edge * 2) * position + edge;
}

function fitShellPositionVertical(position) {
    return position * 0.75;
}

function getRandomHorizontalPosition() {
    return fitShellPositionHorizontal(Math.random());
}

function getRandomVerticalPosition() {
    return fitShellPositionVertical(Math.random());
}

function getRandomShellSizeConfig() {
    const baseSize = getShellSize();
    const maxVariance = Math.min(2.5, baseSize);
    const variance = Math.random() * maxVariance;
    const size = baseSize - variance;
    const height = maxVariance === 0 ? Math.random() : 1 - variance / maxVariance;
    const centerOffset = Math.random() * (1 - height * 0.65) * 0.5;
    const x = Math.random() < 0.5 ? 0.5 - centerOffset : 0.5 + centerOffset;
    return {
        size,
        x: fitShellPositionHorizontal(x),
        height: fitShellPositionVertical(height),
    };
}

function launchShellFromUserEvent(event) {
    const shell = new FireworkShell(createShellFromConfig(getShellSize()));
    const w = mainCanvas.width;
    const h = mainCanvas.height;

    shell.launch(event ? event.x / w : getRandomHorizontalPosition(), event ? 1 - event.y / h : getRandomVerticalPosition());
}

function sequenceRandomShell() {
    const sizeConfig = getRandomShellSizeConfig();
    const shell = new FireworkShell(createShellFromConfig(sizeConfig.size));
    shell.launch(sizeConfig.x, sizeConfig.height);

    let extraDelay = shell.starLife;
    if (shell.fallingLeaves) {
        extraDelay = 4600;
    }

    return 900 + Math.random() * 600 + extraDelay;
}

function sequenceRandomFastShell() {
    const shellType = generateRandomFastShell();
    const sizeConfig = getRandomShellSizeConfig();
    const shell = new FireworkShell(shellType(sizeConfig.size));
    shell.launch(sizeConfig.x, sizeConfig.height);

    let extraDelay = shell.starLife;

    return 900 + Math.random() * 600 + extraDelay;
}

function sequenceTwoShells() {
    const sizeConfig1 = getRandomShellSizeConfig();
    const sizeConfig2 = getRandomShellSizeConfig();
    const shell1 = new FireworkShell(createShellFromConfig(sizeConfig1.size));
    const shell2 = new FireworkShell(createShellFromConfig(sizeConfig2.size));
    const leftOffset = Math.random() * 0.2 - 0.1;
    const rightOffset = Math.random() * 0.2 - 0.1;
    shell1.launch(0.3 + leftOffset, sizeConfig1.height);
    setTimeout(() => {
        shell2.launch(0.7 + rightOffset, sizeConfig2.height);
    }, 100);

    let extraDelay = Math.max(shell1.starLife, shell2.starLife);
    if (shell1.fallingLeaves || shell2.fallingLeaves) {
        extraDelay = 4600;
    }

    return 900 + Math.random() * 600 + extraDelay;
}

function sequenceTripleShell() {
    const shellType = generateRandomFastShell();
    const baseSize = getShellSize();
    const smallSize = Math.max(0, baseSize - 1.25);

    const offset = Math.random() * 0.08 - 0.04;
    const shell1 = new FireworkShell(shellType(baseSize));
    shell1.launch(0.5 + offset, 0.7);

    const leftDelay = 1000 + Math.random() * 400;
    const rightDelay = 1000 + Math.random() * 400;

    setTimeout(() => {
        const offset = Math.random() * 0.08 - 0.04;
        const shell2 = new FireworkShell(shellType(smallSize));
        shell2.launch(0.2 + offset, 0.1);
    }, leftDelay);

    setTimeout(() => {
        const offset = Math.random() * 0.08 - 0.04;
        const shell3 = new FireworkShell(shellType(smallSize));
        shell3.launch(0.8 + offset, 0.1);
    }, rightDelay);

    return 4000;
}

function sequencePyramid() {
    const barrageCountHalf = IS_DESKTOP ? 7 : 4;
    const largeSize = getShellSize();
    const smallSize = Math.max(0, largeSize - 3);
    const randomMainShell = Math.random() < 0.78 ? chrysanthemumShell : ringShell;
    const randomSpecialShell = generateRandomShell;

    function launchShell(x, useSpecial) {
        const isRandom = getShellType() === "Random";
        let shellType = isRandom ? (useSpecial ? randomSpecialShell : randomMainShell) : shellFactories[getShellType()];
        const shell = new FireworkShell(shellType(useSpecial ? largeSize : smallSize));
        const height = x <= 0.5 ? x / 0.5 : (1 - x) / 0.5;
        shell.launch(x, useSpecial ? 0.75 : height * 0.42);
    }

    let count = 0;
    let delay = 0;
    while (count <= barrageCountHalf) {
        if (count === barrageCountHalf) {
            setTimeout(() => {
                launchShell(0.5, true);
            }, delay);
        } else {
            const offset = (count / barrageCountHalf) * 0.5;
            const delayOffset = Math.random() * 30 + 30;
            setTimeout(() => {
                launchShell(offset, false);
            }, delay);
            setTimeout(() => {
                launchShell(1 - offset, false);
            }, delay + delayOffset);
        }

        count++;
        delay += 200;
    }

    return 3400 + barrageCountHalf * 250;
}

function sequenceSmallBarrage() {
    sequenceSmallBarrage.lastCalled = Date.now();
    const barrageCount = IS_DESKTOP ? 11 : 5;
    const specialIndex = IS_DESKTOP ? 3 : 1;
    const shellSize = Math.max(0, getShellSize() - 2);
    const randomMainShell = Math.random() < 0.78 ? chrysanthemumShell : ringShell;
    const randomSpecialShell = generateRandomFastShell;

    function launchShell(x, useSpecial) {
        const isRandom = getShellType() === "Random";
        let shellType = isRandom ? (useSpecial ? randomSpecialShell : randomMainShell) : shellFactories[getShellType()];
        const shell = new FireworkShell(shellType(shellSize));
        const height = (Math.cos(x * 5 * Math.PI + PI_HALF) + 1) / 2;
        shell.launch(x, height * 0.75);
    }

    let count = 0;
    let delay = 0;
    while (count < barrageCount) {
        if (count === 0) {
            launchShell(0.5, false);
            count += 1;
        } else {
            const offset = (count + 1) / barrageCount / 2;
            const delayOffset = Math.random() * 30 + 30;
            const useSpecial = count === specialIndex;
            setTimeout(() => {
                launchShell(0.5 + offset, useSpecial);
            }, delay);
            setTimeout(() => {
                launchShell(0.5 - offset, useSpecial);
            }, delay + delayOffset);
            count += 2;
        }
        delay += 200;
    }

    return 3400 + barrageCount * 120;
}
sequenceSmallBarrage.cooldown = 15000;
sequenceSmallBarrage.lastCalled = Date.now();

const sequences = [sequenceRandomShell, sequenceTwoShells, sequenceTripleShell, sequencePyramid, sequenceSmallBarrage];

let isFirstSequence = true;
const finaleCount = 32;
let currentFinaleCount = 0;

function startFireworkSequence() {
    if (isFirstSequence) {
        isFirstSequence = false;
        if (IS_HEADER) {
            return sequenceTwoShells();
        } else {
            const shell = new FireworkShell(chrysanthemumShell(getShellSize()));
            shell.launch(0.5, 0.5);
            return 2400;
        }
    }

    if (isFinaleModeEnabled()) {
        sequenceRandomFastShell();
        if (currentFinaleCount < finaleCount) {
            currentFinaleCount++;
            return 170;
        } else {
            currentFinaleCount = 0;
            return 6000;
        }
    }

    const rand = Math.random();

    if (rand < 0.08 && Date.now() - sequenceSmallBarrage.lastCalled > sequenceSmallBarrage.cooldown) {
        return sequenceSmallBarrage();
    }

    if (rand < 0.1) {
        return sequencePyramid();
    }

    if (rand < 0.6 && !IS_HEADER) {
        return sequenceRandomShell();
    } else if (rand < 0.8) {
        return sequenceTwoShells();
    } else if (rand < 1) {
        return sequenceTripleShell();
    }
}

let activePointerCount = 0;
let isUpdatingSpeed = false;

function handlePointerStart(event) {
    activePointerCount++;
    const btnSize = 50;

    if (event.y < btnSize) {
        if (event.x < btnSize) {
            togglePauseState();
            return;
        }
        if (event.x > mainCanvas.width / 2 - btnSize / 2 && event.x < mainCanvas.width / 2 + btnSize / 2) {
            toggleSoundState();
            return;
        }
        if (event.x > mainCanvas.width - btnSize) {
            toggleMenuState();
            return;
        }
    }

    if (!isSimulationRunning()) return;

    if (updateSpeedFromPointer(event)) {
        isUpdatingSpeed = true;
    } else if (event.onCanvas) {
        launchShellFromUserEvent(event);
    }
}

function handlePointerEnd(event) {
    activePointerCount--;
    isUpdatingSpeed = false;
}

function handlePointerMove(event) {
    if (!isSimulationRunning()) return;

    if (isUpdatingSpeed) {
        updateSpeedFromPointer(event);
    }
}

function handleKeyPress(event) {
    if (event.keyCode === 80) {
        togglePauseState();
    } else if (event.keyCode === 79) {
        toggleMenuState();
    } else if (event.keyCode === 27) {
        toggleMenuState(false);
    }
}

mainCanvas.addEventListener("pointerstart", handlePointerStart);
mainCanvas.addEventListener("pointerend", handlePointerEnd);
mainCanvas.addEventListener("pointermove", handlePointerMove);
window.addEventListener("keydown", handleKeyPress);

function handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const containerW = Math.min(w, MAX_WIDTH);
    const containerH = w <= 420 ? h : Math.min(h, MAX_HEIGHT);
    domElements.stageContainer.style.width = containerW + "px";
    domElements.stageContainer.style.height = containerH + "px";
    canvasStages.forEach((stage) => stage.resize(containerW, containerH));
    const scaleFactor = getScaleFactor();
    stageWidth = containerW / scaleFactor;
    stageHeight = containerH / scaleFactor;
}

handleResize();
window.addEventListener("resize", handleResize);

let currentFrame = 0;
let speedBarOpacity = 0;
let autoLaunchTimer = 0;

function updateSpeedFromPointer(event) {
    if (isUpdatingSpeed || event.y >= mainCanvas.height - 44) {
        const edge = 16;
        const newSpeed = (event.x - edge) / (mainCanvas.width - edge * 2);
        simulationSpeed = Math.min(Math.max(newSpeed, 0), 1);
        speedBarOpacity = 1;
        return true;
    }
    return false;
}

function updateGlobalVariables(timeStep, lag) {
    currentFrame++;

    if (!isUpdatingSpeed) {
        speedBarOpacity -= lag / 30;
        if (speedBarOpacity < 0) {
            speedBarOpacity = 0;
        }
    }

    if (appStateManager.state.config.autoLaunch) {
        autoLaunchTimer -= timeStep;
        if (autoLaunchTimer <= 0) {
            autoLaunchTimer = startFireworkSequence() * 1.25;
        }
    }
}

function updateFrame(frameTime, lag) {
    if (!isSimulationRunning()) return;

    const width = stageWidth;
    const height = stageHeight;
    const timeStep = frameTime * simulationSpeed;
    const speed = simulationSpeed * lag;

    updateGlobalVariables(timeStep, lag);

    const starDrag = 1 - (1 - Star.airDrag) * speed;
    const starDragHeavy = 1 - (1 - Star.heavyAirDrag) * speed;
    const sparkDrag = 1 - (1 - Spark.airDrag) * speed;
    const gravityAcc = (timeStep / 1000) * GRAVITY;

    COLOR_CODES_WITH_INVISIBLE.forEach((color) => {
        const stars = Star.activeParticles[color];
        for (let i = stars.length - 1; i >= 0; i--) {
            const star = stars[i];
            if (star.updateFrame === currentFrame) {
                continue;
            }
            star.updateFrame = currentFrame;

            star.life -= timeStep;
            if (star.life <= 0) {
                stars.splice(i, 1);
                Star.returnInstance(star);
            } else {
                const burnRate = Math.pow(star.life / star.fullLife, 0.5);
                const burnRateInverse = 1 - burnRate;

                star.prevX = star.x;
                star.prevY = star.y;
                star.x += star.speedX * speed;
                star.y += star.speedY * speed;

                if (!star.heavy) {
                    star.speedX *= starDrag;
                    star.speedY *= starDrag;
                } else {
                    star.speedX *= starDragHeavy;
                    star.speedY *= starDragHeavy;
                }
                star.speedY += gravityAcc;

                if (star.spinRadius) {
                    star.spinAngle += star.spinSpeed * speed;
                    star.x += Math.sin(star.spinAngle) * star.spinRadius * speed;
                    star.y += Math.cos(star.spinAngle) * star.spinRadius * speed;
                }

                if (star.sparkFreq) {
                    star.sparkTimer -= timeStep;
                    while (star.sparkTimer < 0) {
                        star.sparkTimer += star.sparkFreq * 0.75 + star.sparkFreq * burnRateInverse * 4;
                        Spark.add(star.x, star.y, star.sparkColor, Math.random() * PI_2, Math.random() * star.sparkSpeed * burnRate, star.sparkLife * 0.8 + Math.random() * star.sparkLifeVariation * star.sparkLife);
                    }
                }

                if (star.life < star.transitionTime) {
                    if (star.secondColor && !star.colorChanged) {
                        star.colorChanged = true;
                        star.color = star.secondColor;
                        stars.splice(i, 1);
                        Star.activeParticles[star.secondColor].push(star);
                        if (star.secondColor === INVISIBLE_COLOR) {
                            star.sparkFreq = 0;
                        }
                    }

                    if (star.strobe) {
                        star.visible = Math.floor(star.life / star.strobeFreq) % 3 === 0;
                    }
                }
            }
        }

        const sparks = Spark.activeParticles[color];
        for (let i = sparks.length - 1; i >= 0; i--) {
            const spark = sparks[i];
            spark.life -= timeStep;
            if (spark.life <= 0) {
                sparks.splice(i, 1);
                Spark.returnInstance(spark);
            } else {
                spark.prevX = spark.x;
                spark.prevY = spark.y;
                spark.x += spark.speedX * speed;
                spark.y += spark.speedY * speed;
                spark.speedX *= sparkDrag;
                spark.speedY *= sparkDrag;
                spark.speedY += gravityAcc;
            }
        }
    });

    renderScene(speed);
}

function renderScene(speed) {
    const { dpr } = mainCanvas;
    const width = stageWidth;
    const height = stageHeight;
    const trailsCtx = trailsCanvas.context;
    const mainCtx = mainCanvas.context;

    if (getSkyLightingSetting() !== SKY_LIGHT_NONE) {
        renderSkyColor(speed);
    }

    const scaleFactor = getScaleFactor();
    trailsCtx.scale(dpr * scaleFactor, dpr * scaleFactor);
    mainCtx.scale(dpr * scaleFactor, dpr * scaleFactor);

    trailsCtx.globalCompositeOperation = "source-over";
    trailsCtx.fillStyle = `rgba(0, 0, 0, ${appStateManager.state.config.longExposure ? 0.0025 : 0.175 * speed})`;
    trailsCtx.fillRect(0, 0, width, height);

    mainCtx.clearRect(0, 0, width, height);

    while (BurstFlash.activeFlashes.length) {
        const flash = BurstFlash.activeFlashes.pop();

        const burstGradient = trailsCtx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, flash.radius);
        burstGradient.addColorStop(0.024, "rgba(255, 255, 255, 1)");
        burstGradient.addColorStop(0.125, "rgba(255, 160, 20, 0.2)");
        burstGradient.addColorStop(0.32, "rgba(255, 140, 20, 0.11)");
        burstGradient.addColorStop(1, "rgba(255, 120, 20, 0)");
        trailsCtx.fillStyle = burstGradient;
        trailsCtx.fillRect(flash.x - flash.radius, flash.y - flash.radius, flash.radius * 2, flash.radius * 2);
        BurstFlash.returnInstance(flash);
    }

    trailsCtx.globalCompositeOperation = "lighten";

    trailsCtx.lineWidth = 3;
    trailsCtx.lineCap = lowQualityMode ? "square" : "round";
    mainCtx.strokeStyle = "#fff";
    mainCtx.lineWidth = 1;
    mainCtx.beginPath();

    COLOR_CODES.forEach((color) => {
        const stars = Star.activeParticles[color];

        trailsCtx.strokeStyle = color;
        trailsCtx.beginPath();
        stars.forEach((star) => {
            if (star.visible) {
                trailsCtx.lineWidth = star.size;
                trailsCtx.moveTo(star.x, star.y);
                trailsCtx.lineTo(star.prevX, star.prevY);
                mainCtx.moveTo(star.x, star.y);
                mainCtx.lineTo(star.x - star.speedX * 1.6, star.y - star.speedY * 1.6);
            }
        });
        trailsCtx.stroke();
    });
    mainCtx.stroke();

    trailsCtx.lineWidth = Spark.drawWidth;
    trailsCtx.lineCap = "butt";
    COLOR_CODES.forEach((color) => {
        const sparks = Spark.activeParticles[color];
        trailsCtx.strokeStyle = color;
        trailsCtx.beginPath();
        sparks.forEach((spark) => {
            trailsCtx.moveTo(spark.x, spark.y);
            trailsCtx.lineTo(spark.prevX, spark.prevY);
        });
        trailsCtx.stroke();
    });

    if (speedBarOpacity) {
        const speedBarHeight = 6;
        mainCtx.globalAlpha = speedBarOpacity;
        mainCtx.fillStyle = COLOR_PALETTE.Blue;
        mainCtx.fillRect(0, height - speedBarHeight, width * simulationSpeed, speedBarHeight);
        mainCtx.globalAlpha = 1;
    }

    trailsCtx.setTransform(1, 0, 0, 1, 0, 0);
    mainCtx.setTransform(1, 0, 0, 1, 0, 0);
}

function createTextBurstEffect(wordText, particleFactory, centerX, centerY) {
    const matrix = getTextDotMatrix(wordText);
    if (!matrix) return;
    const dotCenterX = matrix.width / 2;
    const dotCenterY = matrix.height / 2;
    const color = getRandomColor();
    const strobed = Math.random() < 0.5;
    const strobeColor = strobed ? getRandomColor() : color;

    for (let i = 0; i < matrix.points.length; i++) {
        const point = matrix.points[i];
        let x = centerX + (point.x - dotCenterX);
        let y = centerY + (point.y - dotCenterY);
        particleFactory({ x, y }, color, strobed, strobeColor);
    }
}

function createHeartBurstEffect(count, particleFactory) {
    const scale = 0.015 * Math.sqrt(count);
    
    for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        
        const rotatedX = -y;
        const rotatedY = x;
        
        const angle = Math.atan2(rotatedY, rotatedX);
        const speed = Math.sqrt(rotatedX * rotatedX + rotatedY * rotatedY) * scale;
        
        particleFactory(angle, speed);
    }
}

function explosionRingStarEffect(star) {
    const count = highQualityMode ? 24 : 12;
    const delay = Math.random() * 200 + 100; // 100-300ms延迟
    
    // 创建二次爆炸的火花
    createBurstEffect(count, (angle, speedMult) => {
        const spark = Spark.add(
            star.x, 
            star.y, 
            star.color, 
            angle, 
            speedMult * 1.8, 
            400 + Math.random() * 200
        );
        
        // 添加闪烁效果
        spark.sparkFreq = 60;
        spark.sparkSpeed = 0.4;
        spark.sparkLife = 200;
        spark.sparkLifeVariation = 2;
    });
    
}

// 螺旋爆炸效果
function spiralStarEffect(star) {
    const count = highQualityMode ? 16 : 8;
    const spiralTurns = 3;
    
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * PI_2;
        const spiralAngle = angle + spiralTurns * Math.PI * (i / count);
        const speed = 1.2 + Math.random() * 0.6;
        
        Spark.add(
            star.x,
            star.y,
            star.color,
            spiralAngle,
            speed,
            500 + Math.random() * 200
        );
    }
    
}

// 瀑布效果
function waterfallStarEffect(star) {
    const count = highQualityMode ? 20 : 10;
    
    for (let i = 0; i < count; i++) {
        const angle = Math.PI + (Math.random() - 0.5) * 0.5; // 主要向下
        const speed = 0.8 + Math.random() * 0.4;
        
        const spark = Spark.add(
            star.x,
            star.y,
            star.color,
            angle,
            speed,
            800 + Math.random() * 300
        );
        
        spark.sparkFreq = 80;
        spark.sparkSpeed = 0.3;
        spark.sparkLife = 400;
    }
}

// 雪花效果
function snowflakeStarEffect(star) {
    const arms = 6;
    const pointsPerArm = highQualityMode ? 4 : 2;
    
    for (let arm = 0; arm < arms; arm++) {
        const baseAngle = (arm / arms) * PI_2;
        
        for (let i = 0; i < pointsPerArm; i++) {
            const distance = 0.2 + (i * 0.15);
            const angle = baseAngle + (Math.random() - 0.5) * 0.1;
            const speed = 0.6 + Math.random() * 0.3;
            
            Spark.add(
                star.x,
                star.y,
                COLOR_PALETTE.White,
                angle,
                speed,
                600 + Math.random() * 200
            );
        }
    }
    
    audioManager.playSound("burstSmall");
}

// 银河星云效果
function galaxyStarEffect(star) {
    const count = highQualityMode ? 20 : 10;
    const nebulaSize = 2.5;
    
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * PI_2;
        const distance = Math.random() * nebulaSize;
        const speed = 0.4 + Math.random() * 0.3;
        
        Spark.add(
            star.x,
            star.y,
            Math.random() < 0.7 ? COLOR_PALETTE.Blue : COLOR_PALETTE.Purple,
            angle,
            speed,
            900 + Math.random() * 300
        );
    }
    
    // 添加中心白色闪光
    for (let i = 0; i < 5; i++) {
        Spark.add(
            star.x,
            star.y,
            COLOR_PALETTE.White,
            Math.random() * PI_2,
            0.8 + Math.random() * 0.4,
            400 + Math.random() * 200
        );
    }
}

// 闪电效果
function lightningStarEffect(star) {
    const branches = highQualityMode ? 3 : 2;
    
    for (let branch = 0; branch < branches; branch++) {
        const startAngle = Math.random() * PI_2;
        const branchLength = 3 + Math.random() * 2;
        
        for (let segment = 0; segment < branchLength; segment++) {
            const angle = startAngle + (Math.random() - 0.5) * 0.3;
            const speed = 1.0 + segment * 0.2;
            
            Spark.add(
                star.x,
                star.y,
                COLOR_PALETTE.White,
                angle,
                speed,
                300 + Math.random() * 150
            );
        }
    }
    
    // 闪电闪光效果
    BurstFlash.add(star.x, star.y, 30);
    audioManager.playSound("burstSmall");
}

// 漩涡效果
function whirlpoolStarEffect(star) {
    const count = highQualityMode ? 15 : 8;
    const rotationSpeed = 0.1;
    
    for (let i = 0; i < count; i++) {
        const baseAngle = (i / count) * PI_2;
        const spiralAngle = baseAngle + rotationSpeed * i;
        const speed = 0.7 + Math.random() * 0.4;
        
        const spark = Spark.add(
            star.x,
            star.y,
            star.color,
            spiralAngle,
            speed,
            700 + Math.random() * 200
        );
        
        // 添加旋转效果
        spark.spinSpeed = 0.05;
        spark.spinRadius = 0.5 + Math.random() * 0.3;
    }
}


// 时间延迟效果
function timeDelayStarEffect(star) {
    const stages = 3;
    const stageDelay = 150;
    
    for (let stage = 0; stage < stages; stage++) {
        setTimeout(() => {
            const count = highQualityMode ? 6 : 3;
            
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * PI_2;
                const speed = 0.6 + Math.random() * 0.3;
                
                Spark.add(
                    star.x,
                    star.y,
                    star.color,
                    angle,
                    speed,
                    400 + Math.random() * 150
                );
            }
            
            if (stage === stages - 1) {
                audioManager.playSound("burstSmall");
            }
        }, stage * stageDelay);
    }
}

function crossetteStarEffect(star) {
    const startAngle = Math.random() * PI_HALF;
    createParticleArc(startAngle, PI_2, 4, 0.5, (angle) => {
        Star.add(star.x, star.y, star.color, angle, Math.random() * 0.6 + 0.75, 600);
    });
}

const currentSkyColor = { r: 0, g: 0, b: 0 };
const targetSkyColor = { r: 0, g: 0, b: 0 };

function renderSkyColor(speed) {
    const maxSkySaturation = getSkyLightingSetting() * 15;
    const maxStarCount = 500;
    let totalStarCount = 0;

    targetSkyColor.r = 0;
    targetSkyColor.g = 0;
    targetSkyColor.b = 0;

    COLOR_CODES.forEach((color) => {
        const tuple = COLOR_TUPLES[color];
        const count = Star.activeParticles[color].length;
        totalStarCount += count;
        targetSkyColor.r += tuple.r * count;
        targetSkyColor.g += tuple.g * count;
        targetSkyColor.b += tuple.b * count;
    });

    const intensity = Math.pow(Math.min(1, totalStarCount / maxStarCount), 0.3);
    const maxColorComponent = Math.max(1, targetSkyColor.r, targetSkyColor.g, targetSkyColor.b);

    targetSkyColor.r = (targetSkyColor.r / maxColorComponent) * maxSkySaturation * intensity;
    targetSkyColor.g = (targetSkyColor.g / maxColorComponent) * maxSkySaturation * intensity;
    targetSkyColor.b = (targetSkyColor.b / maxColorComponent) * maxSkySaturation * intensity;

    const colorChangeSpeed = 10;
    currentSkyColor.r += ((targetSkyColor.r - currentSkyColor.r) / colorChangeSpeed) * speed;
    currentSkyColor.g += ((targetSkyColor.g - currentSkyColor.g) / colorChangeSpeed) * speed;
    currentSkyColor.b += ((targetSkyColor.b - currentSkyColor.b) / colorChangeSpeed) * speed;

domElements.canvasContainer.style.backgroundColor = `rgb(${currentSkyColor.r | 0}, ${currentSkyColor.g | 0}, ${currentSkyColor.b | 0})`;
}

mainCanvas.addEventListener("ticker", updateFrame);

function createParticleArc(startAngle, arcLength, count, randomness, particleFactory) {
    const angleDelta = arcLength / count;
    const end = startAngle + arcLength - angleDelta * 0.5;

    if (end > startAngle) {
        for (let angle = startAngle; angle < end; angle += angleDelta) {
            particleFactory(angle + Math.random() * angleDelta * randomness);
        }
    } else {
        for (let angle = startAngle; angle > end; angle += angleDelta) {
            particleFactory(angle + Math.random() * angleDelta * randomness);
        }
    }
}

function getTextDotMatrix(word) {
    if (!word) return null;
    const fontSize = Math.floor(Math.random() * 70 + 60);
    return MathUtilities.convertTextToDotMatrix(word, 3, "Gabriola,华文琥珀", fontSize + "px");
}

function createBurstEffect(count, particleFactory, startAngle = 0, arcLength = PI_2) {
    const R = 0.5 * Math.sqrt(count / Math.PI);
    const C = 2 * R * Math.PI;
    const C_HALF = C / 2;

    for (let i = 0; i <= C_HALF; i++) {
        const ringAngle = (i / C_HALF) * PI_HALF;
        const ringSize = Math.cos(ringAngle);
        const partsPerFullRing = C * ringSize;
        const partsPerArc = partsPerFullRing * (arcLength / PI_2);
        const angleIncrement = PI_2 / partsPerFullRing;
        const angleOffset = Math.random() * angleIncrement + startAngle;
        const maxRandomAngleOffset = angleIncrement * 0.33;

        for (let j = 0; j < partsPerArc; j++) {
            const randomAngleOffset = Math.random() * maxRandomAngleOffset;
            let angle = angleIncrement * j + angleOffset + randomAngleOffset;
            particleFactory(angle, ringSize);
        }
    }
}

function createTextBurstEffect(wordText, particleFactory, centerX, centerY) {
    const matrix = getTextDotMatrix(wordText);
    if (!matrix) return;
    const dotCenterX = matrix.width / 2;
    const dotCenterY = matrix.height / 2;
    const color = getRandomColor();
    const strobed = Math.random() < 0.5;
    const strobeColor = strobed ? getRandomColor() : color;

    for (let i = 0; i < matrix.points.length; i++) {
        const point = matrix.points[i];
        let x = centerX + (point.x - dotCenterX);
        let y = centerY + (point.y - dotCenterY);
        particleFactory({ x, y }, color, strobed, strobeColor);
    }
}

function crossetteStarEffect(star) {
    const startAngle = Math.random() * PI_HALF;
    createParticleArc(startAngle, PI_2, 4, 0.5, (angle) => {
        Star.add(star.x, star.y, star.color, angle, Math.random() * 0.6 + 0.75, 600);
    });
}

function floralStarEffect(star) {
    const count = 12 + 6 * quality;
    createBurstEffect(count, (angle, speedMult) => {
        Star.add(star.x, star.y, star.color, angle, speedMult * 2.4, 1000 + Math.random() * 300, star.speedX, star.speedY);
    });
    BurstFlash.add(star.x, star.y, 46);
    audioManager.playSound("burstSmall");
}

function fallingLeavesStarEffect(star) {
    createBurstEffect(7, (angle, speedMult) => {
        const newStar = Star.add(star.x, star.y, INVISIBLE_COLOR, angle, speedMult * 2.4, 2400 + Math.random() * 600, star.speedX, star.speedY);
        newStar.sparkColor = COLOR_PALETTE.Gold;
        newStar.sparkFreq = 144 / quality;
        newStar.sparkSpeed = 0.28;
        newStar.sparkLife = 750;
        newStar.sparkLifeVariation = 3.2;
    });
    BurstFlash.add(star.x, star.y, 46);
    audioManager.playSound("burstSmall");
}

function crackleStarEffect(star) {
    const count = highQualityMode ? 32 : 16;
    createParticleArc(0, PI_2, count, 1.8, (angle) => {
        Spark.add(star.x, star.y, COLOR_PALETTE.Gold, angle, Math.pow(Math.random(), 0.45) * 2.4, 300 + Math.random() * 200);
    });
}

function heartStarEffect_1(star)  {
    const count = highQualityMode ? 32 : 16;
    createParticleArc(0, PI_2, count, 1.8, (angle) => {
        Spark.add(star.x, star.y, COLOR_PALETTE.Gold, angle, Math.pow(Math.random(), 0.45) * 2.4, 300 + Math.random() * 200);
    });
}

function heartStarEffect_2(star)  {
    const count = highQualityMode ? 64 : 32;
    
    // 爱心参数方程
    const heartPoints = [];
    const scale = 0.8; // 爱心大小缩放
    
    // 生成爱心形状的点
    for (let i = 0; i < count; i++) {
        const t = (i / count) * Math.PI * 2;
        
        // 爱心参数方程
        const x = 16 * Math.pow(Math.sin(t), 3);
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        
        const rotatedX = x * 0 + y * (-1);  // rotatedX = 0*x + (-1)*y = -y
        const rotatedY = x * 1 + y * 0;     // rotatedY = 1*x + 0*y = x
        
        heartPoints.push({
            x: rotatedX * scale,
            y: rotatedY * scale
        });
    }
    
    // 创建爱心形状的粒子
    for (let i = 0; i < heartPoints.length; i++) {
        const point = heartPoints[i];
        
        // 计算粒子的角度和速度
        const angle = Math.atan2(point.y, point.x);
        const distance = Math.sqrt(point.x * point.x + point.y * point.y);
        const speed = distance * 0.15; // 根据距离调整速度
        
        // 添加一些随机性使爱心更自然
        const randomAngle = (Math.random() - 0.5) * 0.3;
        const randomSpeed = Math.random() * 0.1 + 0.9;
        
        // 使用星星的颜色而不是固定的金色
        const particleColor = star.color === INVISIBLE_COLOR ? COLOR_PALETTE.Gold : star.color;
        
        // 创建粒子
        Spark.add(
            star.x, 
            star.y, 
            particleColor, 
            angle + randomAngle, 
            speed * randomSpeed, 
            400 + Math.random() * 200
        );
    }
    
    // 添加额外的闪烁效果
    if (highQualityMode) {
        for (let i = 0; i < 8; i++) {
            const flashAngle = Math.random() * Math.PI * 2;
            const flashSpeed = Math.random() * 0.5 + 0.3;
            Spark.add(
                star.x,
                star.y,
                COLOR_PALETTE.White,
                flashAngle,
                flashSpeed,
                150 + Math.random() * 100
            );
        }
    }
    
}

class FireworkShell {
    constructor(options) {
        Object.assign(this, options);
        this.starLifeVariation = options.starLifeVariation || 0.125;
        this.color = options.color || getRandomColor();
        this.glitterColor = options.glitterColor || this.color;
        this.disableText = options.disableText || false;

        if (!this.starCount) {
            const density = options.starDensity || 1;
            const scaledSize = this.spreadSize / 54;
            this.starCount = Math.max(6, scaledSize * scaledSize * density);
        }
    }

    launch(position, launchHeight) {
        const width = stageWidth;
        const height = stageHeight;
        const hpad = 60;
        const vpad = 50;
        const minHeightPercent = 0.45;
        const minHeight = height - height * minHeightPercent;

        const launchX = position * (width - hpad * 2) + hpad;
        const launchY = height;
        const burstY = minHeight - launchHeight * (minHeight - vpad);

        const launchDistance = launchY - burstY;
        const launchVelocity = Math.pow(launchDistance * 0.04, 0.64);

        const comet = (this.comet = Star.add(
            launchX,
            launchY,
            typeof this.color === "string" && this.color !== "random" ? this.color : COLOR_PALETTE.White,
            Math.PI,
            launchVelocity * (this.horsetail ? 1.2 : 1),
            launchVelocity * (this.horsetail ? 100 : 400)
        ));

        comet.heavy = true;
        comet.spinRadius = MathUtilities.randomInRange(0.32, 0.85);
        comet.sparkFreq = 32 / quality;
        if (highQualityMode) comet.sparkFreq = 8;
        comet.sparkLife = 320;
        comet.sparkLifeVariation = 3;
        if (this.glitter === "willow" || this.fallingLeaves) {
            comet.sparkFreq = 20 / quality;
            comet.sparkSpeed = 0.5;
            comet.sparkLife = 500;
        }
        if (this.color === INVISIBLE_COLOR) {
            comet.sparkColor = COLOR_PALETTE.Gold;
        }

        if (Math.random() > 0.4 && !this.horsetail) {
            comet.secondColor = INVISIBLE_COLOR;
            comet.transitionTime = Math.pow(Math.random(), 1.5) * 700 + 500;
        }

        comet.onDeath = (comet) => this.burst(comet.x, comet.y);

        audioManager.playSound("lift");
    }

    burst(x, y) {
        const speed = this.spreadSize / 96;

        let color, onDeath, sparkFreq, sparkSpeed, sparkLife;
        let sparkLifeVariation = 0.25;
        let playedDeathSound = false;
        // 爱心烟花随机效果触发标志
        let heartEffectType = 0;
        if (this.heart) {
            // 整个烟花有50%的概率触发爱心效果
            const heartEffectChance = Math.random();
            if (heartEffectChance < 0.5) {
                // 在爱心效果中，heartStarEffect_2有20%的概率，heartStarEffect_1有80%的概率
                heartEffectType = (Math.random() < 0.2) ? 2 : 1;
            }
        }

        // 爆炸环烟花效果
        if (this.explosionRing) {
            onDeath = (star) => {
                if (!playedDeathSound) {
                    audioManager.playSound("burstSmall");
                    playedDeathSound = true;
                    audioManager.playSound("crackle");
                }
                explosionRingStarEffect(star);
            };
        }
        // 螺旋烟花效果
        if (this.spiral) {
            onDeath = (star) => {
                if (!playedDeathSound) {
                    audioManager.playSound("burstSmall");
                    playedDeathSound = true;
                    audioManager.playSound("crackle");
                }
                spiralStarEffect(star);
            };
        }
        // 瀑布烟花效果
        if (this.waterfall) {
            onDeath = (star) => {
                if (!playedDeathSound) {
                    audioManager.playSound("burstSmall");
                    playedDeathSound = true;
                }
                waterfallStarEffect(star);
            };
        }
        // 雪花烟花效果
        if (this.snowflake) {
            onDeath = (star) => {
                if (!playedDeathSound) {
                    audioManager.playSound("burstSmall");
                    playedDeathSound = true;
                }
                snowflakeStarEffect(star);
            };
        }
        // 银河烟花效果
        if (this.galaxy) {
            onDeath = (star) => {
                if (!playedDeathSound) {
                    audioManager.playSound("burstSmall");
                    playedDeathSound = true;
                }
                galaxyStarEffect(star);
            };
        }
        // 闪电烟花效果
        if (this.lightning) {
            onDeath = (star) => {
                if (!playedDeathSound) {
                    audioManager.playSound("burstSmall");
                    playedDeathSound = true;
                }
                lightningStarEffect(star);
            };
        }
        // 漩涡烟花效果
        if (this.whirlpool) {
            onDeath = (star) => {
                if (!playedDeathSound) {
                    audioManager.playSound("burstSmall");
                    playedDeathSound = true;
                }
                whirlpoolStarEffect(star);
            };
        }
        // 时间延迟烟花效果
        if (this.timeDelay) {
            onDeath = (star) => {
                if (!playedDeathSound) {
                    audioManager.playSound("burstSmall");
                    playedDeathSound = true;
                }
                timeDelayStarEffect(star);
            };
        }
        if (this.crossette)
            onDeath = (star) => {
                if (!playedDeathSound) {
                    audioManager.playSound("crackleSmall");
                    playedDeathSound = true;
                }
                crossetteStarEffect(star);
            };
        if (this.crackle)
            onDeath = (star) => {
                if (!playedDeathSound) {
                    audioManager.playSound("crackle");
                    playedDeathSound = true;
                }
                crackleStarEffect(star);
            };
        if (this.heart)
            onDeath = (star) => {
                if (heartEffectType === 1) {
                    if (!playedDeathSound) {
                        audioManager.playSound("crackle");
                        playedDeathSound = true;
                    }
                    heartStarEffect_1(star);
                } else if (heartEffectType === 2) {
                    if (!playedDeathSound) {
                        audioManager.playSound("crackle");
                        playedDeathSound = true;
                    }
                    heartStarEffect_2(star);
                }
            };
        if (this.floral) onDeath = floralStarEffect;
        if (this.fallingLeaves) onDeath = fallingLeavesStarEffect;

        if (this.glitter === "light") {
            sparkFreq = 400;
            sparkSpeed = 0.3;
            sparkLife = 300;
            sparkLifeVariation = 2;
        } else if (this.glitter === "medium") {
            sparkFreq = 200;
            sparkSpeed = 0.44;
            sparkLife = 700;
            sparkLifeVariation = 2;
        } else if (this.glitter === "heavy") {
            sparkFreq = 80;
            sparkSpeed = 0.8;
            sparkLife = 1400;
            sparkLifeVariation = 2;
        } else if (this.glitter === "thick") {
            sparkFreq = 16;
            sparkSpeed = highQualityMode ? 1.65 : 1.5;
            sparkLife = 1400;
            sparkLifeVariation = 3;
        } else if (this.glitter === "streamer") {
            sparkFreq = 32;
            sparkSpeed = 1.05;
            sparkLife = 620;
            sparkLifeVariation = 2;
        } else if (this.glitter === "willow") {
            sparkFreq = 120;
            sparkSpeed = 0.34;
            sparkLife = 1400;
            sparkLifeVariation = 3.8;
        }

        sparkFreq = sparkFreq / quality;

        let firstStar = true;
        const starFactory = (angle, speedMult) => {
            const standardInitialSpeed = this.spreadSize / 1800;

            const star = Star.add(
                x,
                y,
                color || getRandomColor(),
                angle,
                speedMult * speed,
                this.starLife + Math.random() * this.starLife * this.starLifeVariation,
                this.horsetail ? this.comet && this.comet.speedX : 0,
                this.horsetail ? this.comet && this.comet.speedY : -standardInitialSpeed
            );

            if (this.secondColor) {
                star.transitionTime = this.starLife * (Math.random() * 0.05 + 0.32);
                star.secondColor = this.secondColor;
            }

            if (this.strobe) {
                star.transitionTime = this.starLife * (Math.random() * 0.08 + 0.46);
                star.strobe = true;
                star.strobeFreq = Math.random() * 20 + 40;
                if (this.strobeColor) {
                    star.secondColor = this.strobeColor;
                }
            }

            star.onDeath = onDeath;

            if (this.glitter) {
                star.sparkFreq = sparkFreq;
                star.sparkSpeed = sparkSpeed;
                star.sparkLife = sparkLife;
                star.sparkLifeVariation = sparkLifeVariation;
                star.sparkColor = this.glitterColor;
                star.sparkTimer = Math.random() * star.sparkFreq;
            }
        };

        const textStarFactory = (point, color, strobe, strobeColor) => {
            const standardInitialSpeed = this.spreadSize / 1800;

            if (strobe) {
                const speed = Math.random() * 0.1 + 0.05;
                const star = Star.add(
                    point.x,
                    point.y,
                    color,
                    Math.random() * 2 * Math.PI,
                    speed,
                    this.starLife + Math.random() * this.starLife * this.starLifeVariation + speed * 1000,
                    this.horsetail ? this.comet && this.comet.speedX : 0,
                    this.horsetail ? this.comet && this.comet.speedY : -standardInitialSpeed,
                    2
                );

                star.transitionTime = this.starLife * (Math.random() * 0.08 + 0.46);
                star.strobe = true;
                star.strobeFreq = Math.random() * 20 + 40;
                star.secondColor = strobeColor;
            } else {
                Spark.add(
                    point.x,
                    point.y,
                    color,
                    Math.random() * 2 * Math.PI,
                    Math.pow(Math.random(), 0.15) * 1.4,
                    this.starLife + Math.random() * this.starLife * this.starLifeVariation + 1000
                );
            }

            Spark.add(point.x + 5, point.y + 10, color, Math.random() * 2 * Math.PI, Math.pow(Math.random(), 0.05) * 0.4, this.starLife + Math.random() * this.starLife * this.starLifeVariation + 2000);
        };

        if (typeof this.color === "string") {
            if (this.color === "random") {
                color = null;
            } else {
                color = this.color;
            }

            if (this.ring) {
                const ringStartAngle = Math.random() * Math.PI;
                const ringSquash = Math.pow(Math.random(), 2) * 0.85 + 0.15;

                // 爆炸环烟花的多层环形效果
                if (this.explosionRing && this.multiRing) {
                    const layers = this.ringLayers;
                    const layerDelay = this.delayExplosion ? 50 : 0; // 每层延迟50ms
                    
                    for (let layer = 0; layer < layers; layer++) {
                        const layerSize = 0.7 + (layer * 0.3); // 每层逐渐变大
                        const layerColor = layer === 0 ? color : this.secondaryColor;
                        
                        setTimeout(() => {
                            createBurstEffect(this.starCount / layers, (angle, ringSize) => {
                                const initSpeedX = Math.sin(angle) * speed * ringSquash * layerSize;
                                const initSpeedY = Math.cos(angle) * speed * layerSize;
                                const newSpeed = MathUtilities.calculatePointDistance(0, 0, initSpeedX, initSpeedY);
                                const newAngle = MathUtilities.calculatePointAngle(0, 0, initSpeedX, initSpeedY) + ringStartAngle;
                                const star = Star.add(
                                    x,
                                    y,
                                    layerColor,
                                    newAngle,
                                    newSpeed,
                                    this.starLife + Math.random() * this.starLife * this.starLifeVariation
                                );

                                if (this.glitter) {
                                    star.sparkFreq = sparkFreq;
                                    star.sparkSpeed = sparkSpeed;
                                    star.sparkLife = sparkLife;
                                    star.sparkLifeVariation = sparkLifeVariation;
                                    star.sparkColor = this.glitterColor;
                                    star.sparkTimer = Math.random() * star.sparkFreq;
                                }
                                
                                if (this.explosionRing) {
                                    star.onDeath = onDeath;
                                }
                            });
                        }, layer * layerDelay);
                    }
                } else {
                    // 单层环形爆炸
                    createBurstEffect(this.starCount, (angle, ringSize) => {
                        const initSpeedX = Math.sin(angle) * speed * ringSquash;
                        const initSpeedY = Math.cos(angle) * speed;
                        const newSpeed = MathUtilities.calculatePointDistance(0, 0, initSpeedX, initSpeedY);
                        const newAngle = MathUtilities.calculatePointAngle(0, 0, initSpeedX, initSpeedY) + ringStartAngle;
                        const star = Star.add(
                            x,
                            y,
                            color,
                            newAngle,
                            newSpeed,
                            this.starLife + Math.random() * this.starLife * this.starLifeVariation
                        );

                        if (this.glitter) {
                            star.sparkFreq = sparkFreq;
                            star.sparkSpeed = sparkSpeed;
                            star.sparkLife = sparkLife;
                            star.sparkLifeVariation = sparkLifeVariation;
                            star.sparkColor = this.glitterColor;
                            star.sparkTimer = Math.random() * star.sparkFreq;
                        }
                        
                        if (this.explosionRing) {
                            star.onDeath = onDeath;
                        }
                    });
                }
            } else if (this.heart) {
                createHeartBurstEffect(this.starCount, starFactory);
            } else if (this.spiral) {
                // 螺旋形爆炸效果
                const spiralTurns = 2;
                const spiralStart = Math.random() * PI_2;
                
                createBurstEffect(this.starCount, (angle, ringSize) => {
                    const spiralAngle = angle + spiralTurns * Math.PI * (angle / PI_2);
                    starFactory(spiralAngle + spiralStart, ringSize);
                });
            } else if (this.snowflake) {
                // 雪花形爆炸效果
                const arms = 6;
                createBurstEffect(this.starCount, (angle, ringSize) => {
                    const armAngle = Math.round(angle / (PI_2 / arms)) * (PI_2 / arms);
                    starFactory(armAngle, ringSize);
                });
            } else if (this.galaxy) {
                // 银河星云效果 - 随机扩散
                createBurstEffect(this.starCount, (angle, ringSize) => {
                    const randomAngle = angle + (Math.random() - 0.5) * 0.5;
                    starFactory(randomAngle, ringSize * 1.2);
                });
            } else if (this.lightning) {
                // 闪电效果 - 集中爆发
                const lightningBranches = 4;
                for (let i = 0; i < lightningBranches; i++) {
                    const branchAngle = (i / lightningBranches) * PI_2;
                    createBurstEffect(this.starCount / lightningBranches, starFactory, branchAngle, PI_2 / lightningBranches);
                }
            } else if (this.whirlpool) {
                // 漩涡效果 - 旋转分布
                const whirlTurns = 1.5;
                createBurstEffect(this.starCount, (angle, ringSize) => {
                    const whirlAngle = angle + whirlTurns * Math.PI * (angle / PI_2);
                    starFactory(whirlAngle, ringSize);
                });
            } else if (this.rainbowWhirl) {
                // 彩虹漩涡效果
                const whirlTurns = 2;
                createBurstEffect(this.starCount, (angle, ringSize) => {
                    const whirlAngle = angle + whirlTurns * Math.PI * (angle / PI_2);
                    starFactory(whirlAngle, ringSize);
                });
            } else {
                createBurstEffect(this.starCount, starFactory);
            }
        } else if (Array.isArray(this.color)) {
            if (Math.random() < 0.5) {
                const start = Math.random() * Math.PI;
                const start2 = start + Math.PI;
                const arc = Math.PI;
                color = this.color[0];
                createBurstEffect(this.starCount, starFactory, start, arc);
                color = this.color[1];
                createBurstEffect(this.starCount, starFactory, start2, arc);
            } else {
                color = this.color[0];
                createBurstEffect(this.starCount / 2, starFactory);
                color = this.color[1];
                createBurstEffect(this.starCount / 2, starFactory);
            }
        } else {
            throw new Error("Invalid firework color. Expected string or array of strings, got: " + this.color);
        }

        if (!this.disableText && appStateManager.state.config.wordShell) {
            if (Math.random() < 0.1) {
                if (Math.random() < 0.5) {
                    createTextBurstEffect(getRandomText(), textStarFactory, x, y);
                }
            }
        }

        if (this.pistil) {
            const innerShell = new FireworkShell({
                spreadSize: this.spreadSize * 0.5,
                starLife: this.starLife * 0.6,
                starLifeVariation: this.starLifeVariation,
                starDensity: 1.4,
                color: this.pistilColor,
                glitter: "light",
                disableText: true,
                glitterColor: this.pistilColor === COLOR_PALETTE.Gold ? COLOR_PALETTE.Gold : COLOR_PALETTE.White,
            });
            innerShell.burst(x, y);
        }

        if (this.streamers) {
            const innerShell = new FireworkShell({
                spreadSize: this.spreadSize * 0.9,
                starLife: this.starLife * 0.8,
                starLifeVariation: this.starLifeVariation,
                starCount: Math.floor(Math.max(6, this.spreadSize / 45)),
                color: COLOR_PALETTE.White,
                disableText: true,
                glitter: "streamer",
            });
            innerShell.burst(x, y);
        }

        BurstFlash.add(x, y, this.spreadSize / 4);

        // 爆炸环烟花的多重闪光效果
        if (this.explosionRing && this.multiRing) {
            const layers = this.ringLayers;
            const flashDelay = this.delayExplosion ? 50 : 0;
            
            for (let layer = 0; layer < layers; layer++) {
                setTimeout(() => {
                    BurstFlash.add(x, y, this.spreadSize / (4 + layer));
                }, layer * flashDelay);
            }
        }

        if (this.comet) {
            const maxDiff = 2;
            const sizeDifferenceFromMaxSize = Math.min(maxDiff, getShellSize() - this.shellSize);
            const soundScale = (1 - sizeDifferenceFromMaxSize / maxDiff) * 0.3 + 0.7;
            audioManager.playSound("burst", soundScale);
        } else if (this.explosionRing) {
            // 爆炸环烟花的特殊音效
            audioManager.playSound("burst", 0.8);
        }
    }
}

const BurstFlash = {
    activeFlashes: [],
    _pool: [],

    _new() {
        return {};
    },

    add(x, y, radius) {
        const instance = this._pool.pop() || this._new();
        instance.x = x;
        instance.y = y;
        instance.radius = radius;
        this.activeFlashes.push(instance);
        return instance;
    },

    returnInstance(instance) {
        this._pool.push(instance);
    },
};

function createParticleCollection() {
    const collection = {};
    COLOR_CODES_WITH_INVISIBLE.forEach((color) => {
        collection[color] = [];
    });
    return collection;
}

const Star = {
    airDrag: 0.98,
    heavyAirDrag: 0.992,

    activeParticles: createParticleCollection(),
    _pool: [],

    _new() {
        return {};
    },

    add(x, y, color, angle, speed, life, speedOffX, speedOffY, size = 3) {
        const instance = this._pool.pop() || this._new();
        instance.visible = true;
        instance.heavy = false;
        instance.x = x;
        instance.y = y;
        instance.prevX = x;
        instance.prevY = y;
        instance.color = color;
        instance.speedX = Math.sin(angle) * speed + (speedOffX || 0);
        instance.speedY = Math.cos(angle) * speed + (speedOffY || 0);
        instance.life = life;
        instance.fullLife = life;
        instance.size = size;
        instance.spinAngle = Math.random() * PI_2;
        instance.spinSpeed = 0.8;
        instance.spinRadius = 0;
        instance.sparkFreq = 0;
        instance.sparkSpeed = 1;
        instance.sparkTimer = 0;
        instance.sparkColor = color;
        instance.sparkLife = 750;
        instance.sparkLifeVariation = 0.25;
        instance.strobe = false;

        this.activeParticles[color].push(instance);
        return instance;
    },

    returnInstance(instance) {
        instance.onDeath && instance.onDeath(instance);
        instance.onDeath = null;
        instance.secondColor = null;
        instance.transitionTime = 0;
        instance.colorChanged = false;
        this._pool.push(instance);
    },
};

const Spark = {
    drawWidth: 0,
    airDrag: 0.9,

    activeParticles: createParticleCollection(),
    _pool: [],

    _new() {
        return {};
    },

    add(x, y, color, angle, speed, life) {
        const instance = this._pool.pop() || this._new();
        instance.x = x;
        instance.y = y;
        instance.prevX = x;
        instance.prevY = y;
        instance.color = color;
        instance.speedX = Math.sin(angle) * speed;
        instance.speedY = Math.cos(angle) * speed;
        instance.life = life;
        this.activeParticles[color].push(instance);
        return instance;
    },

    returnInstance(instance) {
        this._pool.push(instance);
    },
};

const audioManager = {
    baseURL: "./audio/",
    audioContext: new (window.AudioContext || window.webkitAudioContext)(),
    soundSources: {
        lift: {
            volume: 1,
            playbackRateMin: 0.85,
            playbackRateMax: 0.95,
            fileNames: ["lift1.mp3", "lift2.mp3", "lift3.mp3"],
        },
        burst: {
            volume: 1,
            playbackRateMin: 0.8,
            playbackRateMax: 0.9,
            fileNames: ["burst1.mp3", "burst2.mp3"],
        },
        burstSmall: {
            volume: 0.25,
            playbackRateMin: 0.8,
            playbackRateMax: 1,
            fileNames: ["burst-sm-1.mp3", "burst-sm-2.mp3"],
        },
        crackle: {
            volume: 0.2,
            playbackRateMin: 1,
            playbackRateMax: 1,
            fileNames: ["crackle1.mp3"],
        },
        crackleSmall: {
            volume: 0.3,
            playbackRateMin: 1,
            playbackRateMax: 1,
            fileNames: ["crackle-sm-1.mp3"],
        },
    },

    preload() {
        const allFilePromises = [];

        function checkStatus(response) {
            if (response.status >= 200 && response.status < 300) {
                return response;
            }
            const customError = new Error(response.statusText);
            customError.response = response;
            throw customError;
        }

        const types = Object.keys(this.soundSources);
        types.forEach((type) => {
            const source = this.soundSources[type];
            const { fileNames } = source;
            const filePromises = [];
            fileNames.forEach((fileName) => {
                const fileURL = this.baseURL + fileName;
                const promise = fetch(fileURL)
                    .then(checkStatus)
                    .then((response) => response.arrayBuffer())
                    .then(
                        (data) =>
                            new Promise((resolve) => {
                                this.audioContext.decodeAudioData(data, resolve);
                            })
                    );
                filePromises.push(promise);
                allFilePromises.push(promise);
            });

            Promise.all(filePromises).then((buffers) => {
                source.buffers = buffers;
            });
        });

        return Promise.all(allFilePromises);
    },

    pauseAll() {
        this.audioContext.suspend();
    },

    resumeAll() {
        this.playSound("lift", 0);
        setTimeout(() => {
            this.audioContext.resume();
        }, 250);
    },

    _lastSmallBurstTime: 0,

    playSound(type, scale = 1) {
        scale = MathUtilities.clamp(scale, 0, 1);

        if (!canPlaySound() || simulationSpeed < 0.95) {
            return;
        }

        if (type === "burstSmall") {
            const now = Date.now();
            if (now - this._lastSmallBurstTime < 20) {
                return;
            }
            this._lastSmallBurstTime = now;
        }

        const source = this.soundSources[type];
        if (!source) {
            throw new Error(`Sound of type "${type}" doesn't exist.`);
        }

        const initialVolume = source.volume;
        const initialPlaybackRate = MathUtilities.randomInRange(source.playbackRateMin, source.playbackRateMax);
        const scaledVolume = initialVolume * scale;
        const scaledPlaybackRate = initialPlaybackRate * (2 - scale);

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = scaledVolume;
        
        const buffer = MathUtilities.randomChoice(source.buffers);
        const bufferSource = this.audioContext.createBufferSource();
        bufferSource.playbackRate.value = scaledPlaybackRate;
        bufferSource.buffer = buffer;
        bufferSource.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        bufferSource.start(0);
    },
};

function setLoadingStatus(status) {
    document.querySelector(".loading-init__status").textContent = status;
}

if (IS_HEADER) {
    initializeApplication();
} else {
    setLoadingStatus("正在点燃导火线");
    setTimeout(() => {
        const promises = [audioManager.preload()];
        Promise.all(promises).then(initializeApplication, (reason) => {
            initializeApplication();
            return Promise.reject(reason);
        });
    }, 0);
}