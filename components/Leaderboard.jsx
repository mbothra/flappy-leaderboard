import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';  // Adjust path accordingly
import styles from '../styles/Sepolia.module.css';
import { receiverAbi, contractAddress } from "./constants";
import AlertSnackbar from './AlertSnackbar';
import TransactionModal from './TransactionModal';
import { ethers } from 'ethers';
import { Contract } from "alchemy-sdk";
import { useAccount, useSigner, useNetwork } from "wagmi";
import {Table} from '@chainlink/components';

const Sepolia = () => {
    const [data, setData] = useState([]);
    const { data: signer } = useSigner();

    const columns =[
        { 
            label: 'Attendee Name', 
            id: 'name',
            children: (row) => row.name,  
            width: '250px'
        },
        { 
            label: 'Score', 
            id: 'pipeScore',
            children: (row) => row.pipeScore,  
            width: '250px'
        },
        { 
            label: 'Function Activation Score', 
            id: 'chainlinkScore',
            children: (row) => row.chainlinkScore,  
            width: '250px'
        },
        { 
            label: 'Total Score', 
            id: 'totalScore',
            children: (row) => row.totalScore,  
            width: '250px'
        },
        { 
            label: 'Rank', 
            id: 'rank',
            children: (row) => row.rank,  
            width: '150px'
        }
    ]    
    
    const calculateRanks = (dataArray) => {
        const sortableArray = [...dataArray];  // Create a shallow copy of dataArray
    
        return sortableArray.sort((a, b) => {
            let b_amount = hexToNumber(b['totalScore']._hex);
            let a_amount = hexToNumber(a['totalScore']._hex);
            return b_amount - a_amount
        }).map((item, index) => {
            let rank;
            if (index === 0) rank = 'Highest';
            else if (index === 1) rank = 'Second Highest';
            else if (index === 2) rank = 'Third Highest';
            else rank = '';
    
            return { 
                'name': item['name'],
                'pipeScore':hexToNumber(item['pipeScore']._hex), 
                'chainlinkScore':hexToNumber(item['chainlinkScore']._hex), 
                'totalScore':hexToNumber(item['totalScore']._hex), 
                'id': index.toString(),
                rank };
        });
    };
    
    
    
    async function getWeb3Account() {
        const account = await signer.getAddress();
        const chainId = (await provider.getNetwork()).chainId;
        return {
            signer: signer,
            provider: provider,
            chainId: chainId,
            account: account
        };
    }
    
    const hexToNumber = (hex) => {
        return parseInt(hex, 16);
    };
             
    

    const getContractData = async () => {

        const senderContract = new Contract("0x4201DBeBb6A00af00bDDb511aA628bDf8096b8B4", receiverAbi, signer)
        try {
            // Replace this with the actual method from your smart contract
            const rawData = await senderContract.getTopScorers();
            console.log("API call result:", rawData);
            const rankedData = calculateRanks(rawData);
            console.log(rawData)
            setData(rankedData);
            setTimeout(() => getContractData(), 10000);

        } catch (error) {
            console.error("Error calling API:", error);
        }

    };

    const startPolling = () => {
        getContractData();  // Call immediately
        const interval = setInterval(getContractData, 10000);  // Then set the interval
        return () => clearInterval(interval);  // Cleanup function
    };
    

    useEffect(() => {
        if (!signer) return;
        return startPolling();  // Start polling if signer is available
    }, [signer]);  // Dependency on signer
    
    

    return (
        <div className={styles.container}>
            <h1 className={styles.spacing}>Chainlink Functions SmartCon 2023 Championship</h1>
            <h2 className={styles.subtitleSpacing}>Connecting the World's API to smart contracts</h2>

            <div style={{width:'1140px'}}>
             <Table data={data} columns={columns}     initialOrder={{ column: 'name', direction: 'ascending' }} rowKey={(row) => row['id']}/>
             </div>


            {/* <DataTable data={data} columns={columns} className={styles.table} /> */}
            {/* <div className={styles.spacing}>
                <button className={styles.button} onClick={() => getContractData()}>Refresh Data</button>
            </div> */}
            <AlertSnackbar />
            <TransactionModal />
        </div>
    );
};

export default Sepolia;
