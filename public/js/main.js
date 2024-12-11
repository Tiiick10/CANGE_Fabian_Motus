// ----------------------------
// Variables globales
// ----------------------------

let chosenWord = "" 
let attemptsLeft = 0 
let currentWordDisplay = [] 
let proposals = []  // Historique des propositions
let playerScore = 0  // Score du joueur
let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [] 
let wordsByLength = {}  // Dictionnaire des mots par longueur
let isDictionaryLoaded = false  // Indicateur de chargement du dictionnaire

// ----------------------------
// Éléments DOM
// ----------------------------

let settingsDiv = document.getElementById("settings") 
let gameDiv = document.getElementById("game") 
let wordDisplay = document.getElementById("word-display") 
let remainingAttempts = document.getElementById("remaining-attempts") 
let guessInput = document.getElementById("guess") 
let proposalsDiv = document.getElementById("proposals") 
let message = document.getElementById("message") 
let startButton = document.getElementById("start-game") 
let submitGuessButton = document.getElementById("submit-guess") 
let leaderboardBody = document.getElementById("leaderboard-body")

let currentPlayerName = localStorage.getItem("currentPlayerName") || ""


// ----------------------------
// Chargement du dictionnaire JSON
// ----------------------------

fetch("public/assets/dictionnaire.json")
  .then(response => response.json())
  .then(data => {
    wordsByLength = data
    console.log("Dictionnaire chargé :", wordsByLength) 
    isDictionaryLoaded = true  // Dictionnaire chargé, prêt à démarrer
  })
  .catch(error => {
    console.error("Erreur lors du chargement du dictionnaire :", error)
    isDictionaryLoaded = false  // En cas d'erreur, on empêche de démarrer
  })


// ----------------------------
// Fonction pour démarrer une nouvelle partie
// ----------------------------

startButton.addEventListener("click", () => {

  // Vérification du dictionnaire chargé
  if (!isDictionaryLoaded) {
    alert("Le dictionnaire n'est pas encore chargé. Veuillez patienter.")
    return
  }

  // Vérification du nom du joueur
  if (!currentPlayerName) {
    currentPlayerName = askForPlayerName()
    localStorage.setItem("currentPlayerName", currentPlayerName)
  }

  // Récupération de la longueur du mot et des tentatives
  let wordLength = parseInt(document.getElementById("word-length").value) 
  attemptsLeft = parseInt(document.getElementById("attempts").value) 

  // Vérification de la longueur du mot
  if (!wordsByLength[wordLength]) {
    alert("Longueur de mot invalide. Veuillez choisir une longueur disponible.") 
    return 
  }

  let words = wordsByLength[wordLength] 
  chosenWord = words[Math.floor(Math.random() * words.length)] 

  currentWordDisplay = Array(wordLength).fill("") 
  wordDisplay.innerHTML = ""  

  // Création des cases pour afficher les lettres
  for (let i = 0; i < wordLength; i++) {
    let span = document.createElement("span") 
    span.classList.add("letter") 
    span.textContent = "" 
    wordDisplay.appendChild(span) 
  }

  // Initialisation des tentatives et des propositions
  remainingAttempts.textContent = attemptsLeft 
  proposals = [] 
  proposalsDiv.innerHTML = "" 
  message.textContent = "" 

  // Affichage des sections de jeu
  settingsDiv.style.display = "none" 
  gameDiv.style.display = "block" 
})


// ----------------------------
// Fonction pour valider la proposition du joueur
// ----------------------------

