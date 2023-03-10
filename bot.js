require("dotenv").config();//private key is in .env file instead of putting it in source... safer


//--------------------------
//---  Modify these --------
const TEST = false;// dont actually buy or sell
const TARGETTOKEN = null; // put address of token you just want to front run.  null for any token

const WHALE_SIZE = 1;// Only front run whales buying this many BNB or more
const BUY_BNB_AMOUNT = 0.001;// How much BNB you want to use for token front run
const BUY_SLIPPAGE = 0;//25;//1;// this is a whole number percentage i.e. 1 = 1%  Sets the minimum percentage of the token received before it reverts.  ZERO means you are willing to not get any tokens.  1% means you will only miss 1% of the toal that you want.  50% meams ypou are willing to only get as low as 50% of the tokens owed
const SELL_SLIPPAGE = 0;//25;// how much less off the BNB you are willing to not get when you sell tokens
const BUY_GAS_BOOST = 5000000000; // this is on 10^9 digits.  it equals 5 gwei.  this will be added to the gasPrice to "jackup" the gasprice more
const BUY_GASLIMIT_BOOST = 2;// This is a multiplier to multiply the gaslimit... also helps to jackup the gas price

const BLACKLIST_TOKEN = '0x55d398326f99059fF775485246999027B3197955';// BUSD - we dont want this
//--------------------------
//--------------------------


const express = require("express");
const http = require('http');
const Web3=  require("web3")
const ethers = require("ethers");
const app = express();
const PORT = process.env.PORT || 3888;
var wss = "wss://clean-radial-energy.bsc.discover.quiknode.pro/d8b868a31b38349cd6f140d74e4cc97826324b7f/";//"wss://clean-radial-energy.bsc.discover.quiknode.pro/d8b868a31b38349cd6f140d74e4cc97826324b7f/";//"wss://prettiest-chaotic-road.bsc.discover.quiknode.pro/343ca333a4a630c483e1747f8968cb2a65b28ff9/";//"wss://polished-capable-tab.bsc.discover.quiknode.pro/d420d1e00e9ce18def89cb781f26624977ef3989/";
const web3 = new Web3(wss);
let processing = false;

const secretKey = process.env.PRIVATE_KEY;
const PAN_ROUTER_ADDRESS =  "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const BNB_CONTRACT = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
const swapAbi =  [{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"uint256","name":"_decimals","type":"uint256"},{"internalType":"uint256","name":"_supply","type":"uint256"},{"internalType":"uint256","name":"_txFee","type":"uint256"},{"internalType":"uint256","name":"_burnFee","type":"uint256"},{"internalType":"uint256","name":"_charityFee","type":"uint256"},{"internalType":"address","name":"_FeeAddress","type":"address"},{"internalType":"address","name":"tokenOwner","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"FeeAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_BURN_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_CHARITY_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_TAX_FEE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"burn","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tAmount","type":"uint256"}],"name":"deliver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"excludeAccount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"includeAccount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isCharity","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"isExcluded","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"tAmount","type":"uint256"},{"internalType":"bool","name":"deductTransferFee","type":"bool"}],"name":"reflectionFromToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"setAsCharityAccount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"rAmount","type":"uint256"}],"name":"tokenFromReflection","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalBurn","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalCharity","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalFees","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_txFee","type":"uint256"},{"internalType":"uint256","name":"_burnFee","type":"uint256"},{"internalType":"uint256","name":"_charityFee","type":"uint256"}],"name":"updateFee","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const abi = [{"inputs":[{"internalType":"address","name":"_factory","type":"address"},{"internalType":"address","name":"_WETH","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETHSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermitSupportingFeeOnTransferTokens","outputs":[{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityWithPermit","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}]


function calculate_gas_price(action, amount){
  if (action==="buy"){
    return amount.add(BUY_GAS_BOOST);//ethers.utils.parseUnits(amount.add(1000000000), 'gwei')
  }else{
    return amount.sub(1000000000);//ethers.utils.parseUnits(amount.sub(1000000000), 'gwei')
  }
}


function router(account) {
  return new ethers.Contract(
    PAN_ROUTER_ADDRESS,
      [
          'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
          'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
          'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)',
          'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable',
          'function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline) external payable',
          'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
          'function swapExactTokensForETH (uint amountOutMin, address[] calldata path, address to, uint deadline) external payable'
      ],
      account
  );
}


