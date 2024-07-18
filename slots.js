document.addEventListener('DOMContentLoaded', (event) => {

    let slotSymbols = [//this is replaced with google sheets 
        ["XDo", "Will", "Should", "Can", "Do", "Will", "Should", "Can", "Do", "Will", "Should", "Can", "Do", "Will", "Should"],
        ["Xhumans", "animals", "AIs", "computers", "humans", "animals", "AIs", "computers", "humans", "animals", "AIs", "computers", "humans", "animals", "AIs"],
        ["Xunderstand", "use", "try", "learn", "teach", "know", "understand", "use", "try", "learn", "teach", "know", "understand", "use", "try", "learn", "teach"],
        ["Xthinking?", "ethics?", "love?", "emotions?", "thinking?", "ethics?", "love?", "emotions?", "thinking?", "ethics?", "love?",]
    ];


    function createSymbolElement(symbol) {
        const div = document.createElement('div');
        div.classList.add('symbol');
        div.textContent = symbol;
        return div;
    }
    const slots = document.querySelectorAll('.slot');

    async function fetchData() {
        const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX3YJRw_jV9eUmVWI8WE21ehl8F3GbeeNTD6p3DeGdsnss7K4VWq6M_Ym32HN368v2I6zYkGbn7e-K/pub?output=csv';

        try {
            const response = await fetch(csvUrl);
            const data = await response.text();
            // Parse the CSV data into an array
            const parsedData = Papa.parse(data, { skipEmptyLines: true }).data;
            // Remove the header row
            const dataWithoutHeader = parsedData.slice(1);

            // Transpose the data so each array corresponds to a column
            const transposedData = dataWithoutHeader[0].map((_, colIndex) => dataWithoutHeader.map(row => row[colIndex]));
            const dataWithoutBlanks = transposedData.map(row => row.filter(cell => cell && cell.trim()));

            // Filter out any blank rows
            const filteredData = dataWithoutBlanks.filter(row => row.length > 0);

            //replace spaces with nbsp
            filteredData.forEach((column, index) => {
                column.forEach((cell, cellIndex) => {
                    column[cellIndex] = cell.replace(/ /g, '\u00A0');
                });
            });
            console.log("data cleaned:", filteredData);
            slotSymbols = filteredData;
            generate();
        } catch (error) {
            console.error('Error with google sheets:', error);
        }
    }

    // Call the fetchData function when the page loads
    window.onload = fetchData;


    function generate() {
        slots.forEach((slot, index) => {
            const symbols = slot.querySelector('.symbols');
            symbols.innerHTML = '';

            // Append three copies of the symbols
            for (let i = 0; i < 3; i++) {
                slotSymbols[index].forEach(symbol => {
                    symbols.appendChild(createSymbolElement(symbol));
                });
            }
            // symbols.style.transitionDelay = `${transitionDelay * index}ms`;
        });
        // console.log("3x:", slotSymbols);

    }

    function spin() {
        return new Promise(resolve => {
            let completedSlots = 0;

            slots.forEach((slot, index) => {
                const symbols = slot.querySelector('.symbols');
                const symbolHeight = symbols.querySelector('.symbol')?.clientHeight;
                const symbolCount = symbols.childElementCount;

                const extraSpins = (Math.floor(Math.random() * 10)); // Generate a random number of extra spins
                // const totalDistance = (symbolCount / 3 + extraSpins) * symbolHeight; // Divide the symbolCount by 3
                const randomOffset = -((symbolCount / 3 - 3) + extraSpins) * symbolHeight; // Divide the symbolCount by 3
                symbols.style.top = `${randomOffset}px`;

                symbols.addEventListener('transitionend', () => {
                    completedSlots++;
                    if (completedSlots === slots.length) {
                        // logDisplayedSymbols();
                        spun = true;
                        resolve();
                    }
                }, { once: true });
            });
        });
    }

    const leverContainer = document.querySelector('.levercontainer');
    function spinAndRotate() {
        leverContainer.style.transform = 'rotate(180deg)';
        spin();
    }

    function resetRotation() {
        leverContainer.style.transform = '';
    }

    document.addEventListener('mousedown', spinAndRotate);
    document.addEventListener('mouseup', resetRotation);
    document.addEventListener('touchstart', spinAndRotate);
    document.addEventListener('touchend', resetRotation);

    document.addEventListener('keydown', function (event) {
        if (event.code === 'Space') {
            spinAndRotate();
        }
    });
    document.addEventListener('keyup', function (event) {
        if (event.code === 'Space') {
            resetRotation();
        }
    });
});

document.body.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, { passive: false });