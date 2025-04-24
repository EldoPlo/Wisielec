// Lista słów do odgadnięcia pogrupowana w kategorie
const wordCategories = {
  'Informatyka': [
    'komputer', 'programowanie', 'javascript', 'algorytm', 'aplikacja',
    'internet', 'serwer', 'klawiatura', 'monitor', 'laptop'
  ],
  'Technologia': [
    'procesor', 'pamięć', 'grafika', 'baza', 'dane',
    'informatyka', 'sieć', 'protokół', 'system', 'program'
  ],
  'Programowanie': [
    'biblioteka', 'funkcja', 'obiekt', 'zmienna', 'metoda'
  ],
  'Matematyka': [
    'po prostu pochodna', 'całka', 'macierz', 'wektor', 'równanie',
    'funkcja', 'logarytm', 'trygonometria', 'algebra', 'geometria'
  ],
  'Powiedzonka(studia Informatyka Algorytmiczna)': [
    'No to fajno', 'Po prostu pochodna pochodna fx', 'Czy można wolniej? Ale po co ?'],

  'Teksty do toastu': [
    'Tyrtum pyrtum', 'Ciach Baba w Piach', 'Chluśniem bo uśniem', 'Po szklanie i na rusztowanie', 'Pierdykniem bo odwykniem', 'Można wypić po kubeczku spokój w głowie w porządeczku', 'No to cyk', 'Jan Sebastian Bach',
    'Nic tak zdrowia nie upiększa jak bimberku dawka większa', 'Jak mawiają francuzi co stoi to do buzi', 'Osoba godna pije do dna', 'Hop siup zmiana dup', 'Jedzie ksiądz na karuzeli', 'Piłka bramka gol'
  ]
 
};

// Polski alfabet oraz spacja
const alphabet = 'aąbcćdeęfghijklłmnńoópqrsśtuvwxyzźż?';

// Elementy DOM
let wordContainer;
let keyboard;
let newGameBtn;
let cancelGameBtn;
let messageElement;
let categoryDisplay;

// Stan gry
let currentWord = '';
let currentCategory = '';
let guessedLetters = [];
let incorrectGuesses = 0;
let gameOver = false;

/**
* Inicjalizacja elementów DOM i uruchomienie gry
*/
function init() {
  // Pobierz elementy DOM
  wordContainer = document.getElementById('word-container');
  keyboard = document.getElementById('keyboard');
  newGameBtn = document.getElementById('new-game-btn');
  cancelGameBtn = document.getElementById('cancel-game-btn');
  messageElement = document.getElementById('message');
  
  // Dodaj element dla wyświetlania kategorii
  createCategoryElement();
  
  // Dodaj nasłuchiwacze zdarzeń
  newGameBtn.addEventListener('click', startNewGame);
  cancelGameBtn.addEventListener('click', cancelGame);

  // Rozpocznij grę
  if (!loadGameState()) {
      startNewGame();
  }
  
  // Dodaj obsługę klawiatury fizycznej
  document.addEventListener('keydown', handleKeyPress);
}

/**
* Obsługa naciśnięcia klawisza na klawiaturze fizycznej
*/
function handleKeyPress(event) {
  if (gameOver) return;
  
  let key = event.key.toLowerCase();
  
  // Konwersja spacji na odpowiedni znak
  if (key === ' ') {
    key = ' ';
  }
  
  // Sprawdź czy klawisz jest w alfabecie
  if (alphabet.includes(key)) {
    const keyElement = document.querySelector(`.key[data-letter="${key}"]`);
    if (keyElement && !keyElement.classList.contains('active')) {
      handleLetterClick(key, keyElement);
    }
  }
}

/**
* Tworzy element wyświetlający kategorię
*/
function createCategoryElement() {
  // Sprawdź czy element już istnieje
  categoryDisplay = document.getElementById('category-display');
  if (!categoryDisplay) {
    categoryDisplay = document.createElement('div');
    categoryDisplay.id = 'category-display';
    categoryDisplay.classList.add('category-display');
    
    // Wstaw element przed wordContainer
    const gameContainer = document.querySelector('.game-container');
    gameContainer.insertBefore(categoryDisplay, document.getElementById('message'));
    
    // Dodaj style do elementu kategorii w nagłówku dokumentu
    const style = document.createElement('style');
    style.textContent = `
      .category-display {
        text-align: center;
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 1rem;
        padding: 0.5rem;
        background-color: #f0f8ff;
        border-radius: 5px;
        border: 2px solid var(--primary-color);
      }
      
      .space-key {
        width: 120px !important;
        font-size: 0.9rem;
      }
      
      .letter-space.space {
        border-bottom: none;
        margin: 0 10px;
      }
    `;
    document.head.appendChild(style);
  }
}

