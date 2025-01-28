// Global gameState object
let gameState = {
    grossIncome: 0,
    netIncome: 0,
    currentBalance: 0,
    allowances: 0,
    month: "January",
    housingType: "none",
    housingCost: 0,
    downPayment: 0,
    carType: "none",
    carCost: 0,
    investments: null,
    creditBalance: 0,
    loanBalance: 0,
    monthlyBudget: "balanced", // "cheapest", "balanced", or "extravagant"
    housingChoice: "none", // "cheapRent", "midRent", or "expensiveBuy"
    stressPoints: 0,
    decisionScore: 0,
    eventsTriggered: [], // Keeps track of triggered events
};

// Events object containing all possible outcomes
const events = {
    "Housing Disaster": {
        description: "Your cheap rental has a leaky roof. Repairs cost $1,200.",
        cost: 1200,
        stress: 2,
    },
    "Health Crisis": {
        description: "Cheap food choices lead to a minor illness. Medical bills: $750.",
        cost: 750,
        stress: 3,
    },
    "Tax Audit": {
        description: "A tax audit reveals you owe $1,000 in unpaid taxes.",
        cost: 1000,
        stress: 2,
    },
    "Bonus at Work": {
        description: "Your boss awards you a $500 bonus for excellent performance!",
        reward: 500,
        stress: -1,
    },
    "Landlord Discount": {
        description: "Your landlord offers a $100 monthly discount for being reliable.",
        reward: 100,
        stress: -1,
    },
    "Unexpected Windfall": {
        description: "You receive a $750 bonus for being employee of the month!.",
        reward: 750,
        stress: 0,
    },
    /* --- NEW EVENTS BELOW --- */
    "Minor Setback": {
        description: "Your minimalist lifestyle plus zero tax withholdings caused a minor setback. A $200 emergency expense arises!",
        cost: 200,
        stress: 3,
    },
    "Major Catastrophe": {
        description: "Your big salary, no tax withholdings, cheapest spending, and refusal to buy a house triggered a major catastrophe! It cost you $800 to fix.",
        cost: 800,
        stress: 5,
    },
    "JuneDoubleTrouble": {
        description: "You suffer from burnout, requiring a brief hospital stay. The cost is $1,800.",
        cost: 1800,
        stress: 3,
    },
  };

// Function to trigger an event
function triggerEvent(eventKey) {
    const event = events[eventKey];
    if (!event) {
        console.error(`Event "${eventKey}" not found.`);
        return;
    }

    // Apply rewards or penalties
    if (event.cost) {
        gameState.currentBalance -= event.cost;
    }
    if (event.reward) {
        gameState.currentBalance += event.reward;
    }
    if (event.stress !== undefined) {
        gameState.stressPoints += event.stress;
    }

    // Keep a record of all triggered event descriptions (for logging or later display)
    gameState.eventsTriggered.push(eventKey);

    // Save changes to localStorage
    saveGameState();

    console.log(`Triggered Event: ${event.description}`);
}
function saveName() {
    const name = document.getElementById('player-name').value.trim();
    if (name) {
        gameState.username = name;
        document.getElementById('user-name').textContent = name;
        document.getElementById('name-input-section').style.display = 'none';
        document.getElementById('allowances-section').style.display = 'block';
        saveGameState();
    } else {
        alert('Please enter your name to continue.');
    }
}


function toggleInfoPanel() {
    const infoPanel = document.getElementById('info-panel');
    const overlay = document.getElementById('overlay');
    if (infoPanel.style.display === 'none' || infoPanel.style.display === '') {
        infoPanel.style.display = 'block';
        overlay.style.display = 'block';
    } else {
        infoPanel.style.display = 'none';
        overlay.style.display = 'none';
    }
}

// Optional: Close the panel when clicking outside of it
document.addEventListener('click', function(event) {
    const infoPanel = document.getElementById('info-panel');
    const overlay = document.getElementById('overlay');
    if (!event.target.closest('.info-panel') && !event.target.closest('.info-icon') && infoPanel.style.display === 'block') {
        infoPanel.style.display = 'none';
        overlay.style.display = 'none';
    }
});



// Load and Save functions
function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
  }
let selectedHovercraft = null;

/* --- EVENTS FOR SURPRISES/REWARDS --- */

function postMarchEvent() {
    console.log("postMarchEvent called.");
    console.log("monthlyBudget:", gameState.monthlyBudget);
    console.log("housingChoice:", gameState.housingChoice);
  
    // 1) Check if the user has the highest-paying job + 0 allowances + cheapest food
    //    We'll assume "highest-paying job" means grossIncome > 5000 (adjust as needed).
    //    For "cheapest food," let's say they selected monthlyFood < 100 in Feb.
    const highestPaying = (gameState.grossIncome >= 3000 && gameState.allowances >= 3);
    const cheapestFoodChosen = (gameState.monthlyFood && gameState.monthlyFood < 100);
  
    // 2) Check if they had enough money to buy a house but still chose "cheapRent"
    //    We'll define "enough money to buy" if user can afford at least the cheapest mortgage (like $266.20).
    //    The user also must have picked "rent" with monthlyCost = 650 in March.
    //    (In your code, that means `housingChoice = "cheapRent"`, if you unify it.)
    
    //    Let's see if they "could afford" at least a down payment + $266 mortgage:
    const couldBuy = (gameState.currentBalance >= 2000 && gameState.monthlyBudget !== "cheapest"); 
    // ^ or define your own logic for "could buy"
  
    // 3) BIGGEST NEGATIVE condition:
    //    Highest paying job, 0 allowances, cheapest food, and had enough $ to buy but rented anyway => Major Catastrophe
    if (
      highestPaying &&
      cheapestFoodChosen &&
      couldBuy &&
      // also confirm they actually DID rent (like `housingChoice === "cheapRent"`)
      (gameState.housingChoice === "cheapRent")
    ) {
      triggerEvent("Major Catastrophe");
      return "Major Catastrophe";
    }
  
    // 4) SMALL NEGATIVE condition:
    //    If user only meets the "highest paying job, 0 allowances, cheapest food" but not the other criteria => Minor Setback
    else if (highestPaying && cheapestFoodChosen) {
      triggerEvent("Minor Setback");
      return "Minor Setback";
    }
  
    // 5) Then your existing checks:
    if (gameState.monthlyBudget === "cheapest" && gameState.housingChoice === "cheapRent") {
      triggerEvent("Housing Disaster");
      return "Housing Disaster";
    }
    else if (gameState.monthlyBudget === "cheapest" && gameState.housingChoice !== "cheapRent") {
      triggerEvent("Health Crisis");
      return "Health Crisis";
    }
    else if (gameState.monthlyBudget === "balanced" && gameState.housingChoice === "midRent") {
      triggerEvent("Bonus at Work");
      return "Bonus at Work";
    }
    else if (gameState.monthlyBudget === "balanced" && gameState.housingChoice === "expensiveBuy") {
      triggerEvent("Landlord Discount");
      return "Landlord Discount";
    }
    else {
      // Default
      triggerEvent("Unexpected Windfall");
      return "Unexpected Windfall";
    }
  }

  

/* --- ADD EVENTS INTO MONTHLY TRANSITIONS --- */

// After March transition
function proceedToApril() {
    console.log("proceedToApril called");
    postMarchEvent(); // Trigger March surprises/rewards
    gameState.month = "April";
    saveGameState();
    window.location.href = "april.html";
}

// After June transition


/* ----- JANUARY FUNCTIONS ----- */


function initJanuary() {
    loadGameState();
    if (gameState.username) {
        document.getElementById("user-name").textContent = gameState.username;
    }
}

function selectJob(salary) {
    gameState.grossIncome = salary;
    document.getElementById("gross-salary").textContent = formatCurrency(salary);

    // Hide job selection and show W4 form with name input first
    document.getElementById("job-selection").style.display = "none";
    document.getElementById("w4-form").style.display = "block";
    document.getElementById("name-input-section").style.display = "block";
    document.getElementById("allowances-section").style.display = "none";
}

