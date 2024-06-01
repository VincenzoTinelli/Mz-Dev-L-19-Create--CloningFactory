// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";


contract TestContract is Initializable {
    address public owner;
    uint public foo;
    // This function is used to initialize the contract with an owner and a foo value
    function initialize(address _owner, uint _foo) payable external initializer {
        owner = _owner;
        foo = _foo;
    }

    // This function returns the balance of the contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    // This function is used to transfer tokens or ETH from the contract to a specified address
    function contractTokenTransfer(address _token, address _to, uint _amount) external {
        // Only the owner can call this function
        require(msg.sender == owner, "Only owner can call this function");
        // Check if the destination address is valid
        require(_to != address(0), "Invalid address");
        bool sent;
        if (_token == address(0)) {
            // If the token is ETH, transfer the specified amount to the destination address
            (sent, ) = payable(_to).call{value: _amount}("");
            require(sent, "!sent");
        } else {
            // If the token is not ETH, transfer the specified amount of tokens to the destination address
            SafeERC20.safeTransfer(IERC20(_token), _to, _amount);
        }
    }


}