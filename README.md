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

## Reverts

## buy reverts
reason: 'transaction failed',
  code: 'CALL_EXCEPTION',
(generic error for various reasons that are not clear)


reason: 'transaction failed',
  code: 'CALL_EXCEPTION',
bscscan says: Fail with error 'PancakeRouter: EXCESSIVE_INPUT_AMOUNT'


Fail with error 'PancakeRouter: EXCESSIVE_INPUT_AMOUNT'
Function: swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline)
0	amountOut	uint256	307414692810778444

***305:GONNA buy: buyGasPrice: 109.212  gaslimit: 1500003
108amountOutMin :  0.0 token 0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d
        address :  0xa60B6dD29e42eBc5c670D1B1E1b4951adA040f5b date: 1678533658
       amountin :  0.001
       gasprice :  109.212 gaslimit :  500001
150             : getAmountsOut
152    swapfunc : swapETHForExactTokens: outMin: 4000.0
166: wait on tx :  0xf5835bf339e7b9d9979a1967ffce33f6eaa957451c86a0613aff69caefec1f83
167:      value :  0.001
168:   gasprice :  109.212
169:   gasLimit :  500001

## sell reverts
reason: 'data signature does not match function swapETHForExactTokens.',
  code: 'INVALID_ARGUMENT',
(generic error for various reasons that are not clear)


reason: 'replacement fee too low',
  code: 'REPLACEMENT_UNDERPRICED',
  reason: 'processing response error',
    code: 'SERVER_ERROR',
    body: '{"jsonrpc":"2.0","id":211,"error":{"code":-32000,"message":"replacement transaction underpriced"}}\n',
    error: Error: replacement transaction underpriced
In bscscan error
 Contract 0x10ed43c718714eb63d5aa57b78b54704e256024e (PancakeSwap: Router v2) 
 Warning! Error encountered during contract execution [out of gas] 
   call_0_1_1	from:0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c		to:0x10ed43c718714eb63d5aa57b78b54704e256024e	value:0.001001055450001475 BNB	gaslimit:2,300
(looks like the network was so congested that the token transfer max gas off 2300 was not enough)
https://stackoverflow.com/questions/74930609/solidity-fallback-function-gas-limit



reason: 'failed to get consistent fee data',
  code: 'UNSUPPORTED_OPERATION',
  operation: 'signer.getFeeData'



bscscan: Fail with error 'PancakeRouter: INSUFFICIENT_OUTPUT_AMOUNT€'


reason: 'transaction failed',
  code: 'CALL_EXCEPTION',
bscan:Fail with error 'PancakeRouter: INSUFFICIENT_OUTPUT_AMOUNT€'
0	amountIn	uint256	1020010945522633638
1	amountOutMin	uint256	990031222397547

***305:GONNA buy: buyGasPrice: 10.0  gaslimit: 1020000
108amountOutMin :  0.0 token 0x8EB011A946E242d587eD098d2eB2e4F9699232dC
        address :  0xa60B6dD29e42eBc5c670D1B1E1b4951adA040f5b date: 1678532382
       amountin :  0.001
       gasprice :  10.0 gaslimit :  340000
120    swapping : swapExactETHForTokens: outMin: 0.0