function calculateNetPay() {
    const allowance1 = parseInt(document.getElementById("allowance1").value) || 0;
    const allowance2 = parseInt(document.getElementById("allowance2").value) || 0;
    const allowance3 = parseInt(document.getElementById("allowance3").value) || 0;
    let totalAllowances = allowance1 + allowance2 + allowance3;
    if (totalAllowances > 4) totalAllowances = 4;
    gameState.allowances = totalAllowances;

    const gross = gameState.grossIncome;
    const ssDeduction = gross * 0.038;
    const taxRates = [0.21, 0.15, 0.12, 0.10, 0.08];
    const incomeTax = gross * taxRates[totalAllowances];
    const net = gross - ssDeduction - incomeTax;

    gameState.netIncome = net;
    gameState.currentBalance = net;
    gameState.incomeTax = incomeTax;

    // Update left panel
    document.getElementById("income-tax").textContent = formatCurrency(incomeTax);
    document.getElementById("net-income").textContent = formatCurrency(net);
    document.getElementById("checking-account").textContent = formatCurrency(gameState.currentBalance);
    document.getElementById("total-cash").textContent = formatCurrency(gameState.currentBalance);

    // Show summary
    document.getElementById("result-gross").textContent = formatCurrency(gross);
    document.getElementById("result-ss").textContent = formatCurrency(ssDeduction);
    document.getElementById("result-tax").textContent = formatCurrency(incomeTax);
    document.getElementById("result-net").textContent = formatCurrency(net);

    // Hide W4 form and show results section with Continue button
    document.getElementById("w4-form").style.display = "none";
    document.getElementById("results-section").style.display = "block";

    saveGameState();
}

function loadGameState() {
    const state = localStorage.getItem('gameState');
    if (state) {
        gameState = JSON.parse(state);

        // Ensure all necessary properties exist
        if (!gameState.eventsTriggered) {
            gameState.eventsTriggered = [];
        }

        // Initialize stressPoints, loanBalance, and creditBalance if they are null or undefined
        gameState.transactionLog = gameState.transactionLog || [];
        gameState.eventsTriggered = gameState.eventsTriggered || [];
        gameState.stressPoints = gameState.stressPoints || 0;
        gameState.loanBalance = gameState.loanBalance || 0;
        gameState.creditBalance = gameState.creditBalance || 0;
        gameState.currentBalance = gameState.currentBalance || 0;
        gameState.decisionScore = gameState.decisionScore || 0;
        gameState.vacationChoice = gameState.vacationChoice || "none";
    } else {
        // Initialize default values if no gameState exists in localStorage
        gameState = {
            grossIncome: 0,
            netIncome: 0,
            currentBalance: 0,
            allowances: 0,
            month: "January",
            housingType: "none",
            housingCost: 0,
            downPayment: 0,
            carType: "none",
            carCost: 0,
            investments: null,
            creditBalance: 0,
            loanBalance: 0,
            monthlyBudget: "balanced", // "cheapest", "balanced", or "extravagant"
            housingChoice: "none", // "cheapRent", "midRent", or "expensiveBuy"
            stressPoints: 0, // Initialized to 0
            decisionScore: 0,
            eventsTriggered: [], // Keeps track of triggered events
            vacationChoice: "none", // Added to track vacation choice
        };
    }
    console.log("Loaded Game State:", gameState); // Debugging
}

/**
 * Updates the player's balance and logs the transaction.
 * @param {number} amount - The amount to add (positive) or subtract (negative).
 * @param {string} description - Description of the transaction.
 */
function updateBalance(amount, description) {
    // Validate that amount is a number
    if (typeof amount !== 'number') {
        console.error(`updateBalance Error: Amount must be a number. Received: ${amount}`);
        return;
    }

    // Calculate new balance
    const oldBalance = gameState.currentBalance;
    const newBalance = oldBalance + amount;
    gameState.currentBalance = newBalance;

    // Create transaction entry
    const transaction = {
        date: new Date().toLocaleString(),
        amount: amount,
        description: description || "No description",
        balanceAfter: newBalance,
    };

    // Add to transaction log
    gameState.transactionLog.push(transaction);

    // Log to console
    const action = amount >= 0 ? "Income" : "Expense";
    console.log(`--- Transaction ---`);
    console.log(`Date: ${transaction.date}`);
    console.log(`Type: ${action}`);
    console.log(`Description: ${transaction.description}`);
    console.log(`Amount: ${formatCurrency(amount)}`);
    console.log(`Balance After Transaction: ${formatCurrency(newBalance)}`);
    console.log(`-------------------`);
}
 

function formatCurrency(amount) {
    if (typeof amount !== 'number') {
        console.warn(`formatCurrency Warning: Received non-number value: ${amount}. Defaulting to $0.00.`);
        return "$0.00";
    }
    return "$" + amount.toFixed(2);
}

function proceedToFebruary() {
    // Example implementation to proceed to February
    console.log('Proceeding to February...');
    // Add your logic to transition to the next month
    window.location.href = 'february.html'; // Assuming you have a February page
}


/* ----- FEBRUARY FUNCTIONS ----- */
function initFebruary() {
    loadGameState();
    if (gameState.username) {
        document.getElementById("user-name").textContent = gameState.username;
    }
     // Add previous month's net income *before* anything else
    gameState.currentBalance += gameState.netIncome;
   
   // Show carried-over values from January
    document.getElementById("gross-salary").innerText = formatCurrency(gameState.grossIncome);
    document.getElementById("net-income").innerText = formatCurrency(gameState.netIncome);
    document.getElementById("income-tax").innerText = formatCurrency(gameState.incomeTax); 
    document.getElementById("checking-account").innerText = formatCurrency(gameState.currentBalance);
    document.getElementById("total-cash").innerText = formatCurrency(gameState.currentBalance);

    // Initialize expenses to 0 (they are calculated in calculateFebruaryExpenses())
    document.getElementById("food-expense").textContent = formatCurrency(0);
    document.getElementById("housing-expense").textContent = formatCurrency(0);
    document.getElementById("transport-expense").textContent = formatCurrency(0);
    document.getElementById("slime-expense").textContent = formatCurrency(0);
    document.getElementById("total-expenses").textContent = formatCurrency(0);

}

function calculateFebruaryExpenses() {
    const food = parseFloat(document.getElementById("foodSelect").value) || 0;
    const transport = parseFloat(document.getElementById("transportSelect").value) || 0;
    const slime = parseFloat(document.getElementById("slimeSelect").value) || 0;
    const housing = 100; // fixed

    const totalExpenses = food + transport + slime + housing;

    // Record monthly spending
    gameState.monthlyFood = food;
    gameState.monthlyHousing = housing;
    gameState.monthlyTransport = transport;
    gameState.monthlySlime = slime;

    // Deduct from currentBalance AFTER adding income
    let newNetIncome = gameState.netIncome; // If you're treating net as "net of monthly expenses"
    gameState.currentBalance -= totalExpenses;
    gameState.netIncome = newNetIncome; 

    // Track the user's budget choices for February
    gameState.monthly_budget_choices = {
        food: food,
        transport: transport,
        slime: slime
    };

    // ---- NEW LOGIC: Determine monthlyBudget string ----
    // If user picks the cheapest possible for food & transport, set monthlyBudget to "cheapest"
    if (food <= 100 && transport <= 75) {
        gameState.monthlyBudget = "cheapest";
    } else {
        // Feel free to add more logic here (e.g., "balanced", "extravagant")
        gameState.monthlyBudget = "balanced";
    }

    // Stress & Decision Score updates
    if (food < 100) {
        gameState.stressPoints += 1; // Cheap food increases stress
        console.log("Stress added: Skimped on food.");
    }
    if (transport < 75) {
        gameState.stressPoints += 1; // Cheap transport increases stress
        console.log("Stress added: Skimped on transport.");
    }

    // Additional logic for decisionScore
    if (gameState.monthly_budget_choices) {
        if (
            food === 100 &&
            transport === 75 &&
            slime === 0
        ) {
            gameState.decisionScore -= 2; // All minimal
        } else if (
            food === 125 ||
            transport === 150 ||
            slime === 50
        ) {
            gameState.decisionScore -= 1; // Some moderate choices
        } else if (
            food === 150 &&
            transport === 150 &&
            slime === 50
        ) {
            gameState.decisionScore += 1; // High-end spending
        }
    } else {
        console.log("monthly_budget_choices is undefined. Did you forget to select values?");
    }

    console.log(
        "February Expenses - Food:", food,
        "Transport:", transport,
        "Slime:", slime
    );
    console.log("decisionScore:", gameState.decisionScore);
    console.log("Current Game State:", gameState);
    console.log("Stress added: Skimped on food. Current stressPoints:", gameState.stressPoints);

    // Update left panel
    document.getElementById("food-expense").textContent = formatCurrency(food);
    document.getElementById("housing-expense").textContent = formatCurrency(housing);
    document.getElementById("transport-expense").textContent = formatCurrency(transport);
    document.getElementById("slime-expense").textContent = formatCurrency(slime);
    document.getElementById("total-expenses").textContent = formatCurrency(totalExpenses);
    document.getElementById("checking-account").textContent = formatCurrency(gameState.currentBalance);
    document.getElementById("total-cash").textContent = formatCurrency(gameState.currentBalance);

    // Show main results
    document.getElementById("feb-gross").textContent = formatCurrency(gameState.grossIncome);
    document.getElementById("feb-tax").textContent = formatCurrency(gameState.incomeTax);
    document.getElementById("feb-net").textContent = formatCurrency(newNetIncome);
    document.getElementById("feb-total-expenses").textContent = formatCurrency(totalExpenses);
    document.getElementById("feb-checking").textContent = formatCurrency(gameState.currentBalance);
    document.getElementById("feb-results").style.display = "block";

    // Finally, save changes
    saveGameState();
}
function proceedToMarch() {
    gameState.month = "March";
    saveGameState();
    window.location.href = "march.html";
}

