const Address = "0x20D93f71cD42A0142b8598E53Ad9D4832755345C";
const ABI = [{"constant":true,"inputs":[],"name":"ceoAddress","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getMyMiners","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"initialized","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"sellEggs","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"seedMarket","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"ref","type":"address"}],"name":"hatchEggs","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getMyEggs","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"ref","type":"address"}],"name":"sellEggs","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"eggs","type":"uint256"}],"name":"calculateEggSell","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"ref","type":"address"}],"name":"buyEggs","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}];
const metamaskChainID = 97;
const metamaskHexChainID = '0x61';

//檢查有沒有MetaMask
 if (typeof web3 !== 'undefined') {
     web3 = new Web3(web3.currentProvider);
	 connect()
 } else {
     web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
 }

function connect() {			
	if (typeof web3 !== 'undefined') {
		web3 = new Web3(Web3.givenProvider);
		web3.eth.requestAccounts().then(() => {
			getChain()					  
		});
	} else {
		web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
	}			
}

function getChain() {						
	web3.eth.getChainId().then(function (chainId) {	
		if(chainId == metamaskChainID) {			
			connectWallet()
		} else {
			window.ethereum.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: metamaskHexChainID }]						
			}).then(() => {
				connectWallet()
			}).catch(error => {	
				window.ethereum.request({
					method: 'wallet_addEthereumChain',
					params: [{
						chainId: metamaskHexChainID,
						chainName: "BSCTestNet",
						rpcUrls: ["https://data-seed-prebsc-1-s3.binance.org:8545"],
						nativeCurrency: {
							name: "BNBT",
							symbol: "BNBT",
							decimals: 18,
						},
						blockExplorerUrls: ["https://testnet.bscscan.com/"],
					}]						
				})
			});
		} 	
	})
}

async function connectWallet() {
	coinbase = await web3.eth.getCoinbase();
	$("#address").text(coinbase.substring(0,14) + "...");
	balance = await web3.eth.getBalance(coinbase);
	$("#balance").text(parseFloat(web3.utils.fromWei(balance)).toFixed(3) + ' BNB');
	getContractInfo()
}

async function getContractInfo() {			
    myContract = new web3.eth.Contract(ABI, Address);		
	
    const pool = await myContract.methods.getBalance().call({from: coinbase})
	$("#pool").text(parseFloat(web3.utils.fromWei(pool)).toFixed(3) + ' BNB');
 	const egg = await myContract.methods.getMyMiners().call({from: coinbase})
	$("#egg").text(egg);
	const myEgg = await myContract.methods.getMyEggs().call({from: coinbase})
	const sellPrice = await myContract.methods.calculateEggSell(myEgg).call({from: coinbase})
	$("#reward").text(parseFloat(web3.utils.fromWei(sellPrice)).toFixed(5) + ' BNB');
}


async function go() {
	const chainId = await web3.eth.getChainId();
	if(chainId == metamaskChainID) {
		//抓取網址的地址
		if(location.href.includes('ref')) {
			const address = location.href.split('ref=')[1]
			const price = web3.utils.toWei($("#price").val(), 'ether');	
			myContract.methods.buyEggs(address).send({
				from: coinbase,
				value: price
			}).then(function (result) {
				connectWallet();
			});
		} else {
			const price = web3.utils.toWei($("#price").val(), 'ether');	
			myContract.methods.buyEggs(coinbase).send({
				from: coinbase,
				value: price
			}).then(function (result) {
				connectWallet();
			});
		}		
	} else {
		connect();
	}	
}

async function goAgain() {
	const chainId = await web3.eth.getChainId();
	if(chainId == metamaskChainID) {		
		//放自己的地址
		myContract.methods.hatchEggs(coinbase).send({
			from: coinbase,
		}).then(function (result) {
			connectWallet();
		});
	} else {
		connect();
	}	
}

async function withdraw() {
	const chainId = await web3.eth.getChainId();
	if(chainId == metamaskChainID) {		
		myContract.methods.sellEggs().send({
			from: coinbase,
		}).then(function (result) {
			connectWallet();
		});
	} else {
		connect();
	}	
}

async function copyButton() {
    var textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    textarea.style.position = 'fixed';
    textarea.style.clip = 'rect(0 0 0 0)';
    textarea.style.top = '10px';
    textarea.value = 'https://badgameshow.com/fake/roastturkey.co/#/?ref=' + coinbase;
    textarea.select();
    document.execCommand('copy', true);
    document.body.removeChild(textarea);
    alert("複製成功!");
}

ethereum.on("accountsChanged", (accounts) => {
	web3.eth.getChainId().then(function (chainId) {	
		if(chainId == metamaskHexChainID) {				
			connectWallet();
		}
	})
});