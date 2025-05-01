function loadConfig() {
    const config = {
        numberOfCategories: numberOfCategories,
        includeLuckyLoser: includeLuckyLoser,
        quizLocation: quizLocation,
        quizBranding: quizBranding,
        quizHost: quizHost,
        maxScore: maxScore
    }
    console.table(config)

    document.getElementById('quiz-branding').textContent = quizBranding
    document.getElementById('quiz-host').textContent = `Prowadzący: ${quizHost}`

    if (!localStorage.getItem('quizLocation')) {
        localStorage.setItem('quizLocation', quizLocation)
    }
    window.quizLocation = localStorage.getItem('quizLocation') || quizLocation

    if (!localStorage.getItem('numberOfCategories')) {
        localStorage.setItem('numberOfCategories', numberOfCategories)
    }
    document.getElementById('quiz-location').textContent = window.quizLocation || 'Lokalizacja'

    if (typeof includeLuckyLoser === 'undefined') {
        includeLuckyLoser = false // default fallback
    }

    if (!localStorage.getItem('includeLuckyLoser')) {
        localStorage.setItem('includeLuckyLoser', includeLuckyLoser)
    }
    window.includeLuckyLoser = includeLuckyLoser

    window.quizDate = localStorage.getItem('quizDate') || new Date().toISOString().split('T')[0]
    localStorage.setItem('quizDate', window.quizDate)
    document.getElementById('dateInput').value = window.quizDate
    updateDate(window.quizDate)
}

window.quizData = JSON.parse(localStorage.getItem('quizData')) || []
window.luckyLoserTarget = parseInt(localStorage.getItem('luckyLoserTarget')) || 0
window.showLuckyLoserTarget = localStorage.getItem('showLuckyLoserTarget') === 'true'
window.quizLocation = localStorage.getItem('quizLocation') || ''


function calculateTotal(scores) {
    return scores.reduce((sum, score) => sum + score, 0)
}

function saveToLocalStorage() {
    localStorage.setItem('quizData', JSON.stringify(quizData))
    localStorage.setItem('showLuckyLoserTarget', showLuckyLoserTarget)
    localStorage.setItem('luckyLoserTarget', luckyLoserTarget)
    localStorage.setItem('numberOfCategories', numberOfCategories)
    localStorage.setItem('includeLuckyLoser', includeLuckyLoser)
}

function clearData() {
    quizData = []
    showLuckyLoserTarget = false
    luckyLoserTarget = 0

    localStorage.clear()
    loadConfig() // Reload config from config.js

    // Update UI elements
    document.getElementById('luckyLoserToggle').checked = false
    document.getElementById('luckyLoserTarget').value = 0

    renderTable()
}
function updateLuckyLoserTarget(value) {
    luckyLoserTarget = parseInt(value)
    localStorage.setItem('luckyLoserTarget', luckyLoserTarget)
    renderTable()
}

function toggleLuckyLoserTarget(checked) {
    window.showLuckyLoserTarget = checked
    localStorage.setItem('showLuckyLoserTarget', checked)
    renderTable()
}

function findClosestLuckyLoser() {
    if (!window.showLuckyLoserTarget || quizData.length <= 3) return -1

    quizData.sort((a, b) => b.total - a.total)

    let bestDiff = Math.abs(quizData[3].LuckyLoser - window.luckyLoserTarget)
    let bestIndex = 3

    for (let i = 3; i < quizData.length; i++) {
        const currentDiff = Math.abs(quizData[i].LuckyLoser - window.luckyLoserTarget)
        if (currentDiff <= bestDiff) {
            bestDiff = currentDiff
            bestIndex = i
        }
    }

    return bestIndex
}

function renderLuckyLoserHeader() {
    const header = document.getElementById('lucky-loser-header')
    header.innerHTML = window.showLuckyLoserTarget ? `Dogrywka (${window.luckyLoserTarget})` : 'Dogrywka'
}

