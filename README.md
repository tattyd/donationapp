# A small donation app using PaymentIntents

This small app allows a pub trivia player to send a one-time payment (a "donation", since they can choose the amount) via the PaymentIntent API. All events received are logged to `transaction_log.json`. Whilst donation amounts are chosen by the player, a mandatory transaction fee (covering Stripe fees) is added on the server.

The server is written in Python, using Flask. The client is a simple one-page jQuery + Bootstrap combo.

## Setup
Install Flask and Stripe Python libraries, if required:

```
pip install -r requirements.txt
```

Then, run the Flask server:

```
export FLASK_APP=server.py
export FLASK_ENV=development
export STRIPE_KEY=sk_test_yourstripesecretkey
flask run
```

Finally, forward WebHook events to the server using the Stripe CLI in order to generate an event log:

```
stripe listen --forward-to http://127.0.0.1:5000/webhook
```

Your server should start on [http://127.0.0.1:5000]. If you need to adjust to use a different developer key, change it in two places: once in `server.py` and once in `donation.js`.

## Known issues

- A failed payment (e.g. declined card), followed by navigation back to edit the payment amount, followed by forward navigation and re-trying the payment, causes a Stripe JS error. (See friction log).
- The loading spinner doesn't appear on the 'Pay now' button.
- Some state is kept in memory between requests, recommend not restarting the server during payment sessions. Creating a PaymentIntent, clicking 'Back' to edit the payment amount, then restarting the server, then trying to pay with a new amount, will result in a server error.