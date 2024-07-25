// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TxHistory {
    address public owner = msg.sender;
    mapping(address => bool) public claimed;
    uint public txAmount = 0.005 ether;

    function claim(address beneficiary) public {
        require(!claimed[beneficiary], "Already claimed");
        require(msg.sender == owner, "Only owner");
        claimed[beneficiary] = true;
        (bool sent, bytes memory data) = (beneficiary).call{value: txAmount}("");
        require(sent, "Failed to send Ether");
        data;
    }

    function withdraw(uint amount) public {
        require(msg.sender == owner, "Only owner");
        (bool sent, bytes memory data) = (owner).call{value: amount}("");
        require(sent, "Failed to send Ether");
        data;
    }

    // Fallback function to receive ETH
    receive() external payable {}
}