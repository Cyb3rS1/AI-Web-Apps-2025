// page elements
const landingPage = document.getElementById("landing-page");
const quizPage = document.getElementById("quiz-page");
const questionArea = document.getElementById("question-area");
const quizMessageBox = document.getElementById("quiz-message-box");

// buttons
const btnStart = document.getElementById("btn-start");
const btnCheckAnswer = document.getElementById("btn-check-answer");
const btnNext = document.getElementById("btn-next"); 
const btnTryAgain = document.getElementById("btn-try-again");
const btnsEnd = document.querySelectorAll('.btn-end');
const allButtons = document.querySelectorAll("button");

// modals
let winModal = document.getElementById("win-modal");
let loseModal = document.getElementById("lose-modal");
let endModal = document.getElementById("end-modal");

let selectedAnswer;
let counter = 0;

// function that configures all the buttons at once
allButtons.forEach(button => {

    button.addEventListener('click', function(event){
        event.preventDefault();
    })
})

btnsEnd.forEach(button => {

    button.addEventListener('click', function(event){
    
    questionArea.innerHTML = '';
    counter = 0;

    hidePage(currentModal);
    endQuiz();

    })
})

btnStart.addEventListener('click', function(event){
    startQuiz();
});

btnCheckAnswer.addEventListener('click', function(event){
    checkAnswer(quizQuestions);
});

btnNext.addEventListener('click', function(event) {
    nextQuestion();
})

btnTryAgain.addEventListener('click', function(event) {
    hidePage(currentModal);
})


let quizQuestions = [

    {"question": "What color is the sky?",
    "answers": ['red', 'blue', 'yellow', 'turtles'],
    "correctAnswerIndex": 1},

    {"question": "What is the largest sea in the world?",
    "answers": ['Arabian Sea', 'Coral Sea', 'Carribean Sea', 'Philippine Sea'],
    "correctAnswerIndex": 3},

    {"question": "What galaxy are we in?",
    "answers": ['Andromeda', 'Milky Way', 'Canis Major Dwarf', 'Snickers'],
    "correctAnswerIndex": 1},

    {"question": "What is the rarest element in the universe?",
    "answers": ['Palladium', 'Oxygen', 'Astatine', 'Scandium'],
    "correctAnswerIndex": 2},

    {"question": "What cannot be found in space?",
    "answers": ['Sound waves', 'Diamonds', 'Gravity', 'Ice giants'],
    "correctAnswerIndex": 0},

];

function startQuiz(){

    hidePage(landingPage);
    setupQuizQuestion(quizQuestions);
    showPage(quizPage);
}

function endQuiz(){

    hidePage(currentModal);
    hidePage(quizPage);
    showPage(landingPage);
    
}

function nextQuestion(){

    hidePage(currentModal);

    questionArea.innerHTML = '';

    counter++;

    setupQuizQuestion(quizQuestions);

}

function setupQuizQuestion(quizQuestions){

    console.log(counter);

    let currentQuestion = quizQuestions[counter].question;
    let answerChoices = quizQuestions[counter].answers;

    console.log(currentQuestion);
    console.log(answerChoices);

    //Create the paragraph to ask the question
    let questionText = document.createElement("p");
    questionText.innerText = currentQuestion;

    console.log(questionText.innerText);

    questionArea.appendChild(questionText);
        
    //Create the unordered list to display the answers
    let selectBox = document.createElement("select");

    for(let i = 0; i < answerChoices.length; i++){
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

    if(selectedAnswer == quizQuestions[counter].correctAnswerIndex){

        currentModal = winModal;

        if (counter == quizQuestions.length -1) {

            currentModal = endModal;
        }

    } else {

        currentModal = loseModal;
    }

    // displays currentModal
    showPage(currentModal);
}

hidePage(quizPage);

function showPage(pageToShow){
    pageToShow.style.display = "inline";
}

function hidePage(pageToHide){
    pageToHide.style.display = "none";
}