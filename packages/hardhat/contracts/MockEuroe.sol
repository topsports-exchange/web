// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract MockEuroe is ERC20, Ownable, ERC20Permit {
    using SafeERC20 for IERC20;
    
    constructor(address initialOwner)
        ERC20("MockEuroe", "EUROe")
        Ownable(initialOwner)
        ERC20Permit("MockEuroe")
    {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    function freemint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}