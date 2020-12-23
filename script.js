const mealsEl = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-noils");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

const mealInfoEl = document.getElementById("meal-info")

const mealPopup = document.getElementById("meal-popup");
const popupCloseBtn = document.getElementById("popup");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal(){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData = await resp.json();
    const randomMeal = respData.meals[0];


    addMeal(randomMeal, true);
}
async function getMealById(id){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);

    const respData = await resp.json();

    const meal = respData.meals[0];

    return meal;
}
async function getMealBySearch(term){
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);

    const respData = await resp.json();
    const meals = respData.meals;

    return meals;
}
function addMeal(mealData, random = false){
    const meal = document.createElement("div");
    meal.classList.add("neal");
    meal.innerHTML = `
    <div class="neal-header">
    ${random ? `
        <span class="random">Random Recipe</span>` : ""}
        <img src="${mealData.strMealThumb}">
    </div>
    <div class="neal-body">
        <h4>${mealData.strMeal}</h4>
            <button class="fav-btn"><i class="fas fa-heart"></i></button>
    </div>
    `;

    const heart = meal.querySelector(".fa-heart");
    heart.addEventListener("click", () => {
        if(heart.classList.contains("active")){
            removeMealLS(mealData.idMeal);
            heart.classList.remove("active");
        } else {
            addMealToLS(mealData.idMeal);
            heart.classList.add("active");
        }
        fetchFavMeals();
    });

    meal.addEventListener("click", () => {
        showMealInfo(mealData);
    })

    mealsEl.appendChild(meal);
}

function addMealToLS(mealId){
    const mealIds = getMealsLS();

    localStorage.setItem("mealIds",JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId){
    const mealIds = getMealsLS();

    localStorage.setItem("mealIds",JSON.stringify (mealIds.filter(id => id !== mealId)));
}

function getMealsLS(){
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));

    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals(){
    favoriteContainer.innerHTML = ``;

    const mealIds = getMealsLS();

    const meals = [];

    for(let i = 0; i < mealIds.length;i++){
        const mealId = mealIds[i];

        meal = await getMealById(mealId);

        addMealToFav(meal);
    }
}

function addMealToFav(mealData){
    const favMeal = document.createElement("li");

    favMeal.innerHTML = `
        <img src="${mealData.strMealThumb}">
        <span>${mealData.strMeal}</span>
        <button class="clear"><i class="fa fa-times"></i></button>
    `;

    const btn = favMeal.querySelector(".fa-times");

    favMeal.addEventListener("click", () => {
        showMealInfo(mealData);
    })

    btn.addEventListener("click", () => {
        removeMealLS(mealData.idMeal);

        fetchFavMeals();
    })

    favoriteContainer.appendChild(favMeal);
}

searchBtn.addEventListener("click", async () => {
    mealsEl.innerHTML = ``;
    const search = searchTerm.value;

    const meals = await getMealBySearch(search);

    if(meals){
        meals.forEach(meal => {
            addMeal(meal);
        });
    }
});

function showMealInfo(mealData) {
    mealInfoEl.innerHTML = ``;

    const mealEl = document.createElement("div");

    const ingredients = []

    for(let i = 1; i < 20;i++){
        if(mealData['strIngredient' + i]){
            ingredients.push(`${mealData['strIngredient' + i]} / ${mealData['strMeasure' + i]}`);
        } else {
            break;
        }
    }

    mealInfoEl.appendChild(mealEl);

    mealEl.innerHTML = `
        <div>
            <h1>${mealData.strMeal}</h1>
            <img src="${mealData.strMealThumb}">
        </div>
        <div>
            <p>${mealData.strInstructions}</p>
            <h3>Ingredients:</h3>
            <ul>
                ${ingredients.map(ing => `
                <li>${ing}</li>
                ` ).join('')}
            </ul>
        </div>
    `

    mealPopup.classList.remove("hidden");
}

popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});

