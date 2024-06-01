// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./TestContract.sol";

contract Factory {
    event Deployed(address addr, bytes32 salt);
    event DeployedNew(address addr, bytes32 salt);


    function getAddress(bytes32 salt) public view returns (address) {
        
        address predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            keccak256(type(TestContract).creationCode)
        )))));

        return predictedAddress;
    }

}