from flask import Flask
from flask import render_template
from flask import jsonify
from flask import request
import json
import math
import os
import stripe

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

stripe.api_key = os.environ['STRIPE_KEY']

intentDict = {}

@app.route('/')
def index(name=None):
    return render_template('index.html')

def calculate_total_payment_in_magic_stripe_units(donation):
    return math.ceil(100 * ((donation + 0.3) / 0.971))

@app.route('/create-intent', methods=["POST"])
def create_intent():
    print("Received a request to create intent")

    try:
        payload = request.get_json()
        amount = payload['amount']
        client_secret = payload['clientSecret']
        donation_name = payload['donationName']

        print('amount to donate is: $' + str(amount))
        total_to_charge = calculate_total_payment_in_magic_stripe_units(amount)
        print('final amount to charge is: '+ str(total_to_charge))

        return_secret = ""

        if client_secret:
            print('Previous clientSecret supplied: '+client_secret)

            stripe.PaymentIntent.modify(
                intentDict[client_secret],
                metadata={"amount":total_to_charge, "currency":"usd"}
            )

            return_secret = client_secret

        else:
            intent = stripe.PaymentIntent.create(
                amount=total_to_charge,
                description=donation_name,
                currency='usd'
            )

            intentDict[intent['client_secret']] = intent["id"]

            return_secret = intent['client_secret']

        return jsonify({
          'clientSecret': return_secret
        })
    except Exception as e:
        print(e)
        return jsonify(error=str(e)), 403

@app.route('/webhook', methods=["POST"])
def webhook():

        payload = request.get_json()
        print("Webhook received. Type: "+payload['type'])
        
        event = stripe.Event.construct_from(
            payload, stripe.api_key
        )
        
        transaction_log = []
        with open('transaction_log.json', "r") as logfile:
            transaction_log = json.load(logfile)
        
        transaction_log.append(event)

        with open('transaction_log.json', 'w') as logfile:
            json.dump(transaction_log, logfile)

        return "", 200