/* ----- MARCH FUNCTIONS ----- */
let monthlyBudget = 0;
let maxHousePrice = 0;

/* ----- MARCH FUNCTIONS ----- */
function initMarch() {
    loadGameState();

    if (gameState.username) {
        document.getElementById("user-name").textContent = gameState.username;
    }

    // Add net income to current balance
    gameState.currentBalance += gameState.netIncome;

    // Display left panel values
    document.getElementById("gross-salary").textContent = formatCurrency(gameState.grossIncome);
   document.getElementById("income-tax").textContent = formatCurrency(gameState.incomeTax);
    document.getElementById("net-income").textContent = formatCurrency(gameState.netIncome);
    document.getElementById("checking-account").textContent = formatCurrency(gameState.currentBalance);
    document.getElementById("total-cash").textContent = formatCurrency(gameState.currentBalance);

    // Display February expenses
    document.getElementById("food-expense").textContent = formatCurrency(gameState.monthlyFood || 0);
    document.getElementById("housing-expense").textContent = formatCurrency(100); // Fixed housing cost
    document.getElementById("transport-expense").textContent = formatCurrency(gameState.monthlyTransport || 0);
    document.getElementById("slime-expense").textContent = formatCurrency(gameState.monthlySlime || 0);
    document.getElementById("total-expenses").textContent = formatCurrency(
        (gameState.monthlyFood || 0) + 100 + (gameState.monthlyTransport || 0) + (gameState.monthlySlime || 0)
    );

    // Update middle section with dynamic values
    document.getElementById("march-gross-income").textContent = formatCurrency(gameState.grossIncome);
    document.getElementById("march-transport-cost").textContent = formatCurrency(gameState.monthlyTransport || 0);
    document.getElementById("march-housing-cost").textContent = formatCurrency(100); // Fixed housing cost
    document.getElementById("march-slime-cost").textContent = formatCurrency(gameState.monthlySlime || 0);

    // Add console logs for troubleshooting
    console.log("Loaded March Game State:", gameState);
}
function calculateHouseAffordability() {
    const downPayment = parseFloat(document.getElementById("downPayment").value) || 0;
    const loanTerm = parseInt(document.getElementById("loanTerm").value) || 30;

    // First check if they have enough for the down payment
    if (downPayment > gameState.currentBalance) {
        alert("You don't have enough funds for this down payment!");
        return;
    }

    // Keep numeric calculation separate
    let monthlyBudgetNumber = gameState.netIncome * 0.30;
    gameState.monthlyBudgetNumber = monthlyBudgetNumber;

    // Calculate down payment percentage of current balance
    let downPaymentPercentage = (downPayment / gameState.currentBalance) * 100;

    // Determine house affordability level based on down payment percentage
    let affordabilityLevel = 0;
    if (downPaymentPercentage >= 81) {
        affordabilityLevel = 4; // All options
    } else if (downPaymentPercentage >= 66) {
        affordabilityLevel = 3; // Up to 79k
    } else if (downPaymentPercentage >= 50) {
        affordabilityLevel = 2; // Up to 64k
    } else {
        affordabilityLevel = 1; // Only rent
    }

    // Calculate adjusted house price based on affordability level
    let adjustedHousePrice = 0;
    switch (affordabilityLevel) {
        case 4:
            adjustedHousePrice = 85000; // All options
            break;
        case 3:
            adjustedHousePrice = 79000; // Up to 79k
            break;
        case 2:
            adjustedHousePrice = 64000; // Up to 64k
            break;
        case 1:
        default:
            adjustedHousePrice = 50000; // Up to 50k
            break;
    }

    // Store values in game state
    gameState.maxHousePrice = adjustedHousePrice;
    gameState.downPayment = downPayment;
    gameState.downPaymentPercentage = downPaymentPercentage;
    gameState.affordabilityLevel = affordabilityLevel;

    // Show/hide housing options based on affordability
    document.getElementById("rent-option").style.display = "block"; // Always show rent
    document.getElementById("house-50k").style.display = affordabilityLevel >= 2 ? "block" : "none";
    document.getElementById("house-64k").style.display = affordabilityLevel >= 3 ? "block" : "none";
    document.getElementById("house-85k").style.display = affordabilityLevel >= 4 ? "block" : "none";

    // Update the UI with the numeric budget and house price
    document.getElementById("affordable-monthly").textContent = formatCurrency(monthlyBudgetNumber);
    document.getElementById("affordable-house").textContent = formatCurrency(adjustedHousePrice);

    // Debug logging
    console.log("Down Payment:", downPayment);
    console.log("Down Payment Percentage:", downPaymentPercentage + "%");
    console.log("Affordability Level:", affordabilityLevel);
    console.log("Adjusted House Price:", adjustedHousePrice);

    // Show/hide sections
    document.getElementById("housing-calculator").style.display = "none";
    document.getElementById("housing-results").style.display = "block";

    saveGameState();
}

function selectHousing(type, requiredDown, monthlyCost) {
    // Calculate affordability level based on down payment percentage
    let downPaymentPercentage = (gameState.downPayment / gameState.currentBalance) * 100;
    let affordableLevel = downPaymentPercentage >= 81 ? 4 :
                         downPaymentPercentage >= 66 ? 3 :
                         downPaymentPercentage >= 50 ? 2 : 1;

    // Check if down payment is affordable
    if (gameState.downPayment > gameState.currentBalance) {
        alert("You don't have enough for this down payment!");
        return;
    }

    // Handle rent option
    if (type === 'rent') {
        gameState.housingChoice = "cheapRent";
        gameState.downPayment = 0;
        gameState.housingType = "Rented";
        gameState.housingCost = monthlyCost;
        gameState.decisionScore -= 2;
        console.log("Housing Chosen: Rented");
    } 
    // Handle buy option
    else if (type === 'buy') {
        // Define house options with correct price points
        const houseOptions = [
            { level: 4, cost: 736.88, price: 85000 },
            { level: 3, cost: 476.04, price: 79000 },  // Corrected price for level 3
            { level: 2, cost: 266.20, price: 64000 }   // Corrected price for level 2
        ];

        // Find matching house option based on affordability and monthly cost
        const selectedHouse = houseOptions.find(house => 
            affordableLevel >= house.level && 
            Math.abs(monthlyCost - house.cost) < 0.01  // Using approximate equality for floating point
        );

        if (selectedHouse) {
            gameState.currentBalance -= gameState.downPayment;
            gameState.housingType = "Owned";
            gameState.housingCost = selectedHouse.cost;
            gameState.housePrice = selectedHouse.price;

            // Adjust decision score based on house price
            if (selectedHouse.price === 64000) {
                gameState.decisionScore -= 1;
            } else if (selectedHouse.price === 85000) {
                gameState.decisionScore += 1;
            }

            console.log("Selected House:", selectedHouse);
            console.log("Affordability Level:", affordableLevel);
            console.log("Monthly Cost:", monthlyCost);
        } else {
            console.log("No matching house found for:", {
                affordableLevel,
                monthlyCost,
                downPaymentPercentage
            });
            alert("You cannot afford this house with your current down payment percentage.");
            return;
        }
    }

    // Update UI
    document.getElementById("chosen-housing").textContent = gameState.housingType;
    document.getElementById("chosen-down").textContent = formatCurrency(gameState.downPayment);
    document.getElementById("chosen-monthly").textContent = formatCurrency(gameState.housingCost);
    document.getElementById("march-checking").textContent = formatCurrency(gameState.currentBalance);

    // Show final results
    document.getElementById("housing-results").style.display = "none";
    document.getElementById("march-final").style.display = "block";

    console.log("Decision Score Updated:", gameState.decisionScore);
    saveGameState();
}