function renderTable() {
    // Generate headers
    const headerRow = document.getElementById('quiz-table-header')
    headerRow.innerHTML = '<th>Nazwa Drużyny</th>'
    for (let i = 1; i <= numberOfCategories; i++) {
        headerRow.innerHTML += `<th>K${i}</th>`
    }
    if (window.includeLuckyLoser) {  // Using window.includeLuckyLoser
        headerRow.innerHTML += `<th id="lucky-loser-header">Dogrywka</th>`
    }
    headerRow.innerHTML += '<th>Suma</th>'

    const tableBody = document.getElementById('quiz-table-body')
    tableBody.innerHTML = ''

    const sidebar = document.getElementById('sidebar')
    const isEditing = sidebar.style.transform === 'translateX(0px)'

    if (window.includeLuckyLoser) {  // Using window.includeLuckyLoser
        renderLuckyLoserHeader()
    }

    quizData.sort((a, b) => b.total - a.total)
    const closestIndex = window.includeLuckyLoser && window.showLuckyLoserTarget ? findClosestLuckyLoser() : -1

    quizData.forEach((team, index) => {
        const row = document.createElement('tr')
        const isClosest = index === closestIndex

        if (team.total > 0) {
            if (index === 0) row.classList.add('medal-gold')
            if (index === 1) row.classList.add('medal-silver')
            if (index === 2) row.classList.add('medal-bronze')
        }

        if (isClosest && window.showLuckyLoserTarget && window.includeLuckyLoser) {
            row.classList.add('table-success')
            row.style.border = '2px solid #198754'
        }

        if (isEditing) {
            let rowHtml = `
                <td>
                    <div class="d-flex align-items-center">
                        <input type="text" class="form-control me-2" value="${team.team}" 
                            onchange="updateTeamName(${index}, this.value)">
                        <button class="btn btn-danger" onclick="deleteTeam(${index})">Usuń</button>
                    </div>
                </td>
                ${team.scores.slice(0, numberOfCategories).map((score, scoreIndex) => `
                    <td>
                        <input type="number" class="form-control" value="${score}" min="0" max="${maxScore}"
                            onchange="updateScore(${index}, ${scoreIndex}, this.value)">
                    </td>
                `).join('')}`

            if (window.includeLuckyLoser) {
                rowHtml += `
                    <td>
                        <input type="number" class="form-control" value="${team.LuckyLoser}"
                            onchange="updateLuckyLoser(${index}, this.value)">
                    </td>`
            }

            rowHtml += `<td><strong>${team.total}</strong></td>`
            row.innerHTML = rowHtml
        } else {
            let rowHtml = `
                <td>
                    <div style="display: grid; grid-template-columns: 40px 1fr; align-items: center;">
                        <div style="font-size: 32px; line-height: 1;">
                            ${index === 0 ? "🥇" : ""}
                            ${index === 1 ? "🥈" : ""}
                            ${index === 2 ? '🥉' : ''}
                            ${isClosest && window.includeLuckyLoser ? "🍀" : ""}
                        </div>
                        <div style="text-align: center;">
                            ${team.team}
                        </div>
                    </div>
                </td>
                ${team.scores.slice(0, numberOfCategories).map((score) => `<td>${score}</td>`).join("")}`

            if (window.includeLuckyLoser) {
                rowHtml += `<td>${team.LuckyLoser}</td>`
            }

            rowHtml += `<td><strong>${team.total}</strong></td>`
            row.innerHTML = rowHtml
        }
        tableBody.appendChild(row)
    })
}

