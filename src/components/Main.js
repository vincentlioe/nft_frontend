import React, {Component} from 'react';
import Web3 from 'web3';
import Color from './Color.json';

class Main extends Component{
    constructor(props){
        super(props);
        this.state = {
            account : '',
            contract : null,
            totalSupply: 0,
            colors: [],
            input : '',
            loading : false
        };
        this.handleInput = this.handleInput.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    async loadWeb3(){
        if(window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        }
        else {
            alert('non ethereum browser detected');
        }
    }

    async loadBlockChainData(){
       const web3 = window.web3;
       const accounts = await web3.eth.getAccounts();
       this.setState({
            account : accounts[0]
       });
       const networkId = await web3.eth.net.getId();
       const networkData = Color.networks[networkId];
       if(networkData){
           const abi = Color.abi;
           const address = networkData.address;
           const contract = new web3.eth.Contract(abi,address);
            this.setState({
                contract : contract
            });
            const totalSupply = await contract.methods.totalSupply().call();
            this.setState({
                totalSupply : totalSupply
            });
            const colors = [];
            for(let i = 0; i < totalSupply; ++i){
                const color = await contract.methods.colors(i).call();
                colors.push(color);
            }
            this.setState({
                colors : colors
            });
        }else{
           alert('smart contract not deployed on the network');
       }
    }

    async componentDidMount() {
        await this.loadWeb3();
        await this.loadBlockChainData();
    }

    handleInput(e){
        let value = e.target.value;
        this.setState({
            input : value
        })
    }

    async handleSubmit(e){
        e.preventDefault();
        this.setState({
            loading : true
        });
        await this.state.contract.methods.mint(this.state.input).send({from : this.state.account});
        this.setState({
            loading : false
        });
        await this.loadBlockChainData();
    }
    render(){
        return(
            <div className="w-100">
                <h1 className="text-danger">My Account: {this.state.account}</h1>
                <h2>Mint new token (color)</h2>
                <div className="row w-100 py-3">
                    <div className="form-group col-10">
                        <input className="form-control" placholder="color hex code" value={this.state.input} onChange={this.handleInput}></input>
                    </div>
                    <div className="col-2">
                        {
                            this.state.loading?
                            <div className="spinner-border" role="status">
                                <span className="sr-only"></span>
                            </div>
                            :
                            <button className="btn btn-primary btn-block w-100" onClick={this.handleSubmit}>Mint</button>
                        }
                    </div>
                </div>
                <div className="pt-5 row text-center">
                    {this.state.colors.map( (color,key) => {
                        return(
                            <div className="col-md-3 mb-3" key={key}>
                                <div className="token" style={{backgroundColor: color}}></div>
                                <div>{color}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}
export default Main;
