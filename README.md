This is the Front runner bot

## Getting Started

First, in a commandline/terminal go into the project directory and type:
```bash
yarn install
```

Next, create a text file called 
```bash
.env
```

Then edit this file and add this line:

```bash
PRIVATE_KEY="your wallet private  key"
```

Replace "your wallet private  key" wit hyour actual private key...

then save this file to the project directory.

*****NEVER CHECK IN YOUR .env FILE!!!!  you are giving away your private key then!!!!

Next, open up bots.js in a text editor or in MS code, and add your wss link to line 25:

```bash
var wss = "wss://your link goes here";
```

You can also adjust the parameters lines 8-13:

```bash
const WHALE_SIZE = 1;// Only front run whales buying this many BNB or more
const BUY_BNB_AMOUNT = 0.001;// How much BNB you want to use for token front run
const BUY_SLIPPAGE = 25;//1;// this is a whole number percentage i.e. 1 = 1%  Sets the minimum percentage of the token received before it reverts.  ZERO means you are willing to not get any tokens.  1% means you will only miss 1% of the toal that you want.  50% meams ypou are willing to only get as low as 50% of the tokens owed
const SELL_SLIPPAGE = 25;
const BUY_GAS_BOOST = 5000000000; 
const BUY_GASLIMIT_BOOST = 2;
```

Then save the file and in a commandline or terminal type:
```bash
yarn start
```

Ctrl+C will kill the app...