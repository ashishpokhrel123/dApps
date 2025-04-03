const { expect } = require("chai");

describe("BuyMeACoffee", function () {
  let buyMeACoffee;
  let owner;
  let buyer;
  const coffeePrice = ethers.utils.parseEther("1"); // 1 Ether

  beforeEach(async function () {
    const [deployer, _buyer] = await ethers.getSigners();
    owner = deployer;
    buyer = _buyer;

    const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
    buyMeACoffee = await BuyMeACoffee.deploy();
  });

  it("should deploy the contract", async function () {
    expect(await buyMeACoffee.owner()).to.equal(owner.address);
  });

  it("should allow users to buy coffee", async function () {
    const name = "John Doe";
    const message = "Great coffee!";
    
    await expect(() => 
      buyMeACoffee.connect(buyer).buyCoffee(name, message, { value: coffeePrice })
    ).to.changeEtherBalances([buyer, owner], [-coffeePrice, coffeePrice]);

    const memos = await buyMeACoffee.getMemos();
    expect(memos.length).to.equal(1);
    expect(memos[0].name).to.equal(name);
    expect(memos[0].message).to.equal(message);
  });

  it("should emit a NewMemo event when coffee is bought", async function () {
    const name = "Alice";
    const message = "Thank you!";
    
    await expect(
      buyMeACoffee.connect(buyer).buyCoffee(name, message, { value: coffeePrice })
    )
    .to.emit(buyMeACoffee, "NewMemo")
    .withArgs(buyer.address, anyValue, name, message);
  });

  it("should require payment to buy coffee", async function () {
    const name = "Bob";
    const message = "Awesome service!";
    
    await expect(
      buyMeACoffee.connect(buyer).buyCoffee(name, message, { value: 0 })
    ).to.be.revertedWith("You need to pay more than 0");
  });
});