function validateGuess() {

  let userGuess = guessInput.value.toLowerCase()  
  guessInput.value = "" 

  // Vérification de la longueur du mot
  if (userGuess.length !== chosenWord.length) {
    message.textContent = `Le mot proposé doit avoir ${chosenWord.length} lettres.` 
    message.style.color = "red" 
    return 
  }

  // Vérification de la validité du mot
  if (!wordsByLength[chosenWord.length].includes(userGuess)) {
    message.textContent = "Ce mot n'est pas valide." 
    message.style.color = "red" 
    return 
  }

  // Mise à jour de l'affichage des lettres
  let displayUpdate = Array(chosenWord.length).fill("absent")  
  let usedIndices = new Set()  
  let remainingChosenWord = [...chosenWord]  

  // Comparaison lettre par lettre
  for (let i = 0; i < chosenWord.length; i++) {
    if (userGuess[i] === chosenWord[i]) {
      displayUpdate[i] = "correct" 
      usedIndices.add(i) 
      remainingChosenWord[i] = null  
    }
  }

  // Recherche des lettres présentes
  for (let i = 0; i < chosenWord.length; i++) {
    if (!usedIndices.has(i)) {
      let letterIndex = remainingChosenWord.indexOf(userGuess[i]) 
      if (letterIndex !== -1) {
        displayUpdate[i] = "present" 
        remainingChosenWord[letterIndex] = null  
      }
    }
  }

  // Mise à jour de l'affichage
  let spans = wordDisplay.querySelectorAll(".letter") 
  for (let i = 0; i < chosenWord.length; i++) {
    spans[i].textContent = userGuess[i].toUpperCase() 
    spans[i].classList.remove("correct", "present", "absent") 

    if (displayUpdate[i] === "correct") {
      spans[i].classList.add("correct") 
    } else if (displayUpdate[i] === "present") {
      spans[i].classList.add("present") 
    } else {
      spans[i].classList.add("absent") 
    }
  }

  // Ajout de la proposition à l'historique
  proposals.push(userGuess) 
  proposalsDiv.innerHTML += `<p>${userGuess.toUpperCase()}</p>` 

  // Vérification de la victoire
  if (userGuess === chosenWord) {
    message.textContent = "Félicitations ! Vous avez trouvé le mot !" 
    message.style.color = "green" 
    playerScore++ 
    askForReplay() 
  } else {
    attemptsLeft-- 
    remainingAttempts.textContent = attemptsLeft 

    // Vérification de la fin de la partie
    if (attemptsLeft === 0) {
      message.textContent = `Dommage ! Le mot était "${chosenWord.toUpperCase()}".` 
      message.style.color = "red" 
      askForReplay() 
    } else {
      message.textContent = "Continuez à essayer !" 
      message.style.color = "black" 
    }
  }
}

// Événements pour la soumission de la proposition
submitGuessButton.addEventListener("click", validateGuess) 
guessInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    validateGuess() 
  }
})

// ----------------------------
// Fonction pour demander un replay
// ----------------------------

function askForReplay() {
  setTimeout(() => {
    updateLeaderboard(currentPlayerName, playerScore)

    if (confirm("Voulez-vous rejouer ?")) {
      settingsDiv.style.display = "block" 
      gameDiv.style.display = "none" 
    } else {
      alert(`Merci d'avoir joué ! Votre score final est : ${playerScore}`) 
      playerScore = 0 
      settingsDiv.style.display = "block" 
      gameDiv.style.display = "none" 
    }
  }, 1000) 
}

// ----------------------------
// Fonction pour demander le nom du joueur
// ----------------------------

function askForPlayerName() {
  let playerName = prompt("Veuillez entrer votre nom :")
  while (!playerName || playerName.trim() === "") {
    playerName = prompt("Le nom ne peut pas être vide. Veuillez entrer votre nom :")
  }
  return playerName.trim()
}

// ----------------------------
// Fonction pour mettre à jour le leaderboard
// ----------------------------

function updateLeaderboard(playerName, score) {
  let existingPlayer = leaderboard.find(player => player.name === playerName)

  if (existingPlayer) {
    if (score > existingPlayer.score) {
      existingPlayer.score = score
    }
  } else {
    leaderboard.push({ name: playerName, score })
  }

  leaderboard.sort((a, b) => b.score - a.score)
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard))

  renderLeaderboard()
}

// ----------------------------
// Fonction pour afficher le leaderboard
// ----------------------------

function renderLeaderboard() {
  leaderboardBody.innerHTML = leaderboard
    .map(player => 
      `<tr>
        <td>${player.name}</td>
        <td>${player.score}</td>
      </tr>`
    )
    .join('')
}

renderLeaderboard()