function proceedToApril() {
    console.log("proceedToApril called");
    // Do not call postMarchEvent() here
    gameState.month = "April";
    saveGameState();
    window.location.href = "april.html";
}
function initApril() {
    // 1. Load game state
    loadGameState();
    console.log("Init April - Loaded Game State:", gameState);

    // 2. Display username, if available
    if (gameState.username) {
        document.getElementById("user-name").textContent = gameState.username;
    }
    
    // 3. Normal April finance setup
    const aprilGross = gameState.grossIncome;
    const aprilNet = gameState.netIncome;
    // Add April’s net to current balance
    gameState.currentBalance += aprilNet;
    // Ensure a default lease penalty
    gameState.carLeasePenalty = 0; 

    // Update left panel info
    document.getElementById("gross-salary").textContent = formatCurrency(aprilGross);
    document.getElementById("income-tax").textContent = formatCurrency(0);
    document.getElementById("net-income").textContent = formatCurrency(aprilNet);
    document.getElementById("checking-account").textContent = formatCurrency(gameState.currentBalance);
    document.getElementById("total-cash").textContent = formatCurrency(gameState.currentBalance);

    // 4. Calculate & display total expenses
    const monthlyFood = gameState.monthlyFood || 0;
    const monthlyHousing = gameState.housingCost || 0;
    const monthlyTransport = 0;    // If there's a cost in April, update this
    const monthlySlime = gameState.monthlySlime || 0;

    const totalExpenses = monthlyFood + monthlyHousing + monthlyTransport + monthlySlime;
    document.getElementById("food-expense").textContent = formatCurrency(monthlyFood);
    document.getElementById("housing-expense").textContent = formatCurrency(monthlyHousing);
    document.getElementById("transport-expense").textContent = formatCurrency(monthlyTransport);
    document.getElementById("slime-expense").textContent = formatCurrency(monthlySlime);
    document.getElementById("total-expenses").textContent = formatCurrency(totalExpenses);

    // 5. Trigger March event (so user sees it on the April page)
    let triggered = postMarchEvent(); 
    console.log("initApril - Event Triggered:", triggered);

    if (triggered) {
        // Show event container
        document.getElementById("march-event-container").style.display = "block";
        const eventDescription = events[triggered]?.description || "No event found.";
        document.getElementById("march-event-text").textContent = eventDescription;

        // Hide the car section until user clicks "Continue"
        document.getElementById("car-section").style.display = "none";
    } else {
        // No event triggered
        document.getElementById("march-event-container").style.display = "none";
        document.getElementById("car-section").style.display = "block";
    }

    // 6. Save changes
    saveGameState();
}
function continueFromMarchEvent() {
    // Hide the event container
    document.getElementById("march-event-container").style.display = "none";
    // Show the car-buying UI
    document.getElementById("car-section").style.display = "block";
}

function showHovercraftDetails(hovercraftName) {
    // Get the hovercraft details elements
    const titleElement = document.getElementById('hovercraft-title');
    const infoElement = document.getElementById('hovercraft-info');

    // Check if the elements exist
    if (!titleElement || !infoElement) {
        console.error("Error: 'hovercraft-title' or 'hovercraft-info' not found in the DOM.");
        return;
    }

    // Set the details based on the hovercraft name
    if (hovercraftName === 'X2001') {
        titleElement.textContent = 'X2001 Hovercraft';
        infoElement.innerHTML = `
            <p>Purchase Price: $22,000</p>
            <p>Monthly Lease Price with $2,000 Down: $305</p>
            <p>Three-year, 36,000-mile lease:</p>
            <ul>
                <li>15¢ per mile over lease allowance</li>
                <li>Return policy: $500 penalty</li>
                <li>Cost to purchase at lease end: $12,000</li>
            </ul>
        `;
    } else if (hovercraftName === 'Force Five Hovercraft') {
        titleElement.textContent = 'Force Five Hovercraft';
        infoElement.innerHTML = `
            <p>Purchase Price: $45,000</p>
            <p>Monthly Lease Price with $3,000 Down: $600</p>
            <p>Three-year, 36,000-mile lease:</p>
            <ul>
                <li>20¢ per mile over lease allowance</li>
                <li>Return policy: $750 penalty</li>
                <li>Cost to purchase at lease end: $20,000</li>
            </ul>
        `;
    } else {
        console.error("Invalid hovercraft name provided:", hovercraftName);
        return;
    }

    // Display the details section and hide the selection section
    document.getElementById('hovercraft-selection').style.display = 'none';
    document.getElementById('hovercraft-details').style.display = 'block';
}

function chooseOption(option) {
    if (!selectedHovercraft) {
        console.error('Error: No hovercraft selected.');
        alert('Please select a hovercraft before proceeding.');
        return;
    }

    selectedOption = option;

    const confirmationSection = document.getElementById('confirmation-section');
    const detailsSection = document.getElementById('hovercraft-details');
    detailsSection.style.display = 'none';
    confirmationSection.style.display = 'block';

    const confirmationTitle = document.getElementById('confirmation-title');
    const confirmationDetails = document.getElementById('confirmation-details');

    if (option === 'buy') {
        confirmationTitle.textContent = `Buy ${selectedHovercraft.name}`;
        confirmationDetails.innerHTML = `
            <p>Purchase Price: $${selectedHovercraft.purchasePrice?.toLocaleString()}</p>
            <p>You are choosing to buy this hovercraft outright.</p>
        `;
    } else if (option === 'lease') {
        confirmationTitle.textContent = `Lease ${selectedHovercraft.name}`;
        confirmationDetails.innerHTML = `
            <p>Down Payment: $${selectedHovercraft.leaseDown?.toLocaleString()}</p>
            <p>Monthly Payment: $${selectedHovercraft.monthlyLease?.toLocaleString()} for ${selectedHovercraft.leaseTerm} months</p>
            <p>End of Lease Purchase Option: $${selectedHovercraft.leasePurchasePrice?.toLocaleString()}</p>
        `;
    } else {
        console.error('Invalid option selected.');
        confirmationDetails.textContent = 'An error occurred. Please try again.';
    }
}

function selectHovercraft(hovercraftName) {
    if (hovercraftName === 'X2001') {
        selectedHovercraft = {
            name: 'X2001',
            purchasePrice: 22000,
            leaseDown: 2000,
            monthlyLease: 305,
            leaseTerm: 36,
            leasePurchasePrice: 12000,
        };
        // Save the car name at the time of selection
        gameState.carName = 'X2001';
    } else if (hovercraftName === 'Force Five Hovercraft') {
        selectedHovercraft = {
            name: 'Force Five Hovercraft',
            purchasePrice: 45000,
            leaseDown: 3000,
            monthlyLease: 600,
            leaseTerm: 36,
            leasePurchasePrice: 20000,
        };
        gameState.carName = 'Force Five Hovercraft';
    } else {
        console.error('Invalid hovercraft selected:', hovercraftName);
        return;
    }
    console.log('Selected Hovercraft:', selectedHovercraft);
    showHovercraftDetails(hovercraftName);
}

