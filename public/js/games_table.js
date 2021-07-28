const _MS_PER_DAY = 1000 * 60 * 60 * 24;

// a and b are javascript Date objects
function dateDiffInDays(a, b) {
    try {
        // Discard the time and time-zone information.
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.abs(Math.floor((utc2 - utc1) / _MS_PER_DAY));

    } catch (e) {
        return "?"
    }
}

function formatDate(d) {
    try {
        return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    } catch (e) {
        return d
    }
}

function generateGamesTable(tableQuery) {
    // Generate games table
    fetch('/game', { method: 'GET'})
        .then(res => res.json())
        .then(games => {
            let table = document.querySelector(tableQuery);

            if (table.length) table = table[0];

            const tableHeaders = ['Game', 'Players', 'State']

            const tableRows = games.map(game => {
                const gameLink = document.createElement("a");
                gameLink.href = "/play?game=" + game._id
                gameLink.innerHTML = game.name;

                return [
                    gameLink,
                    game.players.length,
                    game.hasStarted ? 'Day ' + dateDiffInDays(new Date(), new Date(game.startedAt)) : 'Lobby'
                ];
            });

            createTable(table, tableHeaders, tableRows)
        })
}

function generateAdminTable(tableQuery) {
    // Generate games table
    fetch('/game/all', { method: 'GET'})
        .then(res => res.json())
        .then(games => {
            let table = document.querySelector(tableQuery);

            const tableHeaders = ['Game', 'Players', 'State', 'Creator ID', 'Created', 'Updated', 'Remove']

            const tableRows = games.map(game => {
                const gameLink = document.createElement("a");
                gameLink.href = "/play?game=" + game._id
                gameLink.innerHTML = game.name;

                const row = [
                    gameLink,
                    game.players ? game.players.length : "?",
                    game.hasStarted ? 'Day ' + dateDiffInDays(new Date(), new Date(game.startedAt)) : 'Lobby',
                    game.creator_id,
                    formatDate(new Date(game.createdAt)),
                    formatDate(new Date(game.updatedAt)),
                ]

                const deleteButton = document.createElement("button")
                deleteButton.innerHTML = "Delete"

                deleteButton.onclick = function(e) {
                    fetch('/game/' + game._id, { method: 'DELETE'} ).then(res => {
                        console.log(res)
                        location.reload()
                    }).catch(err => console.log(err))
                }

                row.push(deleteButton)

                return row;
            });

            createTable(table, tableHeaders, tableRows)
        })
}


function createTable(container, headers, rows) {
    const table = document.createElement("table")

    const tableRow = document.createElement("tr")

    for (let i = 0; i < headers.length; i++) {
        const tableHeader = document.createElement("th")
        tableHeader.innerHTML = headers[i]
        tableRow.appendChild(tableHeader)
    }

    table.appendChild(tableRow)

    for (let i = 0; i < rows.length; i++) {

        const tableRow = document.createElement("tr")

        for (let j = 0; j < headers.length; j++) {
            const tableElement = document.createElement("td");
            if (rows[i][j] instanceof HTMLElement) {
                tableElement.appendChild(rows[i][j])
            } else {
                tableElement.innerHTML = rows[i][j]
            }

            tableRow.appendChild(tableElement)
        }

        table.appendChild(tableRow)
    }

    container.appendChild(table)
}