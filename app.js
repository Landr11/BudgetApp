
//BUDGET CONTROLLER
var budgetController =(function(){

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal =  function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
            //store the sum in the data.totals var
            data.totals[type] = sum;
        });

    };

 // Object containing arrays containing Object values to store all items, Kept in an array to keep the code DRY
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        }, 
        budget: 0, 
        percentage: -1
    };

    return {
        addItem: function(type, des, val){
           var newItem, ID;
           

           //Create a new ID, if empty ID = 0
           if(data.allItems[type].length > 0){
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
           } else {
               ID = 0;
           }
           


           //Create new Item based on the type condition "inc" or "exp"
           if(type=== "exp"){
               newItem = new Expense(ID, des, val);
           } else if (type === "inc"){
               newItem = new Income(ID, des, val);
           }
           //Push it into our data object
           data.allItems[type].push(newItem);

           //Return the new element to be used
           return newItem;
        },

        calculateBudget: function(){

            //Calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");

            //Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage of the income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else{
                data.percentage = -1;
            }
            
        },

        getBudget: function(){
            return{
                budget:      data.budget,
                totalInc:    data.totals.inc,
                totalExp:    data.totals.exp,
                percentage:  data.percentage
            };
        },

        //Used to expose the data being passed in the app/testing
        testing: function(){
            console.log(data);
        }

    };
   
})();



//UI CONTROLLER
var UIController =(function(){

  
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn", 
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list"
    };
  
    //Returns an Object containing the results of the querySelectors
   return {
       getInput: function(){
           return {
            type:        document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
            description: document.querySelector(DOMstrings.inputDescription).value,
            //covert the input value from a string to a number using parseFloat
            value:       parseFloat( document.querySelector(DOMstrings.inputValue).value) 
           };   
       }, 
      
       // Display the data on the Page
       addListItem: function(obj, type){
           var html, newHtml, element;
           
         // Create HTML string with placeholder text
           if(type === "inc"){
            element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
           } else if(type === "exp"){
            element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
           }

        // Replace the placeholder text with data
        newHtml = html.replace("%id%", obj.id);
        newHtml = newHtml.replace("%description%", obj.description);
        newHtml = newHtml.replace("%value%", obj.value);

        // Insert the HTML into the DOM
        document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
       },

       clearFields: function(){
           var fields, fieldsArr;
         // Select all the field to clear
           fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);

           fieldsArr = Array.prototype.slice.call(fields);

         //Use the foreach method to loop over and clear the fields
         fieldsArr.forEach(function(current, index, array){
             current.value = "";
         });  

        //Set the input focus to the description box
        fieldsArr[0].focus();

       },

       // EXPORT DOMstrings var
       getDOMstrings: function(){
        return DOMstrings;
          }    
   };

})();



//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

        //GLOBAL Document keypress
        document.addEventListener("keypress", function(event){
    
            if(event.keycode === 13 || event.which === 13){
                ctrlAddItem();
            }    
        });  
    }

    var updateBudget = function(){
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        console.log(budget);

    };

    var ctrlAddItem = function(){
        var input, newItem;

         // 1. Get the field input data.
         input = UICtrl.getInput();

         //Check data input validity before proceeding

         if(input.description !== "" && !isNaN(input.value) && input.value > 0){

            // 2. Add the item to the budget controller
        newItem = budgetCtrl.addItem(input.type, input.description, input.value);

        // 3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);

        // 4. Clear the fields
        UICtrl.clearFields();

        // 5.Calculate and update the budget
        updateBudget();

         }

    };

      return {
          init: function(){
               console.log("The Application has started");
               setupEventListeners();
        }
     }

})(budgetController, UIController);

controller.init();