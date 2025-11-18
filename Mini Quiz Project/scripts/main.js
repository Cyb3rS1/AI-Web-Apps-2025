// page elements
const landingPage = document.getElementById("landing-page");
const optionsPage = document.getElementById("options-page");
const quizPage = document.getElementById("quiz-page");



const difficultyCheckboxes = document.querySelectorAll('input[type="checkbox"][name="difficulty"]');
let numOfQuestions = document.getElementById("num_of_questions");
let selectedDifficulty = [];
let selectCategory = document.getElementById("categories");
const categoryArea = document.getElementById("category-text-area");
const categoryTextNode = document.createTextNode("");
const questionArea = document.getElementById("question-area");
const quizMessageBox = document.getElementById("quiz-message-box");
const difficultyLevel = document.getElementById("difficulty-level");
const difficultyTextNode = document.createTextNode("");
const scoreArea = document.getElementById("score-area");
const scoreTextNode = document.createTextNode("");
const questionNumberArea = document.getElementById("question-number-area");
const qNumberTextNode = document.createTextNode("");

// buttons
const btnStart = document.getElementById("btn-start");
const btnOptions = document.getElementById("btn-options");
const btnOkay = document.getElementById("btn-okay");
const btnSaveOptions = document.getElementById("btn-save-options");
const btnResetOptions = document.getElementById("btn-reset-options");
const btnCheckAnswer = document.getElementById("btn-check-answer");
const btnNext = document.getElementById("btn-next"); 
const btnTryAgain = document.getElementById("btn-try-again");
const btnsEnd = document.querySelectorAll('.btn-end');
const allButtons = document.querySelectorAll("button");

// modals
let modalContainer = document.getElementById("modal-container");
let modalContainerQuizOptions = document.getElementById("modal-container-quiz-options");
let undefinedDifficultyModal = document.getElementById("undefined-difficulty-modal");
let winModal = document.getElementById("win-modal");
let loseModal = document.getElementById("lose-modal");
let endModal = document.getElementById("end-modal");

// dynamic variables for quiz logic
const TWENTY_FOUR_HOURS = 86400000;

let selectedAnswer;
let pointValue;
let questionNumber = 1;
let counter = 0;
let score = 0;

// --- UTILITY HELPERS ---------------------------------------------------------

function buildApiString(amount, categoryId, difficulty) {
    return `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=${difficulty}&type=multiple`;
}

function randomizeAnswers(answersToRandomize){
    const correct = answersToRandomize[answersToRandomize.length - 1];
    const shuffled = shuffleArray([...answersToRandomize]);
    return {
        answers: shuffled,
        correctAnswerIndex: shuffled.indexOf(correct)
    };
}

function shuffleArray(array) {
    let i = array.length;
    while (i !== 0) {
        const r = Math.floor(Math.random() * i);
        i--;
        [array[i], array[r]] = [array[r], array[i]];
    }
    return array;
}


// builds a url for obtaining info about one category
function buildCategoryInfoString(categoryId) {

    return "https://opentdb.com/api_count.php?category="+categoryId;


}


// (default question difficulty and question amount)
let questionAmount = 5;
let questionCategory = 9; // Category 9 = General Knowledge
let questionDifficulty = "medium";
let difficulty_levels = ["easy", "medium", "hard"];
const categoriesUrl = "https://opentdb.com/api_category.php";
let url = buildApiString(questionAmount, questionCategory, questionDifficulty);


let question_bank = [];

let question_category_info = [];

let question_meta_info = {

    last_accessed: ""

};

// where all the question objects are stored
let quizQuestions = [];



// --- FETCH QUESTIONS ONLY WHEN NEEDED ----------------------------------------