function confirmChoice() {
    const confirmationMessage = document.getElementById("confirmation-message");
    let monthlyPayment = 0; // Define this at the top level of the function
    
    if (selectedOption === 'buy') {
        const downPayment = selectedHovercraft.leaseDown;
        const purchasePrice = selectedHovercraft.purchasePrice;
        const interestRate = 0.085;
        const loanTerm = 3;
        const remainingAmount = purchasePrice - downPayment;
        const monthlyInterestRate = interestRate / 12;
        const totalPayments = loanTerm * 12;
        monthlyPayment = (remainingAmount * monthlyInterestRate) /
            (1 - Math.pow(1 + monthlyInterestRate, -totalPayments));

        if (gameState.currentBalance < downPayment) {
            confirmationMessage.textContent = "You do not have enough funds for the down payment.";
            confirmationMessage.style.color = "red";
            return;
        }

        // Update game state
        gameState.currentBalance -= downPayment;
        gameState.carType = 'Owned';
        gameState.carCost = monthlyPayment;
        gameState.transportExpenses = monthlyPayment;
        gameState.carPurchasePrice = selectedHovercraft.purchasePrice;

    } else if (selectedOption === 'lease') {
        const downPayment = selectedHovercraft.leaseDown;
        const monthlyLease = selectedHovercraft.monthlyLease;
        monthlyPayment = monthlyLease; // Set monthlyPayment for lease option

        if (gameState.currentBalance < downPayment) {
            confirmationMessage.textContent = "You do not have enough funds for the lease down payment.";
            confirmationMessage.style.color = "red";
            return;
        }

        // Update game state
        gameState.currentBalance -= downPayment;
        gameState.carType = 'Leased';
        gameState.carCost = monthlyLease;
        gameState.carName = selectedHovercraft.name;
        
        // Store lease penalty
        const leasePenalty = selectedHovercraft.name === "X2001" ? 1000 : 1000;
        localStorage.setItem('leasePenalty', leasePenalty);
    }

    // Show final results
    document.getElementById("chosen-vehicle").textContent = selectedHovercraft.name;
    document.getElementById("chosen-type").textContent = selectedOption === 'buy' ? 'Purchase' : 'Lease';
    document.getElementById("chosen-down").textContent = formatCurrency(selectedHovercraft.leaseDown);
    document.getElementById("chosen-monthly").textContent = formatCurrency(monthlyPayment);
    document.getElementById("april-checking").textContent = formatCurrency(gameState.currentBalance);

    // Hide confirmation and show final section
    document.getElementById("confirmation-section").style.display = "none";
    document.getElementById("april-final").style.display = "block";

    saveGameState();
}



function chooseOption(option) {
    selectedOption = option;

    const confirmationSection = document.getElementById('confirmation-section');
    const detailsSection = document.getElementById('hovercraft-details');
    detailsSection.style.display = 'none';
    confirmationSection.style.display = 'block';

    const confirmationTitle = document.getElementById('confirmation-title');
    const confirmationDetails = document.getElementById('confirmation-details');

    console.log("Option Selected:", selectedOption); // Debugging log
    console.log("Selected Hovercraft Details:", selectedHovercraft); // Debugging log

    if (!selectedHovercraft || !selectedOption) {
        console.error('Selected hovercraft or option is undefined.');
        alert('An error occurred. Please go back and select a hovercraft again.');
        return;
    }

    if (option === 'buy') {
        confirmationTitle.textContent = `Buy ${selectedHovercraft.name}`;
        confirmationDetails.innerHTML = `
            <p>Purchase Price: $${selectedHovercraft.purchasePrice?.toLocaleString()}</p>
            <p>You are choosing to buy this hovercraft outright.</p>
        `;
    } else if (option === 'lease') {
        confirmationTitle.textContent = `Lease ${selectedHovercraft.name}`;
        confirmationDetails.innerHTML = `
            <p>Down Payment: $${selectedHovercraft.leaseDown?.toLocaleString()}</p>
            <p>Monthly Payment: $${selectedHovercraft.monthlyLease?.toLocaleString()} for ${selectedHovercraft.leaseTerm} months</p>
            <p>End of Lease Purchase Option: $${selectedHovercraft.leasePurchasePrice?.toLocaleString()}</p>
        `;
    } else {
        console.error('Invalid option selected.');
        confirmationDetails.textContent = 'An error occurred. Please try again.';
    }
}



function proceedToMay() {
    // Save the game state before moving to May
    saveGameState();

    // Navigate to the May page
    window.location.href = "may.html";
}
function goBackToDetails() {
    // Hide the confirmation section
    document.getElementById('confirmation-section').style.display = 'none';

    // Show the hovercraft details section
    document.getElementById('hovercraft-details').style.display = 'block';
}
function goBack() {
    // Hide the details section
    document.getElementById('hovercraft-details').style.display = 'none';

    // Show the hovercraft selection section
    document.getElementById('hovercraft-selection').style.display = 'flex';
}
function initMay() {
    loadGameState(); // Load the game state

    if (gameState.username) {
        document.getElementById("user-name").textContent = gameState.username;
    }

    // Carry over previous month's balance
    gameState.currentBalance += gameState.netIncome;

    // Update left panel values
    document.getElementById("gross-salary").textContent = formatCurrency(gameState.grossIncome || 0);
    document.getElementById("income-tax").textContent = formatCurrency(0); // No income tax for May
    document.getElementById("net-income").textContent = formatCurrency(gameState.netIncome || 0);
    document.getElementById("checking-account").textContent = formatCurrency(gameState.currentBalance || 0);
    document.getElementById("total-cash").textContent = formatCurrency(gameState.currentBalance || 0);

    // Initialize expenses to 0 or carry forward calculated values
    document.getElementById("food-expense").textContent = formatCurrency(gameState.monthlyFood || 0);
    document.getElementById("housing-expense").textContent = formatCurrency(gameState.housingCost || 0);
    document.getElementById("transport-expense").textContent = formatCurrency(gameState.carCost || 0);
    document.getElementById("slime-expense").textContent = formatCurrency(gameState.monthlySlime || 0);
    const totalExpenses = (gameState.monthlyFood || 0) + (gameState.housingCost || 0) + (gameState.carCost || 0) + (gameState.monthlySlime || 0);
    document.getElementById("total-expenses").textContent = formatCurrency(totalExpenses);

    saveGameState(); // Save the updated game state
}
function calculateMayInvestments() {
    const stockInput = parseFloat(document.getElementById('stockInput').value) || 0;
    const realEstateInput = parseFloat(document.getElementById('realEstateInput').value) || 0;
    const cdInput = parseFloat(document.getElementById('cdInput').value) || 0;
    const confirmationMessage = document.getElementById('confirmation-message');

    // Validate minimum investments
    if (stockInput > 0 && stockInput < 2000) {
        confirmationMessage.textContent = "Minimum stock investment is $2,000";
        confirmationMessage.style.color = "red";
        return;
    }
    if (realEstateInput > 0 && realEstateInput < 1000) {
        confirmationMessage.textContent = "Minimum real estate investment is $1,000";
        confirmationMessage.style.color = "red";
        return;
    }
    if (cdInput > 0 && cdInput < 500) {
        confirmationMessage.textContent = "Minimum CD investment is $500";
        confirmationMessage.style.color = "red";
        return;
    }

    const totalInvestment = stockInput + realEstateInput + cdInput;

    if (totalInvestment > gameState.currentBalance) {
        confirmationMessage.textContent = "You do not have enough funds to make this investment!";
        confirmationMessage.style.color = "red";
        return;
    }

    // Store investments and update balance
    gameState.investments = {
        stock: stockInput,
        realEstate: realEstateInput,
        cd: cdInput,
        total: totalInvestment
    };
    gameState.currentBalance -= totalInvestment;

    // Update display
    document.getElementById('investment-section').style.display = 'none';
    document.getElementById('investment-confirmation').style.display = 'block';
    
    // Build investment summary
    let summary = '<h3>Your Investment Summary:</h3>';
    if (stockInput > 0) summary += `<p>Deodorant Factory: ${formatCurrency(stockInput)}</p>`;
    if (realEstateInput > 0) summary += `<p>Mercury Sea Land: ${formatCurrency(realEstateInput)}</p>`;
    if (cdInput > 0) summary += `<p>Certificate of Deposit: ${formatCurrency(cdInput)}</p>`;
    summary += `<p><strong>Total Investment: ${formatCurrency(totalInvestment)}</strong></p>`;
    summary += `<p>Updated Balance: ${formatCurrency(gameState.currentBalance)}</p>`;
    
    document.getElementById('investment-message').innerHTML = summary;
    saveGameState();
}



