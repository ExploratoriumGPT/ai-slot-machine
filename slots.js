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

            // Append 100 copies of the symbols
            for (let i = 0; i < 100; i++) {
                slotSymbols[index].forEach(symbol => {
                    symbols.appendChild(createSymbolElement(symbol));
                });
            }
        });

    }

    let wheelPositions = [250, 250, 250, 250];

    function spin() {
        return new Promise(resolve => {
            let completedSlots = 0;

            slots.forEach((slot, index) => {
                const symbols = slot.querySelector('.symbols');
                const symbolHeight = symbols.querySelector('.symbol')?.clientHeight;
                const symbolCount = symbols.childElementCount;

                // go in random direction by between 10 and 20
                var newPosition = Math.floor(Math.random() * 10) + 10;
                if (Math.random() > 0.5) {
                    newPosition = -1 * newPosition;
                }
                // if random direction would put us off the edge, course correct manually
                if (wheelPositions[index] + newPosition < 0) {
                    newPosition = 200;
                } else if (wheelPositions[index] + newPosition > 500) {
                    newPosition = -200;
                }
                wheelPositions[index] = wheelPositions[index] + newPosition;
                const randomOffset = -wheelPositions[index] * symbolHeight;
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
        console.log("spin");
        spin();
    }

    document.addEventListener('mousedown', spinAndRotate);
    document.addEventListener('touchstart', spinAndRotate);

    document.addEventListener('keydown', function (event) {
        if (event.code === 'Space') {
            spinAndRotate();
        }
    });
});

// document.body.addEventListener('touchmove', function (e) {
//     e.preventDefault();
// }, { passive: false });