async function fetchQuestions(reqAmount, reqCategoryId, reqDifficulty) {
    const MAX_QUESTION_PULL = 50;
    let results = [];

    while (reqAmount > 0) {
        const pullAmount = Math.min(reqAmount, MAX_QUESTION_PULL);
        const url = buildApiString(pullAmount, reqCategoryId, reqDifficulty);

        const res = await fetch(url);
        const data = await res.json();

        if (data?.results?.length > 0) {
            results = results.concat(data.results);
        }

        reqAmount -= pullAmount;
    }

    // Normalize question format
    return results.map(element => {
        const answers = [...element.incorrect_answers, element.correct_answer];
        const randomized = randomizeAnswers(answers);

        return {
            question: element.question,
            answers: randomized.answers,
            correctAnswerIndex: randomized.correctAnswerIndex,
            category: element.category,
            difficulty: element.difficulty,
            pointValue:
                element.difficulty === "easy" ? 1 :
                element.difficulty === "medium" ? 3 : 5
        };
    });
}

/* ============================================================
   NEW QUESTION BANK SYSTEM — WORKS WITH EXISTING VARIABLE NAMES
   ============================================================ */

// load full question bank array from localStorage
function loadQuestionBank() {
    return JSON.parse(localStorage.getItem("question-bank") || "[]");
}

// save full question bank array to localStorage
function saveQuestionBank(bank) {
    localStorage.setItem("question-bank", JSON.stringify(bank));
}

// find one category block in the bank
function getCategoryBlock(bank, categoryName) {
    return bank.find(entry => entry.category === categoryName);
}

// splits the requested amount evenly across selected difficulties
function splitAmountAcrossDifficulties(reqAmount, reqDifficulties) {
    const base = Math.floor(reqAmount / reqDifficulties.length);
    const remainder = reqAmount % reqDifficulties.length;

    let result = {};
    reqDifficulties.forEach((diff, index) => {
        result[diff] = index === 0 ? base + remainder : base;
    });

    return result;
}

// fetches only the needed difficulty amount, chunked to 50 per request
async function fetchDifficultyChunk(reqAmount, reqCategoryId, reqDifficulty) {
    const MAX_PULL = 50;
    let results = [];

    while (reqAmount > 0) {
        const pullAmount = Math.min(reqAmount, MAX_PULL);
        const url = buildApiString(pullAmount, reqCategoryId, reqDifficulty);

        const res = await fetch(url);
        const data = await res.json();

        if (data?.results?.length > 0) {
            results = results.concat(data.results);
        }

        reqAmount -= pullAmount;
    }

    return results.map(element => {
        const answers = [...element.incorrect_answers, element.correct_answer];
        const randomized = randomizeAnswers([...answers]);

        return {
            question: element.question,
            answers: randomized.answers,
            correctAnswerIndex: randomized.correctAnswerIndex,
            category: element.category,
            difficulty: element.difficulty,
            pointValue:
                element.difficulty === "easy" ? 1 :
                element.difficulty === "medium" ? 3 : 5
        };
    });
}

// ensures the question-bank has blocks for this category/difficulty
async function fetchAndStoreIfMissing(
    reqAmount, 
    reqCategoryId, 
    reqCategoryName, 
    reqDifficulty
) {
    let bank = loadQuestionBank();
    let categoryBlock = getCategoryBlock(bank, reqCategoryName);

    if (!categoryBlock) {
        categoryBlock = {
            category: reqCategoryName,
            difficulties: { easy: [], medium: [], hard: [] }
        };
        bank.push(categoryBlock);
    }

    if (!categoryBlock.difficulties[reqDifficulty]) {
        categoryBlock.difficulties[reqDifficulty] = [];
    }

    const existing = categoryBlock.difficulties[reqDifficulty];

    if (existing.length >= reqAmount) {
        return existing.slice(0, reqAmount);
    }

    const needed = reqAmount - existing.length;

    const newQuestions = await fetchDifficultyChunk(
        needed,
        reqCategoryId,
        reqDifficulty
    );

    categoryBlock.difficulties[reqDifficulty] =
        categoryBlock.difficulties[reqDifficulty].concat(newQuestions);

    saveQuestionBank(bank);

    return categoryBlock.difficulties[reqDifficulty].slice(0, reqAmount);
}

