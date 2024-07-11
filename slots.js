document.addEventListener('DOMContentLoaded', (event) => {

    let slotSymbols = [//this is replaced with google sheets 
        ["Do", "Will", "Should", "Can", "Do", "Will", "Should", "Can", "Do", "Will", "Should", "Can", "Do", "Will", "Should"],
        ["humans", "animals", "AIs", "computers", "humans", "animals", "AIs", "computers", "humans", "animals", "AIs", "computers", "humans", "animals", "AIs"],
        ["understand", "use", "try", "learn", "teach", "know", "understand", "use", "try", "learn", "teach", "know", "understand", "use", "try", "learn", "teach"],
        ["thinking?", "ethics?", "love?", "emotions?", "thinking?", "ethics?", "love?", "emotions?", "thinking?", "ethics?", "love?",]
    ];

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createSymbolElement(symbol) {
        const div = document.createElement('div');
        div.classList.add('symbol');
        div.textContent = symbol;
        return div;
    }

    let spun = false;
    const slots = document.querySelectorAll('.slot');

    const transitionDelay = 150;


    async function fetchData() {
        const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTX3YJRw_jV9eUmVWI8WE21ehl8F3GbeeNTD6p3DeGdsnss7K4VWq6M_Ym32HN368v2I6zYkGbn7e-K/pub?output=csv';

        try {
            const response = await fetch(csvUrl);
            const data = await response.text();

            // Parse the CSV data into an array
            const parsedData = Papa.parse(data, { skipEmptyLines: true }).data;

            // Filter out the header row and any blank rows
            const filteredData = parsedData.slice(1).filter(row => row.every(cell => cell));

            // Transpose the data so each array corresponds to a column
            const transposedData = filteredData[0].map((_, colIndex) => filteredData.map(row => row[colIndex]));
            //make each array repeat twice to make the slot machine effect
            transposedData.forEach((column, index) => {
                transposedData[index] = column.concat(column);
            });
            // Assign the transposed data to slotSymbols
            slotSymbols = transposedData;
            console.log(slotSymbols);

            // Call the rest of your code here, or trigger an event to signal that the data is ready
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

            // Append a copy of the symbols at the beginning
            slotSymbols[index].forEach(symbol => {
                symbols.appendChild(createSymbolElement(symbol));
            });

            // Append the original symbols
            slotSymbols[index].forEach(symbol => {
                symbols.appendChild(createSymbolElement(symbol));
            });

            // Append a copy of the symbols at the end
            slotSymbols[index].forEach(symbol => {
                symbols.appendChild(createSymbolElement(symbol));
            });

            symbols.style.transitionDelay = `${transitionDelay * index}ms`;
        });
    }
    function spin() {
        return new Promise(resolve => {
            if (spun) {
                reset();
            }
            let completedSlots = 0;

            slots.forEach((slot, index) => {
                const symbols = slot.querySelector('.symbols');
                const symbolHeight = symbols.querySelector('.symbol')?.clientHeight;
                const symbolCount = symbols.childElementCount;

                const extraSpins = Math.floor(Math.random() * 10); // Generate a random number of extra spins
                const totalDistance = (symbolCount / 3 + extraSpins) * symbolHeight; // Divide the symbolCount by 3
                const randomOffset = -((symbolCount / 3 - 3) + extraSpins) * symbolHeight; // Divide the symbolCount by 3
                symbols.style.top = `${randomOffset}px`;

                symbols.addEventListener('transitionend', () => {
                    completedSlots++;
                    if (completedSlots === slots.length) {
                        logDisplayedSymbols();
                        spun = true;
                        resolve();
                    }
                }, { once: true });
            });
        });
    }

    const spinAmountInput = document.querySelector('.spinAmount');

    async function autoSpin() {
        let spinAmount = spinAmountInput.value;
        if (spinAmount) {
            spinAmountInput.style.border = 'none';
            for (let i = 0; i < spinAmount; i++) {
                await spin();
                await new Promise(resolve => setTimeout(resolve, transitionDelay * slots.length)); // Wait for a delay before starting the next spin
            }
        } else {
            spinAmountInput.style.border = '2px solid red';
        }
    }

    function reset() {
        const slots = document.querySelectorAll('.slot');

        slots.forEach(slot => {
            const symbols = slot.querySelector('.symbols');
            symbols.style.transition = 'none';
            symbols.style.top = '0';
            symbols.offsetHeight;
            symbols.style.transition = '';
        });

        generate();
    }

    function logDisplayedSymbols() {
        const slots = document.querySelectorAll('.slot');
        const displayedSymbols = [[], [], []];

        slots.forEach((slot) => {
            const symbols = slot.querySelector('.symbols');
            const symbolArray = Array.from(symbols.textContent);
            displayedSymbols[0].push(symbolArray[symbolArray.length - 3]);
            displayedSymbols[1].push(symbolArray[symbolArray.length - 2]);
            displayedSymbols[2].push(symbolArray[symbolArray.length - 1]);
        });

        displayedSymbols.forEach((symbols, index) => {
            console.log(`Displayed symbols(row ${index + 1}): ${symbols}`);
        });
    }



    generate();
    const leverContainer = document.querySelector('.levercontainer');

    leverContainer.addEventListener('mousedown', function () {
        leverContainer.style.transform = 'rotate(180deg)';
        spin();
    });

    leverContainer.addEventListener('mouseup', function () {
        leverContainer.style.transform = '';
    });
});