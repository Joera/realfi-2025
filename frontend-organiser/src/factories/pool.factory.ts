import { Batch, Pool } from "@s3ntiment/shared";
import { IServices } from "../services/services";
import surveyStore from 's3ntiment-contracts/deployments/base/S3ntimentSurveyStore.json' assert { type: 'json' }

export const getPoolInfo = async (services:IServices, poolId: string) : Promise<Pool> => {

    const [safeAddress, createdAt ] = await services.viem.read(surveyStore.address as `0x${string}`, surveyStore.abi,"getPool", [poolId]);
    console.log(safeAddress)

    // batches ??
    const batches: Batch[] = [];
    const _batches = await services.viem.read(surveyStore.address as `0x${string}`, surveyStore.abi,"getPoolBatches", [poolId]);

    console.log(_batches)

    const abi = [{
        "inputs": [],
        "name": "getOwners",
        "outputs": [
            {
            "internalType": "address[]",
            "name": "",
            "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
        }];

    const owners  = await services.viem.read(safeAddress, abi,"getOwners", []);
    console.log(owners)

    return {
            id: poolId, 
            name: "",
            safeAddress, 
            batches: [],
            owners,
            readers: [],
            createdAt: Number(createdAt)
    }
}