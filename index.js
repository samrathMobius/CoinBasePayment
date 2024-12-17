require("dotenv").config();
const express = require("express");
const app = express();

app.use(express.json({
    verify: (req, res, buf) => {
        const url = req.originalUrl;
        if (url.startsWith("/webhook")) {
            req.rawBody = buf.toString();
        } 
    }
}));

var coinbase = require('coinbase-commerce-node');
var Client = coinbase.Client;
var resources = coinbase.resources;
var Webhook = coinbase.Webhook;
 
Client.init(process.env.COINBASE_API_KEY);

app.post("/checkout", async (req, res) => {
    const { amount, currency } = req.body;

    try {
        const charge = await resources.Charge.create({
            name: "Test Charge",
            description: "Test charge description",
            local_price: {
                amount: amount,
                currency: currency,
            },
            pricing_type: "fixed_price",
            metadata: {
                user_id: "2323"
            },
        });

        res.status(200).json({
            charge: charge,

        });
    } catch (error){
        res.status(500).json({
            error: error,
        })
    };
});

app.post("/webhook", async (req,res) => {
    const event = Webhook.verifyEventBody(
        req.rawBody,
        req,headers["x-cc-webhook-signature"],
        process.env.COINBASE_WEBHOOK_SECRET
    );

    if (event.type === "charge:confirmed"){
        let amount = event.data.pricing.local.amount;
        let currency = event.data.pricing.local.currency;
        let user_id = event.data.metadata.user_id;

        console.log(amount, currency, user_id);
    }
     
})

app.listen(3000, () => {
    console.log("server running on port 3000");
});