/**
* Inicjalizacja klawiatury z literami alfabetu
*/
function initKeyboard() {
  keyboard.innerHTML = '';
  
  // Dodaj zwykłe litery
  for (const letter of alphabet) {
    const key = document.createElement('div');
    key.classList.add('key');
    
    // Specjalne formatowanie dla spacji
    if (letter === ' ') {
      key.textContent = 'SPACJA';
      key.classList.add('space-key');
    } else {
      key.textContent = letter;
    }
    
    key.dataset.letter = letter;
    key.addEventListener('click', function() {
      handleLetterClick(letter, this);
    });
    keyboard.appendChild(key);
  }
  
  // Dodaj znak zapytania dla podpowiedzi
 // Dodaj znak zapytania dla podpowiedzi
// const hintKey = document.createElement('div');
// hintKey.classList.add('key');
// hintKey.textContent = '?';
// hintKey.dataset.special = 'hint'; // Oznacz jako specjalny klawisz
// hintKey.addEventListener('click', showHint);
// keyboard.appendChild(hintKey);
}

/**
* Pokazuje podpowiedź - pierwszą nieodgadniętą literę
*/
function showHint() {
  if (gameOver) return;

  for (let i = 0; i < currentWord.length; i++) {
    const letter = currentWord[i];
    if (letter !== ' ' && !guessedLetters.includes(letter.toLowerCase())) {
      const keyElement = document.querySelector(`.key[data-letter="${letter.toLowerCase()}"]`);
      if (keyElement) {
        handleLetterClick(letter.toLowerCase(), keyElement);
        break;
      }
    }
  }
}

/**
* Inicjalizacja wyświetlania słowa do odgadnięcia
*/
function initWordDisplay() {
  wordContainer.innerHTML = '';
  for (let i = 0; i < currentWord.length; i++) {
    const letterSpace = document.createElement('div');
    letterSpace.classList.add('letter-space');
    letterSpace.dataset.index = i;
    
    // Automatycznie odkryj spacje
    if (currentWord[i] === ' ') {
      letterSpace.classList.add('space');
      letterSpace.textContent = ' ';
      // Dodaj spację do odgadniętych liter
      if (!guessedLetters.includes(' ')) {
        guessedLetters.push(' ');
      }
    }
    
    wordContainer.appendChild(letterSpace);
  }
}

/**
* Aktualizacja wyświetlania słowa z odgadniętymi literami
*/
function updateWordDisplay() {
  const letterSpaces = document.querySelectorAll('.letter-space');
  letterSpaces.forEach((space, index) => {
    const letter = currentWord[index];
    if (guessedLetters.includes(letter.toLowerCase())) { // Porównuj małe litery
      space.textContent = letter; // Wyświetl oryginalną literę (małą lub dużą)
    } else if (letter !== ' ') { // Nie czyść spacji
      space.textContent = '';
    }
  });
}

/**
* Resetowanie rysunku wisielca
*/
function resetHangman() {
  const parts = document.querySelectorAll('.hangman-part');
  parts.forEach(part => part.classList.add('hidden'));
}

/**
* Pokazywanie kolejnej części wisielca
*/
function showNextHangmanPart() {
  const nextPart = document.getElementById(`part-${incorrectGuesses}`);
  if (nextPart) {
    nextPart.classList.remove('hidden');
  }
}

/**
* Sprawdzenie czy gracz wygrał
* @returns {boolean} - Czy wszystkie litery zostały odgadnięte
*/
function checkWin() {
  for (let i = 0; i < currentWord.length; i++) {
    const letter = currentWord[i].toLowerCase(); // Normalizuj literę do małej
    if (!guessedLetters.includes(letter)) {
      return false;
    }
  }
  return true;
}

