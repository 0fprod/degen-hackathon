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
        bool isLocked;
    }

    mapping(address => Savings[]) private savingsByUserAndToken;

    /**
     * @dev Create a new saving
     * @param _tokenAddress token address
     * @param _amount amount to save
     * @param _goal total goal
     * @param _isLocked lock the saving until goal is reached
     */
    function createSaving(
        address _tokenAddress,
        uint _amount,
        uint _goal,
        bool _isLocked
    ) external {
        Savings[] storage savings = savingsByUserAndToken[msg.sender];
        uint8 progress = _calculateProgress(_amount, _goal);
        uint id = savings.length;
        savings.push(
            Savings(id, _tokenAddress, _amount, _goal, progress, _isLocked)
        );
        _transferFrom(_tokenAddress, msg.sender, address(this), _amount);
    }

    /**
     * @dev Add tokens to the saving
     * @param _tokenAddress token address
     * @param _amount amount to add
     * @param _id saving id
     */
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

    /**
     * @dev Transfer tokens from one saving to another
     * @param _tokenAddress token address
     * @param _fromId saving id to transfer from
     * @param _toId saving id to transfer to
     * @param _amount amount to transfer
     */
    function transferASavingToAnother(
        address _tokenAddress,
        uint _fromId,
        uint _toId,
        uint _amount
    ) external {
        Savings storage savingFrom = _findSaving(_tokenAddress, _fromId);
        Savings storage savingTo = _findSaving(_tokenAddress, _toId);
        require(savingFrom.balance >= _amount, "Insufficient balance");

        // handle savingTo exceeding goal
        if (savingTo.balance + _amount > savingTo.goal) {
            uint excess = savingTo.balance + _amount - savingTo.goal;
            savingTo.balance = savingTo.goal;
            savingFrom.balance -= _amount - excess;
            savingFrom.progress = _calculateProgress(
                savingFrom.balance,
                savingFrom.goal
            );
        } else {
            savingFrom.balance -= _amount;
            savingTo.balance += _amount;
            savingFrom.progress = _calculateProgress(
                savingFrom.balance,
                savingFrom.goal
            );
            savingTo.progress = _calculateProgress(
                savingTo.balance,
                savingTo.goal
            );
        }
    }

    /**
     * @dev Withdraw tokens from the saving
     * @param _tokenAddress token address
     * @param _amount amount to withdraw
     * @param _id saving id
     */
    function withdrawSaving(
        address _tokenAddress,
        uint _amount,
        uint _id
    ) external {
        Savings storage saving = _findSaving(_tokenAddress, _id);
        require(saving.balance >= _amount, "Insufficient balance");
        if (saving.isLocked && saving.progress < 100) {
            revert("Saving is locked until goal is reached");
        }

        saving.balance -= _amount;
        saving.progress = _calculateProgress(saving.balance, saving.goal);

        _transferFrom(_tokenAddress, address(this), msg.sender, _amount);
    }

    /**
     * @dev Transfer tokens from the sender to the contract
     * @param _tokenAddress token address
     * @param _amount amount to transfer
     */
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

    /**
     * @dev Get the saving by id
     * @param _tokenAddress token address
     * @param _id saving id
     */
    function getSavings(
        address _tokenAddress,
        uint _id
    ) external view returns (Savings memory) {
        return _findSaving(_tokenAddress, _id);
    }

    /**
     * @dev Get all the savings of the user
     */
    function getUserSavings()
        external
        view
        returns (Savings[] memory _userSavings)
    {
        _userSavings = savingsByUserAndToken[msg.sender];
    }

    /**
     * @dev Find the saving by id
     * @param _tokenAddress token address
     * @param _id saving id
     */
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

    /**
     * @dev Calculate the progress of the saving
     * @param _balance current balance
     * @param _goal total goal
     */
    function _calculateProgress(
        uint _balance,
        uint _goal
    ) internal pure returns (uint8) {
        return uint8((_balance * 100) / _goal);
    }
}
