
//BUDGET CONTROLLER (CALCULATION AND VARIABLES DEFINITION)
var budgetController =(function(){

//Variables definition
 
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
   
    //Add Calculate percentage to Expense prototype property
    Expense.prototype.calcPercentage = function(totalIncome){

        if(totalIncome > 0){
           this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }   
    };

    //Return the percentage with a function added to the prototype property
    Expense.prototype.getPercentages = function(){
        return this.percentage;
    };


    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal =  function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current, index, array){
            sum += current.value;
        });
        //store the sum in the data.totals var
        data.totals[type] = sum;
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

// The Logic behind the User's interaction

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
      
        //Delete Item function
        deleteItem: function(type, id){
            var ids, index;

          // convert to an array using the map method
             ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);
            
            //Use the slice method to remove the data if its not -1
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
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

        //Calculate the percentage for each exp item
        calculatePercentages: function(){

            data.allItems.exp.forEach(function(current){
               current.calcPercentage(data.totals.inc);
            });
        },

        //Retrieve the percentages
        getPercentages: function(){
           var allPerc = data.allItems.exp.map(function(current){
               return current.getPercentages();
           });
           return allPerc;
        },
        
        //Returning the Data Object
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



//UI CONTROLLER(DOM MANIPULATION AND DISPLAY )
var UIController =(function(){

  
    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn", 
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list", 
        budgetLabel: ".budget__value",
        incomeLabel:".budget__income--value",
        expensesLabel:".budget__expenses--value",
        percentageLabel:".budget__expenses--percentage",
        container:".container", 
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    //Formating the numbers for the UI
    var formatNumber = function(num, type){
        /* add + or - before numbers
        exactly 2 decimal points
        comma seperating the thousands */
        
       var numSplit, int, dec, type, sign;



       //Remove the sign in front of the number
        num = Math.abs(num);
       //add the decimals
        num = num.toFixed(2);
       //Comma for the thousounds
       // 1. Split the number user the slpit method (stored in an array)
       numSplit = num.split(".");
       // 2. Store the first part
       int = numSplit[0];
       if (int.length > 3){
           //Cut -3  to always capture the thousounds 
           int  = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
       }

       // 3. Store the second part
       dec = numSplit[1];

       //Use ternary operator to check the sign
       type === "exp" ? sign = "-" : sign = "+";

       //Return the formatted number
       return sign + "" + int + "." + dec;

       //Alternative method
       //return (type === "exp" ? "-" : "+") + "" + int + "." + dec;
      };
      

       //Trick forEachloop for NODLELIST
       var nodeListForEach = function(list, callback){
        for(var i = 0;  i < list.length; i++){
             callback(list[i], i);
         }
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
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
           } else if(type === "exp"){
            element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
           }

        // Replace the placeholder text with data
        newHtml = html.replace("%id%", obj.id);
        newHtml = newHtml.replace("%description%", obj.description);
        newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

        // Insert the HTML into the DOM
        document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
       },

       //Delete Item
       deleteListItem: function(selectorID){
           //use the DOM child method to remove the targeted element
           var el = document.getElementById(selectorID);
           el.parentNode.removeChild(el);
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

       //Display the Budgets in the UI
       displayBudget: function(obj){
           var type;

          obj.budget > 0 ? type = "inc" : type = "exp";

           document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
           document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,"inc");
           document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");
           
         if(obj.percentage > 0){
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
         } else {
            document.querySelector(DOMstrings.percentageLabel).textContent = "---";
         }
       },

       //Display each percentages in the UI
       displayPercentages: function(percentages){
        
       //Select all the percentages classes on the Page
       var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
       
       //we call the function and we pass the percentages list 
       nodeListForEach(fields, function(current, index){
      
            if(percentages[index] > 0){
              current.textContent = percentages[index] + "%";
            } else {
              current.textContent = "---";
            }   
          });
       },

       // Get the current date to display on the UI
       displayMonth: function(){
          var now, year, month, months;
        //Select the year
        now = new Date();
        months = ["january", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        //Get the month
        month = now.getMonth();
        //Get the Fullyear
        year = now.getFullYear();
        //Select element on the page and format it
        document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
       },

       //Function to change the color of the input field
       changedType:  function(){
        //Select the fields
        var fields = document.querySelectorAll(DOMstrings.inputType + "," + DOMstrings.inputDescription + "," + DOMstrings.inputValue);
        
        //Loop over and apply the colour
        nodeListForEach(fields, function(cur){
            cur.classList.toggle("red-focus");

        });
       
        document.querySelector(DOMstrings.inputBtn).classList.toggle("red");

       },

       // EXPORT DOMstrings var
       getDOMstrings: function(){
        return DOMstrings;
          }    
   };

})();



//GLOBAL APP CONTROLLER (USER INTERACTION)
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
        
         //Event Delgation Bubbling and Traversing the DOM to delete
        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

        //Change Event, to change the colour of the Input field depending on the type of input
        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
    };

    var updateBudget = function(){
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    var updatePercentages = function(){
       
        // 1. Calculate the percentages
        budgetCtrl.calculatePercentages();

        // 2. Read the percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

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

        // 5. Calculate and update the budget
        updateBudget();

        // 6. Calculate and update the percentages
        updatePercentages();

         }

    };

    //Event Delgation Bubbling and Traversing the DOM to delete
    var ctrlDeleteItem = function(event){
     var itemID, splitID, type, ID;
     //Getting the target element in the html
     itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

     if(itemID){
         //devide the class name 
         splitID = itemID.split("-");
         type    = splitID[0];
         ID      = parseInt(splitID[1]);

         // 1. Delete the item from the data structure
         budgetCtrl.deleteItem(type, ID);

         // 2. Delete the item from the UI
        UICtrl.deleteListItem(itemID);

         // 3. Update and show the new budget
         updateBudget();

         // 4. Calculate and update percentages
         updatePercentages();
     }

    };

      return {
          init: function(){
               console.log("The Application has started");
               UICtrl.displayMonth();
               // 3. Display the budget on the UI
               UICtrl.displayBudget({
                budget:      0,
                totalInc:    0,
                totalExp:    0,
                percentage:  -1
            });
               setupEventListeners();
        }
     }

})(budgetController, UIController);

controller.init();