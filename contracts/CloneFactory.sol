// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/proxy/Clones.sol";


contract CloneFactory {
    

    /**
     * @dev Predicts the contract address that will be created using the given implementation, salt, and the current contract address.
     * @param implementation The address of the contract implementation.
     * @param salt The salt value used for address calculation.
     * @return The predicted contract address.
     */
    function predictContractAddress(address implementation, bytes32 salt) external view returns (address) {
        return Clones.predictDeterministicAddress(implementation, salt);
    }

    /**
     * @dev Creates a new clone contract using the given implementation and salt.
     * @param implementation The address of the contract implementation.
     * @param salt The salt value used for address calculation.
     */
    function cloneTestContract(address implementation, bytes32 salt) external {
        Clones.cloneDeterministic(implementation, salt);
    }

}