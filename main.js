const keys = Object.freeze({
    left: 'ArrowLeft',
    up: 'ArrowUp',
    right: 'ArrowRight',
    down: 'ArrowDown',
    enter: 'Enter'

});
const audios = Object.freeze({
    rotateFigure: new Audio('./assets/rotate-figure.mp3'),
    placeFigure: new Audio('./assets/placed-figure.mp3'),
    linesCompleted: new Audio('./assets/lines-completed.mp3'),
})
const getStickSanitizedCurrentIndexes = ({ module, rotationOrigin }) => {
    let result = window.currentFigure.currentIndexes;
    if (module === 9) {
        if (result.includes(rotationOrigin - 20))
            result = result.map(index => index - 2)
        else if (result.includes(rotationOrigin + 20))
            result = result.map(index => index - 1)
    } else if (module === 0) {
        if (result.includes(rotationOrigin + 20))
            result = result.map(index => index + 2)
        else if (result.includes(rotationOrigin - 20))
            result = result.map(index => index + 1)
    }
    return result;
}
const getPyramidSanitizedCurrentIndexes = ({ module, rotationOrigin }) => {
    let result = window.currentFigure.currentIndexes;
    if (module === 9) {
        if (result.includes(rotationOrigin + 10) && rotationOrigin % 10 === 9)
            result = result.map(index => index - 1)
    } else if (module === 0) {
        if (result.includes(rotationOrigin + 10) && rotationOrigin % 10 === 0)
            result = result.map(index => index + 1)
    }
    return result;
}
const getSSanitizedCurrentIndexes = ({ module, rotationOrigin }) => {
    let result = window.currentFigure.currentIndexes;
    if (module === 9) {
        if (result.includes(rotationOrigin + 10) && rotationOrigin % 10 === 9)
            result = result.map(index => index - 1)
    } else if (module === 0) {
        if (result.includes(rotationOrigin - 10) && rotationOrigin % 10 === 0)
            result = result.map(index => index + 1)
    }
    return result;
}
const getS2SanitizedCurrentIndexes = ({ module, rotationOrigin }) => {
    let result = window.currentFigure.currentIndexes;
    if (module === 9) {
        if (result.includes(rotationOrigin - 10) && rotationOrigin % 10 === 9)
            result = result.map(index => index - 1)
    } else if (module === 0) {
        if (result.includes(rotationOrigin + 10) && rotationOrigin % 10 === 0)
            result = result.map(index => index + 1)
    }
    return result;
}
const getLSanitizedCurrentIndexes = ({ rotationOrigin }) => {
    let result = window.currentFigure.currentIndexes;
    if (rotationOrigin % 10 === 9) {
        result = result.map(index => index - 1)
    } else if (rotationOrigin % 10 === 0) {
        result = result.map(index => index + 1)
    }
    return result;
}
const getL2SanitizedCurrentIndexes = ({ rotationOrigin }) => {
    let result = window.currentFigure.currentIndexes;
    if (rotationOrigin % 10 === 9) {
        result = result.map(index => index - 1)
    } else if (rotationOrigin % 10 === 0) {
        result = result.map(index => index + 1)
    }
    return result;
}
const gameFigures = Object.freeze({
    Stick: {
        initialIndexes: [4, 14, 24, 34],
        class: 'stick',
        sanitizeIndexesForRotation: getStickSanitizedCurrentIndexes
    },
    L: {
        initialIndexes: [4, 14, 24, 25],
        class: 'l',
        sanitizeIndexesForRotation: getLSanitizedCurrentIndexes
    },
    L2: {
        initialIndexes: [4, 14, 24, 23],
        class: 'l2',
        sanitizeIndexesForRotation: getL2SanitizedCurrentIndexes
    },
    S: {
        initialIndexes: [4, 14, 5, 13],
        class: 's',
        sanitizeIndexesForRotation: getSSanitizedCurrentIndexes
    },
    S2: {
        initialIndexes: [4, 14, 3, 15],
        class: 's2',
        sanitizeIndexesForRotation: getS2SanitizedCurrentIndexes
    },
    Square: {
        initialIndexes: [4, 5, 14, 15],
        class: 'square',
    },
    Pyramid: {
        initialIndexes: [15, 14, 13, 4],
        class: 'pyramid',
        sanitizeIndexesForRotation: getPyramidSanitizedCurrentIndexes
    },
});
var score = 0;
const scoreBreakPoints = [50, 100, 150, 250, 350, 400, 550, 700, 850];
var currentLevel = 1;
const placedCellClassName = 'placed';
const completedCellClassName = 'completed'
const figureKeys = Object.keys(gameFigures);
const getFigure = () => {
    const figureKey = figureKeys[Math.floor(Math.random() * 7)];
    const figure = { ...gameFigures[figureKey] };
    figure.currentIndexes = [...figure.initialIndexes];
    return figure;
}
const populateScore = () => {
    window.scoreContainer ||= document.querySelector('.score');
    window.scoreContainer.innerHTML = `Score ${score}`
}

