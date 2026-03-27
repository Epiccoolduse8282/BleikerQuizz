const quizData = [
    {
        question: "Hva måles i Ohm (Ω)?",
        answers: ["Strøm", "Motstand", "Spenning", "Effekt"],
        correct: 1
    },
    {
        question: "Hva er normal kroppstemperatur hos mennesker?",
        answers: ["35°C", "37°C", "39°C", "40°C"],
        correct: 1
    },
    {
        question: "Hva er kroppens viktigste energikilde under hard trening?",
        answers: ["Protein", "Karbohydrater", "Vann", "Vitaminer"],
        correct: 1
    },
    {
        question: "Hva betyr målgruppe i media?",
        answers: ["Hvor reklamen sendes", "Hvem budskapet er laget for", "Hvor videoen spilles inn", "Hvor mange som ser"],
        correct: 1
    },
    {
        question: "Hva betyr kildekritikk?",
        answers: ["Å bruke mange kilder", "Å vurdere om informasjon er troverdig", "Å skrive lange tekster", "Å kopiere kilder"],
        correct: 1
    },
    {
        question: "Hva er god kundeservice?",
        answers: ["Å ignorere kunder", "Å hjelpe kunder på en vennlig og profesjonell måte", "Å selge mest mulig", "Å snakke lite"],
        correct: 1
    },
    {
        question: "Hva er HMS?",
        answers: ["Helse, miljø og sikkerhet", "Høy maskin standard", "Hoved maskin system", "Industriell standard"],
        correct: 0
    },
    {
        question: "Hva betyr HTML?",
        answers: ["HyperText Markup Language", "HighText Machine Language", "Hyper Transfer Media Link", "Home Tool Markup Language"],
        correct: 0
    },
    {
        question: "Hva er Stortinget?",
        answers: ["Norges regjering", "Norges parlament (nasjonalforsamling)", "Norges høyesterett", "Norges kongehus"],
        correct: 1
    },
    {
        question: "Hva betyr demokrati?",
        answers: ["At én person bestemmer alt", "At folket har makt til å påvirke beslutninger", "At lærere bestemmer alt", "At ingen bestemmer"],
        correct: 1
    }
]

let currentScore = 0
let answeredCount = 0
let quizFinished = false
let scoreSaved = false
let answeredState = Array(quizData.length).fill(false)

const storageKey = "bleikerQuizHighscores"

const quizContainer = document.getElementById("quizContainer")
const scoreBadge = document.getElementById("scoreBadge")
const resultPanel = document.getElementById("resultPanel")
const resultMessage = document.getElementById("resultMessage")
const saveScoreBtn = document.getElementById("saveScoreBtn")
const restartBtn = document.getElementById("restartBtn")
const leaderboardList = document.getElementById("leaderboardList")
const playerNameInput = document.getElementById("playerName")

function loadHighscores() {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    try {
        return JSON.parse(raw)
    } catch (e) {
        return []
    }
}

function saveHighscores(scores) {
    localStorage.setItem(storageKey, JSON.stringify(scores))
}

function renderLeaderboard() {
    const highscores = loadHighscores().sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return new Date(a.date) - new Date(b.date)
    }).slice(0, 10)

    leaderboardList.innerHTML = ""

    if (highscores.length === 0) {
        const li = document.createElement("li")
        li.textContent = "Ingen highscores enda."
        leaderboardList.appendChild(li)
        return
    }

    highscores.forEach((entry, index) => {
        const li = document.createElement("li")
        const left = document.createElement("span")
        const right = document.createElement("span")

        left.innerHTML = '<span class="rank">#' + (index + 1) + '</span>' + escapeHtml(entry.name)
        right.textContent = entry.score + " / " + quizData.length

        li.appendChild(left)
        li.appendChild(right)
        leaderboardList.appendChild(li)
    })
}

function updateScoreBadge() {
    scoreBadge.textContent = "Poeng: " + currentScore + " / " + quizData.length
}

