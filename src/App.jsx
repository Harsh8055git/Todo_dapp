import Header from "./components/Header";
import { ethers } from "ethers";
import { Card, Button, InputGroup, FormControl } from "react-bootstrap";
import Todo from "./artifacts/contracts/Todo.sol/Todo.json";
import { useState , useEffect } from "react";


const contractAddress = "0x171Fe54d7583F689C708F8F0F0218EED00Bf25e8";
// const contractAddress = "0x90a9D12021755DD37a1f01D3604Fe5DC86092a97"; -- old contract with date and no address 

function App() {
  const [task, addTask] = useState("");
  const [connection, setConnection] = useState(false);
  const [bool, setBool] = useState(false);
  
  const [author, addAuthor] = useState("");
  const [taskArray, updateTask] = useState([]);
  let reverseArr = [];
    useEffect( requestAccount, [bool]);

 
 
  const checkIfWalletIsConnected = () => {
    /*
    * First make sure we have access to window.ethereum
    */
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
      
  
    }
  }

  async function requestAccount() {
    reverseArr=[];

    checkIfWalletIsConnected();
    // we try here to get the public key of the accounts
    let ethAccounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log(ethAccounts);
    setConnection(true);
    // we will load the to do's on blockchain after the wallet is connected
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const contractProvider = new ethers.Contract(contractAddress,Todo.abi, provider);

   
    // below is the code for getting data from bc

    let taskArrayTxn = await contractProvider.getTasks();
    console.log(taskArrayTxn);
    taskArrayTxn.forEach((element, i)=> {
    
    reverseArr.push(taskArrayTxn[taskArrayTxn.length - 1 - i ]);
  
      
    })
    updateTask(reverseArr);
    console.log(taskArray);

  }


  async function addNewTask() {
    if (!window.ethereum || task === "") return;
     await requestAccount();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contractSigner = new ethers.Contract(
      contractAddress,
      Todo.abi,
      signer
    );

    let addTaskTxn = await contractSigner.createTask(task, author);
    await addTaskTxn.wait();
    console.log("added task succesfully");
    
   requestAccount();
   setBool(true);
  } 

  async function toggleTask(e) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();

    
    const contractSigner = new ethers.Contract(contractAddress,Todo.abi,signer);
   try {
    const toggleTxn = await contractSigner.setDoneTrue(e.currentTarget.id);
    await toggleTxn.wait();
    requestAccount(); }
    catch (error){ 
      // e.currentTarget.span.innerText = "if you didn't added this note, you can't mark it as done 😒";
      console.log(error);
      window.alert(" I think you are trying to do changes in someone else's note, if you didn't added this note, you can't mark it as completed 😒")
      

    }
  }
   
   



  return (
    <div>
      <Header />

      <div className="form-group mx-auto" style={{ width: "39rem" }}>
        <label htmlFor="exampleFormControlTextarea1">Add Task</label>
        <textarea
          className="form-control width-10"
          id="exampleFormControlTextarea1"
          rows="5"
          onChange={(e) => addTask(e.target.value)}
          defaultValue={ " Hi there, This project is made using reactjs, etherjs and the smart contract is written in solidity, when you add a note here it gets deployed on the rinkeby test network for forever. This is my first ever dapp that i made after learning etherjs and solidity. Connect with me on twitter @harsh_eth. Have a nice day."}
       / >
      
         
       
        <InputGroup size="sm" className="mb-3 mt-2">
          <InputGroup.Text id="inputGroup-sizing-sm">Name</InputGroup.Text>
          <FormControl
            onChange={(e) => addAuthor(e.target.value)}
          ></FormControl>
        </InputGroup>

        <br />

        
        <Button className="my-2" onClick={addNewTask}>
          {" "}
          Add{" "}
        </Button>

        { !connection && <Button className="my-2 float-right" style={{ margin: "5rem" }}  >
          
          Connect Wallet
        </Button> }
         
        {  connection &&  <Button className="my-2" style={{ margin: "11rem" }}>
          {" "}
          Filter Your Todo's{" "}
        </Button> }
      </div>

      <div> { taskArray.map( (task, i) => (
        <Card
          style={{ width: "39rem" }}
          className="d-flex justify-content-center mx-auto my-2"
          key={i}
          
        >
          <Card.Body>
            <Card.Title> {task.author}</Card.Title>

            <Card.Text className="d-flex flex-column ">
            <label htmlFor={task.id} >
              <input type="checkbox" className="my-2" id={task.id} checked={task.done} onChange={(e) => toggleTask(e)}  />
              <div >
              {task.content} <br/> <span className="red">  </span>
              </div>
              </label>
            </Card.Text>
          </Card.Body>
        </Card> ) )}
      </div>
    </div>
  );
}

export default App;
