function generateTestData(teamCount = 10) {
    const adjectives = ['Szybki', 'Mądry', 'Sprytny', 'Wesoły', 'Dziki', 'Zwinny', 'Bystry', 'Głodny', 'Groźny', 'Leniwy', 'Śpiący', 'Wściekły', 'Potężny', 'Mały', 'Wielki', 'Cichy', 'Głośny', 'Dumny', 'Odważny', 'Tchórzliwy', 'Śmieszny', 'Poważny', 'Tajemniczy', 'Magiczny', 'Dziwny', 'Kolorowy', 'Elegancki', 'Zabawny']
    const nouns = ['Kot', 'Pies', 'Lew', 'Orzeł', 'Tygrys', 'Wilk', 'Niedźwiedź', 'Sokół', 'Słoń', 'Żyrafa', 'Pingwin', 'Panda', 'Rekin', 'Delfin', 'Królik', 'Wąż', 'Smok', 'Jednorożec', 'Feniks', 'Krokodyl', 'Nosorożec', 'Gepard', 'Pantera', 'Goryl', 'Leniwiec', 'Koala', 'Wiewiórka', 'Bóbr', 'Szop', 'Lis']

    // Clear existing data
    quizData = []

    console.log("Generating data for", teamCount, "teams")

    for (let i = 0; i < teamCount; i++) {
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
        const noun = nouns[Math.floor(Math.random() * nouns.length)]

        const team = {
            team: `${adj} ${noun}`,
            scores: Array(numberOfCategories).fill(0).map(() => Math.floor(Math.random() * maxScore + 1)),
            LuckyLoser: Math.floor(Math.random() * 99901) + 100,
            total: 0
        }

        team.total = team.scores.reduce((sum, score) => sum + score, 0)
        quizData.push(team)
    }

    saveToLocalStorage()
    renderTable()
}

function printLocalStorage() {
    console.group('LocalStorage Contents:')

    // Print quiz data
    console.log('Quiz Data:', JSON.parse(localStorage.getItem('quizData')))

    // Print settings
    console.log('Lucky Loser Target:', localStorage.getItem('luckyLoserTarget'))
    console.log('Show Lucky Loser:', localStorage.getItem('showLuckyLoserTarget'))

    // Print metadata
    console.log('Quiz Location:', localStorage.getItem('quizLocation'))
    console.log('Quiz Date:', localStorage.getItem('quizDate'))

    console.groupEnd()
}

function nukeLocalStorage() {
    localStorage.clear()
    loadConfig()
    location.reload()
}
