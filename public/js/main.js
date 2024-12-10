// Liste de mots prédéfinis pour chaque longueur

let wordsByLength = {

  5: ["frite", "arbre", "chien", "bleue", "calin"],
  6: ["agiter", "pierre", "voyage", "aurore"],
  7: ["admirer", "parfume", "bonheur", "abdomen"],

}

// Variables globales

let chosenWord = "" 
let attemptsLeft = 0  
let currentWordDisplay = [] 
let proposals = []  // Historique
let playerScore = 0  // Score

// Éléments DOM

let settingsDiv = document.getElementById("settings") 
let gameDiv = document.getElementById("game") 
let wordDisplay = document.getElementById("word-display") 
let remainingAttempts = document.getElementById("remaining-attempts") 
let guessInput = document.getElementById("guess") 
let proposalsDiv = document.getElementById("proposals") 
let message = document.getElementById("message") 
let startButton = document.getElementById("start-game") 
let submitGuessButton = document.getElementById("submit-guess") 

// Fonction pour démarrer une nouvelle partie

startButton.addEventListener("click", () => {

  // Obtenir les paramètres choisis par le joueur

  let wordLength = parseInt(document.getElementById("word-length").value) 
  attemptsLeft = parseInt(document.getElementById("attempts").value) 

  // Valider la longueur de mot

  if (!wordsByLength[wordLength]) {
      alert("Longueur de mot invalide. Veuillez choisir une longueur disponible.") 
      return 
  }

  // Choisir un mot aléatoire

  let words = wordsByLength[wordLength] 
  chosenWord = words[Math.floor(Math.random() * words.length)] 

  // Initialiser l'affichage du mot

  currentWordDisplay = Array(chosenWord.length).fill("[ ]") 
  wordDisplay.innerHTML = currentWordDisplay
      .map((char) => `<span>${char}</span>`)
      .join("") 

  // Réinitialiser les variables et l'affichage

  remainingAttempts.textContent = attemptsLeft 
  proposals = [] 
  proposalsDiv.innerHTML = "" 
  message.textContent = "" 

  // Passer à la section du jeu

  settingsDiv.style.display = "none" 
  gameDiv.style.display = "block" 
}) 

// Fonction pour valider une proposition

function validateGuess() {

  let userGuess = guessInput.value.toLowerCase()  // Mot utilisateur
  guessInput.value = "" 

  // Vérifier la validité de la proposition

  if (userGuess.length !== chosenWord.length) {
      message.textContent = "Le mot proposé doit avoir la même longueur." 
      return 
  }

  // Initialiser des variables

  let displayUpdate = [...currentWordDisplay]  // Mise à jour de l'affichage
  let usedIndices = new Set()  // Indices des lettres bien placées
  let remainingChosenWord = [...chosenWord]  // Lettres restantes du mot cible

  // Vérifier les lettres bien placées

  for (let i = 0; i < chosenWord.length; i++) {
      if (userGuess[i] === chosenWord[i]) {
          displayUpdate[i] = `[${userGuess[i].toUpperCase()}]` 
          usedIndices.add(i) 
          remainingChosenWord[i] = null  // Marquer comme utilisée
      }
  }

  // Vérifier les lettres présentes mais mal placées

  for (let i = 0; i < chosenWord.length; i++) {
      if (!usedIndices.has(i) && remainingChosenWord.includes(userGuess[i])) {
          displayUpdate[i] = `<span class="present">${userGuess[i].toUpperCase()}</span>` 
          remainingChosenWord[remainingChosenWord.indexOf(userGuess[i])] = null  // Marquer comme utilisée
      } else if (!usedIndices.has(i)) {
          displayUpdate[i] = "[ ]"  // Lettre absente
      }
  }

  // Mettre à jour l'affichage du mot

  currentWordDisplay = displayUpdate 
  wordDisplay.innerHTML = currentWordDisplay
      .map((char) =>
          char.startsWith("[")
              ? `<span class="correct">${char}</span>`
              : `<span>${char}</span>`
      )
      .join("") 

  // Ajouter la proposition à l'historique

  proposals.push(userGuess) 
  proposalsDiv.innerHTML = proposals.map((word) => `<p>${word}</p>`).join("") 

  // Vérifier la fin de la partie

  if (userGuess === chosenWord) {
      message.textContent = "Félicitations ! Vous avez trouvé le mot !" 
      playerScore++ 
      askForReplay() 

  } else {

      attemptsLeft-- 
      remainingAttempts.textContent = attemptsLeft 

      if (attemptsLeft === 0) {
          message.textContent = `Dommage ! Le mot était "${chosenWord}".` 
          askForReplay() 
      }
  }
}

// Associer le bouton "Valider" à la fonction validateGuess

submitGuessButton.addEventListener("click", validateGuess) 

// Validation avec Enter

guessInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
      validateGuess() 
  }
}) 

// Rejouer

function askForReplay() {
  setTimeout(() => {
      if (confirm("Voulez-vous rejouer ?")) {
          settingsDiv.style.display = "block" 
          gameDiv.style.display = "none" 
      } else {
          alert(`Merci d'avoir joué ! Votre score final est : ${playerScore}`) 
          settingsDiv.style.display = "block" 
          gameDiv.style.display = "none" 
      }
  }, 1000) 
}
