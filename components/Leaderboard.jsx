import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';  // Adjust path accordingly
import styles from '../styles/Sepolia.module.css';
import { receiverAbi, contractAddress } from "./constants";
import AlertSnackbar from './AlertSnackbar';
import TransactionModal from './TransactionModal';
import { ethers } from 'ethers';
import { Contract } from "alchemy-sdk";
import { useAccount, useSigner, useNetwork } from "wagmi";

const Sepolia = () => {
    const [data, setData] = useState([]);
    const { data: signer } = useSigner();

    const columns = [
        { label: 'Attendee Name', dataKey: 'name', width: 250 },
        { label: 'Score', dataKey: 'pipeScore', numeric: true, width: 250 },
        { label: 'Function Activation Score', dataKey: 'chainlinkScore',  width: 250 },
        { label: 'Total Score', dataKey: 'totalScore',  width: 250 },
        { label: 'Rank', dataKey: 'rank', width: 150 }
    ];
    
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

        } catch (error) {
            console.error("Error calling API:", error);
        }

    };

    useEffect(() => {
        // Load data from localStorage when the component mounts
        const interval = setInterval(() => {
            getContractData();
        }, 60000);  // Polls every minute
    
        return () => clearInterval(interval); // Clean up on component unmount
    }, []);
    

    return (
        <div className={styles.container}>
            <h1 className={styles.spacing}>Chainlink Function SmartCon'23 Championship</h1>
            <h2 className={styles.subtitleSpacing}>Connecting the World to Chain</h2>
            <DataTable data={data} columns={columns} className={styles.table} />
            <div className={styles.spacing}>
                <button className={styles.button} onClick={() => getContractData()}>Refresh Data</button>
            </div>
            <AlertSnackbar />
            <TransactionModal />
        </div>
    );
};

export default Sepolia;