const populateLevel = () => {
    window.levelContainer ||= document.querySelector('.level');
    window.levelContainer.innerHTML = `Level ${currentLevel}`
}
const updateStats = () => {
    populateScore();
    if (score >= scoreBreakPoints[currentLevel - 1]) {
        currentLevel++;
        populateLevel();
    }
}
const addKeyEventListener = () => {
    window.addEventListener('keydown', (e) => {

        switch (e.key) {
            case keys.up:
                rotateFigure();
                break;
            case keys.left:
                moveFigureLeft();
                break;
            case keys.right:
                moveFigureRight();
                break;
            case keys.down:
                moveFigureDownOrPlaceIt(true);
                break;
            case keys.enter:
                startGame();
                break;
        }

    })
}

const rotateFigure = () => {

    if (window.currentFigure.placed || window.currentFigure.class === 'square')
        return;

    let currentIndexesCopy = [...window.currentFigure.currentIndexes];
    window.currentFigure.currentIndexes.forEach(index => {
        window.cells[index].classList.value = 'game-cell';
    });
    let rotationOrigin = window.currentFigure.currentIndexes[1];
    const modulesOfCurrentIndexes = window.currentFigure.currentIndexes.map(index => index % 10);
    const extremeModules = modulesOfCurrentIndexes.filter(item => item == 9 || item == 0)
        .filter((v, i, s) => i === s.indexOf(v));
    if (extremeModules.length === 1) {
        let sanitizedCurrentIndexes = window.currentFigure.currentIndexes;

        sanitizedCurrentIndexes = window.currentFigure.sanitizeIndexesForRotation({ module: extremeModules[0], rotationOrigin })

        if (sanitizedCurrentIndexes.filter(index => index > 199 || window.cells[index].classList.contains(placedCellClassName)).length)
            return;

        rotationOrigin = sanitizedCurrentIndexes[1];
        window.currentFigure.currentIndexes = sanitizedCurrentIndexes;

    }
    let newIndexes = [
        getRotatedIndex(window.currentFigure.currentIndexes[0], rotationOrigin),
        rotationOrigin,
        getRotatedIndex(window.currentFigure.currentIndexes[2], rotationOrigin),
        getRotatedIndex(window.currentFigure.currentIndexes[3], rotationOrigin)
    ];

    if (newIndexes.filter(index => index > 199 || window.cells[index].classList.contains(placedCellClassName)).length) {
        currentIndexesCopy.forEach(index => {
            window.cells[index].classList.add(window.currentFigure.class);
        });
        return;
    }

    window.currentFigure.currentIndexes = newIndexes;
    window.currentFigure.currentIndexes.forEach(index => {
        window.cells[index].classList.add(window.currentFigure.class);
    });
    audios.rotateFigure.pause();
    audios.rotateFigure.currentTime = 0;
    audios.rotateFigure.play();
}

