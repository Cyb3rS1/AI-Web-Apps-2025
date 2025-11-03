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

// fetching questions for API call
function buildApiString(questionAmount, questionCategory, questionDifficulty) {

    return "https://opentdb.com/api.php?amount="+questionAmount+"&category="+questionCategory+"&difficulty="+questionDifficulty+"&type=multiple";

}


// builds a url for obtaining info about one category
function buildCategoryInfoString(categoryId) {

    return "https://opentdb.com/api_count.php?category="+categoryId;


}


// (default question difficulty and question amount)
let questionAmount = 5;
let questionCategory = 9; // Category 9 = ANY
let questionDifficulty = "medium";
let difficulty_levels = ["easy", "medium", "hard"];
const MAX_QUESTION_PULL = 50; // per API call
const categoriesUrl = "https://opentdb.com/api_category.php";
let url = buildApiString(questionAmount, questionCategory, questionDifficulty);


let question_bank = [];

let question_category_info = [];

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

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



// builds question objects based on the API url passed into it
async function getQuestions(){

    try {

        // check to see if the categories were saves, reestablish them if they are not
        const cacheCategories = JSON.parse(localStorage.getItem("question_category_info") || "[]");

        // check to see if the questions are in the bank, get new questions if they are not
        const cacheQuestions = JSON.parse(localStorage.getItem("question-bank") || "[]");
        const meta = JSON.parse(localStorage.getItem("question-meta-info") || "{}");

        const last_fetched = Number(meta.last_fetched) || 0;
        const ageMs = Date.now() - last_fetched;
        console.log("Age since last API fetch (ms): ", ageMs);

        // if cache exists and it's "fresh enough"
        if (cacheCategories.length > 0 && cacheQuestions.length && ageMs < 2000) {

            question_category_info = cacheCategories;
            console.log("Loaded locally stored category and question data (cache)")
            return;
        }

        // otherwise call the API // start with obtaining the question information
        // (categories, num of questions per difficulty)

        // fetch the url containing all the question categories
        const categoriesRes = await fetch(categoriesUrl);
        const categoriesData = await categoriesRes.json();

        if (!categoriesData || !categoriesData.trivia_categories) {
            console.warn("Categories undefined, retrying...");
            setTimeout(getCategories, 1000);
            return;
        }

        // console.log("We have categories!");

        // for each category, make a new thisCategory object
        for (let category of categoriesData.trivia_categories) {

            // make a new thisCategory object and insert the info from the categoriesUrl (id and name)
            let thisCategory = {
                id: category.id,
                name: category.name,
            };

            // fetch the current category by its ID
            let categoryQuestionCountsUrl = buildCategoryInfoString(category.id);
            const categoryQuestionCountsRes = await fetch(categoryQuestionCountsUrl);
            const categoryQuestionCountsData = await categoryQuestionCountsRes.json();

            if (!categoryQuestionCountsData || !categoryQuestionCountsData.category_question_count) {
                console.warn("Categories Info undefined, retrying...");
                setTimeout(() => {

                    fetch(categoryQuestionCountsUrl)
                    .then(categoryQuestionCountsRes => categoryQuestionCountsRes.json())
                    .then(categoryQuestionCountsData => console.log(categoryQuestionCountsData));
                    
                }, 1000);
                return;
            }

            // console.log("We have category info for category " + category.id + "!"); // WORKS

            // add the corresponding question amounts to each category
            thisCategory.easy_question_count = categoryQuestionCountsData.category_question_count.total_easy_question_count;
            thisCategory.medium_question_count = categoryQuestionCountsData.category_question_count.total_medium_question_count;
            thisCategory.hard_question_count = categoryQuestionCountsData.category_question_count.total_hard_question_count;
            
            question_category_info.push(thisCategory);

            // create an option in the select box for each category
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            selectCategory.appendChild(option);

        }

        localStorage.setItem("question-categories", JSON.stringify(question_category_info));

        // console.log(question_category_info); // WORKS

        // console.log("We have categories!");

        } catch {

        console.warn("Error loading API url request, too many questions?");
    }

    let totalCategories = question_category_info.length;

    for (let i = 0; i < totalCategories; i++) {

        let category = question_category_info[i];

        console.log(category);

        // build base structure for this category
        const thisCategory = {
        category: category.name,
        difficulties: { 
            easy: [], 
            medium: [], 
            hard: [] }
        };

    for (let difficulty_level of difficulty_levels) {

        console.log(`--- Starting ${difficulty_level} for ${category.name} ---`);

        url = buildApiString(MAX_QUESTION_PULL, category.id, difficulty_level);

      try {
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.results) {
          console.warn(`⚠️ No results for ${category.name}, ${difficulty_level}`);
          continue;
        }

        data.results.forEach(element => {
          let thisQuestion = {
            question: element.question,
            answers: [...element.incorrect_answers, element.correct_answer],
            correctAnswerIndex: element.incorrect_answers.length,
            category: element.category,
            difficulty: element.difficulty,
            pointValue:
              element.difficulty === "easy" ? 1 :
              element.difficulty === "medium" ? 3 : 5
          };

          // Randomize answers
          let randomizedAnswers = randomizeAnswers(thisQuestion.answers);
          thisQuestion.answers = randomizedAnswers.answers;
          thisQuestion.correctAnswerIndex = randomizedAnswers.correctAnswerIndex;

          thisCategory.difficulties[difficulty_level].push(thisQuestion);
        });

        console.log(`✅ Loaded ${difficulty_level} questions for ${category.name}`);

      } catch (err) {
        console.error("❌ Error fetching:", err);
      }

      // wait 5 seconds before next difficulty
      await sleep(5000);
    }

    // after all difficulties for this category
    if (!question_bank.find(c => c.category === thisCategory.category)) {
      question_bank.push(thisCategory);
    }

    localStorage.setItem("question-bank", JSON.stringify(question_bank));

    // progress log
    console.log(`📦 Saved category '${category.name}' to localStorage`);
    console.log(`Progress: ${i + 1} / ${totalCategories} categories complete`);

  }

   // retrieve it as a string
    const savedBank = localStorage.getItem("question-bank");

    // parse back into an object
    const questionBankObj = JSON.parse(savedBank);

    // log it
    console.log("📦 Question Bank:", questionBankObj);

  console.log("🎉 All categories finished!");
}

// gets questions according to the results of the default API call
getQuestions();


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