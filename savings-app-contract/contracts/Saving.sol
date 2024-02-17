// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {console} from "hardhat/console.sol";

contract Saving {
    struct Savings {
        uint id;
        address tokenAddress;
        uint balance;
        uint goal;
        uint8 progress;
    }

    mapping(address => Savings[]) private savingsByUserAndToken;

    function createSaving(
        address _tokenAddress,
        uint _amount,
        uint _goal
    ) external {
        Savings[] storage savings = savingsByUserAndToken[msg.sender];
        uint8 progress = _calculateProgress(_amount, _goal);
        uint id = savings.length;
        savings.push(Savings(id, _tokenAddress, _amount, _goal, progress));
        _transferFrom(_tokenAddress, msg.sender, address(this), _amount);
    }

    function addToSaving(
        address _tokenAddress,
        uint _amount,
        uint _id
    ) external {
        Savings storage saving = _findSaving(_tokenAddress, _id);
        saving.balance += _amount;
        saving.progress = _calculateProgress(saving.balance, saving.goal);
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
        return _findSaving(_tokenAddress, _id);
    }

    function getUserSavings()
        external
        view
        returns (Savings[] memory _userSavings)
    {
        _userSavings = savingsByUserAndToken[msg.sender];
    }

    function _findSaving(
        address _tokenAddress,
        uint _id
    ) internal view returns (Savings storage) {
        Savings[] storage savings = savingsByUserAndToken[msg.sender];
        for (uint i = 0; i < savings.length; i++) {
            if (
                savings[i].id == _id && savings[i].tokenAddress == _tokenAddress
            ) {
                return savings[i];
            }
        }
        revert("Saving not found for the given id");
    }

    function _calculateProgress(
        uint _balance,
        uint _goal
    ) internal pure returns (uint8) {
        return uint8((_balance * 100) / _goal);
    }
}
