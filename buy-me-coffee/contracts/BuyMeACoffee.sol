// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BuyMeACoffee {
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    Memo[] public memos;

    event NewMemo(address indexed from, uint256 timestamp, string name, string message);

    function buyCoffee(string memory _name, string memory _message) public payable {
        require(msg.value > 0, "Must send ETH to buy coffee.");

        memos.push(Memo(msg.sender, block.timestamp, _name, _message));

        emit NewMemo(msg.sender, block.timestamp, _name, _message);
    }

    // ✅ Make sure this function is `public view` and returns `memos`
    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }
}
