import React, {useEffect} from 'react';
import CircularProgressWithLabel from './CircularProgressWithLabel';
import { useEthers, useBlockNumber } from '@usedapp/core';
 
function TransactionHandler({store}) {
  const blocknumber = useBlockNumber();  
  const { account } = useEthers();
  const [currentCount, setCurrentCount] = React.useState(0);
  const [transactionList, setTransactionList] = React.useState([]);
  useEffect(() => {
    store.subscribe(function(key, value){
      if (key === 'transactions' && value.length > 0) {
        const lastItem = value[value.length-1];
        if (!transactionList.includes(lastItem.hash)) {
          setTransactionList([...transactionList, lastItem]);
          awaitTransaction(lastItem);
        }
      }
    });

    
    
    //getBalance();
  });
  useEffect(() => {
    //getBalance();
    setCurrentCount(0);
  }, [blocknumber, account])

  const awaitTransaction = async (transaction) => {
    //setCurrentCount(currentCount+1);
    //await transaction.wait();
    //setCurrentCount(currentCount-1);   
    //await getBalance();
  };

  return (
    <>
      { 
        currentCount > 0 && 
        <CircularProgressWithLabel label={currentCount}></CircularProgressWithLabel>
      }
    </>
  );
}

export default TransactionHandler;