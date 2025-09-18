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
const btnCancelOptions = document.getElementById("btn-cancel-options");
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

// fetching questions for API call
function buildApiString(questionAmount, questionCategory, questionDifficulty) {

    return "https://opentdb.com/api.php?amount="+questionAmount+"&category="+questionCategory+"&difficulty="+questionDifficulty+"&type=multiple";

}


// (default question difficulty and question amount)
let questionAmount = 5;
let questionCategory = 9; // Category 9 = ANY
let questionDifficulty = "medium";
const categoriesUrl = "https://opentdb.com/api_category.php";
let url = buildApiString(questionAmount, questionCategory, questionDifficulty);


let question_bank = [];

let question_meta_info = {

    last_accessed: ""

};

// where all the question objects are stored
let quizQuestions = [];

function randomizeAnswers(answersToRandomize){

    let newAnswersAndAnswerIndex = {};

    let correctAnswer = answersToRandomize[answersToRandomize.length - 1];

    // console.log("Correct Answer:" + correctAnswer + " ");
    // console.log(answersToRandomize);

    newAnswersAndAnswerIndex.answers = shuffleArray(answersToRandomize);

    for (let i = 0; i < newAnswersAndAnswerIndex.answers.length; i++) {

        if (newAnswersAndAnswerIndex.answers[i] == correctAnswer) {

            newAnswersAndAnswerIndex.correctAnswerIndex = i;
            break;
        }
    }

    // console.log(newAnswersAndAnswerIndex);
    return newAnswersAndAnswerIndex;
}

function shuffleArray(array) {

    let currentIndex = array.length;
    let randomIndex;

    // while there remain elements to shuffle,
    while (currentIndex !== 0 ) {

        // pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // and swap it with the current element
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ]

    }

  return array;
}

let questionCategories = [];

async function getCategories(categoriesUrl) {

    try {

        // check to see if the questions are in the bank, get new questions if they are not
        const cache = JSON.parse(localStorage.getItem("question-categories") || "[]");
        const meta = JSON.parse(localStorage.getItem("question-meta-info") || "{}")

        const last_fetched = Number(meta.last_fetched) || 0;
        const ageMs = Date.now() - last_fetched;
        console.log("Age since last API fetch (ms): ", ageMs);

        // if cache exists and it's "fresh enough"
        if (cache.length > 0 && ageMs < 2000) { // 2 seconds

            quizQuestions = cache;
            console.log("loaded cache categories")
            return;
        }
        
        // fetch the url containing the question categories
        const res = await fetch(categoriesUrl);
        const data = await res.json();

        if (!data || !data.trivia_categories) {
            console.warn("Categories undefined, retrying...");
            setTimeout(getCategories, 1000);
            return;
        }

        console.log("We have categories!");

        for (let element of data.trivia_categories) {
            let thisCategory = {
                id: element.id,
                name: element.name
            };

        questionCategories.push(thisCategory);

        }
        localStorage.setItem("question-categories", JSON.stringify(questionCategories));
        quizQuestions = question_bank;

        meta.last_fetched = Date.now();
        localStorage.setItem("question-meta-info", JSON.stringify(meta));
        console.log("API loaded new data: " + JSON.parse(localStorage.getItem("question-meta-info")));

    } catch (err) {
        console.error("Error fetching Categories:", err);
        setTimeout(getCategories, 1000);

    } 

    // console.log(questionCategories);

    questionCategories.forEach(category => {

        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        selectCategory.appendChild(option);

    })

    // set the default of questionCategories to questionCategory(9)
    questionCategories.value = questionCategory;

}

getCategories(categoriesUrl);