// main function that prepares quizQuestions exactly as before
async function prepareQuizQuestions(reqAmount, reqCategoryId, reqDifficulties) {
    quizQuestions = []; // reset

    const categoryName =
        selectCategory.options[selectCategory.selectedIndex].text;

    const split = splitAmountAcrossDifficulties(reqAmount, reqDifficulties);

    for (const diff of reqDifficulties) {
        const needed = split[diff];
        const questions = await fetchAndStoreIfMissing(
            needed,
            reqCategoryId,
            categoryName,
            diff
        );
        quizQuestions = quizQuestions.concat(questions);
    }

    quizQuestions = shuffleArray(quizQuestions);
}

localStorage.removeItem("trivia-categories");

/* ============================================================
   LOAD & STORE CATEGORIES ON PAGE LOAD
   ============================================================ */

// Loads categories from local storage
function loadCategoriesFromStorage() {
    return JSON.parse(localStorage.getItem("trivia-categories") || "[]");
}

// Saves categories to local storage
function saveCategoriesToStorage(categories) {
    localStorage.setItem("trivia-categories", JSON.stringify(categories));
}

// Fetches categories from API if not already in storage
async function loadCategories() {
    let stored = loadCategoriesFromStorage();

    // If already stored, use them
    if (stored.length > 0) {
        populateCategorySelect(stored);
        return;
    }

    // Otherwise fetch from API
    try {
        const res = await fetch("https://opentdb.com/api_category.php");
        const data = await res.json();

        if (data.trivia_categories) {
            saveCategoriesToStorage(data.trivia_categories);
            populateCategorySelect(data.trivia_categories);
        }
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}

// Populates the <select> element with category names & ids
function populateCategorySelect(categories) {
    selectCategory.innerHTML = ""; // clear old

    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;         // ID for API calls
        option.textContent = cat.name; // Display category name
        selectCategory.appendChild(option);
    });
}

// Load categories immediately when page loads
document.addEventListener("DOMContentLoaded", async () => {
    await loadCategories();
    
    // LOAD DEFAULT QUESTIONS IMMEDIATELY
    await prepareQuizQuestions(
        questionAmount,
        questionCategory,
        [questionDifficulty] // wrap in array because prepareQuizQuestions expects an array
    );

    console.log("Loaded default quiz questions:", quizQuestions);
});


// display the current score on the page by appending it
// to the scoreArea h3 element
scoreTextNode.textContent = score;
scoreArea.appendChild(scoreTextNode);

// Add an event listener for when the selected option changes
// DOESN'T WORK WITH NODE.JS SELECT ELEMENT
selectCategory.addEventListener('change', function(event) {
  let selectedValue = event.target.value;
  console.log('Selected category + id :', selectedValue);
});

// function that configures all the buttons at once
allButtons.forEach(button => {

    button.addEventListener('click', function(event){
        event.preventDefault();
    })
})

// when the start button is clicked, the quiz begins
btnStart.addEventListener('click', function(event){

    startQuiz();
});

btnSaveOptions.addEventListener('click', async function(event) {
    event.preventDefault();

    // clear previous data
    selectedDifficulty = [];
    quizQuestions = [];

    questionAmount = Number(numOfQuestions.value);
    questionCategory = selectCategory.value;

    difficultyCheckboxes.forEach(checkbox => {
        if (checkbox.checked) selectedDifficulty.push(checkbox.value);
    });

    if (selectedDifficulty.length === 0) {
        showPage(modalContainerQuizOptions);
        showPage(undefinedDifficultyModal);
        return;
    }

    await prepareQuizQuestions(questionAmount, questionCategory, selectedDifficulty);

    console.log("Quiz Questions Ready:", quizQuestions);
});

btnResetOptions.addEventListener('click', function(event){

    // reset all input fields to default values
    numOfQuestions.value = questionAmount;
    selectCategory.value = questionCategory;

    // Loop through each difficulty checkbox
    difficultyCheckboxes.forEach(checkbox => {
        // Example condition: check only if value is 'banana' or 'cherry'
        if (checkbox.value === 'medium') {
            checkbox.checked = true; // ✅ Check it
        } else {
            checkbox.checked = false; // ❌ Uncheck it
        }
    });

});