function checkCompletion() {
    if (answeredCount !== quizData.length) return

    quizFinished = true
    resultPanel.style.display = "block"

    const name = playerNameInput.value.trim()
    if (name) {
        resultMessage.textContent = name + ", du fikk " + currentScore + " av " + quizData.length + " poeng."
    } else {
        resultMessage.textContent = "Du fikk " + currentScore + " av " + quizData.length + " poeng."
    }
}

function saveCurrentScore() {
    const name = playerNameInput.value.trim()

    if (!quizFinished) {
        resultPanel.style.display = "block"
        resultMessage.textContent = "Du må fullføre alle spørsmål før du kan lagre resultatet."
        return
    }

    if (!name) {
        resultMessage.textContent = "Skriv inn navnet ditt."
        playerNameInput.focus()
        return
    }

    const scores = loadHighscores()
    scores.push({
        name: name,
        score: currentScore,
        date: new Date().toISOString()
    })

    saveHighscores(scores)
    renderLeaderboard()

    scoreSaved = true
    saveScoreBtn.textContent = "Lagret!"
    saveScoreBtn.disabled = true
    resultMessage.textContent = name + ", poengsummen din på " + currentScore + " av " + quizData.length + " er lagret."
}

function resetQuiz() {
    currentScore = 0
    answeredCount = 0
    quizFinished = false
    scoreSaved = false
    answeredState = Array(quizData.length).fill(false)

    saveScoreBtn.textContent = "Lagre poengsum"
    saveScoreBtn.disabled = false
    resultPanel.style.display = "none"

    updateScoreBadge()
    renderQuiz()
}

function renderQuiz() {
    quizContainer.innerHTML = ""

    quizData.forEach((q, index) => {
        const box = document.createElement("div")
        box.className = "question-box"

        const title = document.createElement("div")
        title.className = "question-title"
        title.textContent = (index + 1) + ". " + q.question

        const answers = document.createElement("div")
        answers.className = "answers"

        q.answers.forEach((answerText, i) => {
            const btn = document.createElement("button")
            btn.className = "answer-btn"
            btn.type = "button"
            btn.textContent = answerText

            btn.addEventListener("click", function () {
                if (answeredState[index]) return

                answeredState[index] = true
                answeredCount += 1

                if (i === q.correct) {
                    currentScore += 1
                    btn.classList.add("correct")
                } else {
                    btn.classList.add("wrong")
                    answers.children[q.correct].classList.add("correct")
                }

                Array.from(answers.children).forEach(b => b.disabled = true)

                updateScoreBadge()
                checkCompletion()
            })

            answers.appendChild(btn)
        })

        box.appendChild(title)
        box.appendChild(answers)
        quizContainer.appendChild(box)
    })
}

function escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
}

saveScoreBtn.addEventListener("click", saveCurrentScore)
restartBtn.addEventListener("click", resetQuiz)

playerNameInput.addEventListener("input", function () {
    if (quizFinished && !scoreSaved) {
        const name = playerNameInput.value.trim()
        resultMessage.textContent = name
            ? name + ", du fikk " + currentScore + " av " + quizData.length + " poeng."
            : "Du fikk " + currentScore + " av " + quizData.length + " poeng."
    }
})

function checkVideoAnswer(btn, correct) {
    const buttons = btn.parentElement.querySelectorAll("button")
    const result = document.getElementById("videoResult")

    buttons.forEach(b => b.disabled = true)

    if (correct) {
        btn.style.background = "#155b38"
        btn.style.border = "2px solid #00d98a"
        result.textContent = "Riktig! Gult symboliserer vår, nytt liv og energi."
    } else {
        btn.style.background = "#5a1a1a"
        btn.style.border = "2px solid #ff4d4d"
        result.textContent = "Feil. Riktig svar er: symbol på vår, nytt liv og energi."
    }
}

renderQuiz()
updateScoreBadge()
renderLeaderboard()