/**
* Obsługa kliknięcia litery
* @param {string} letter - Kliknięta litera
* @param {HTMLElement} keyElement - Element DOM reprezentujący klawisz
*/
function handleLetterClick(letter, keyElement) {
  if (gameOver || keyElement.classList.contains('active')) {
    return;
  }

  // Sprawdź, czy klawisz jest specjalny (np. ?)
  // if (keyElement.dataset.special === 'hint') {
  //   showHint(); // Wywołaj funkcję podpowiedzi
  //   return;
  // }

  keyElement.classList.add('active');
  guessedLetters.push(letter.toLowerCase()); // Normalizuj literę do małej

  if (currentWord.toLowerCase().includes(letter.toLowerCase())) { // Porównuj małe litery
    keyElement.classList.add('correct');
    updateWordDisplay();

    if (checkWin()) {
      endGame(true);
    }
  } else {
    keyElement.classList.add('incorrect');
    incorrectGuesses++;
    showNextHangmanPart();

    if (incorrectGuesses >= 10) {
      endGame(false);
    }
  }

  // Zapisz stan gry
  saveGameState();
}
/**
* Zakończenie gry
* @param {boolean} isWin - Czy gracz wygrał
*/
function endGame(isWin) {
  gameOver = true;
  
  messageElement.classList.remove('hidden', 'success', 'error');
  
  if (isWin) {
    messageElement.textContent = 'Gratulacje! Odgadłeś słowo!';
    messageElement.classList.add('success');
  } else {
    messageElement.textContent = `Przegrałeś! Poprawne słowo to: ${currentWord.toUpperCase()}`;
    messageElement.classList.add('error');
    
    // Pokaż całe słowo
    const letterSpaces = document.querySelectorAll('.letter-space');
    letterSpaces.forEach((space, index) => {
      space.textContent = currentWord[index];
    });
  }
  
  // Usuń zapisany stan gry
  localStorage.removeItem('hangmanGameState');
}

/**
* Wybierz losową kategorię i słowo
* @returns {Object} - Obiekt zawierający wylosowane słowo i jego kategorię
*/
function getRandomWordAndCategory() {
  // Pobierz wszystkie kategorie
  const categories = Object.keys(wordCategories);
  
  // Wybierz losową kategorię
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  
  // Wybierz losowe słowo z wybranej kategorii
  const wordsInCategory = wordCategories[randomCategory];
  const randomWord = wordsInCategory[Math.floor(Math.random() * wordsInCategory.length)];
  
  return {
    word: randomWord,
    category: randomCategory
  };
}

/**
* Rozpoczęcie nowej gry
*/
function startNewGame() {
  gameOver = false;
  guessedLetters = [];
  incorrectGuesses = 0;

  const { word, category } = getRandomWordAndCategory();
  currentWord = word;
  currentCategory = category;

  updateCategoryDisplay();
  resetHangman();
  initKeyboard();
  initWordDisplay();
  updateWordDisplay();

  messageElement.classList.add('hidden');
  saveGameState();
}

/**
* Aktualizacja wyświetlania kategorii
*/
function updateCategoryDisplay() {
  categoryDisplay.textContent = `Kategoria: ${currentCategory}`;
}

/**
* Anulowanie gry
*/
function cancelGame() {
  localStorage.removeItem('hangmanGameState');
  startNewGame();
}

/**
* Zapisanie stanu gry w localStorage
*/
function saveGameState() {
  const gameState = {
    currentWord,
    currentCategory,
    guessedLetters,
    incorrectGuesses,
    gameOver
  };
  localStorage.setItem('hangmanGameState', JSON.stringify(gameState));
}

/**
* Odczytanie stanu gry z localStorage
* @returns {boolean} - Czy udało się wczytać stan gry
*/
function loadGameState() {
  const savedState = localStorage.getItem('hangmanGameState');
  if (savedState) {
    const gameState = JSON.parse(savedState);
    currentWord = gameState.currentWord;
    currentCategory = gameState.currentCategory || 'Nieznana'; // Dla kompatybilności ze starszymi zapisami
    guessedLetters = gameState.guessedLetters;
    incorrectGuesses = gameState.incorrectGuesses;
    gameOver = gameState.gameOver;
    
    // Przywróć UI na podstawie stanu
    updateCategoryDisplay();
    initWordDisplay();
    updateWordDisplay();
    initKeyboard();
    
    // Przywróć stan klawiszy
    guessedLetters.forEach(letter => {
      const keyElement = document.querySelector(`.key[data-letter="${letter}"]`);
      if (keyElement) {
        keyElement.classList.add('active');
        if (currentWord.includes(letter)) {
          keyElement.classList.add('correct');
        } else {
          keyElement.classList.add('incorrect');
        }
      }
    });
    
    // Przywróć rysunek wisielca
    for (let i = 1; i <= incorrectGuesses; i++) {
      const part = document.getElementById(`part-${i}`);
      if (part) {
        part.classList.remove('hidden');
      }
    }
    
    // Przywróć komunikat o zakończeniu gry
    if (gameOver) {
      const isWin = checkWin();
      messageElement.classList.remove('hidden', 'success', 'error');
      
      if (isWin) {
        messageElement.textContent = 'Gratulacje! Odgadłeś słowo!';
        messageElement.classList.add('success');
      } else {
        messageElement.textContent = `Przegrałeś! Poprawne słowo to: ${currentWord.toUpperCase()}`;
        messageElement.classList.add('error');
      }
    }
    
    return true;
  }
  return false;
}

// Uruchom aplikację po załadowaniu DOM
document.addEventListener('DOMContentLoaded', init);