document.addEventListener('DOMContentLoaded', function () {
    loadConfig()

    const luckyLoserControls = document.querySelector('.mb-4:has(#luckyLoserToggle)')
    if (!includeLuckyLoser) {
        luckyLoserControls.style.display = 'none'
    }

    // Set initial states from localStorage
    document.getElementById('luckyLoserToggle').checked = window.showLuckyLoserTarget
    document.getElementById('luckyLoserTarget').value = window.luckyLoserTarget
    document.getElementById('dateInput').value = quizDate

    // Set initial date display
    const savedDate = localStorage.getItem('quizDate')
    if (savedDate) {
        updateDate(savedDate)
    }

    const elements = {
        sidebar: document.getElementById('sidebar'),
        sidebarToggle: document.getElementById('sidebarToggle'),
        luckyLoserToggle: document.getElementById('luckyLoserToggle'),
        luckyLoserTarget: document.getElementById('luckyLoserTarget'),
        dateInput: document.getElementById('dateInput'),
        addTeamButton: document.getElementById('addTeamButton'),
        clearDataButton: document.getElementById('clearDataButton'),
        exportButton: document.getElementById('exportButton'),
        nukeButton: document.getElementById('nukeButton')
    }

    if (elements.sidebarToggle && elements.sidebar) {
        elements.sidebarToggle.addEventListener('click', () => {
            const isOpen = elements.sidebar.style.transform === 'translateX(0px)'
            elements.sidebar.style.transform = isOpen ? 'translateX(100%)' : 'translateX(0)'
            renderTable()
        })
    }

    if (elements.luckyLoserToggle) {
        elements.luckyLoserToggle.checked = window.showLuckyLoserTarget
        elements.luckyLoserToggle.addEventListener('change', (e) => {
            toggleLuckyLoserTarget(e.target.checked)
        })
    }

    elements.addTeamButton?.addEventListener('click', addTeam)
    elements.clearDataButton?.addEventListener('click', clearData)
    elements.exportButton?.addEventListener('click', exportToCSV)
    elements.luckyLoserTarget?.addEventListener('change', (e) => updateLuckyLoserTarget(e.target.value))
    elements.quizLocationInput?.addEventListener('change', (e) => updateLocation(e.target.value))
    elements.dateInput?.addEventListener('change', (e) => updateDate(e.target.value))
    elements.nukeButton?.addEventListener('click', nukeLocalStorage)

    renderTable()
})

function exportToCSV() {
    const today = new Date().toISOString().split('T')[0]
    const headers = ['Nazwa Drużyny', ...Array(10).fill(0).map((_, i) => `K${i + 1}`), 'Dogrywka', 'Suma']
    const csvContent = [
        headers.join(','),
        ...quizData.map(team => [
            team.team,
            ...team.scores,
            team.tiebreaker,
            team.total
        ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `quiz_${today}.csv`
    link.click()
}

function addTeam() {
    const newTeam = {
        team: `Team ${quizData.length + 1}`,
        scores: Array(10).fill(0),
        luckyLoser: 0,
        total: 0
    }
    quizData.push(newTeam)
    saveToLocalStorage()
    renderTable()
}

window.updateTeamName = function (index, newName) {
    quizData[index].team = newName
    saveToLocalStorage()
    renderTable()
}

window.deleteTeam = function (index) {
    quizData.splice(index, 1)
    saveToLocalStorage()
    renderTable()
}

window.updateScore = function (teamIndex, scoreIndex, value) {
    quizData[teamIndex].scores[scoreIndex] = Number(value)
    quizData[teamIndex].total = calculateTotal(quizData[teamIndex].scores)
    saveToLocalStorage()
    renderTable()
}

window.updateLuckyLoser = function (teamIndex, value) {
    quizData[teamIndex].luckyLoser = Number(value)
    quizData[teamIndex].total = calculateTotal(quizData[teamIndex].scores)
    saveToLocalStorage()
    renderTable()
}

document.getElementById('dateInput').addEventListener('change', (e) => {
    updateDate(e.target.value)
})

function updateLocation(value) {
    quizLocation = value
    localStorage.setItem('quizLocation', value)
    document.getElementById('quizLocation').textContent = value || 'Lokalizacja'
    document.getElementById('locationInput').value = window.quizLocation
}

function updateDate(value) {
    quizDate = value
    localStorage.setItem('quizDate', value)

    // Format the date for display using Polish locale
    const date = new Date(value)
    const displayDate = date.toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })
    document.getElementById('quiz-date').textContent = displayDate || 'Date'
}

window.clearData = clearData
window.toggleLuckyLoserTarget = toggleLuckyLoserTarget
window.updateLuckyLoserTarget = updateLuckyLoserTarget
window.renderTable = renderTable