// builds question objects based on the API url passed into it
async function getQuestions(){

    try {

        // check to see if the questions are in the bank, get new questions if they are not
        const cache = JSON.parse(localStorage.getItem("question-bank") || "[]");
        const meta = JSON.parse(localStorage.getItem("question-meta-info") || "{}")

        const last_fetched = Number(meta.last_fetched) || 0;
        const ageMs = Date.now() - last_fetched;
        console.log("Age since last API fetch (ms): ", ageMs);

        // if cache exists and it's "fresh enough"
        if (cache.length > 0 && ageMs < 2000) { // 2 sec

            quizQuestions = cache;
            console.log("loaded cache questions")
            return;
        }
        
        // otherwise call the API
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.results) {
            console.warn("Data undefined, retrying...");
            setTimeout(getQuestions, 1000);
            return;
        }

        console.log("We have questions!");

        for (let element of data.results) {
            let thisQuestion = {
                question: element.question,
                // ...element.incorrect_answers is shorthand JS for inserting all
                // incorrect answers into the answers array without a loop
                answers: [...element.incorrect_answers, element.correct_answer],
                correctAnswerIndex: element.incorrect_answers.length,
                category: element.category,
                difficulty: element.difficulty,
                pointValue: 1
            };

            // determine the point value of each question based on
            // its difficulty
            if (thisQuestion.difficulty == "easy") {

            thisQuestion.pointValue = 1;

            } else if (thisQuestion.difficulty == "medium") {

            thisQuestion.pointValue = 3;

            } else if (thisQuestion.difficulty == "hard") {

            thisQuestion.pointValue = 5;
            }

            // use the randomizeAnswers() function to randomize thisQuestion answers
            let randomizedAnswers = randomizeAnswers(thisQuestion.answers);
            thisQuestion.answers = randomizedAnswers.answers;
            thisQuestion.correctAnswerIndex = randomizedAnswers.correctAnswerIndex;
            // console.log(thisQuestion);
            // quizQuestions.push(thisQuestion);
            question_bank.push(thisQuestion);
        }

        localStorage.setItem("question-bank", JSON.stringify(question_bank));
        quizQuestions = question_bank;

        meta.last_fetched = Date.now();
        localStorage.setItem("question-meta-info", JSON.stringify(meta));
        console.log("API loaded new data: " + JSON.parse(localStorage.getItem("question-meta-info")));

    } catch (err) {
        console.error("Error fetching Questions:", err);
        setTimeout(getQuestions, 1000);

    } 
}

// gets questions according to the results of the default API call
getQuestions(url);

// display the current score on the page by appending it
// to the scoreArea h3 element
scoreTextNode.textContent = score;
scoreArea.appendChild(scoreTextNode);

// Add an event listener for when the selected option changes
selectCategory.addEventListener('change', function(event) {
  const selectedValue = event.target.value;
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

/* btnOptions.addEventListener('click', function(event){

    openOptions();

}); 

function openOptions(){

    hidePage(landingPage);
    showPage(optionsPage);

} */

btnSaveOptions.addEventListener('click', function(event){

    // clears previously defined selected difficulty options
    // (prevents duplicates)
    selectedDifficulty = [];

    // clears the default quizQuestions
    quizQuestions = [];

    // takes value from numOfQuestions combo box
    questionAmount = numOfQuestions.value;

    questionCategory = selectCategory.value;

    // stores all the checked checkbox values into selectedDifficulty
    difficultyCheckboxes.forEach(checkbox => {

        if (checkbox.checked) {
            selectedDifficulty.push(checkbox.value);
        }
    });

    if (selectedDifficulty.length == 0) {

        showPage(modalContainerQuizOptions);
        showPage(undefinedDifficultyModal);

    } else {

        hidePage(optionsPage);
        showPage(landingPage);

    }

    let questionCounts = {};

    const questionsPerDifficulty = Math.floor(questionAmount / selectedDifficulty.length);
    const remainder = questionAmount % selectedDifficulty.length;

    if (selectedDifficulty.length > 1) {

        selectedDifficulty.forEach(difficulty => {

            questionDifficulty = difficulty;

            questionCounts[difficulty] = questionsPerDifficulty;

        })

    }

    // AI: Distribute remainder (e.g., if questionAmount = 10, give the extra 1 to one difficulty)
    for (let i = 0; i < remainder; i++) {

        questionCounts[selectedDifficulty[i]]++;
    }

        console.log(questionCounts);

    // key, value = selectedDifficulty, questionsPerDifficulty
    Object.entries(questionCounts).forEach(([key, value]) => {

        url = buildApiString(value, questionCategory,`${key}`);
        getQuestions(url);

        console.log(url);

    })

    console.log(quizQuestions);

});

btnCancelOptions.addEventListener('click', function(event){

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

    hidePage(optionsPage);
    showPage(landingPage);

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

    console.log("question category:" + questionCategory);

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