function proceedToJune() {
    gameState.month = "June";
    saveGameState();
    window.location.href = "june.html";
}

/* ----- JUNE FUNCTIONS ----- */

function initJune() {
    loadGameState();
    if (gameState.username) {
        document.getElementById("user-name").textContent = gameState.username;
    }
    const juneGross = gameState.grossIncome;
    const juneNet = gameState.netIncome;
     gameState.currentBalance += juneNet;

    document.getElementById("gross-salary").textContent = formatCurrency(juneGross);
    document.getElementById("income-tax").textContent = formatCurrency(0); 
    document.getElementById("net-income").textContent = formatCurrency(juneNet);
    document.getElementById("checking-account").textContent = formatCurrency(gameState.currentBalance);
    document.getElementById("total-cash").textContent = formatCurrency(gameState.currentBalance);

     const monthlyFood = gameState.monthlyFood;   
    const monthlyHousing = gameState.housingCost || 0;
    const monthlyTransport = gameState.carCost || 0; 
    const monthlySlime = gameState.monthlySlime;  
    const totalExpenses = monthlyFood + monthlyHousing + monthlyTransport + monthlySlime;

    document.getElementById("food-expense").textContent = formatCurrency(monthlyFood);
    document.getElementById("housing-expense").textContent = formatCurrency(monthlyHousing);
    document.getElementById("transport-expense").textContent = formatCurrency(monthlyTransport);
    document.getElementById("slime-expense").textContent = formatCurrency(monthlySlime);
    document.getElementById("total-expenses").textContent = formatCurrency(totalExpenses);

    // Reset julyTransitioned
    localStorage.removeItem('julyTransitioned');

    saveGameState();
}

function handlePayment(option) {
    let message = "";
    switch (option) {
        case 'credit':
            message = "You charged $950 to your credit card. Payment will be due later.";
            break;
        case 'loan':
            message = "You took out a loan for $950 with 10.5% interest.";
            break;
        case 'savings':
            if (gameState.currentBalance >= 950) {
                gameState.currentBalance -= 950;
                message = `Vacation paid from savings. Remaining balance: ${formatCurrency(gameState.currentBalance)}`;
            } else {
                message = "Insufficient funds in checking account.";
            }
            break;
        case 'work':
            gameState.currentBalance += 950;
            message = `You skipped the vacation and earned $950. New balance: ${formatCurrency(gameState.currentBalance)}`;
            break;
        default:
            console.error("Invalid payment option selected.");
            return;
    }
    document.getElementById("confirmation-message").style.cssText = "color: black; font-weight: bold;";
    // Update the confirmation message dynamically
    const confirmationMessageElement = document.getElementById("confirmation-message");
    confirmationMessageElement.textContent = message;
    confirmationMessageElement.style.color = "black"; // Change the text color to black

    // Show the confirmation section
    const confirmationSection = document.getElementById("confirmation-section");
    confirmationSection.style.display = "block";

    // Save the game state
    saveGameState();
}
    // Update UI with confirmation
    const confirmationSection = document.getElementById("confirmation-section");
    const confirmationMessage = document.getElementById("confirmation-message");
    confirmationMessage.textContent = message;
    confirmationSection.style.display = "block";

    // Save game state
    saveGameState();

    function postJuneEvent() {
        console.log("postJuneEvent called.");
    
        try {
            // Check for multiple "easiest" choices
            const cheapestCarLease = (gameState.carType === "Leased" && gameState.carName === "X2001");
            let noInvestments = true;
    
            if (gameState.investments) {
                const totalInv =
                    (gameState.investments.stock || 0) +
                    (gameState.investments.realEstate || 0) +
                    (gameState.investments.cd || 0);
                noInvestments = (totalInv <= 0);
            }
    
            const workedVacation = (gameState.vacationChoice === "work");
    
            // Extra Negative Scenario
            if (cheapestCarLease && noInvestments && workedVacation) {
                triggerEvent("JuneDoubleTrouble");
                console.log("Triggered JuneDoubleTrouble event!");
                return "JuneDoubleTrouble"; // Return event for logging
            }
    
            // Standard June Logic
            if (gameState.stressPoints >= 5) {
                triggerEvent("TaxAudit");
                return "TaxAudit";
            } else if (gameState.stressPoints <= 2) {
                triggerEvent("UnexpectedWindfall");
                return "UnexpectedWindfall";
            } else if (gameState.housingChoice === "cheapRent" || gameState.monthlyBudget === "cheapest") {
                triggerEvent("HealthCrisis");
                return "HealthCrisis";
            } else {
                triggerEvent("BonusAtWork");
                return "BonusAtWork";
            }
        } catch (error) {
            console.error("Error in postJuneEvent:", error);
        }
    
        console.log("June events processed. Current Game State:", gameState);
        return null;
    }

function displayTriggeredEvents() {
    const eventMessage = document.getElementById("event-message");
    const eventList = document.getElementById("event-list");

    if (eventMessage && eventList) {
        eventList.innerHTML = ""; // Clear previous events
        gameState.eventsTriggered.forEach((event) => {
            const li = document.createElement("li");
            li.textContent = event;
            eventList.appendChild(li);
        });

        eventMessage.style.display = "block";
    }
}

let julyTransitioned = false; // A new flag

function proceedToJuly() {
    console.log("proceedToJuly called");

    try {
        // Trigger June events before July starts
        const juneEventTriggered = postJuneEvent();
        console.log("June Event Triggered:", juneEventTriggered);

        // Update the game state to transition to July
        gameState.month = "July";
        saveGameState();
        console.log("Game State Saved for July:", gameState);

        // Navigate to July
        setTimeout(() => {
            window.location.href = "july.html";
        }, 500);
    } catch (error) {
        console.error("Error in proceedToJuly:", error);
    }
}




/* ----- JULY FUNCTIONS (Same as before) ----- */
// Note: The user mentioned some breakage here was fixed previously.
// Ensure that July logic is not interfering with January.
// The July logic does not touch January code, so it should be fine.

function handleHovercraftPayment(option) {
    selectedOption = option;

    const confirmationSection = document.getElementById('confirmation-section');
    const detailsSection = document.getElementById('hovercraft-details');
    detailsSection.style.display = 'none';
    confirmationSection.style.display = 'block';

    const confirmationTitle = document.getElementById('confirmation-title');
    const confirmationDetails = document.getElementById('confirmation-details');

    console.log("Option Selected:", selectedOption); // Debugging log
    console.log("Selected Hovercraft Details:", selectedHovercraft); // Debugging log

    if (!selectedHovercraft || !selectedOption) {
        console.error('Selected hovercraft or option is undefined.');
        alert('An error occurred. Please go back and select a hovercraft again.');
        return;
    }

    if (option === 'buy') {
        confirmationTitle.textContent = `Buy ${selectedHovercraft.name}`;
        confirmationDetails.innerHTML = `
            <p>Purchase Price: $${selectedHovercraft.purchasePrice?.toLocaleString()}</p>
            <p>You are choosing to buy this hovercraft outright.</p>
        `;
    } else if (option === 'lease') {
        confirmationTitle.textContent = `Lease ${selectedHovercraft.name}`;
        confirmationDetails.innerHTML = `
            <p>Down Payment: $${selectedHovercraft.leaseDown?.toLocaleString()}</p>
            <p>Monthly Payment: $${selectedHovercraft.monthlyLease?.toLocaleString()} for ${selectedHovercraft.leaseTerm} months</p>
            <p>End of Lease Purchase Option: $${selectedHovercraft.leasePurchasePrice?.toLocaleString()}</p>
        `;
    } else {
        console.error('Invalid option selected.');
        confirmationDetails.textContent = 'An error occurred. Please try again.';
    }
}