const getRotatedIndex = (indexToRotate, originIndex) => {
    const firstRowIndexOfOrigin = Math.floor(originIndex / 10) * 10;
    if (indexToRotate >= firstRowIndexOfOrigin && indexToRotate < firstRowIndexOfOrigin + 10) {

        return originIndex - (originIndex - indexToRotate) * 10;

    }

    const upFromOriginIndex = originIndex - 10;
    const previousRowIndexOfOrigin = firstRowIndexOfOrigin - 10;
    if (indexToRotate >= previousRowIndexOfOrigin && indexToRotate < previousRowIndexOfOrigin + 10) {

        return originIndex - 10 * (upFromOriginIndex - indexToRotate) + 1;
    }

    const upFromUpOriginIndex = originIndex - 20;
    const previousUpRowIndexOfOrigin = firstRowIndexOfOrigin - 20;
    if (indexToRotate >= previousUpRowIndexOfOrigin && indexToRotate < previousUpRowIndexOfOrigin + 10) {

        return originIndex - 10 * (upFromUpOriginIndex - indexToRotate) + 2;
    }

    const downFromOriginIndex = originIndex + 10;
    const nextRowIndexOfOrigin = firstRowIndexOfOrigin + 10;
    if (indexToRotate >= nextRowIndexOfOrigin && indexToRotate < nextRowIndexOfOrigin + 10) {

        return originIndex - 10 * (downFromOriginIndex - indexToRotate) - 1;
    }

    const downFromDownOriginIndex = originIndex + 20;
    const nextDownRowIndexOfOrigin = firstRowIndexOfOrigin + 20;
    if (indexToRotate >= nextDownRowIndexOfOrigin && indexToRotate < nextDownRowIndexOfOrigin + 10) {

        return originIndex - 10 * (downFromDownOriginIndex - indexToRotate) - 2;
    }
}

const initialize = () => {
    gameStarted = true;
    const startOverlayClassList = document.querySelector('.start-game-overlay').classList;
    startOverlayClassList.contains('hidden') ? undefined : startOverlayClassList.add('hidden');
    const endOverlayClassList = document.querySelector('.end-game-overlay').classList;
    !endOverlayClassList.contains('hidden') ? endOverlayClassList.add('hidden') : undefined;
    window.cells?.forEach(cell => cell.classList.value = 'game-cell')
    score = 0;
    currentLevel = 1;
    populateScore();
    populateLevel();
    window.cells ||= [...document.querySelectorAll('.game-cell')];
    populateNextFigureOrGameOver();
    window.rowsToCompleteInitialIndexes = [];
    audios.linesCompleted.volume = 0.3;
    audios.placeFigure.volume = 0.3;
    audios.rotateFigure.volume = 0.3;
};

const moveFigureDown = (manual = false) => {
    const nextFilledCellsIndexes = window.currentFigure.currentIndexes.map(index => index + 10);
    window.currentFigure.currentIndexes.forEach(index => window.cells[index].classList.remove(window.currentFigure.class))
    nextFilledCellsIndexes.forEach(index => {
        const cellClassList = window.cells[index].classList;
        cellClassList.contains(window.currentFigure.class) ? undefined : cellClassList.add(window.currentFigure.class);
    });
    window.currentFigure.currentIndexes = nextFilledCellsIndexes;
    
    if (manual) {
        audios.rotateFigure.pause();
        audios.rotateFigure.currentTime = 0;
        audios.rotateFigure.play();
    }
}
const moveFigureLeft = () => {

    if (window.currentFigure.placed)
        return;

    if (window.currentFigure.currentIndexes.filter(index => index % 10 === 0).length)
        return;

    if (window.currentFigure.currentIndexes.filter(index => window.cells[index - 1].classList.contains(placedCellClassName)).length)
        return;

    const nextFilledCellsIndexes = window.currentFigure.currentIndexes.map(index => index - 1);
    window.currentFigure.currentIndexes.forEach(index => window.cells[index].classList.remove(window.currentFigure.class))
    nextFilledCellsIndexes.forEach(index => {
        const cellClassList = window.cells[index].classList;
        cellClassList.contains(window.currentFigure.class) ? undefined : cellClassList.add(window.currentFigure.class);
    });
    window.currentFigure.currentIndexes = nextFilledCellsIndexes;
    
    audios.rotateFigure.pause();
    audios.rotateFigure.currentTime = 0;
    audios.rotateFigure.play();
}
const moveFigureRight = () => {

    if (window.currentFigure.placed)
        return;

    if (window.currentFigure.currentIndexes.filter(index => (index + 1) % 10 === 0).length)
        return;

    if (window.currentFigure.currentIndexes.filter(index => window.cells[index + 1].classList.contains(placedCellClassName)).length)
        return;


    const nextFilledCellsIndexes = window.currentFigure.currentIndexes.map(index => index + 1);
    window.currentFigure.currentIndexes.forEach(index => window.cells[index].classList.remove(window.currentFigure.class))
    nextFilledCellsIndexes.forEach(index => {
        const cellClassList = window.cells[index].classList;
        cellClassList.contains(window.currentFigure.class) ? undefined : cellClassList.add(window.currentFigure.class);
    });
    window.currentFigure.currentIndexes = nextFilledCellsIndexes;
    
    audios.rotateFigure.pause();
    audios.rotateFigure.currentTime = 0;
    audios.rotateFigure.play();
}