btnOkay.addEventListener('click', function(event) {

    hidePage(modalContainerQuizOptions);
    hidePage(undefinedDifficultyModal);

})

// when the check answer button is pressed, the user's answer
// is assessed based on the quizAnswers array
btnCheckAnswer.addEventListener('click', function(event){

    checkAnswer(quizQuestions);
});

btnNext.addEventListener('click', function(event) {

    nextQuestion();
})

btnTryAgain.addEventListener('click', function(event) {

    hidePage(modalContainer);
    hidePage(currentModal);
})

// when the end button is clicked, the quiz ends and the landing
// page is shown
btnsEnd.forEach(button => {

    button.addEventListener('click', function(event){
    
    questionArea.innerHTML = '';
    counter = 0;

    hidePage(currentModal);
    endQuiz();

    })
})


function startQuiz(){

    console.log(quizQuestions);

    console.log("question category: " + questionCategory);

    console.log(quizQuestions);

    categoryArea.textContent = quizQuestions[counter].category;

    qNumberTextNode.textContent = questionNumber;
    questionNumberArea.appendChild(qNumberTextNode);

    scoreTextNode.textContent = score;
    hidePage(landingPage);
    setupQuizQuestion(quizQuestions);
    showPage(quizPage);
}



function endQuiz(){

    score = 0;
    questionNumber = 1;
    categoryArea.textContent = "";
    hidePage(modalContainer);
    hidePage(currentModal);
    hidePage(quizPage);
    showPage(landingPage);
    
}

function nextQuestion(){

    hidePage(modalContainer);
    hidePage(currentModal);

    difficultyLevel.removeChild(difficultyTextNode);
    questionArea.innerHTML = '';

    questionNumber++;
    qNumberTextNode.textContent = questionNumber;

    counter++;

    setupQuizQuestion(quizQuestions);

}

function setupQuizQuestion(quizQuestions){

    let currentQuestion = quizQuestions[counter].question;
    let currentDifficulty = quizQuestions[counter].difficulty
    let answerChoices = quizQuestions[counter].answers;
    pointValue = quizQuestions[counter].pointValue;

    // console.log(counter);
    // console.log(currentQuestion);
    // console.log(answerChoices);

    //Create the paragraph to ask the question
    let questionText = document.createElement("h2");
    questionText.innerText = currentQuestion;

    // console.log(questionText.innerText);

    
    questionArea.appendChild(questionText);

    
    // after the difficulty level is evaluated, append it
    // to the difficultyLevel p element
    difficultyTextNode.textContent = currentDifficulty;
    difficultyLevel.appendChild(difficultyTextNode);

    //Create the unordered list to display the answers
    let selectBox = document.createElement("select");

    for (let i = 0; i < answerChoices.length; i++){
        let option = document.createElement("option");
        option.value = i;
        option.innerText = answerChoices[i];

        // console.log(option.value);
        selectBox.appendChild(option);
    }

    selectedAnswer = 0;
    console.log(selectedAnswer);

    selectBox.addEventListener('change', function(event){
        event.preventDefault();
        selectedAnswer = selectBox.value;

        console.log(selectedAnswer);
    });

    questionArea.appendChild(selectBox);
}


// checks whether the user's input is correct and displays
// a corresponding modal
function checkAnswer(quizQuestions){

    pointValue = quizQuestions[counter].pointValue;
    console.log(pointValue);

    if (selectedAnswer == quizQuestions[counter].correctAnswerIndex){

        currentModal = winModal;

        score += pointValue;

        scoreTextNode.textContent = score;

        console.log(score);

        if (counter == quizQuestions.length -1) {

            currentModal = endModal;
        }

    } else {

        currentModal = loseModal;
    }

    // displays currentModal
    showPage(modalContainer);
    showPage(currentModal);
    
}

hidePage(quizPage);

function showPage(pageToShow){
    pageToShow.style.display = "inline";
}

function hidePage(pageToHide){
    pageToHide.style.display = "none";
}