function handleJunePayment(option) {
    let message = "";
    switch (option) {
        case 'credit':
            message = "You charged $950 to your credit card. Payment will be due later.";
            gameState.vacationChoice = "credit";
            gameState.creditBalance = (gameState.creditBalance || 0) + 950;
            break;
        case 'loan':
            message = "You took out a loan for $950 with 10.5% interest.";
            gameState.vacationChoice = "loan";
            gameState.loanBalance = (gameState.loanBalance || 0) + 950;
            break;
        case 'savings':
            if (gameState.currentBalance >= 950) {
                gameState.currentBalance -= 950;
                message = `Vacation paid from savings. Remaining balance: ${formatCurrency(gameState.currentBalance)}`;
                gameState.vacationChoice = "savings";
            } else {
                message = "Insufficient funds in checking account.";
                gameState.vacationChoice = "savings_failed";
            }
            break;
        case 'work':
            gameState.currentBalance += 950;
            message = `You skipped the vacation and earned $950. New balance: ${formatCurrency(gameState.currentBalance)}`;
            gameState.vacationChoice = "work";
            break;
        default:
            console.error("Invalid payment option selected.");
            return;
    }

    // Update UI with confirmation
    const confirmationSection = document.getElementById("confirmation-section");
    const confirmationMessage = document.getElementById("confirmation-message");
    confirmationMessage.textContent = message;
    confirmationSection.style.display = "block";

    // Get the button and add the `proceedToJuly` to it
     const proceedButton = document.getElementById('proceed-to-july-button');
    proceedButton.onclick = proceedToJuly; // Add the onclick function


    // Save game state
    saveGameState();
}


// Global declarations:
var julySteps = []; // Initialize it here
var currentStepIndex = -1;

function initJuly() {
    console.log("Initializing July...");

    // Load the game state
    loadGameState();

    // Update the username display
    if (gameState.username) {
        document.getElementById("user-name").textContent = gameState.username;
    }

    // Initialize July income and add to the current balance
    const julyGross = 432;
    const julyNet = julyGross; // No taxes for July
    gameState.grossIncome = julyGross;
    gameState.netIncome = julyNet;
    gameState.currentBalance += julyNet;

    // Update UI for income and balance
    document.getElementById("gross-salary").textContent = formatCurrency(julyGross);
    document.getElementById("income-tax").textContent = formatCurrency(0); // No income tax
    document.getElementById("net-income").textContent = formatCurrency(julyNet);
    document.getElementById("checking-account").textContent = formatCurrency(gameState.currentBalance);
    document.getElementById("total-cash").textContent = formatCurrency(gameState.currentBalance);

    // Save the game state after updates
    saveGameState();

    console.log("July setup complete.");
}


function initJulySteps() {
    console.log("Initializing July Steps...");
    const startButton = document.getElementById("start-july-steps");
    if (startButton) {
        startButton.style.display = "none";
    }
    // Load the game state
    loadGameState();
    
  
    // Add steps to the *global* julySteps array:
    julySteps = []; // Re-initialize *inside* the function, but *after* other functions have been defined.
    addTriggeredEventStep();
    addHousingSettlementStep();
    addTaxReconciliationStep();
    addCarSettlementStep();
    addInvestmentReturnsStep();
    addDebtPaymentStep();

    // Update the username display
    if (gameState.username) {
        document.getElementById("user-name").textContent = gameState.username;
    }

    // Initialize July income and add to the current balance
    const julyGross = 432;
    const julyNet = julyGross; // No taxes for July
    gameState.grossIncome = julyGross;
    gameState.netIncome = julyNet;
    gameState.currentBalance += julyNet;

    // Update UI for income and balance
    document.getElementById("gross-salary").textContent = formatCurrency(julyGross);
    document.getElementById("income-tax").textContent = formatCurrency(0); // No income tax
    document.getElementById("net-income").textContent = formatCurrency(julyNet);
    document.getElementById("checking-account").textContent = formatCurrency(gameState.currentBalance);
    document.getElementById("total-cash").textContent = formatCurrency(gameState.currentBalance);

    // Save the game state after updates
    saveGameState();


    // Add the final step for the ticket outcome
    julySteps.push({
        title: "Final Outcome",
        description: "Let's see if you can afford the $10,000 ticket...",
        apply: () => 0,
    });

    // Start processing the steps
    startSteps();
    console.log("July steps initialized:", julySteps);
}
// Helper function to add steps based on triggered events
function addTriggeredEventStep() {
    if (gameState.eventsTriggered.includes('JuneDoubleTrouble')) {
        julySteps.push({
            title: "Medical Emergency",
            description: "You suffer from burnout, requiring a brief hospital stay. The cost is $1,500.",
            apply: () => {
                updateBalance(-1500, "Medical Emergency - Burnout Hospital Stay");
                gameState.stressPoints += 3;
                return -1500;
            },
        });
    }
    // Removed logStepDetails();
}

// Helper function to add housing settlement step
function addHousingSettlementStep() {
    let description = "";
    let change = 0;

    if (gameState.housingType === "Rented") {
        if (gameState.housingChoice === "cheapRent") {
            description = "You broke your lease early and incurred a penalty of $750.";
            change = -750;
        } else {
            description = "You rented. No housing profit or loss.";
        }
        julySteps.push({
            title: "Housing Settlement",
            description,
            apply: () => {
                gameState.currentBalance += change;
                return change;
            },
        });
    } else if (gameState.housingType === "Owned") {
        const houseProfit = settleHouse();
        description = houseProfit
            ? `You sold your house and earned a net profit of ${formatCurrency(houseProfit)}.`
            : "No profit or loss from your house sale.";
        change = houseProfit;
        julySteps.push({
            title: "Sell Your House",
            description,
            apply: () => {
                gameState.currentBalance += change;
                return change;
            },
        });
    } else {
        julySteps.push({
            title: "Housing Settlement",
            description: "No house to sell.",
            apply: () => 0,
        });
    }
    
}

// Helper function to add tax reconciliation step
function addTaxReconciliationStep() {
    const taxBill = calculateFinalTax();
    if (taxBill < 0) {
        const refund = Math.abs(taxBill);
        julySteps.push({
            title: "Tax Time",
            description: `You overpaid taxes. You receive a refund of ${formatCurrency(refund)}.`,
            apply: () => {
                gameState.currentBalance += refund;
                return refund;
            },
        });
    } else if (taxBill > 0) {
        julySteps.push({
            title: "Tax Time",
            description: `You owe ${formatCurrency(taxBill)} in taxes.`,
            apply: () => {
                gameState.currentBalance -= taxBill;
                return -taxBill;
            },
        });
    } else {
        julySteps.push({
            title: "Tax Time",
            description: "No additional tax bill due.",
            apply: () => 0,
        });
    }
    
}

// Helper function to add car settlement step
function addCarSettlementStep() {
    if (gameState.carType === "Owned") {
        const carProfit = settleCar();
        const description = carProfit >= 0
            ? `You sell your car and gain ${formatCurrency(carProfit)}.`
            : `You sell your car and lose ${formatCurrency(Math.abs(carProfit))}.`;
        julySteps.push({
            title: "Sell Your Car",
            description,
            apply: () => {
                gameState.currentBalance += carProfit;
                return carProfit;
            },
        });
    } else if (gameState.carType === "Leased") {
        const leasePenalty = parseInt(localStorage.getItem('leasePenalty'), 10) || 0;
        julySteps.push({
            title: "Car Settlement",
            description: `You returned your leased car early and incurred a penalty of ${formatCurrency(leasePenalty)}.`,
            apply: () => {
                gameState.currentBalance -= leasePenalty;
                return -leasePenalty;
            },
        });
    } else {
        julySteps.push({
            title: "Car Settlement",
            description: "No car ownership, no settlement.",
            apply: () => 0,
        });
    }
    
}