const placeFigureAndHandlePossibleLineCompleted = () => {
    window.currentFigure.placed = true;
    window.currentFigure.currentIndexes.forEach(index => window.cells[index].classList.add(placedCellClassName));
    audios.placeFigure.play();
    window.currentFigure.currentIndexes.forEach(index => {
        const currentRowFirstCellIndex = Math.floor(index / 10) * 10;
        for (var i = 0; i < 10; i++) {
            if (!window.cells[currentRowFirstCellIndex + i].classList.contains(placedCellClassName))
                return;
        }
        window.rowsToCompleteInitialIndexes.indexOf(currentRowFirstCellIndex) + 1 ? undefined : window.rowsToCompleteInitialIndexes.push(currentRowFirstCellIndex);
    });

    if (!window.rowsToCompleteInitialIndexes.length) {        
        score++;
        updateStats();
        return;
    }
    score += window.rowsToCompleteInitialIndexes.length * 10;
    updateStats();
    const sortedRowToCompleteInitialIndexes = window.rowsToCompleteInitialIndexes.sort((x, y) => x - y);

    sortedRowToCompleteInitialIndexes.forEach((rowIndex) => {
        for (var indexOfRowToBeMovedDown = rowIndex;
            indexOfRowToBeMovedDown > 0;
            indexOfRowToBeMovedDown--) {

            window.cells[indexOfRowToBeMovedDown + 9].classList.value = window.cells[indexOfRowToBeMovedDown - 1].classList.value;
        }

    })
    while (window.rowsToCompleteInitialIndexes.length) {
        window.rowsToCompleteInitialIndexes.splice(0)
    }
    audios.linesCompleted.play();
}
const gameOver = () => {
    document.querySelector('.end-game-overlay').classList.remove('hidden')
    gameStarted = false;
}
const populateNextFigureOrGameOver = () => {
    const nextFigure = getFigure();
    if (nextFigure.currentIndexes.filter(index => window.cells[index].classList.contains(placedCellClassName)).length) {
        gameOver();
        return false;
    }
    window.currentFigure = nextFigure;
    window.currentFigureRowNumber = 0;
    window.needNextFigure = false;
    return true;
}
const moveFigureDownOrPlaceIt = (manual = false) => {

    if (window.currentFigure.placed)
        return;

    if (
        window.currentFigure.currentIndexes
            .filter(index => index + 10 > 199).length
        || window.currentFigure.currentIndexes
            .filter(index => window.cells[index + 10].classList.contains(placedCellClassName)).length
    ) {

        placeFigureAndHandlePossibleLineCompleted();
        window.needNextFigure = true;
        return;
    }
    window.currentFigureRowNumber++;
    moveFigureDown(manual);
}
const runGame = async () => {
    while (gameStarted) {
        if (window.needNextFigure && !populateNextFigureOrGameOver()) {
            return;
        }
        moveFigureDownOrPlaceIt();

        await delay();
    }
}
const delay = () => new Promise(res => setTimeout(res, currentLevel === 1 ? 1000 : 1000 / (0.8*currentLevel)));
let gameStarted = false;
const startGame = () => {
    if (gameStarted)
        return;

    initialize();
    runGame();
};
addKeyEventListener();