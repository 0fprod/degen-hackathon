// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {console} from "hardhat/console.sol";

contract Saving {
    struct Savings {
        uint balance;
        uint goal;
        address tokenAddress;
    }

    mapping(address => Savings[]) public savingsByUser;

    function createSaving(
        address _tokenAddress,
        uint _amount,
        uint _goal
    ) external {
        savingsByUser[msg.sender].push(Savings(_amount, _goal, _tokenAddress));
        _transferFrom(_tokenAddress, msg.sender, address(this), _amount);
    }

    function withdrawSaving(address _tokenAddress, uint _amount) external {
        Savings storage saving = _findSaving(_tokenAddress);
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
        address _tokenAddress
    ) external view returns (Savings memory) {
        Savings memory saving = _findSaving(_tokenAddress);
        require(saving.tokenAddress == _tokenAddress, "No savings found");
        return saving;
    }

    function _findSaving(
        address _tokenAddress
    ) internal view returns (Savings storage) {
        Savings[] storage savings = savingsByUser[msg.sender];
        for (uint i = 0; i < savings.length; i++) {
            if (savings[i].tokenAddress == _tokenAddress) {
                return savings[i];
            }
        }
        revert("No savings found");
    }
}