// Helper function to add investment returns step
function addInvestmentReturnsStep() {
    const investmentReturns = settleInvestments();
    if (investmentReturns > 0) {
        julySteps.push({
            title: "Liquidate Investments",
            description: `Your investments have matured. Total returns after tax: ${formatCurrency(investmentReturns)}.`,
            apply: () => {
                gameState.currentBalance += investmentReturns;
                return investmentReturns;
            },
        });
    } else {
        julySteps.push({
            title: "Investment Returns",
            description: "No investments made, no returns.",
            apply: () => 0,
        });
    }
   
}

// Helper function to add debt payment step
function addDebtPaymentStep() {
    const totalDebt = (gameState.creditBalance || 0) + (gameState.loanBalance || 0);
    if (totalDebt > 0) {
        julySteps.push({
            title: "Debt Payment",
            description: `You must pay off your debts of ${formatCurrency(totalDebt)}.`,
            apply: () => {
                gameState.currentBalance -= totalDebt;
                // Reset debts after payment
                gameState.creditBalance = 0;
                gameState.loanBalance = 0;
                return -totalDebt;
            },
        });
    } else {
        julySteps.push({
            title: "Debt Payment",
            description: "No debts to pay.",
            apply: () => 0,
        });
    }
   
}
function startSteps() {
    currentStepIndex = -1;

    document.getElementById("summary-text").style.display = "none";
    document.getElementById("final-results").style.display = "none";
    document.getElementById("step-details").style.display = "block";

    // Only call nextStep() once!
    nextStep();

    console.log("Final decisionScore for July", gameState.decisionScore);
}

function calculateFinalTax() {
    // Distinguish a "high-paying" job from a "lower-paying" job.
    // Adjust your threshold or logic as fits your game.
    const highPayThreshold = 3168;  // or 5000 if that’s your top job
    const isHighPayingJob = (gameState.grossIncome >= highPayThreshold);

    const totalAllowances = gameState.allowances || 0;
    let finalTaxReconciliation = 0; // negative => refund, positive => owe

    // Example logic combining job level + allowances
    if (isHighPayingJob) {
        // High-paying job bracket
        switch (totalAllowances) {
            case 0:
                finalTaxReconciliation = -500;  // Overwithheld => big refund
                break;
            case 1:
                finalTaxReconciliation = -200;  // Slight refund
                break;
            case 2:
                finalTaxReconciliation = 500;   // Owe some money (not 0)
                break;
            case 3:
                finalTaxReconciliation = 1200;  // Owe more
                break;
            case 4:
            default:
                finalTaxReconciliation = 1500;  // Owe even more
                break;
        }
    } else {
        // Lower-paying or mid-paying job bracket
        switch (totalAllowances) {
            case 0:
                finalTaxReconciliation = -300;  // Decent refund
                break;
            case 1:
                finalTaxReconciliation = -100;  // Small refund
                break;
            case 2:
                finalTaxReconciliation = 0;     // Break-even
                break;
            case 3:
                finalTaxReconciliation = 800;   // Owe a bit
                break;
            case 4:
            default:
                finalTaxReconciliation = 1000;  // Owe more
                break;
        }
    }
    
    console.log("Calculated finalTaxReconciliation:", finalTaxReconciliation,
                "| HighPay?", isHighPayingJob,
                "| Allowances:", totalAllowances);
    return finalTaxReconciliation;
}




function nextStep() {
    currentStepIndex++;
    if (currentStepIndex < julySteps.length) {
        let step = julySteps[currentStepIndex];
        let change = step.apply();

        document.getElementById("step-title").textContent = step.title;
        document.getElementById("step-description").textContent = step.description;

        document.getElementById("checking-account").textContent = formatCurrency(gameState.currentBalance);
        document.getElementById("total-cash").textContent = formatCurrency(gameState.currentBalance);
        document.getElementById("step-balance").textContent = formatCurrency(gameState.currentBalance);

        console.log(`--- Step ${currentStepIndex + 1} ---`);
        console.log(`Title: ${step.title}`);
        console.log(`Description: ${step.description}`);
        console.log(`Change in Balance: ${formatCurrency(change)}`);
        console.log(`New Current Balance: ${formatCurrency(gameState.currentBalance)}`);
        console.log(`Stress Points: ${gameState.stressPoints}`);
        console.log(`Decision Score: ${gameState.decisionScore}`);
        console.log("-------------------------");
        
        if (step.title === "Final Outcome") {
            finalizeJuly();
        }
    } else {
        finalizeJuly();
    }
}


function toggleFinalOverlay() {
    const finalOverlay = document.getElementById('final-overlay');
    const overlay = document.getElementById('overlay');
    
    if (!finalOverlay || !overlay) {
        console.error("Could not find elements #final-overlay or #overlay in the DOM.");
        return;
    }

    if (finalOverlay.style.display === 'none' || finalOverlay.style.display === '') {
        finalOverlay.style.display = 'block';
        overlay.style.display = 'block';
    } else {
        finalOverlay.style.display = 'none';
        overlay.style.display = 'none';
    }
}


function finalizeJuly() {
    // Hide the normal final results <div> 
    document.getElementById("step-details").style.display = "none";
    document.getElementById("final-results").style.display = "none";

    // Decide which image + text
    let finalMsg = "";
    let finalImage = "";
    if (gameState.currentBalance >= 10000) {
        finalMsg = `Congratulations! You have $${gameState.currentBalance.toFixed(2)}, enough for the $10,000 ticket home!`;
        finalImage = "https://i.imgur.com/M9A3949.jpeg"; // leaving Knob
    } else {
        finalMsg = `Unfortunately, you only have $${gameState.currentBalance.toFixed(2)}, not enough for the $10,000 ticket. You're stuck on Knob!`;
        finalImage = "https://i.imgur.com/Fn2dl9O.jpeg"; // stuck on Knob
    }

    // Insert that text & image into the overlay
    document.getElementById("final-message-overlay").textContent = finalMsg;
    document.getElementById("final-image").src = finalImage;

    // Show the overlay
    toggleFinalOverlay();

    // Finally, save the game state
    saveGameState();
}


/* Placeholder Functions */


function settleHouse() {
    if (gameState.housingType === "Owned") {
        let originalPrice = gameState.housePrice || 0; // Fetch the original purchase price
        let currentValue = originalPrice * 1.07; // Assume 7% market appreciation
        let profit = currentValue - originalPrice;
        let tax = profit * 0.20; // 20% capital gains tax
        return profit - tax; // Return net profit
    }
    
    return 0; // No house owned
}


function settleCar() {
    if (gameState.carType === "Owned") {
        let originalValue = gameState.carPurchasePrice || 22000;
        let currentValue = originalValue * 0.90; // Assume 10% depreciation
        return currentValue - originalValue; // Return profit or loss
    } else if (gameState.carType === "Leased") {
        console.log(`Applying penalty for leased car: ${gameState.carName}, Penalty: ${gameState.carLeasePenalty}`); // Debugging
        let penalty = gameState.carLeasePenalty || 0; // Fetch the saved penalty
        return -penalty; // Return negative penalty
    }
    
    return 0; // No car owned
}


function settleInvestments() {
    if (!gameState.investments) return 0;
    let returns = 0;
    let cd = gameState.investments.cd || 0;
    let stock = gameState.investments.stock || 0;
    let realEstate = gameState.investments.realEstate || 0;

    // Calculate CD returns
    if (cd > 0) {
        let cdFinal = cd * 1.025; // 2.5% interest
        let cdProfit = cdFinal - cd;
        let cdTax = cdProfit * 0.20; // 20% tax
        returns += cdFinal - cdTax;
    }

    // Calculate stock returns
    if (stock > 0) {
         let stockFinal = stock * 1.10; // 10% interest
        let stockProfit = stockFinal - stock;
        let stockTax = stockProfit * 0.20;
        returns += stockFinal - stockTax;
    }

    // Calculate real estate returns
     if (realEstate > 0) {
        let reFinal = realEstate * 1.05; // 5% interest
        let reProfit = reFinal - realEstate;
        let reTax = reProfit * 0.20;
        returns += reFinal - reTax;
    }
    
    return returns;
}


function settleDebts() {
    let totalDebt = 0;
    
    if (gameState.creditBalance) totalDebt += gameState.creditBalance;
    if (gameState.loanBalance) totalDebt += gameState.loanBalance;
    return totalDebt; // Total debts to be subtracted
    
}
