const keys = Object.freeze({
    left: 'ArrowLeft',
    up: 'ArrowUp',
    right: 'ArrowRight',
    down: 'ArrowDown'

});
const gameFigures = Object.freeze({
    Stick: {
        initialIndexes: [4, 14, 24, 34],
        class: 'stick'
    },
    L: {
        initialIndexes: [4, 14, 24, 25],
        class: 'l'
    },
    L2: {
        initialIndexes: [4, 14, 24, 23],
        class: 'l2'
    },
    S: {
        initialIndexes: [4, 14, 5, 13],
        class: 's'
    },
    S2: {
        initialIndexes: [4, 14, 3, 15],
        class: 's2'
    },
    Square: {
        initialIndexes: [4, 5, 14, 15],
        class: 'square'
    },
    Pyramid: {
        initialIndexes: [15, 14, 13, 4],
        class: 'pyramid'
    },
});
const placedCellClassName = 'placed';
const completedCellClassName = 'completed'
const figureKeys = Object.keys(gameFigures);
const getFigure = () => {
    const figureKey = figureKeys[Math.floor(Math.random() * 7)];
    const figure = { ...gameFigures[figureKey] };
    figure.currentIndexes = [...figure.initialIndexes];
    return figure;
}

const cooldownMs = 300;
let lastExecution = Date.now();
let keyDownBlocked = false;
const addKeyEventListener = () => {
    window.addEventListener('keydown', (e) => {
        if (Date.now() - lastExecution < cooldownMs || keyDownBlocked)
            return;
        keyDownBlocked = true;
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
                moveFigureDownOrPlaceIt();
                break;
        }
        keyDownBlocked = false;
    })
}

const rotateFigure = () => {

    if (window.currentFigure.placed || window.currentFigure.class === 'square')
        return;

    window.currentFigure.currentIndexes.forEach(index => {
        window.cells[index].classList.value = 'game-cell';
    });
    let rotationOrigin = window.currentFigure.currentIndexes[1];
    const modulesOfCurrentIndexes = window.currentFigure.currentIndexes.map(index => index % 10);
    const extremeModules = modulesOfCurrentIndexes.filter(item => item == 9 || item == 0)
        .filter((v, i, s) => i === s.indexOf(v));
    if (extremeModules.length === 1) {
        let sanitizedCurrentIndexes = window.currentFigure.currentIndexes;
        if (extremeModules[0] === 0) {

            //TODO: IDENTIFY EACH PIECE AND TREAT IT SEPARATELY
            if (window.currentFigure.currentIndexes.indexOf(rotationOrigin - 20) + 1) {
                sanitizedCurrentIndexes = window.currentFigure.currentIndexes.map(index => index + 2);
            } else if (window.currentFigure.currentIndexes.indexOf(rotationOrigin - 10) + 1) {
                sanitizedCurrentIndexes = window.currentFigure.currentIndexes.map(index => index + 1);
            } 
        } else {
            if (window.currentFigure.currentIndexes.indexOf(rotationOrigin - 20) + 1) {
                sanitizedCurrentIndexes = window.currentFigure.currentIndexes.map(index => index - 2);
            } else if (window.currentFigure.currentIndexes.indexOf(rotationOrigin + 20) + 1) {
                sanitizedCurrentIndexes = window.currentFigure.currentIndexes.map(index => index - 2);
            } else if (window.currentFigure.currentIndexes.indexOf(rotationOrigin + 10) + 1) {
                sanitizedCurrentIndexes = window.currentFigure.currentIndexes.map(index => index - 1);
            }

        }


        if (sanitizedCurrentIndexes.filter(index => index > 199).length ||
            sanitizedCurrentIndexes.filter(index => window.cells[index].classList.contains(placedCellClassName)).length)
            return;



        rotationOrigin = window.currentFigure.currentIndexes[1];

    }
    let newIndexes = [getRotatedIndex(window.currentFigure.currentIndexes[0], rotationOrigin),
        rotationOrigin,
    getRotatedIndex(window.currentFigure.currentIndexes[2], rotationOrigin),
    getRotatedIndex(window.currentFigure.currentIndexes[3], rotationOrigin)];

    if (newIndexes.filter(index => index > 199).length)
        return;

    window.currentFigure.currentIndexes = newIndexes;
    window.currentFigure.currentIndexes.forEach(index => {
        window.cells[index].classList.add(window.currentFigure.class);
    });
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
    window.cells ||= [...document.querySelectorAll('.game-cell')];
    populateNextFigureOrGameOver();
    window.rowsToCompleteInitialIndexes = [];
    window.score = 0;
    addKeyEventListener();
};

const moveFigureDown = () => {
    const nextFilledCellsIndexes = window.currentFigure.currentIndexes.map(index => index + 10);
    window.currentFigure.currentIndexes.forEach(index => window.cells[index].classList.remove(window.currentFigure.class))
    nextFilledCellsIndexes.forEach(index => {
        const cellClassList = window.cells[index].classList;
        cellClassList.contains(window.currentFigure.class) ? undefined : cellClassList.add(window.currentFigure.class);
    });
    window.currentFigure.currentIndexes = nextFilledCellsIndexes;
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
}
const placeFigureAndHandlePossibleLineCompleted = () => {
    window.currentFigure.placed = true;
    window.currentFigure.currentIndexes.forEach(index => window.cells[index].classList.add(placedCellClassName));

    window.currentFigure.currentIndexes.forEach(index => {
        const currentRowFirstCellIndex = Math.floor(index / 10) * 10;
        for (var i = 0; i < 10; i++) {
            if (!window.cells[currentRowFirstCellIndex + i].classList.contains(placedCellClassName))
                return;
        }
        window.rowsToCompleteInitialIndexes.indexOf(currentRowFirstCellIndex) + 1 ? undefined : window.rowsToCompleteInitialIndexes.push(currentRowFirstCellIndex);
    });

    if (!window.rowsToCompleteInitialIndexes.length) {
        keyDownBlocked = false;
        return;
    }

    const sortedRowToCompleteInitialIndexes = window.rowsToCompleteInitialIndexes.sort((x, y) => x - y);
    for (var i = 0; i < 10; i++)
        window.cells[i].classList.value = 'game-cell';

    sortedRowToCompleteInitialIndexes.forEach((rowIndex, index) => {
        for (var indexOfRowToBeMovedDown = rowIndex;
            indexOfRowToBeMovedDown > 0;
            indexOfRowToBeMovedDown--) {

            window.cells[indexOfRowToBeMovedDown + 9].classList.value = window.cells[indexOfRowToBeMovedDown - 1].classList;
        }

    })
    while (window.rowsToCompleteInitialIndexes.length) {
        window.rowsToCompleteInitialIndexes.splice(0)
    }

}
const gameOver = () => {

}

const populateNextFigureOrGameOver = () => {
    const nextFigure = getFigure();
    if (window.currentFigure?.currentIndexes.filter(index => nextFigure.initialIndexes.indexOf(index) + 1).length) {
        gameOver();
        return false;
    }
    window.currentFigure = nextFigure;
    window.currentFigureRowNumber = 0;
    window.needNextFigure = false;
    return true;
}
const moveFigureDownOrPlaceIt = () => {

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
    moveFigureDown();
}
const runGame = () => {
    const recurrentJobForGameId = setInterval(() => {
        if (window.needNextFigure && !populateNextFigureOrGameOver()) {
            window.clearInterval(recurrentJobForGameId);
            return;
        } else {
            moveFigureDownOrPlaceIt();
        }
    }, 1000);
}
console.log('all defined')
window.onload = () => {
    initialize();
    runGame();
    console.log('ran')
};