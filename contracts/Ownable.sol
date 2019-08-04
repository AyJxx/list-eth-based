pragma solidity ^0.4.18;

contract Ownable {
  // State variables
  address owner;

  // Modifiers
  modifier onlyOwner() {
    require(msg.sender == owner);
    _; // Function continues on this line if modifier is implemented
  }

  // Constructor
  function Ownable() public {
    owner = msg.sender;
  }
}
