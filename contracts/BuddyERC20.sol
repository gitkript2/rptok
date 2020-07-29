pragma solidity ^0.5.0;

import "../../../packages/arbos-contracts/contracts/ArbSys.sol";
import "../../../packages/arb-bridge-eth/contracts/inbox/IGlobalInbox.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract ArbBaseERC20 is ERC20, ERC20Detailed {
    constructor() public ERC20Detailed("Token Buddy", "TB", 18) {}
}

// contract PairedErc20 is ArbBaseERC20 {
//     function mint(address account, uint256 amount) external;   
//     function burn(address account, uint256 amount) external;
// }

contract ArbERC20 is ArbBaseERC20 {
    function adminMint(address account, uint256 amount) public {
        // This function is only callable through admin logic since address 1 cannot make calls
        // require(msg.sender == address(1));
        _mint(account, amount);
    }

    function withdraw(address account, uint256 amount) public {
        _burn(msg.sender, amount);
        ArbSys(100).withdrawERC20(account, amount);
    }
}

contract BuddyERC20 is ArbBaseERC20 {
    address public inbox;
    address public chain;

    constructor() public {}

    function initialize(address _rollupChain, address _inbox) public {
        inbox = _inbox;
        chain = _rollupChain;
        IGlobalInbox(_inbox).deployL2ContractPair(
            _rollupChain,
            type(ArbERC20).creationCode
        );
    }

    function mint(address account, uint256 amount) public {
        require(inbox == msg.sender, "must be authorized rollup-chain");
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public {
        require(inbox == msg.sender, "must be authorized rollup-chain");
        _burn(account, amount);
    }
}