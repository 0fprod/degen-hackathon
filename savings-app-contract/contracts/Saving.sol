// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {console} from "hardhat/console.sol";

contract Saving {
    struct Savings {
        uint id;
        uint balance;
        uint goal;
    }

    mapping(address => mapping(address => Savings[]))
        public savingsByUserAndToken;

    function createSaving(
        address _tokenAddress,
        uint _amount,
        uint _goal
    ) external {
        Savings[] storage savings = savingsByUserAndToken[msg.sender][
            _tokenAddress
        ];
        uint id = savings.length;
        savings.push(Savings(id, _amount, _goal));
        _transferFrom(_tokenAddress, msg.sender, address(this), _amount);
    }

    function addToSaving(
        address _tokenAddress,
        uint _amount,
        uint _id
    ) external {
        Savings storage saving = _findSaving(_tokenAddress, _id);
        saving.balance += _amount;
        _transferFrom(_tokenAddress, msg.sender, address(this), _amount);
    }

    function withdrawSaving(
        address _tokenAddress,
        uint _amount,
        uint _id
    ) external {
        Savings storage saving = _findSaving(_tokenAddress, _id);
        require(saving.balance >= _amount, "Insufficient balance");
        saving.balance -= _amount;
        _transferFrom(_tokenAddress, address(this), msg.sender, _amount);
    }

    function _transferFrom(
        address _tokenAddress,
        address _sender,
        address _recipient,
        uint256 _amount
    ) internal {
        IERC20 token = IERC20(_tokenAddress);
        bool approved = token.approve(address(this), _amount);
        require(approved, "Approval failed");
        bool success = token.transferFrom(_sender, _recipient, _amount);
        require(success, "Transfer failed");
    }

    function getSavings(
        address _tokenAddress,
        uint _id
    ) external view returns (Savings memory) {
        Savings memory saving = _findSaving(_tokenAddress, _id);
        return saving;
    }

    function _findSaving(
        address _tokenAddress,
        uint _id
    ) internal view returns (Savings storage) {
        Savings[] storage savings = savingsByUserAndToken[msg.sender][
            _tokenAddress
        ];
        require(savings.length > _id, "Saving not found for the given id");
        return savings[_id];
    }
}
