// page elements
const landingPage = document.getElementById("landing-page");
const quizPage = document.getElementById("quiz-page");
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
const btnCheckAnswer = document.getElementById("btn-check-answer");
const btnNext = document.getElementById("btn-next"); 
const btnTryAgain = document.getElementById("btn-try-again");
const btnsEnd = document.querySelectorAll('.btn-end');
const allButtons = document.querySelectorAll("button");

// modals
let modalContainer = document.getElementById("modal-container");
let winModal = document.getElementById("win-modal");
let loseModal = document.getElementById("lose-modal");
let endModal = document.getElementById("end-modal");

// dynamic variables for quiz logic
let selectedAnswer;
let pointValue;
let questionNumber = 1;
let counter = 0;
let score = 0;

// display the current score on the page by appending it
// to the scoreArea h3 element
scoreTextNode.textContent = score;
scoreArea.appendChild(scoreTextNode);

// function that configures all the buttons at once
allButtons.forEach(button => {

    button.addEventListener('click', function(event){
        event.preventDefault();
    })
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

// when the start button is clicked, the quiz begins
btnStart.addEventListener('click', function(event){

    startQuiz();
});

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


let quizQuestions = [

    {"question": "What color is the sky?",
    "answers": ['red', 'blue', 'yellow', 'turtles'],
    "correctAnswerIndex": 1,
    "pointValue": 1},

    {"question": "What is the largest sea in the world?",
    "answers": ['Arabian Sea', 'Coral Sea', 'Carribean Sea', 'Philippine Sea'],
    "correctAnswerIndex": 3,
    "pointValue": 2},

    {"question": "What galaxy are we in?",
    "answers": ['Andromeda', 'Milky Way', 'Canis Major Dwarf', 'Snickers'],
    "correctAnswerIndex": 1,
    "pointValue": 1},

    {"question": "What is the rarest element in the universe?",
    "answers": ['Palladium', 'Oxygen', 'Astatine', 'Scandium'],
    "correctAnswerIndex": 2,
    "pointValue": 3},

    {"question": "What cannot be found in space?",
    "answers": ['Sound waves', 'Diamonds', 'Gravity', 'Ice giants'],
    "correctAnswerIndex": 0,
    "pointValue": 3},

];


function startQuiz(){

    qNumberTextNode.textContent = questionNumber;
    questionNumberArea.appendChild(qNumberTextNode);

    scoreTextNode.textContent = score;
    hidePage(landingPage);
    setupQuizQuestion(quizQuestions);
    showPage(quizPage);
}

function endQuiz(){

    score = 0;
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
    let answerChoices = quizQuestions[counter].answers;
    pointValue = quizQuestions[counter].pointValue;

    console.log(counter);
    console.log(currentQuestion);
    console.log(answerChoices);

    //Create the paragraph to ask the question
    let questionText = document.createElement("h2");
    questionText.innerText = currentQuestion;

    console.log(questionText.innerText);

    
    questionArea.appendChild(questionText);

    // append the difficulty level to difficultyLevel depending
    // on the question's point value
    if (pointValue == 1) {

        difficulty = "Easy";

    } else if (pointValue == 2) {

        difficulty = "Medium";

    } else if (pointValue >= 3) {

        difficulty = "Hard";

    }

    // after the difficulty level is evaluated, append it
    // to the difficultyLevel p element
    difficultyTextNode.textContent = difficulty;
    difficultyLevel.appendChild(difficultyTextNode);

    //Create the unordered list to display the answers
    let selectBox = document.createElement("select");

    for (let i = 0; i < answerChoices.length; i++){
        let option = document.createElement("option");
        option.value = i;
        option.innerText = answerChoices[i];

        console.log(option.value);
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