function erc20(account,tokenAddress) {
  return new ethers.Contract(
      tokenAddress,
      [{
          "constant": true,
          "inputs": [{"name": "_owner", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"name": "balance", "type": "uint256"}],
          "payable": false,
          "type": "function"
      },
      {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
      {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
      {
        "constant": false,
        "inputs": [{"name": "_spender","type": "address"},{"name": "_value","type": "uint256"}],
        "name": "approve",
        "outputs": [{"name": "","type": "bool"}],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
      },
    ],
      account
  );
}


const buyToken = async(account,tokenContract,gasLimit,gasPrice, swapFunc)=>{
  //buyAmount how much are we going to pay for example 0.1 BNB
  const buyAmount = BUY_BNB_AMOUNT//0.001

  //Slippage refers to the difference between the expected price of a trade and the price at which the trade is executed
  const slippage = BUY_SLIPPAGE;//0  // in whole percentage i.e. 1 = 1% slip, slip means you will get a minimum of 1% less tokens before it reverts and cancels the buy.  a slip of 0 means no revert - you might get zero tokens.  percent can only be whole numbers...

  //amountOutMin how many token we are going to receive
  let amountOutMin = 0;
  const amountIn = ethers.utils.parseUnits(buyAmount.toString(), 'ether');
  
  if (parseInt(slippage) !== 0) {
    console.log("102: buying slip : ",tokenContract);
    const amounts = await router(account).getAmountsOut(amountIn, [BNB_CONTRACT, tokenContract]);
    console.log("104:   rev amounts : ", ethers.utils.formatUnits(amounts[0],'ether'), ethers.utils.formatUnits(amounts[1],'ether'));
    amountOutMin = amounts[1].sub(amounts[1].div(100).mul(`${slippage}`));
  }
  //amountOutMin: 0 bnb 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c token 0x674aA28Ac436834051fff3fC7b6e59D6f9c57a1c 0xa60B6dD29e42eBc5c670D1B1E1b4951adA040f5b 1678289324722 BigNumber { _hex: '0x016345785d8a0000', _isBigNumber: true } BigNumber { _hex: '0x02eda5', _isBigNumber: true } 7.000000001
  console.log("108amountOutMin : ",ethers.utils.formatUnits(amountOutMin,'ether'), "token",tokenContract);
  console.log("        address : ",account.address, "date:",(Math.round(Date.now() / 1000) + (60 * 10)))
  console.log("       amountin : ",ethers.utils.formatUnits(amountIn,'ether')) 
  console.log("       gasprice : ",ethers.utils.formatUnits(gasPrice,'gwei'), "gaslimit : ",gasLimit.toString());
  if(!TEST){
    let tx;
    if(swapFunc == 1)
    {
      //console.log("118             : getAmountsOut");
      //const amounts = await router(account).getAmountsOut(amountIn, [BNB_CONTRACT, tokenContract]);
      console.log("120    swapping : swapExactETHForTokens");
      tx = await router(account).swapExactETHForTokens(
        1,
        [BNB_CONTRACT, tokenContract],
        account.address,
        (Math.round(Date.now() / 1000) + (60 * 10)),//(Date.now() + 1000 * 60 * 10),
        {
            'value': amountIn,
            'gasLimit': gasLimit,
            'gasPrice': gasPrice,
        }
      );
    }
    else if(swapFunc == 2)
    {
      console.log("135    swapfunc : swapExactETHForTokensSupportingFeeOnTransferTokens");
      tx = await router(account).swapExactETHForTokensSupportingFeeOnTransferTokens(
        amountOutMin,
        [BNB_CONTRACT, tokenContract],
        account.address,
        (Math.round(Date.now() / 1000) + (60 * 10)),//(Date.now() + 1000 * 60 * 10),
        {
            'value': amountIn,
            'gasLimit': gasLimit,
            'gasPrice': gasPrice,
        }
      );
    }
    else if(swapFunc == 3)//swapETHForExactTokens
    {
      console.log("150             : getAmountsOut");
      const amounts = await router(account).getAmountsOut(amountIn, [BNB_CONTRACT, tokenContract]);
      console.log("152    swapfunc : swapETHForExactTokens");
      tx = await router(account).swapETHForExactTokens(
        amounts[1],
        [BNB_CONTRACT, tokenContract],
        account.address,
        (Math.round(Date.now() / 1000) + (60 * 10)),//(Date.now() + 1000 * 60 * 10),
        {
            'value': amountIn,
            'gasLimit': gasLimit,
            'gasPrice': gasPrice,
        }
      );
    }
    
    console.log("166: wait on tx : ",tx.hash);
    console.log("167:      value : ",ethers.utils.formatUnits(tx.value));
    console.log("168:   gasprice : ",ethers.utils.formatUnits(tx.gasPrice,'gwei'));
    console.log("169:   gasLimit : ",tx.gasLimit.toString());
    const receipt = await tx.wait();
    console.log("171: tx received");
    if (receipt && receipt.blockNumber && receipt.status === 1) { // 0 - failed, 1 - success
      console.log(`Transaction https://bscscan.com/tx/${receipt.transactionHash} mined, status success`);
    } else if (receipt && receipt.blockNumber && receipt.status === 0) {
      console.log(`Transaction https://bscscan.com/tx/${receipt.transactionHash} mined, status failed`);
    } else {
      console.log(`Transaction https://bscscan.com/tx/${receipt.transactionHash} not mined`);
    }
  }
}


const sellToken = async(account,tokenContract,gasLimit,gasPrice,value=99)=>{
  const sellTokenContract = new ethers.Contract(tokenContract,swapAbi,account)
  const contract = new ethers.Contract(PAN_ROUTER_ADDRESS,abi,account)
  const accountAddress = account.address
  const tokenBalance = TEST ? ethers.utils.parseEther("10") : await erc20(account,tokenContract).balanceOf(accountAddress);
  let amountOutMin = 0;
  const slippage = SELL_SLIPPAGE;//1;
  const amountIn = tokenBalance.mul(value).div(100)
  console.log("191     amountIn : ",ethers.utils.formatUnits(amountIn,'ether'), "tokenBalance:",ethers.utils.formatUnits(tokenBalance,'ether'), "token:",tokenContract)
  const amounts = await router(account).getAmountsOut(amountIn, [tokenContract,BNB_CONTRACT]);
  if (parseInt(slippage) !== 0) {
    amountOutMin = amounts[1].sub(amounts[1].mul(`${slippage}`).div(100));
  } else {
    amountOutMin = amounts[1]
  }
  console.log("*198amountOutMin : ",ethers.utils.formatUnits(amountOutMin,'ether'),tokenContract);
  console.log("  accountAddress : ",accountAddress, "date:", (Math.round(Date.now() / 1000) + (60 * 10)));
  console.log("        gasprice : ",ethers.utils.formatUnits(gasPrice,'gwei'), "gaslimit : ",gasLimit.toString());
  if(!TEST){
    const approve = await sellTokenContract.approve(PAN_ROUTER_ADDRESS, amountIn);
    console.log("203: wait approve...")
    const receipt_approve = await approve.wait();
    console.log("205: approve finished:", receipt_approve.transactionHash, "gas used:",receipt_approve.gasUsed.toString(), "cumalGas:", receipt_approve.cumulativeGasUsed.toString(), "effectGas:", receipt_approve.effectiveGasPrice, "block:", receipt_approve.blockNumber, "status:",receipt_approve.status)
    if (receipt_approve && receipt_approve.blockNumber && receipt_approve.status === 1) { 
      console.log(`Approved https://bscscan.com/tx/${receipt_approve.transactionHash}`);
      const swap_txn = await contract.swapExactTokensForETHSupportingFeeOnTransferTokens(
        amountIn ,amountOutMin, 
        [tokenContract, BNB_CONTRACT],
        accountAddress,
        (Math.round(Date.now() / 1000) + (60 * 10)),//(Date.now() + 1000 * 60 * 10),
        {
          'gasLimit': gasLimit,
          'gasPrice': gasPrice,
        }
      )
      console.log("218: wait tx...", swap_txn)
      const receipt = await swap_txn.wait();
      console.log("220: tx finished",tokenContract)
      if (receipt && receipt.blockNumber && receipt.status === 1) { // 0 - failed, 1 - success
        console.log(`Transaction https://bscscan.com/tx/${receipt.transactionHash} mined, status success`);
      } else if (receipt && receipt.blockNumber && receipt.status === 0) {
        console.log(`Transaction https://bscscan.com/tx/${receipt.transactionHash} mined, status failed`);
      } else {
        console.log(`Transaction https://bscscan.com/tx/${receipt.transactionHash} not mined`);
      }
    }
  }
  processing = false;
}


var init = async function () {
  var customWsProvider = new ethers.providers.WebSocketProvider(wss);
  const wallet = new ethers.Wallet(secretKey);
  const account = wallet.connect(customWsProvider)
  const iface = new ethers.utils.Interface(['function    swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline)',
'function swapETHForExactTokens(uint amountOut, address[] calldata path, address to, uint deadline)',
'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint amountOutMin,address[] calldata path,address to,uint deadline)'])

customWsProvider.on("pending", (tx) => {
  customWsProvider.getTransaction(tx).then(async function (transaction) {
  // now we will only listen for pending transaction on pancakesswap factory
  if(transaction && transaction.to==="0x10ED43C718714eb63d5aA57B78B54704E256024E"){
    const value = web3.utils.fromWei(transaction.value.toString())
    const gasPrice= web3.utils.fromWei(transaction.gasPrice.toString())
    const gasLimit= web3.utils.fromWei(transaction.gasLimit.toString())
  // for example we will be only showing transaction that are higher than 30 bnb
    if(value>WHALE_SIZE) {//nachomod 10
      let swapFunc = 0;
      let swapName = "";
      let result = []
      //we will use try and catch to handle the error and decode the data of the function used to swap the token
      try {
        result = iface.decodeFunctionData('swapExactETHForTokens', transaction.data)
        swapName = "swapExactETHForTokens"
        swapFunc = 1
      } catch (error) {
      try {
        result = iface.decodeFunctionData('swapExactETHForTokensSupportingFeeOnTransferTokens', transaction.data)
        swapName = "swapExactETHForTokensSupportingFeeOnTransferTokens"
        swapFunc = 2
      } catch (error) {
      try {
        result = iface.decodeFunctionData('swapETHForExactTokens', transaction.data)
        swapName = "swapETHForExactTokens"
        swapFunc = 3;
      } catch (error) {
        console.log("================= final err : swapETHForExactTokens =============", error,transaction);//,transaction);
        processing = false;
        return;
      }
      }
      }

      //for now, just do swapExactETHForTokensSupportingFeeOnTransferTokens -- gotta debug the other ones later
      /*if(swapFunc != 2){
        processing = false; 
        return;
      }*/

      if(result.length>0){
        let tokenAddress = ""
        if(result[1].length>0){
          if(processing) return;//we will only handle one "front run" at a time
          processing = true;

          tokenAddress = result[1][1];
          if(TARGETTOKEN && (tokenAddress !== TARGETTOKEN || tokenAddress === BLACKLIST_TOKEN)){ 
            processing = false;
            return;
          }

          console.log("------295:value : (",value,") -------------------");
          console.log("          token : (", tokenAddress,")" );
          console.log("       function : ", swapName)
          console.log("           from : ", transaction.from );
          console.log("       gasPrice : ",transaction.gasPrice.toString(), "gasLimit",transaction.gasLimit.toString());

          const buyGasPrice = calculate_gas_price("buy",transaction.gasPrice)
          const buyGasLimit = transaction.gasLimit.mul(BUY_GASLIMIT_BOOST);
          const sellGasPrice = calculate_gas_price("sell",transaction.gasPrice)

          console.log("***305:GONNA buy: buyGasPrice:",ethers.utils.formatUnits(buyGasPrice, 'gwei'), " gaslimit:", buyGasLimit.toString());
          // after calculating the gas price we buy the token
          await buyToken(account,tokenAddress,transaction.gasLimit,buyGasPrice, swapFunc);//transaction.gasLimit
          // after buying the token we sell it
          console.log(""); 
          console.log("**310:GONNA sell: sellGasPrice",ethers.utils.formatUnits(sellGasPrice, 'gwei'),'gaslimit:', transaction.gasLimit.toString());
          await sellToken(account,tokenAddress,transaction.gasLimit,sellGasPrice)
          console.log("************************ COMPLETE **************************")
          console.log("");
          console.log("");
          console.log("");
        }
      }
    }
    }
  });
});


customWsProvider._websocket.on("error", async (ep) => {
  console.log(`Unable to connect to ${ep.subdomain} retrying in 3s...`);
  setTimeout(init, 3000);
});


customWsProvider._websocket.on("close", async (code) => {
  console.log(
  `Connection lost with code ${code}! Attempting reconnect in 3s...`
  );
  customWsProvider._websocket.terminate();
  setTimeout(init, 3000);
});

};


init();
//now we create the express server
const server = http.createServer(app);
// we launch the server
server.listen(PORT, () => {
console.log(`Listening on port ${PORT}`)});