jQuery.fn.existsWithValue = function() { 
    return this.length && this.val().length; 
}

// A reference to Stripe.js initialized with your real test publishable API key.
var stripe = Stripe("pk_test_51HIH7JDYPps3j2jbYgwVfJck8GPO6bFCdtIK66tEvoE1mVHJtdcT1yli0LUHrF1TEKiT80B9AAiEiP3r174ul74Y00JcZvmLsj");
var elements = stripe.elements();
var cardElement;
var stripeStyle = {
    base: {
      color: "#32325d",
      fontFamily: 'Arial, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#32325d"
      }
    },
    invalid: {
      fontFamily: 'Arial, sans-serif',
      color: "#fa755a",
      iconColor: "#fa755a"
    }
  };
var clientSecret = "" // hold onto a single clientSecret to allow users to go back and edit purchase amount

// Set up bindings.
$( document ).ready(function() {
    console.log('   ___-___  o==o======   . ENGAGE!   .\n=========== ||//\n            \ \ |//__\n            #_______/');

    seekToPage(0);

    $('#nameInput').change(function() {
        validateName();
        updateUI();
    });

    $('#amountInput').change(function() {
        validateAmount();
        updateUI();
    });

    $('#nextButton').click(function() {
        var payload = { "amount":donationAmount, "clientSecret": clientSecret};
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: '/create-intent',
            dataType : 'json',
            data : JSON.stringify(payload),
            success : function(result) {
                console.log(result); 
                clientSecret = result["clientSecret"];
                mountStripe();
                seekToPage(1);
            },
            error : function(result){
                console.log(result);
            }
        });
    });

    $('#backButton').click(function() {
        destroyStripe();
        seekToPage(0);
    })

    
});

function mountStripe() {
    cardElement = elements.create("card", { style: stripeStyle });
    cardElement.mount("#card-element");

    cardElement.on("change", function (event) {
      // Disable the Pay button if there are no card details in the Element
      $("#submitButton").prop("disabled", !event.complete);
      updateCardError(event.error ? event.error.message : "");
    });

    $("#payment-form").on("submit", function(event) {
      event.preventDefault();
      processPayment(stripe, cardElement, clientSecret);
    });
}

function processPayment(stripe, card, clientSecret) {
    stripe.confirmCardPayment(clientSecret,
        {
            payment_method: { card: card }
        }).then(function(result) {
            if(!result.error) {
                seekToPage(2);
            } else {
                updateCardError(result.error.message);
            }
        });
}

function destroyStripe() {
    cardElement.destroy();
}

var nameIsValid = false;
function validateName() {
    if($('#nameInput').existsWithValue()){
        nameIsValid = true;
    } else {
        nameIdValid = false;
    }
    console.log("Valid name? "+nameIsValid);
}

var amountIsValid = false;
var donationAmount = 0.0;
var processingFee = 0.0;

function validateAmount() {
    if($('#amountInput').existsWithValue()){ 
        donationAmount = parseInt($('#amountInput').val()); // it goes horribly wrong without parseInt
        processingFee = ((donationAmount + 0.3) / 0.971) - donationAmount;
        amountIsValid = true;
    } else {
        amountIsValid = false;
    }
    console.log("Valid amount? "+amountIsValid);
}

function updateUI() {
    $('#nextButton').prop('disabled', !(amountIsValid && nameIsValid));

    if(amountIsValid) {
        $('#donationHint').text("+ processing fee $"+processingFee.toFixed(2));
        $('.totalAmount').text("$" + (donationAmount+processingFee).toFixed(2));
    } else {
        $('#donationHint').text("");
        $('.totalAmount').text("");
    }
}

function updateCardError(errorString) {
    $("#card-error").text(errorString);
}

function seekToPage(newPage) {
    $('#page0, #page1, #page2').removeClass('d-none');
    $
    switch(newPage) {
        case 0:
            console.log("seeking page "+newPage);    
            $('#page1, #page2').addClass('d-none');
            break;
        case 1:
            console.log("seeking page "+newPage);    
            $('#page0, #page2').addClass('d-none');
            break;
        case 2:
            console.log("seeking page "+newPage);    
            $('#page0, #page1').addClass('d-none');
            break;
    }
}